
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/hooks/use-toast";
import type { Pet, PetSpecies, PetGender, PetSize } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { petIdGenerator, petSpeciesList, dogBreeds, catBreeds, petGendersList, yesNoOptions, furTypesBySpecies, furColorsBySpecies, petSizesList } from "@/lib/constants";
import { formatDate, parseDateSafe, formatDateToBrasil, calculateAge, isValidDate } from "@/lib/date-utils";
import { CalendarIcon, ArrowLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useMemo } from "react";

const petFormSchema = z.object({
  nome: z.string().min(2, { message: "Nome do pet é obrigatório (mínimo 2 caracteres)." }),
  especie: z.enum(petSpeciesList as [PetSpecies, ...PetSpecies[]], { required_error: "Espécie é obrigatória." }),
  raca: z.string().min(1, { message: "Raça é obrigatória." }),
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
  fotoUrl: z.string().url({ message: "URL da foto inválida." }).optional().or(z.literal("")),
  tipoPelagem: z.string().optional(),
  corPelagem: z.string().optional(),
  peso: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : parseFloat(String(val).replace(",", "."))),
    z.number({ invalid_type_error: "Peso deve ser um número." }).positive({ message: "Peso deve ser positivo." }).optional()
  ),
  porte: z.enum(petSizesList as [PetSize, ...PetSize[]]).optional(),
  sinaisObservacoes: z.string().optional(),
});

type PetFormValues = z.infer<typeof petFormSchema>;

export default function AdicionarPetPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [allPets, setAllPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const [calculatedAgeDisplay, setCalculatedAgeDisplay] = useState<string | null>(null);
  const [breedSearch, setBreedSearch] = useState("");
  const [furColorSearch, setFurColorSearch] = useState("");

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      nome: "",
      especie: undefined,
      raca: "",
      sexo: undefined,
      castrado: undefined,
      fotoUrl: "",
      sinaisObservacoes: "",
      ageInMonths: undefined,
    },
  });

  const especieSelecionada = form.watch("especie");
  const watchedDataNascimento = form.watch("dataNascimento");

  useEffect(() => {
    if (watchedDataNascimento && isValidDate(watchedDataNascimento)) {
      const age = calculateAge(watchedDataNascimento);
      setCalculatedAgeDisplay(age.display);
      if (form.getValues("ageInMonths") !== undefined) {
        form.setValue("ageInMonths", undefined, { shouldValidate: false });
      }
    } else {
      setCalculatedAgeDisplay(null);
    }
  }, [watchedDataNascimento, form]);

  const onSubmit = (data: PetFormValues) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
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
      dataNascimento: data.dataNascimento ? formatDate(data.dataNascimento, "dd/MM/yyyy") : undefined,
      idade: undefined,
    };

    if (!data.dataNascimento && typeof data.ageInMonths === 'number') {
      newPet.idade = Math.floor(data.ageInMonths / 12); 
    }

    setAllPets([...allPets, newPet]);
    toast({ title: "Sucesso!", description: `${data.nome} foi adicionado(a) aos seus pets.` });
    router.push("/pets");
  };

  const baseRacas = useMemo(() => {
    return especieSelecionada === "Cão" ? dogBreeds : especieSelecionada === "Gato" ? catBreeds : [];
  }, [especieSelecionada]);

  const racasDisponiveis = useMemo(() => {
    if (breedSearch.length >= 3) {
      return baseRacas.filter(raca => raca.toLowerCase().startsWith(breedSearch.toLowerCase()));
    }
    return baseRacas;
  }, [baseRacas, breedSearch]);

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
    form.setValue("tipoPelagem", "");
    form.setValue("corPelagem", "");
    setBreedSearch("");
    setFurColorSearch("");
  }, [especieSelecionada, form]);

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
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Pet</FormLabel>
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
                      <FormLabel>Espécie</FormLabel>
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
                <div> {/* Container for breed search and select */}
                  <FormLabel htmlFor="breed-search">Buscar Raça</FormLabel>
                  <div className="relative">
                    <Input 
                      id="breed-search"
                      placeholder="Digite min. 3 letras" 
                      value={breedSearch} 
                      onChange={(e) => setBreedSearch(e.target.value)} 
                      disabled={!especieSelecionada}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                  </div>
                  <FormField
                    control={form.control}
                    name="raca"
                    render={({ field }) => (
                      <FormItem className="mt-2"> {/* Add margin top for spacing */}
                        {/* <FormLabel>Raça</FormLabel> No longer needed as label is on search */}
                        <Select onValueChange={field.onChange} value={field.value} disabled={!especieSelecionada}>
                          <FormControl><SelectTrigger><SelectValue placeholder={especieSelecionada ? "Selecione a raça" : "Primeiro escolha a espécie"} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {racasDisponiveis.length > 0 ? (
                              racasDisponiveis.map(breed => <SelectItem key={breed} value={breed}>{breed}</SelectItem>)
                            ) : (
                              <div className="p-2 text-sm text-muted-foreground">
                                {breedSearch.length >= 3 ? "Nenhuma raça encontrada." : (especieSelecionada ? "Digite para buscar." : "Escolha a espécie.")}
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
                  name="sexo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo</FormLabel>
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
                      <FormLabel>Castrado?</FormLabel>
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
              
              <FormField
                control={form.control}
                name="dataNascimento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Nascimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              formatDateToBrasil(field.value)
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => field.onChange(date)}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {calculatedAgeDisplay && (
                      <FormDescription className="mt-1 text-sm text-muted-foreground">
                        Idade calculada: {calculatedAgeDisplay}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ageInMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade (em meses)</FormLabel>
                    <FormDescription>Preencha se a data de nascimento não for conhecida.</FormDescription>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 6"
                        {...field}
                        disabled={!!watchedDataNascimento}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fotoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Foto (Opcional)</FormLabel>
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
                      <FormLabel>Tipo de Pelagem (Opcional)</FormLabel>
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
                <div> {/* Container for fur color search and select */}
                    <FormLabel htmlFor="fur-color-search">Buscar Cor da Pelagem</FormLabel>
                    <div className="relative">
                        <Input
                        id="fur-color-search"
                        placeholder="Digite min. 3 letras"
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
                        <FormItem className="mt-2"> {/* Add margin top for spacing */}
                            {/* <FormLabel>Cor da Pelagem (Opcional)</FormLabel> No longer needed */}
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
                      <FormLabel>Peso (kg) (Opcional)</FormLabel>
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
                      <FormLabel>Porte (Opcional)</FormLabel>
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
                    <FormLabel>Sinais Particulares / Observações (Opcional)</FormLabel>
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
