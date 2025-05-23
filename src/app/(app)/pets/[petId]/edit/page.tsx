
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/hooks/use-toast";
import type { Pet, PetSpecies, PetGender, PetSize, PetAcquisitionType, PetPurpose } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { petSpeciesList, dogBreeds, catBreeds, petGendersList, yesNoOptions, furTypesBySpecies, furColorsBySpecies, petSizesList, acquisitionTypes, petPurposes, ufsBrasil } from "@/lib/constants";
import { formatDate, parseDateSafe, formatDateToBrasil, calculateAge, isValidDate } from "@/lib/date-utils";
import { CalendarIcon, ArrowLeft, Search, ChevronsUpDown, Check as CheckIcon, Link as LinkIcon, QrCode, Users, UploadCloud, XCircle, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useMemo, useRef } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { parse as parseDateFn } from 'date-fns';
import Image from "next/image";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/bmp", "image/webp"];

// Schema é o mesmo da criação
const petFormSchema = z.object({
  nome: z.string().min(2, { message: "Nome do pet é obrigatório (mínimo 2 caracteres)." }),
  especie: z.enum(petSpeciesList as [PetSpecies, ...PetSpecies[]], { required_error: "Espécie é obrigatória." }),
  raca: z.string().min(1, { message: "Raça é obrigatória." }),
  birthDateUnknown: z.boolean().default(false),
  dataNascimento: z.date().optional(),
  ageInMonths: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : parseInt(String(val), 10)),
    z.number({ invalid_type_error: "Idade em meses deve ser um número." })
      .int("Idade em meses deve ser um número inteiro.")
      .min(0, "Idade não pode ser negativa.")
      .optional()
  ),
  sexo: z.enum(petGendersList as [PetGender, ...PetGender[]], { required_error: "Sexo é obrigatório." }),
  castrado: z.enum(yesNoOptions, { required_error: "Informar se é castrado é obrigatório." }),
  tipoAquisicao: z.enum(acquisitionTypes as [string, ...string[]]).optional(),
  finalidade: z.enum(petPurposes as [string, ...string[]]).optional(),
  fotoUrl: z.string().optional(),
  tipoPelagem: z.string().optional(),
  corPelagem: z.string().optional(),
  peso: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : parseFloat(String(val).replace(",", "."))),
    z.number({ invalid_type_error: "Peso deve ser um número." }).positive({ message: "Peso deve ser positivo." }).optional()
  ),
  porte: z.enum(petSizesList as [PetSize, ...PetSize[]]).optional(),
  sinaisObservacoes: z.string().optional(),
  hasSimPatinhas: z.enum(["Sim", "Não"], { errorMap: () => ({ message: "Selecione Sim ou Não." }) }).optional(),
  simPatinhasId: z.string().optional(),
  simPatinhasEmissionDate: z.date().optional(),
  simPatinhasEmissionCity: z.string().optional(),
  simPatinhasEmissionUF: z.string().optional(),
  secondaryTutorName: z.string().optional(),
  secondaryTutorEmail: z.string().email({ message: "E-mail do 2º tutor inválido." }).optional().or(z.literal("")),
  secondaryTutorCpf: z.string().optional().refine(val => {
    if (!val || val.trim() === "") return true;
    const numericCpf = val.replace(/[^\d]/g, "");
    return numericCpf.length === 11;
  }, { message: "CPF do 2º tutor deve conter 11 dígitos." }),
}).refine(data => {
  if (data.birthDateUnknown && data.ageInMonths === undefined) {
    return false;
  }
  if (!data.birthDateUnknown && data.dataNascimento === undefined) {
    return false;
  }
  return true;
}, {
  message: "Informe a data de nascimento ou a idade estimada em meses.",
  path: ["dataNascimento"],
}).superRefine((data, ctx) => {
  if (data.hasSimPatinhas === "Sim") {
    if (!data.simPatinhasId || data.simPatinhasId.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Registro Geral SimPatinhas é obrigatório.",
        path: ["simPatinhasId"],
      });
    }
    if (!data.simPatinhasEmissionDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data de Emissão do SimPatinhas é obrigatória.",
        path: ["simPatinhasEmissionDate"],
      });
    }
  }
});

type PetFormValues = z.infer<typeof petFormSchema>;

export default function EditarPetPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [allPets, setAllPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calculatedAgeDisplay, setCalculatedAgeDisplay] = useState<string | null>(null);
  
  const [isBreedPopoverOpen, setIsBreedPopoverOpen] = useState(false);
  const [breedSearchValue, setBreedSearchValue] = useState("");
  
  const [isFurColorPopoverOpen, setIsFurColorPopoverOpen] = useState(false);
  const [furColorSearchValue, setFurColorSearchValue] = useState("");

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSimPatinhasCalendarOpen, setIsSimPatinhasCalendarOpen] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
    
  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    // defaultValues são preenchidos no useEffect após carregar o pet
  });

  const [dateInputString, setDateInputString] = useState<string>("");
  const [simPatinhasDateInputString, setSimPatinhasDateInputString] = useState<string>("");

  useEffect(() => {
    if (petId && user) {
      const foundPet = allPets.find(p => p.id === petId && (p.ownerId === user.cpf || p.secondaryTutorCpf === user.cpf));
      if (foundPet) {
        setPetToEdit(foundPet);
        
        // Popular formulário
        const birthDateKnown = !!foundPet.dataNascimento;
        const dataNascimentoDate = birthDateKnown ? parseDateSafe(foundPet.dataNascimento!) : undefined;
        
        form.reset({
          nome: foundPet.nome,
          especie: foundPet.especie,
          raca: foundPet.raca,
          birthDateUnknown: !birthDateKnown,
          dataNascimento: dataNascimentoDate,
          ageInMonths: !birthDateKnown && foundPet.idade !== undefined ? foundPet.idade * 12 : undefined, // Assumindo que 'idade' é em anos
          sexo: foundPet.sexo,
          castrado: foundPet.castrado,
          tipoAquisicao: foundPet.tipoAquisicao,
          finalidade: foundPet.finalidade,
          fotoUrl: foundPet.fotoUrl,
          tipoPelagem: foundPet.tipoPelagem || "",
          corPelagem: foundPet.corPelagem || "",
          peso: foundPet.peso,
          porte: foundPet.porte,
          sinaisObservacoes: foundPet.sinaisObservacoes || "",
          hasSimPatinhas: foundPet.hasSimPatinhas,
          simPatinhasId: foundPet.simPatinhasId || "",
          simPatinhasEmissionDate: foundPet.simPatinhasEmissionDate ? parseDateSafe(foundPet.simPatinhasEmissionDate) : undefined,
          simPatinhasEmissionCity: foundPet.simPatinhasEmissionCity || "",
          simPatinhasEmissionUF: foundPet.simPatinhasEmissionUF || "",
          secondaryTutorName: foundPet.secondaryTutorName || "",
          secondaryTutorEmail: foundPet.secondaryTutorEmail || "",
          secondaryTutorCpf: foundPet.secondaryTutorCpf || "",
        });
        
        if (foundPet.fotoUrl) setImagePreview(foundPet.fotoUrl);
        if (dataNascimentoDate) setDateInputString(formatDateToBrasil(dataNascimentoDate));
        if (foundPet.simPatinhasEmissionDate) setSimPatinhasDateInputString(formatDateToBrasil(parseDateSafe(foundPet.simPatinhasEmissionDate)!));

      } else {
        toast({ variant: "destructive", title: "Erro", description: "Pet não encontrado ou você não tem permissão para editá-lo." });
        router.push("/pets");
      }
      setIsLoading(false);
    } else if (!user) {
      router.push("/login");
    }
  }, [petId, allPets, user, router, toast, form]);


  const especieSelecionada = form.watch("especie");
  const watchedDataNascimento = form.watch("dataNascimento");
  const isBirthDateUnknown = form.watch("birthDateUnknown");
  const hasSimPatinhas = form.watch("hasSimPatinhas");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Tipo de arquivo inválido",
          description: `Por favor, selecione um arquivo PNG, JPG, BMP ou WEBP.`,
        });
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: `O arquivo deve ter no máximo ${MAX_FILE_SIZE_MB}MB.`,
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("fotoUrl", reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("fotoUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (watchedDataNascimento && isValidDate(watchedDataNascimento)) {
      const formattedDate = formatDateToBrasil(watchedDataNascimento);
      if (dateInputString !== formattedDate) {
        setDateInputString(formattedDate);
      }
    }
  }, [watchedDataNascimento, dateInputString]);

  const watchedSimPatinhasDate = form.watch("simPatinhasEmissionDate");
  useEffect(() => {
    if (watchedSimPatinhasDate && isValidDate(watchedSimPatinhasDate)) {
      const formattedDate = formatDateToBrasil(watchedSimPatinhasDate);
      if (simPatinhasDateInputString !== formattedDate) {
        setSimPatinhasDateInputString(formattedDate);
      }
    }
  }, [watchedSimPatinhasDate, simPatinhasDateInputString]);

  useEffect(() => {
    if (isBirthDateUnknown) {
      form.setValue("dataNascimento", undefined);
      setCalculatedAgeDisplay(null);
      setDateInputString("");
    } else {
      form.setValue("ageInMonths", undefined, { shouldValidate: true });
    }
  }, [isBirthDateUnknown, form]);

  useEffect(() => {
    if (!isBirthDateUnknown && watchedDataNascimento && isValidDate(watchedDataNascimento)) {
      const age = calculateAge(watchedDataNascimento);
      setCalculatedAgeDisplay(age.display);
      form.setValue("ageInMonths", undefined, { shouldValidate: false });
    } else if (!isBirthDateUnknown) {
      setCalculatedAgeDisplay(null);
    }
  }, [watchedDataNascimento, isBirthDateUnknown, form]);

  useEffect(() => {
    if (hasSimPatinhas === "Não") {
      form.setValue("simPatinhasId", "");
      form.setValue("simPatinhasEmissionDate", undefined);
      setSimPatinhasDateInputString("");
      form.setValue("simPatinhasEmissionCity", "");
      form.setValue("simPatinhasEmissionUF", "");
    }
  }, [hasSimPatinhas, form]);

  const onSubmit = (data: PetFormValues) => {
    if (!user || !petToEdit) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar as alterações." });
      return;
    }
    if (data.birthDateUnknown && data.ageInMonths === undefined) {
      form.setError("ageInMonths", { message: "Idade em meses é obrigatória se a data de nascimento for desconhecida." });
      return;
    }
    if (!data.birthDateUnknown && !data.dataNascimento) {
      form.setError("dataNascimento", { message: "Data de nascimento é obrigatória se não for desconhecida." });
      return;
    }

    const updatedPetData: Pet = {
      ...petToEdit, // Mantém ID, ownerId e outros campos não editáveis do original
      nome: data.nome,
      especie: data.especie,
      raca: data.raca,
      sexo: data.sexo,
      castrado: data.castrado,
      tipoAquisicao: data.tipoAquisicao as PetAcquisitionType | undefined,
      finalidade: data.finalidade as PetPurpose | undefined,
      fotoUrl: data.fotoUrl || undefined,
      tipoPelagem: data.tipoPelagem || "",
      corPelagem: data.corPelagem || "",
      peso: data.peso,
      porte: data.porte,
      sinaisObservacoes: data.sinaisObservacoes,
      dataNascimento: !data.birthDateUnknown && data.dataNascimento ? formatDate(data.dataNascimento, "dd/MM/yyyy") : undefined,
      idade: undefined, // Será recalculado ou definido com base em ageInMonths
      hasSimPatinhas: data.hasSimPatinhas,
      simPatinhasId: data.hasSimPatinhas === "Sim" ? data.simPatinhasId : undefined,
      simPatinhasEmissionDate: data.hasSimPatinhas === "Sim" && data.simPatinhasEmissionDate ? formatDate(data.simPatinhasEmissionDate, "dd/MM/yyyy") : undefined,
      simPatinhasEmissionCity: data.hasSimPatinhas === "Sim" ? data.simPatinhasEmissionCity : undefined,
      simPatinhasEmissionUF: data.hasSimPatinhas === "Sim" ? data.simPatinhasEmissionUF : undefined,
      secondaryTutorName: data.secondaryTutorName || undefined,
      secondaryTutorEmail: data.secondaryTutorEmail || undefined,
      secondaryTutorCpf: data.secondaryTutorCpf ? data.secondaryTutorCpf.replace(/[^\d]/g, "") : undefined,
      // status e outros campos não presentes no formulário permanecem do petToEdit
    };

    if (data.birthDateUnknown && typeof data.ageInMonths === 'number') {
      updatedPetData.idade = Math.floor(data.ageInMonths / 12);
    } else if (!data.birthDateUnknown && data.dataNascimento) {
      const age = calculateAge(data.dataNascimento);
      updatedPetData.idade = age.years;
    }

    const petIndex = allPets.findIndex(p => p.id === petToEdit.id);
    if (petIndex !== -1) {
      const updatedPetsList = [...allPets];
      updatedPetsList[petIndex] = updatedPetData;
      setAllPets(updatedPetsList);
      toast({ title: "Sucesso!", description: `As informações de ${data.nome} foram atualizadas.` });
      router.push(`/pets/${petToEdit.id}`); // Ou para /pets
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível encontrar o pet para atualizar." });
    }
  };

  const baseRacas = useMemo(() => {
    return especieSelecionada === "Cão" ? dogBreeds : especieSelecionada === "Gato" ? catBreeds : [];
  }, [especieSelecionada]);

  const filteredRacas = useMemo(() => {
    if (!breedSearchValue) return baseRacas;
    return baseRacas.filter(raca => 
      raca.toLowerCase().includes(breedSearchValue.toLowerCase())
    );
  }, [baseRacas, breedSearchValue]);

  const tiposPelagemDisponiveis = useMemo(() => {
    return especieSelecionada ? furTypesBySpecies[especieSelecionada] : [];
  }, [especieSelecionada]);
  
  const baseCoresPelagem = useMemo(() => {
    return especieSelecionada ? furColorsBySpecies[especieSelecionada] : [];
  }, [especieSelecionada]);

  const filteredCoresPelagem = useMemo(() => {
    if (!furColorSearchValue) return baseCoresPelagem;
    return baseCoresPelagem.filter(cor => 
      cor.toLowerCase().includes(furColorSearchValue.toLowerCase())
    );
  }, [baseCoresPelagem, furColorSearchValue]);

  useEffect(() => {
    // Não resetar ao mudar espécie se já estiver editando e dados carregados
    // Apenas se for uma mudança manual que invalidaria a raça/cor atual.
    // form.setValue("raca", ""); 
    // setBreedSearchValue("");
    // form.setValue("tipoPelagem", "");
    // form.setValue("corPelagem", "");
    // setFurColorSearchValue("");
  }, [especieSelecionada, form]);

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "dataNascimento" | "simPatinhasEmissionDate") => {
    const typedValue = e.target.value;
    if (fieldName === "dataNascimento") setDateInputString(typedValue);
    else setSimPatinhasDateInputString(typedValue);

    const dateFormatRegex = /^(?:\d{1,2}(?:\/(?:\d{1,2}(?:\/\d{0,4})?)?)?)?$/;
    if (typedValue.length <= 10 && (typedValue === "" || dateFormatRegex.test(typedValue))) {
      if (typedValue.length === 10 && typedValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const parsedDate = parseDateFn(typedValue, "dd/MM/yyyy", new Date());
        if (isValidDate(parsedDate)) {
          form.setValue(fieldName, parsedDate, { shouldValidate: true });
        } else {
          form.setValue(fieldName, undefined, { shouldValidate: true });
        }
      } else if (typedValue === "") {
        form.setValue(fieldName, undefined, { shouldValidate: true });
      }
    }
  };

  const handleDateInputBlur = (dateString: string, fieldName: "dataNascimento" | "simPatinhasEmissionDate") => {
    const parsedDate = parseDateFn(dateString, "dd/MM/yyyy", new Date());
    if (isValidDate(parsedDate)) {
      form.setValue(fieldName, parsedDate, { shouldValidate: true });
      if (fieldName === "dataNascimento") setDateInputString(formatDateToBrasil(parsedDate));
      else setSimPatinhasDateInputString(formatDateToBrasil(parsedDate));
    } else {
      if (dateString === "") {
        form.setValue(fieldName, undefined, { shouldValidate: true });
      } else {
        form.setValue(fieldName, undefined, { shouldValidate: true });
        if (fieldName === "dataNascimento") setDateInputString(dateString);
        else setSimPatinhasDateInputString(dateString);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size={32} /> <span className="ml-2">Carregando dados do pet...</span>
      </div>
    );
  }

  if (!petToEdit) {
    // Já tratado pelo useEffect, mas como fallback.
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-destructive">Pet não encontrado ou você não tem permissão para editá-lo.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/pets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Meus Pets
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/pets/${petToEdit.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Perfil de {petToEdit.nome}
          </Link>
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
            <div className="flex items-center space-x-3 mb-3">
                 <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50">
                    <Image
                        src={form.getValues("fotoUrl") || imagePreview || `https://placehold.co/100x100.png?text=${encodeURIComponent(petToEdit.nome.charAt(0))}`}
                        alt={`Foto de ${petToEdit.nome}`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={`${petToEdit.especie} ${petToEdit.raca}`}
                    />
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold text-primary flex items-center">
                        <Edit className="mr-2 h-6 w-6" />
                        Editar Perfil de {petToEdit.nome}
                    </CardTitle>
                    <CardDescription>
                        Modifique as informações do seu pet.
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados Básicos do Pet */}
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Pet<span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Ex: Rex, Luna" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="especie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Espécie<span className="text-destructive">*</span></FormLabel>
                      <Select 
                        onValueChange={(value) => { 
                          field.onChange(value as PetSpecies);
                          // Resetar raça e cor ao mudar espécie, se necessário.
                          form.setValue("raca", "");
                          setBreedSearchValue("");
                          form.setValue("tipoPelagem", "");
                          form.setValue("corPelagem", "");
                          setFurColorSearchValue("");
                        }} 
                        value={field.value}
                      >
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione a espécie" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {petSpeciesList.map(specie => <SelectItem key={specie} value={specie}>{specie}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="raca"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Raça<span className="text-destructive">*</span></FormLabel>
                      <Popover open={isBreedPopoverOpen} onOpenChange={setIsBreedPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={isBreedPopoverOpen}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={!especieSelecionada}
                            >
                              {field.value
                                ? baseRacas.find(
                                    (raca) => raca.toLowerCase() === field.value.toLowerCase()
                                  ) || (especieSelecionada ? "Selecione ou digite a raça" : "Primeiro escolha a espécie")
                                : (especieSelecionada ? "Selecione ou digite a raça" : "Primeiro escolha a espécie")}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Buscar raça..."
                              value={breedSearchValue}
                              onValueChange={setBreedSearchValue}
                              disabled={!especieSelecionada}
                            />
                            <CommandEmpty>{especieSelecionada ? "Nenhuma raça encontrada." : "Escolha uma espécie primeiro."}</CommandEmpty>
                            <CommandList>
                              {especieSelecionada && filteredRacas.map((raca) => (
                                <CommandItem
                                  value={raca}
                                  key={raca}
                                  onSelect={() => {
                                    form.setValue("raca", raca, { shouldValidate: true });
                                    setIsBreedPopoverOpen(false);
                                    setBreedSearchValue(""); 
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      raca.toLowerCase() === field.value?.toLowerCase() ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {raca}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="birthDateUnknown"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="birthDateUnknown"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel htmlFor="birthDateUnknown" className="cursor-pointer">
                        Data de Nascimento desconhecida
                      </FormLabel>
                      <FormDescription>
                        Marque esta opção se você não sabe a data exata e irá informar a idade estimada em meses.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {!isBirthDateUnknown && (
                <FormField
                  control={form.control}
                  name="dataNascimento"
                  render={({ field }) => ( 
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Nascimento<span className="text-destructive">*</span></FormLabel>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                           <FormControl>
                             <div className="relative">
                                <Input
                                  placeholder="dd/mm/aaaa"
                                  value={dateInputString}
                                  onChange={(e) => handleDateInputChange(e, "dataNascimento")}
                                  onBlur={() => handleDateInputBlur(dateInputString, "dataNascimento")}
                                  disabled={isBirthDateUnknown}
                                  className={cn(
                                    "w-full pl-3 pr-10 text-left font-normal", 
                                    !field.value && !dateInputString && "text-muted-foreground"
                                  )}
                                  onClick={() => !isBirthDateUnknown && setIsCalendarOpen(true)} 
                                />
                                <CalendarIcon 
                                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 cursor-pointer" 
                                  onClick={() => !isBirthDateUnknown && setIsCalendarOpen(true)} 
                                />
                              </div>
                           </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value} 
                            onSelect={(date) => {
                              form.setValue("dataNascimento", date, { shouldValidate: true }); 
                              if (date && isValidDate(date)) {
                                setDateInputString(formatDateToBrasil(date));
                              } else {
                                setDateInputString(""); 
                              }
                              setIsCalendarOpen(false); 
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {calculatedAgeDisplay && !isBirthDateUnknown && (
                        <FormDescription className="mt-1 text-sm text-muted-foreground">
                          Idade calculada: {calculatedAgeDisplay}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {isBirthDateUnknown && (
                <FormField
                  control={form.control}
                  name="ageInMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade Estimada (em meses)<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 6"
                          {...field}
                          disabled={!isBirthDateUnknown}
                          onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>Preencha a idade aproximada do pet em meses.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Detalhes Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sexo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo<span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o sexo" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {petGendersList.map(gender => <SelectItem key={gender} value={gender}>{gender}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="castrado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Castrado?<span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {yesNoOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="tipoAquisicao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Aquisição</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo de aquisição" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {acquisitionTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="finalidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Finalidade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione a finalidade" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {petPurposes.map(purpose => <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fotoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto</FormLabel>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-full p-4 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer"
                           onClick={() => fileInputRef.current?.click()}>
                        <FormControl>
                          <Input
                            type="file"
                            accept={ALLOWED_IMAGE_TYPES.join(",")}
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                          />
                        </FormControl>
                        {imagePreview ? (
                          <div className="relative w-48 h-48 mx-auto rounded-md overflow-hidden group">
                            <Image src={imagePreview} alt="Preview da foto do pet" layout="fill" objectFit="cover" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => { e.stopPropagation(); removeImage(); }}
                              aria-label="Remover imagem"
                            >
                              <XCircle className="h-5 w-5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground py-6">
                            <UploadCloud className="h-12 w-12 mb-2" />
                            <p className="text-sm">Clique para carregar uma imagem</p>
                            <p className="text-xs">(PNG, JPG, BMP, WEBP - Máx {MAX_FILE_SIZE_MB}MB)</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="tipoPelagem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Pelagem</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!especieSelecionada || tiposPelagemDisponiveis.length === 0}>
                        <FormControl><SelectTrigger><SelectValue placeholder={especieSelecionada ? "Selecione o tipo" : "Escolha a espécie"} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {tiposPelagemDisponiveis.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="corPelagem"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Cor da Pelagem</FormLabel>
                      <Popover open={isFurColorPopoverOpen} onOpenChange={setIsFurColorPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={isFurColorPopoverOpen}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={!especieSelecionada}
                            >
                              {field.value
                                ? baseCoresPelagem.find(
                                    (cor) => cor.toLowerCase() === field.value.toLowerCase()
                                  ) || (especieSelecionada ? "Selecione ou digite a cor" : "Primeiro escolha a espécie")
                                : (especieSelecionada ? "Selecione ou digite a cor" : "Primeiro escolha a espécie")}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Buscar cor da pelagem..."
                              value={furColorSearchValue}
                              onValueChange={setFurColorSearchValue}
                              disabled={!especieSelecionada}
                            />
                            <CommandEmpty>{especieSelecionada ? "Nenhuma cor encontrada." : "Escolha uma espécie primeiro."}</CommandEmpty>
                            <CommandList>
                              {especieSelecionada && filteredCoresPelagem.map((cor) => (
                                <CommandItem
                                  value={cor}
                                  key={cor}
                                  onSelect={() => {
                                    form.setValue("corPelagem", cor, { shouldValidate: true });
                                    setIsFurColorPopoverOpen(false);
                                    setFurColorSearchValue(""); 
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      cor.toLowerCase() === field.value?.toLowerCase() ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {cor}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="peso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl><Input type="number" step="0.1" placeholder="Ex: 5.5" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.value)} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="porte"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Porte</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o porte" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {petSizesList.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="sinaisObservacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sinais Particulares / Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alguma marca distinta, alergia conhecida, comportamento especial, etc."
                        className="resize-y min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Seção 2º Tutor */}
              <Card className="pt-4">
                <CardHeader className="pb-2 pt-0">
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Informações do 2º Tutor</CardTitle>
                  </div>
                   <CardDescription>Preencha se houver um segundo responsável pelo pet.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <FormField
                    control={form.control}
                    name="secondaryTutorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo do 2º Tutor</FormLabel>
                        <FormControl><Input placeholder="Nome do segundo tutor" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondaryTutorEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail do 2º Tutor</FormLabel>
                        <FormControl><Input type="email" placeholder="email@exemplo.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="secondaryTutorCpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF do 2º Tutor</FormLabel>
                        <FormControl><Input placeholder="CPF (somente números)" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Seção SimPatinhas */}
              <Card className="pt-4">
                <CardHeader className="pb-2 pt-0">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Cadastro SimPatinhas</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <LinkIcon className="h-4 w-4" />
                    <AlertTitle>O que é o SimPatinhas?</AlertTitle>
                    <AlertDescription>
                      O Sistema de Identificação e Monitoramento de Cães e Gatos (SimPatinhas) é uma iniciativa para o controle populacional e bem-estar animal.
                      <a href="https://sinpatinhas.mma.gov.br/login" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                        Saiba mais ou cadastre seu pet aqui.
                      </a>
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={form.control}
                    name="hasSimPatinhas"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Possui cadastro no SimPatinhas?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Sim" />
                              </FormControl>
                              <FormLabel className="font-normal">Sim</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Não" />
                              </FormControl>
                              <FormLabel className="font-normal">Não</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {hasSimPatinhas === "Sim" && (
                    <div className="space-y-4_mt-4_border-t_pt-4">
                      <FormField
                        control={form.control}
                        name="simPatinhasId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registro Geral SimPatinhas<span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input placeholder="ID do registro" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="simPatinhasEmissionDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data de Emissão do SimPatinhas<span className="text-destructive">*</span></FormLabel>
                             <Popover open={isSimPatinhasCalendarOpen} onOpenChange={setIsSimPatinhasCalendarOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      placeholder="dd/mm/aaaa"
                                      value={simPatinhasDateInputString}
                                      onChange={(e) => handleDateInputChange(e, "simPatinhasEmissionDate")}
                                      onBlur={() => handleDateInputBlur(simPatinhasDateInputString, "simPatinhasEmissionDate")}
                                      className={cn("w-full pl-3 pr-10 text-left font-normal", !field.value && !simPatinhasDateInputString && "text-muted-foreground")}
                                      onClick={() => setIsSimPatinhasCalendarOpen(true)}
                                    />
                                    <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 cursor-pointer" onClick={() => setIsSimPatinhasCalendarOpen(true)} />
                                  </div>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    form.setValue("simPatinhasEmissionDate", date, { shouldValidate: true });
                                    if (date && isValidDate(date)) {
                                       setSimPatinhasDateInputString(formatDateToBrasil(date));
                                    } else {
                                       setSimPatinhasDateInputString("");
                                    }
                                    setIsSimPatinhasCalendarOpen(false);
                                  }}
                                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="simPatinhasEmissionCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cidade de Emissão</FormLabel>
                              <FormControl><Input placeholder="Ex: Brasília" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="simPatinhasEmissionUF"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>UF de Emissão</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione a UF" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {ufsBrasil.map(uf => <SelectItem key={uf.sigla} value={uf.sigla}>{uf.nome}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push(`/pets/${petToEdit.id}`)}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

