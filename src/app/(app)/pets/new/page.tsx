
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/hooks/use-toast";
import type { Pet, PetSpecies, PetGender, PetSize, PetAcquisitionType, PetPurpose } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DateSelectors } from "@/components/ui/date-selectors";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Import helper functions instead of individual breed lists
import { petIdGenerator, petSpeciesList, petGendersList, yesNoOptions, petSizesList, acquisitionTypes, petPurposes, ufsBrasil, getBreedsForSpecies, getFurTypesForSpecies, getFurColorsForSpecies } from "@/lib/constants";
import { formatDate, parseDateSafe, formatDateToBrasil, calculateAge, isValidDate } from "@/lib/date-utils";
import { CalendarIcon, ArrowLeft, Search, ChevronsUpDown, Check as CheckIcon, Link as LinkIcon, QrCode, Users, UploadCloud, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useMemo, useRef } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { parse as parseDateFn } from 'date-fns';
import Image from "next/image";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/bmp", "image/webp"];

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
  secondaryTutorCpf: z.string().optional().refine(val => {
    if (!val || val.trim() === "") return true; // Optional, so empty is fine
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
  path: ["dataNascimento"], // Apply error to dataNascimento field
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

export default function AdicionarPetPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [allPets, setAllPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const [calculatedAgeDisplay, setCalculatedAgeDisplay] = useState<string | null>(null);

  const [isBreedPopoverOpen, setIsBreedPopoverOpen] = useState(false);
  const [breedSearchValue, setBreedSearchValue] = useState("");

  const [isFurTypePopoverOpen, setIsFurTypePopoverOpen] = useState(false); // Popover for fur type
  const [furTypeSearchValue, setFurTypeSearchValue] = useState(""); // Search for fur type

  const [isFurColorPopoverOpen, setIsFurColorPopoverOpen] = useState(false);
  const [furColorSearchValue, setFurColorSearchValue] = useState("");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      nome: "",
      especie: undefined,
      raca: "",
      sexo: undefined,
      castrado: undefined,
      tipoAquisicao: undefined,
      finalidade: undefined,
      fotoUrl: "",
      tipoPelagem: "", // Initialize as empty
      corPelagem: "", // Initialize as empty
      sinaisObservacoes: "",
      birthDateUnknown: false,
      dataNascimento: undefined,
      ageInMonths: undefined,
      hasSimPatinhas: undefined,
      simPatinhasId: "",
      simPatinhasEmissionDate: undefined,
      simPatinhasEmissionCity: "",
      simPatinhasEmissionUF: "",
      secondaryTutorName: "",
      secondaryTutorCpf: "",
    },
  });

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
          description: `Por favor, selecione um arquivo PNG, JPG, BMP ou WEBP. (Recebido: ${file.type})`,
        });
        setImagePreview(null);
        form.setValue("fotoUrl", "");
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: `O arquivo deve ter no máximo ${MAX_FILE_SIZE_MB}MB. (Tamanho: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        });
        setImagePreview(null);
        form.setValue("fotoUrl", "");
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("fotoUrl", result, { shouldValidate: true });
      };
      reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "Erro ao ler arquivo",
            description: "Não foi possível processar o arquivo de imagem.",
        });
        setImagePreview(null);
        form.setValue("fotoUrl", "");
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
      reader.readAsDataURL(file);
    } else {
        setImagePreview(null);
        form.setValue("fotoUrl", "");
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("fotoUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const watchedSimPatinhasDate = form.watch("simPatinhasEmissionDate");

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
      form.setValue("simPatinhasEmissionCity", "");
      form.setValue("simPatinhasEmissionUF", "");
    }
  }, [hasSimPatinhas, form]);

  const onFormErrors = (errors: any) => {
    console.error("Erros de validação do formulário:", errors);
    toast({
      variant: "destructive",
      title: "Formulário Inválido",
      description: "Por favor, verifique os campos em vermelho e corrija os erros.",
    });
  };


  const onSubmit = (data: PetFormValues) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
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

    const newPet: Pet = {
      id: petIdGenerator(),
      ownerId: user.cpf,
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
      status: { value: "ativo" },
      possuiDeficiencia: false,
      possuiMicrochip: "Não",
      possuiPedigree: "Não",
      dataNascimento: !data.birthDateUnknown && data.dataNascimento ? formatDate(data.dataNascimento, "dd/MM/yyyy") : undefined,
      idade: undefined,
      hasSimPatinhas: data.hasSimPatinhas,
      simPatinhasId: data.hasSimPatinhas === "Sim" ? data.simPatinhasId : undefined,
      simPatinhasEmissionDate: data.hasSimPatinhas === "Sim" && data.simPatinhasEmissionDate ? formatDate(data.simPatinhasEmissionDate, "dd/MM/yyyy") : undefined,
      simPatinhasEmissionCity: data.hasSimPatinhas === "Sim" ? data.simPatinhasEmissionCity : undefined,
      simPatinhasEmissionUF: data.hasSimPatinhas === "Sim" ? data.simPatinhasEmissionUF : undefined,
      secondaryTutorName: data.secondaryTutorName || undefined,
      secondaryTutorCpf: data.secondaryTutorCpf ? data.secondaryTutorCpf.replace(/[^\d]/g, "") : undefined,
    };

    if (data.birthDateUnknown && typeof data.ageInMonths === 'number') {
      newPet.idade = Math.floor(data.ageInMonths / 12);
    } else if (!data.birthDateUnknown && data.dataNascimento) {
      const age = calculateAge(data.dataNascimento);
      newPet.idade = age.years;
    }

    setAllPets([...allPets, newPet]);
    toast({ title: "Sucesso!", description: `${data.nome} foi adicionado(a) aos seus pets.` });
    router.push("/pets");
  };

  // Use helper function to get breeds based on selected species
  const baseRacas = useMemo(() => {
    return getBreedsForSpecies(especieSelecionada) || []; // Ensure array
  }, [especieSelecionada]);

  const filteredRacas = useMemo(() => {
    const safeRacas = Array.isArray(baseRacas) ? baseRacas : [];
    if (!breedSearchValue) return safeRacas;
    return safeRacas.filter(raca =>
      raca.toLowerCase().includes(breedSearchValue.toLowerCase())
    );
  }, [baseRacas, breedSearchValue]);

  // Use helper function to get fur types based on selected species
  const tiposPelagemDisponiveis = useMemo(() => {
    return getFurTypesForSpecies(especieSelecionada) || []; // Ensure array
  }, [especieSelecionada]);

  // Filter fur types based on search
  const filteredTiposPelagem = useMemo(() => {
    const safeTipos = Array.isArray(tiposPelagemDisponiveis) ? tiposPelagemDisponiveis : [];
    if (!furTypeSearchValue) return safeTipos;
    return safeTipos.filter(tipo =>
      tipo.toLowerCase().includes(furTypeSearchValue.toLowerCase())
    );
  }, [tiposPelagemDisponiveis, furTypeSearchValue]);

  // Use helper function to get fur colors based on selected species
  const baseCoresPelagem = useMemo(() => {
    return getFurColorsForSpecies(especieSelecionada) || []; // Ensure array
  }, [especieSelecionada]);

  const filteredCoresPelagem = useMemo(() => {
    const safeCores = Array.isArray(baseCoresPelagem) ? baseCoresPelagem : [];
    if (!furColorSearchValue) return safeCores;
    return safeCores.filter(cor =>
      cor.toLowerCase().includes(furColorSearchValue.toLowerCase())
    );
  }, [baseCoresPelagem, furColorSearchValue]);


  // Reset dependent fields when species changes
  useEffect(() => {
    form.setValue("raca", "");
    setBreedSearchValue("");
    form.setValue("tipoPelagem", "");
    setFurTypeSearchValue("");
    form.setValue("corPelagem", "");
    setFurColorSearchValue("");
  }, [especieSelecionada, form]);



  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Adicionar Novo Pet</CardTitle>
            <Button variant="outline" size="icon" asChild>
              <Link href="/pets">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Voltar para Meus Pets</span>
              </Link>
            </Button>
          </div>
          <CardDescription>Preencha os dados abaixo para cadastrar um novo animal.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onFormErrors)} className="space-y-8">


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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                  ? (Array.isArray(baseRacas) && baseRacas.find(raca => raca === field.value)) ?? field.value // Show value even if not in list
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
                                  {Array.isArray(filteredRacas) && filteredRacas.map((raca) => (
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

                  {/* Conditional Rendering for Tipo de Pelagem - Added Array.isArray check */}
                  {Array.isArray(tiposPelagemDisponiveis) && tiposPelagemDisponiveis.length > 0 && (
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
                                    ? (Array.isArray(tiposPelagemDisponiveis) && tiposPelagemDisponiveis.find(tipo => tipo === field.value)) ?? field.value
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
                                    {/* Added Array.isArray check */} 
                                    {Array.isArray(filteredTiposPelagem) && filteredTiposPelagem.map((tipo) => (
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
                                  ? (Array.isArray(baseCoresPelagem) && baseCoresPelagem.find(cor => cor === field.value)) ?? field.value
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
                                  {Array.isArray(filteredCoresPelagem) && filteredCoresPelagem.map((cor) => (
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormControl>
                                <DateSelectors
                                  value={field.value}
                                  onChange={field.onChange}
                                  fromYear={1980}
                                  toYear={new Date().getFullYear()}
                                  disabled={isBirthDateUnknown}
                                />
                            </FormControl>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            defaultValue={field.value}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormLabel>Carregar Foto</FormLabel>
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
                        Envie uma foto do seu pet (PNG, JPG, BMP, WEBP - Máx {MAX_FILE_SIZE_MB}MB).
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
                          defaultValue={field.value}
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
                          <FormControl>
                              <DateSelectors
                                value={field.value}
                                onChange={field.onChange}
                                fromYear={1980}
                                toYear={new Date().getFullYear()}
                              />
                          </FormControl>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  {form.formState.isSubmitting ? "Salvando..." : "Salvar Pet"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

