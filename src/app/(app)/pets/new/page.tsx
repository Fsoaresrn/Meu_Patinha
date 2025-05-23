
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { petIdGenerator, petSpeciesList, dogBreeds, catBreeds, petGendersList, yesNoOptions, furTypesBySpecies, furColorsBySpecies, petSizesList, acquisitionTypes, petPurposes, ufsBrasil } from "@/lib/constants";
import { formatDate, parseDateSafe, formatDateToBrasil, calculateAge, isValidDate } from "@/lib/date-utils";
import { CalendarIcon, ArrowLeft, Search, ChevronsUpDown, Check as CheckIcon, Link as LinkIcon, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useMemo } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { parse as parseDateFn } from 'date-fns';

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
  fotoUrl: z.string().url({ message: "URL da foto inválida." }).optional().or(z.literal("")),
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

export default function AdicionarPetPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [allPets, setAllPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const [calculatedAgeDisplay, setCalculatedAgeDisplay] = useState<string | null>(null);
  
  const [isBreedPopoverOpen, setIsBreedPopoverOpen] = useState(false);
  const [breedSearchValue, setBreedSearchValue] = useState("");
  
  const [furColorSearch, setFurColorSearch] = useState("");

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSimPatinhasCalendarOpen, setIsSimPatinhasCalendarOpen] = useState(false);
    
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
      sinaisObservacoes: "",
      birthDateUnknown: false,
      dataNascimento: undefined,
      ageInMonths: undefined,
      hasSimPatinhas: undefined,
      simPatinhasId: "",
      simPatinhasEmissionDate: undefined,
      simPatinhasEmissionCity: "",
      simPatinhasEmissionUF: "",
    },
  });

  const especieSelecionada = form.watch("especie");
  const watchedDataNascimento = form.watch("dataNascimento");
  const isBirthDateUnknown = form.watch("birthDateUnknown");
  const hasSimPatinhas = form.watch("hasSimPatinhas");
  
  const [dateInputString, setDateInputString] = useState<string>("");
  const [simPatinhasDateInputString, setSimPatinhasDateInputString] = useState<string>("");

  useEffect(() => {
    if (watchedDataNascimento && isValidDate(watchedDataNascimento)) {
      const formattedDate = formatDateToBrasil(watchedDataNascimento);
      if (dateInputString !== formattedDate) {
        setDateInputString(formattedDate);
      }
    } else if (!watchedDataNascimento && dateInputString !== "") {
      setDateInputString("");
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
        setSimPatinhasDateInputString("");
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

  const coresPelagemDisponiveis = useMemo(() => {
    if (furColorSearch.length >= 3) {
      return baseCoresPelagem.filter(cor => cor.toLowerCase().startsWith(furColorSearch.toLowerCase()));
    }
    return baseCoresPelagem;
  }, [baseCoresPelagem, furColorSearch]);


  useEffect(() => {
    form.setValue("raca", "");
    setBreedSearchValue("");
    form.setValue("tipoPelagem", "");
    form.setValue("corPelagem", "");
    setFurColorSearch("");
  }, [especieSelecionada, form]);

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "dataNascimento" | "simPatinhasEmissionDate") => {
    const typedValue = e.target.value;
    if (fieldName === "dataNascimento") {
      setDateInputString(typedValue);
    } else {
      setSimPatinhasDateInputString(typedValue);
    }

    if (typedValue.length <= 10) {
        if (typedValue === "" || /^(?:\d{1,2}\/?\d{0,2}\/?\d{0,4})?$/.test(typedValue)) { 
            if (typedValue.length === 10 && typedValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                 const parsedDate = parseDateFn(typedValue, "dd/MM/yyyy", new Date());
                 if (isValidDate(parsedDate)) {
                    const currentRHFDate = form.getValues(fieldName);
                    if (!currentRHFDate || currentRHFDate.getTime() !== parsedDate.getTime()) {
                        form.setValue(fieldName, parsedDate, { shouldValidate: true });
                    }
                 }
            } else if (typedValue === "") {
                form.setValue(fieldName, undefined, { shouldValidate: true });
            }
        }
    } else if (typedValue === "") {
        form.setValue(fieldName, undefined, { shouldValidate: true });
    }
  };

  const handleDateInputBlur = (dateString: string, fieldName: "dataNascimento" | "simPatinhasEmissionDate") => {
    const parsedDate = parseDateFn(dateString, "dd/MM/yyyy", new Date());
    const currentRHFDate = form.getValues(fieldName);

    if (isValidDate(parsedDate)) {
      if (!currentRHFDate || currentRHFDate.getTime() !== parsedDate.getTime()) {
        form.setValue(fieldName, parsedDate, { shouldValidate: true });
      }
      if (fieldName === "dataNascimento") {
        setDateInputString(formatDateToBrasil(parsedDate));
      } else {
        setSimPatinhasDateInputString(formatDateToBrasil(parsedDate));
      }
    } else {
      if (dateString === "") { 
        if (currentRHFDate !== undefined) {
            form.setValue(fieldName, undefined, { shouldValidate: true });
        }
      } else { 
        if (currentRHFDate !== undefined) {
            form.setValue(fieldName, undefined, { shouldValidate: true });
        }
         if (fieldName === "dataNascimento") {
            setDateInputString(dateString); // Keep invalid input string for user to see
        } else {
            setSimPatinhasDateInputString(dateString); // Keep invalid input string for user to see
        }
      }
    }
  };


  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/pets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Meus Pets
          </Link>
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Adicionar Novo Pet</CardTitle>
          <CardDescription>Preencha as informações do seu novo companheiro.</CardDescription>
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
                                    form.setValue("raca", raca);
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
                    <FormLabel>URL da Foto</FormLabel>
                    <FormControl><Input placeholder="https://exemplo.com/foto.png" {...field} /></FormControl>
                    <FormDescription>Cole a URL de uma imagem para o perfil do pet.</FormDescription>
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
                <div> 
                    <FormLabel htmlFor="fur-color-search">Cor da Pelagem</FormLabel>
                    <div className="relative mt-2">
                        <Input
                        id="fur-color-search"
                        placeholder="Digite min. 3 letras para buscar"
                        value={furColorSearch}
                        onChange={(e) => setFurColorSearch(e.target.value)}
                        disabled={!especieSelecionada}
                        className="pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                    </div>
                    <FormField
                        control={form.control}
                        name="corPelagem"
                        render={({ field }) => (
                        <FormItem className="mt-2">
                            <Select onValueChange={field.onChange} value={field.value} disabled={!especieSelecionada || coresPelagemDisponiveis.length === 0 && furColorSearch.length < 3}>
                            <FormControl><SelectTrigger><SelectValue placeholder={especieSelecionada ? "Selecione a cor" : "Escolha a espécie"} /></SelectTrigger></FormControl>
                            <SelectContent>
                                {coresPelagemDisponiveis.length > 0 ? (
                                coresPelagemDisponiveis.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)
                                ) : (
                                <div className="p-2 text-sm text-muted-foreground">
                                    {furColorSearch.length >= 3 ? "Nenhuma cor encontrada." : (especieSelecionada ? "Digite para buscar." : "Escolha a espécie.")}
                                </div>
                                )}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
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
                <Button type="button" variant="outline" onClick={() => router.push('/pets')}>Cancelar</Button>
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

    