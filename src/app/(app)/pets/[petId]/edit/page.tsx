
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
// Import helper functions
import { petSpeciesList, petGendersList, yesNoOptions, petSizesList, acquisitionTypes, petPurposes, ufsBrasil, getBreedsForSpecies, getFurTypesForSpecies, getFurColorsForSpecies } from "@/lib/constants";
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

// Schema is the same as creation
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

  const [isFurTypePopoverOpen, setIsFurTypePopoverOpen] = useState(false); // Popover for fur type
  const [furTypeSearchValue, setFurTypeSearchValue] = useState(""); // Search for fur type

  const [isFurColorPopoverOpen, setIsFurColorPopoverOpen] = useState(false);
  const [furColorSearchValue, setFurColorSearchValue] = useState("");

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSimPatinhasCalendarOpen, setIsSimPatinhasCalendarOpen] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    // defaultValues are populated in useEffect after loading the pet
  });

  const [dateInputString, setDateInputString] = useState<string>("");
  const [simPatinhasDateInputString, setSimPatinhasDateInputString] = useState<string>("");

  useEffect(() => {
    if (petId && user) {
      const foundPet = allPets.find(p => p.id === petId && (p.ownerId === user.cpf || p.secondaryTutorCpf === user.cpf));
      if (foundPet) {
        setPetToEdit(foundPet);

        // Populate form
        const birthDateKnown = !!foundPet.dataNascimento;
        const dataNascimentoDate = birthDateKnown ? parseDateSafe(foundPet.dataNascimento!) : undefined;
        const simPatinhasDate = foundPet.simPatinhasEmissionDate ? parseDateSafe(foundPet.simPatinhasEmissionDate) : undefined;

        form.reset({
          nome: foundPet.nome,
          especie: foundPet.especie,
          raca: foundPet.raca,
          birthDateUnknown: !birthDateKnown,
          dataNascimento: dataNascimentoDate,
          ageInMonths: !birthDateKnown && foundPet.idade !== undefined ? foundPet.idade * 12 : undefined, // Assuming 'idade' is in years
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
          simPatinhasEmissionDate: simPatinhasDate,
          simPatinhasEmissionCity: foundPet.simPatinhasEmissionCity || "",
          simPatinhasEmissionUF: foundPet.simPatinhasEmissionUF || "",
          secondaryTutorName: foundPet.secondaryTutorName || "",
          secondaryTutorEmail: foundPet.secondaryTutorEmail || "",
          secondaryTutorCpf: foundPet.secondaryTutorCpf || "",
        });

        if (foundPet.fotoUrl) setImagePreview(foundPet.fotoUrl);
        if (dataNascimentoDate) setDateInputString(formatDateToBrasil(dataNascimentoDate));
        if (simPatinhasDate) setSimPatinhasDateInputString(formatDateToBrasil(simPatinhasDate));

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
    } else if (!watchedDataNascimento && dateInputString !== "") {
      // setDateInputString(""); // Optional: Clear if date becomes invalid
    }
  }, [watchedDataNascimento, dateInputString]);

  const watchedSimPatinhasDate = form.watch("simPatinhasEmissionDate");
  useEffect(() => {
    if (watchedSimPatinhasDate && isValidDate(watchedSimPatinhasDate)) {
      const formattedDate = formatDateToBrasil(watchedSimPatinhasDate);
      if (simPatinhasDateInputString !== formattedDate) {
        setSimPatinhasDateInputString(formattedDate);
      }
    } else if (!watchedSimPatinhasDate && simPatinhasDateInputString !== "") {
      // setSimPatinhasDateInputString(""); // Optional
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
      ...petToEdit, // Keep ID, ownerId, and other non-editable fields from original
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
      idade: undefined, // Will be recalculated or set based on ageInMonths
      hasSimPatinhas: data.hasSimPatinhas,
      simPatinhasId: data.hasSimPatinhas === "Sim" ? data.simPatinhasId : undefined,
      simPatinhasEmissionDate: data.hasSimPatinhas === "Sim" && data.simPatinhasEmissionDate ? formatDate(data.simPatinhasEmissionDate, "dd/MM/yyyy") : undefined,
      simPatinhasEmissionCity: data.hasSimPatinhas === "Sim" ? data.simPatinhasEmissionCity : undefined,
      simPatinhasEmissionUF: data.hasSimPatinhas === "Sim" ? data.simPatinhasEmissionUF : undefined,
      secondaryTutorName: data.secondaryTutorName || undefined,
      secondaryTutorEmail: data.secondaryTutorEmail || undefined,
      secondaryTutorCpf: data.secondaryTutorCpf ? data.secondaryTutorCpf.replace(/[^\d]/g, "") : undefined,
      // status and other fields not present in the form remain from petToEdit
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
      router.push(`/pets/${petToEdit.id}`); // Or to /pets
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível encontrar o pet para atualizar." });
    }
  };

  // Use helper function to get breeds based on selected species
  const baseRacas = useMemo(() => {
    return getBreedsForSpecies(especieSelecionada);
  }, [especieSelecionada]);

  const filteredRacas = useMemo(() => {
    if (!breedSearchValue) return baseRacas;
    return baseRacas.filter(raca =>
      raca.toLowerCase().includes(breedSearchValue.toLowerCase())
    );
  }, [baseRacas, breedSearchValue]);

  // Use helper function to get fur types based on selected species
  const tiposPelagemDisponiveis = useMemo(() => {
    return getFurTypesForSpecies(especieSelecionada);
  }, [especieSelecionada]);

  // Filter fur types based on search
  const filteredTiposPelagem = useMemo(() => {
    if (!furTypeSearchValue) return tiposPelagemDisponiveis;
    return tiposPelagemDisponiveis.filter(tipo =>
      tipo.toLowerCase().includes(furTypeSearchValue.toLowerCase())
    );
  }, [tiposPelagemDisponiveis, furTypeSearchValue]);

  // Use helper function to get fur colors based on selected species
  const baseCoresPelagem = useMemo(() => {
    return getFurColorsForSpecies(especieSelecionada);
  }, [especieSelecionada]);

  const filteredCoresPelagem = useMemo(() => {
    if (!furColorSearchValue) return baseCoresPelagem;
    return baseCoresPelagem.filter(cor =>
      cor.toLowerCase().includes(furColorSearchValue.toLowerCase())
    );
  }, [baseCoresPelagem, furColorSearchValue]);


  // Reset dependent fields when species changes (only if editing and species actually changes)
  useEffect(() => {
    // This effect should ideally run only when especieSelecionada changes *after* initial load
    // We might need a flag or check against petToEdit.especie to prevent resetting on load
    if (petToEdit && especieSelecionada !== petToEdit.especie) {
        form.setValue("raca", "");
        setBreedSearchValue("");
        form.setValue("tipoPelagem", "");
        setFurTypeSearchValue("");
        form.setValue("corPelagem", "");
        setFurColorSearchValue("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [especieSelecionada, form, petToEdit]); // Add petToEdit dependency

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "dataNascimento" | "simPatinhasEmissionDate") => {
    const typedValue = e.target.value;
    if (fieldName === "dataNascimento") {
      setDateInputString(typedValue);
    } else {
      setSimPatinhasDateInputString(typedValue);
    }

    const dateFormatRegex = /^(?:\d{1,2}(?:\/(?:\d{1,2}(?:\/\d{0,4})?)?)?)?$/;

    if (typedValue.length <= 10) {
        if (typedValue === "" || dateFormatRegex.test(typedValue)) {
            if (typedValue.length === 10 && typedValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                 const parsedDate = parseDateFn(typedValue, "dd/MM/yyyy", new Date());
                 if (isValidDate(parsedDate)) {
                    const currentRHFDate = form.getValues(fieldName);
                    if (!currentRHFDate || formatDate(currentRHFDate, "dd/MM/yyyy") !== typedValue) {
                        form.setValue(fieldName, parsedDate, { shouldValidate: true });
                    }
                 } else {
                    form.setValue(fieldName, undefined, { shouldValidate: true });
                 }
            } else {
                 form.setValue(fieldName, undefined, { shouldValidate: true });
            }
        }
    }
  };

  const handleDateSelect = (date: Date | undefined, fieldName: "dataNascimento" | "simPatinhasEmissionDate") => {
    if (date && isValidDate(date)) {
      form.setValue(fieldName, date, { shouldValidate: true });
      const formatted = formatDateToBrasil(date);
      if (fieldName === "dataNascimento") {
        setDateInputString(formatted);
        setIsCalendarOpen(false);
      } else {
        setSimPatinhasDateInputString(formatted);
        setIsSimPatinhasCalendarOpen(false);
      }
    } else {
      form.setValue(fieldName, undefined, { shouldValidate: true });
      if (fieldName === "dataNascimento") {
        setDateInputString("");
      } else {
        setSimPatinhasDateInputString("");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!petToEdit) {
    // This case should ideally be handled by the redirect in useEffect, but added for safety
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p>Pet não encontrado ou erro ao carregar.</p>
            <Button asChild className="mt-4">
                <Link href="/pets">Voltar para Meus Pets</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center">
                <Edit className="mr-2 h-6 w-6"/> Editar Pet: {petToEdit.nome}
            </CardTitle>
            <Button variant="outline" size="icon" asChild>
              <Link href={`/pets/${petId}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Voltar para Detalhes do Pet</span>
              </Link>
            </Button>
          </div>
          <CardDescription>Atualize os dados do seu pet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Seção: Informações Básicas */}
              <section>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Pet *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Bob, Luna" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="especie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Espécie *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a espécie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {petSpeciesList.map((specie) => (
                              <SelectItem key={specie} value={specie}>{specie}</SelectItem>
                            ))}
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
                        <FormLabel>Raça *</FormLabel>
                        <Popover open={isBreedPopoverOpen} onOpenChange={setIsBreedPopoverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                disabled={!especieSelecionada}
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? baseRacas.find(raca => raca === field.value) ?? field.value // Show value even if not in list (e.g., "Outra")
                                  : "Selecione a raça"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar raça..."
                                value={breedSearchValue}
                                onValueChange={setBreedSearchValue}
                              />
                              <CommandList>
                                <CommandEmpty>Nenhuma raça encontrada.</CommandEmpty>
                                <CommandGroup>
                                  {filteredRacas.map((raca) => (
                                    <CommandItem
                                      value={raca}
                                      key={raca}
                                      onSelect={() => {
                                        form.setValue("raca", raca);
                                        setIsBreedPopoverOpen(false);
                                        setBreedSearchValue("");
                                      }}
                                    >
                                      <CheckIcon
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          raca === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {raca}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Conditional Rendering for Tipo de Pelagem */}
                  {tiposPelagemDisponiveis.length > 0 && (
                    <FormField
                      control={form.control}
                      name="tipoPelagem"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Tipo de Pelagem</FormLabel>
                          <Popover open={isFurTypePopoverOpen} onOpenChange={setIsFurTypePopoverOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? tiposPelagemDisponiveis.find(tipo => tipo === field.value) ?? field.value
                                    : "Selecione o tipo de pelagem"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Buscar tipo..."
                                  value={furTypeSearchValue}
                                  onValueChange={setFurTypeSearchValue}
                                />
                                <CommandList>
                                  <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
                                  <CommandGroup>
                                    {filteredTiposPelagem.map((tipo) => (
                                      <CommandItem
                                        value={tipo}
                                        key={tipo}
                                        onSelect={() => {
                                          form.setValue("tipoPelagem", tipo);
                                          setIsFurTypePopoverOpen(false);
                                          setFurTypeSearchValue("");
                                        }}
                                      >
                                        <CheckIcon
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            tipo === field.value ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {tipo}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="corPelagem"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Cor (Pelagem/Plumagem/Escamas)</FormLabel>
                        <Popover open={isFurColorPopoverOpen} onOpenChange={setIsFurColorPopoverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                disabled={!especieSelecionada}
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? baseCoresPelagem.find(cor => cor === field.value) ?? field.value
                                  : "Selecione a cor"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar cor..."
                                value={furColorSearchValue}
                                onValueChange={setFurColorSearchValue}
                              />
                              <CommandList>
                                <CommandEmpty>Nenhuma cor encontrada.</CommandEmpty>
                                <CommandGroup>
                                  {filteredCoresPelagem.map((cor) => (
                                    <CommandItem
                                      value={cor}
                                      key={cor}
                                      onSelect={() => {
                                        form.setValue("corPelagem", cor);
                                        setIsFurColorPopoverOpen(false);
                                        setFurColorSearchValue("");
                                      }}
                                    >
                                      <CheckIcon
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          cor === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {cor}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sexo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexo *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o sexo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {petGendersList.map((gender) => (
                              <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Seção: Nascimento e Idade */}
              <section>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Nascimento e Idade</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="birthDateUnknown"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Não sei a data de nascimento
                            </FormLabel>
                            <FormDescription>
                              Marque esta opção se não souber a data exata.
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
                            <FormLabel>Data de Nascimento *</FormLabel>
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <Input
                                      placeholder="dd/mm/aaaa"
                                      value={dateInputString}
                                      onChange={(e) => handleDateInputChange(e, "dataNascimento")}
                                      onBlur={() => {
                                        const parsedDate = parseDateFn(dateInputString, "dd/MM/yyyy", new Date());
                                        if (!isValidDate(parsedDate)) {
                                            form.setValue("dataNascimento", undefined, { shouldValidate: true });
                                        }
                                      }}
                                      className="border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 flex-grow mr-2"
                                    />
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => handleDateSelect(date, "dataNascimento")}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1980-01-01")
                                  }
                                  initialFocus
                                  captionLayout="dropdown-buttons"
                                  fromYear={1980}
                                  toYear={new Date().getFullYear()}
                                />
                              </PopoverContent>
                            </Popover>
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
                            <FormLabel>Idade Estimada (em meses) *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Ex: 6" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  {calculatedAgeDisplay && (
                    <Alert>
                      <AlertTitle>Idade Calculada</AlertTitle>
                      <AlertDescription>
                        {calculatedAgeDisplay}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </section>

              {/* Seção: Características Físicas */}
              <section>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Características Físicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="peso"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso (kg)</FormLabel>
                        <FormControl>
                          <Input type="text" inputMode="decimal" placeholder="Ex: 5,5" {...field} value={field.value ?? ""} />
                        </FormControl>
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
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o porte" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {petSizesList.map((size) => (
                              <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sinaisObservacoes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Sinais Particulares / Observações</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descreva manchas, cicatrizes, ou outras características únicas..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Seção: Informações Adicionais */}
              <section>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Informações Adicionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="castrado"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Castrado? *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-1"
                          >
                            {yesNoOptions.map(option => (
                              <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={option} />
                                </FormControl>
                                <FormLabel className="font-normal">{option}</FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipoAquisicao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Aquisição</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione como adquiriu o pet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {acquisitionTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
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
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a finalidade do pet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {petPurposes.map((purpose) => (
                              <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Seção: Foto */}
              <section>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Foto do Pet</h3>
                <FormField
                  control={form.control}
                  name="fotoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carregar Nova Foto / Manter Atual</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept={ALLOWED_IMAGE_TYPES.join(",")}
                            onChange={handleFileChange}
                            className="hidden"
                            ref={fileInputRef}
                            id="pet-photo-upload"
                          />
                          <label
                            htmlFor="pet-photo-upload"
                            className={cn(
                              "cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                              "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                            )}
                          >
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Selecionar Arquivo
                          </label>
                          {imagePreview && (
                            <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                              <Image src={imagePreview} alt="Pré-visualização" layout="fill" objectFit="cover" />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-0 right-0 h-5 w-5 rounded-full p-0.5"
                                onClick={removeImage}
                              >
                                <XCircle className="h-4 w-4" />
                                <span className="sr-only">Remover Imagem</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Envie uma nova foto ou deixe em branco para manter a atual (PNG, JPG, BMP, WEBP - Máx {MAX_FILE_SIZE_MB}MB).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* Seção: SimPatinhas (Opcional) */}
              <section>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Registro Geral (SimPatinhas - Opcional)</h3>
                <FormField
                  control={form.control}
                  name="hasSimPatinhas"
                  render={({ field }) => (
                    <FormItem className="space-y-3 mb-6">
                      <FormLabel>Possui Registro Geral SimPatinhas?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {yesNoOptions.map(option => (
                            <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={option} />
                              </FormControl>
                              <FormLabel className="font-normal">{option}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {hasSimPatinhas === "Sim" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="simPatinhasId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do Registro *</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o número do registro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="simPatinhasEmissionDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Emissão *</FormLabel>
                          <Popover open={isSimPatinhasCalendarOpen} onOpenChange={setIsSimPatinhasCalendarOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <Input
                                    placeholder="dd/mm/aaaa"
                                    value={simPatinhasDateInputString}
                                    onChange={(e) => handleDateInputChange(e, "simPatinhasEmissionDate")}
                                    onBlur={() => {
                                      const parsedDate = parseDateFn(simPatinhasDateInputString, "dd/MM/yyyy", new Date());
                                      if (!isValidDate(parsedDate)) {
                                          form.setValue("simPatinhasEmissionDate", undefined, { shouldValidate: true });
                                      }
                                    }}
                                    className="border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 flex-grow mr-2"
                                  />
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => handleDateSelect(date, "simPatinhasEmissionDate")}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1980-01-01")
                                }
                                initialFocus
                                captionLayout="dropdown-buttons"
                                fromYear={1980}
                                toYear={new Date().getFullYear()}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="simPatinhasEmissionCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade de Emissão</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Natal" {...field} />
                          </FormControl>
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
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a UF" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ufsBrasil.map((uf) => (
                                <SelectItem key={uf.sigla} value={uf.sigla}>{uf.sigla} - {uf.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </section>

              {/* Seção: Segundo Tutor (Opcional) */}
              <section>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Segundo Tutor (Opcional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="secondaryTutorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do 2º Tutor</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
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
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
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
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormDescription>Apenas números serão considerados.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
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

