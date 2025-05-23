
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuthStore } from "@/stores/auth.store";
import type { Pet, Vaccination, VaccineProtocolInfo, VaccineBoosterFrequencySelected, PetSpecies } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Info, CalendarIcon, Syringe, Save } from "lucide-react";
import { formatDateToBrasil, parseDateSafe, isValidDate, addMonths, addYears, formatDate } from "@/lib/date-utils";
import { vaccineProtocols, vaccineBoosterFrequenciesConstants, genericVaccineDosesConstants, vaccineCategoriesConstants } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { format as dateFnsFormat, parse as dateFnsParse } from 'date-fns';

const vaccineFormSchema = z.object({
  vaccineType: z.string({ required_error: "Selecione o tipo da vacina." }),
  specifiedVaccineName: z.string().optional(),
  dose: z.string({ required_error: "Selecione a dose aplicada." }),
  administrationDate: z.date({ required_error: "Data da administração é obrigatória." }),
  boosterFrequencySelected: z.string().optional(), // Corresponde a VaccineBoosterFrequencySelected
  nextDueDate: z.date().optional(),
  vetClinic: z.string().optional(),
  vetName: z.string().optional(),
  lotNumber: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.vaccineType === "outra" && (!data.specifiedVaccineName || data.specifiedVaccineName.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Nome da vacina é obrigatório se 'Outra' for selecionada.",
      path: ["specifiedVaccineName"],
    });
  }
  if (data.boosterFrequencySelected === "Definir Próxima Data Manualmente" && !data.nextDueDate) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Próxima data é obrigatória se 'Definir Manualmente' for selecionado.",
      path: ["nextDueDate"],
    });
  }
});

type VaccineFormValues = z.infer<typeof vaccineFormSchema>;

export default function AddVaccinationPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [allPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const [vaccinations, setVaccinations] = useLocalStorage<Vaccination[]>(`vaccinations-data-${user?.cpf || 'default'}`, []);
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoadingPet, setIsLoadingPet] = useState(true);
  
  const [selectedProtocol, setSelectedProtocol] = useState<VaccineProtocolInfo | null>(null);
  const [availableDoses, setAvailableDoses] = useState<string[]>(genericVaccineDosesConstants);

  const [adminDateInput, setAdminDateInput] = useState<string>("");
  const [nextDueDateInput, setNextDueDateInput] = useState<string>("");

  const form = useForm<VaccineFormValues>({
    resolver: zodResolver(vaccineFormSchema),
    defaultValues: {
      vaccineType: "",
      specifiedVaccineName: "",
      dose: "",
      administrationDate: undefined,
      boosterFrequencySelected: undefined,
      nextDueDate: undefined,
      vetClinic: "",
      vetName: "",
      lotNumber: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (petId && user) {
      const foundPet = allPets.find(p => p.id === petId && (p.ownerId === user.cpf || p.secondaryTutorCpf === user.cpf));
      if (foundPet) {
        if (foundPet.status.value !== 'ativo') {
             toast({
                variant: "destructive",
                title: "Pet Não Ativo",
                description: `Não é possível registrar vacinas para ${foundPet.nome} pois o status não é "ativo".`,
                duration: 7000,
            });
            router.push(`/vaccination-booklet/${petId}`);
            return;
        }
        setPet(foundPet);
      } else {
        toast({ variant: "destructive", title: "Pet não encontrado", description: "Não foi possível carregar as informações do pet." });
        router.push("/vaccination-booklet");
      }
      setIsLoadingPet(false);
    } else if (!user) {
        router.push("/login");
    }
  }, [petId, allPets, user, router, toast]);

  const watchedVaccineType = form.watch("vaccineType");
  const watchedAdminDate = form.watch("administrationDate");
  const watchedBoosterFrequency = form.watch("boosterFrequencySelected");

  useEffect(() => {
    if (watchedVaccineType) {
      const protocol = vaccineProtocols.find(p => p.id === watchedVaccineType);
      setSelectedProtocol(protocol || null);
      if (protocol && protocol.recommendedDoses && protocol.recommendedDoses.length > 0) {
        setAvailableDoses(protocol.recommendedDoses);
      } else {
        setAvailableDoses(genericVaccineDosesConstants);
      }
      form.setValue("dose", ""); // Reset dose selection
    } else {
      setSelectedProtocol(null);
      setAvailableDoses(genericVaccineDosesConstants);
    }
  }, [watchedVaccineType, form]);

  // Auto-calculate next due date
  useEffect(() => {
    if (watchedAdminDate && watchedBoosterFrequency && watchedBoosterFrequency !== "Definir Próxima Data Manualmente" && watchedBoosterFrequency !== "Não Aplicar Reforço" && watchedBoosterFrequency !== "Dose Única") {
      let nextDate: Date | null = null;
      try {
        const adminDateObj = new Date(watchedAdminDate);
        if (isValidDate(adminDateObj)) {
            if (watchedBoosterFrequency === "Reforço Semanal") nextDate = addMonths(adminDateObj, 0.25); // Approx
            else if (watchedBoosterFrequency === "Reforço Mensal") nextDate = addMonths(adminDateObj, 1);
            else if (watchedBoosterFrequency === "Reforço Anual") nextDate = addYears(adminDateObj, 1);
            else if (watchedBoosterFrequency === "Reforço a cada 3 anos") nextDate = addYears(adminDateObj, 3);
            
            if (nextDate && isValidDate(nextDate)) {
              form.setValue("nextDueDate", nextDate, { shouldValidate: true });
              setNextDueDateInput(formatDateToBrasil(nextDate));
            } else {
              form.setValue("nextDueDate", undefined);
              setNextDueDateInput("");
            }
        }
      } catch (e) {
        form.setValue("nextDueDate", undefined);
        setNextDueDateInput("");
      }
    } else if (watchedBoosterFrequency === "Definir Próxima Data Manualmente" || watchedBoosterFrequency === "Não Aplicar Reforço" || watchedBoosterFrequency === "Dose Única") {
      // User will set manually or no next date
      if (watchedBoosterFrequency !== "Definir Próxima Data Manualmente") {
        form.setValue("nextDueDate", undefined);
        setNextDueDateInput("");
      }
    }
  }, [watchedAdminDate, watchedBoosterFrequency, form]);


  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "administrationDate" | "nextDueDate") => {
    const typedValue = e.target.value;
    if (fieldName === "administrationDate") setAdminDateInput(typedValue);
    else setNextDueDateInput(typedValue);

    const dateFormatRegex = /^(?:\d{1,2}(?:\/(?:\d{1,2}(?:\/\d{0,4})?)?)?)?$/;
    if (typedValue.length <= 10 && (typedValue === "" || dateFormatRegex.test(typedValue))) {
        if (typedValue.length === 10 && typedValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const parsedDate = dateFnsParse(typedValue, "dd/MM/yyyy", new Date());
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
  
  const handleDateInputBlur = (dateString: string, fieldName: "administrationDate" | "nextDueDate") => {
    const parsedDate = dateFnsParse(dateString, "dd/MM/yyyy", new Date());
    if (isValidDate(parsedDate)) {
        form.setValue(fieldName, parsedDate, { shouldValidate: true });
        if (fieldName === "administrationDate") setAdminDateInput(formatDateToBrasil(parsedDate));
        else setNextDueDateInput(formatDateToBrasil(parsedDate));
    } else {
        if (dateString === "") {
            form.setValue(fieldName, undefined, { shouldValidate: true });
        } else {
            form.setValue(fieldName, undefined, { shouldValidate: true });
            if (fieldName === "administrationDate") setAdminDateInput(dateString);
            else setNextDueDateInput(dateString);
        }
    }
  };


  const onSubmit = (data: VaccineFormValues) => {
    if (!pet || !user) return;

    const newVaccination: Vaccination = {
      id: `${pet.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // Unique ID
      petId: pet.id,
      vaccineType: data.vaccineType,
      vaccineName: data.vaccineType === "outra" ? data.specifiedVaccineName || "Outra" : selectedProtocol?.name || "Nome não encontrado",
      specifiedVaccineName: data.vaccineType === "outra" ? data.specifiedVaccineName : undefined,
      dose: data.dose,
      administrationDate: formatDate(data.administrationDate, "dd/MM/yyyy"),
      boosterFrequencySelected: data.boosterFrequencySelected as VaccineBoosterFrequencySelected | undefined,
      nextDueDate: data.nextDueDate ? formatDate(data.nextDueDate, "dd/MM/yyyy") : undefined,
      vetClinic: data.vetClinic,
      vetName: data.vetName,
      lotNumber: data.lotNumber,
      notes: data.notes,
    };

    setVaccinations(prev => [...prev, newVaccination]);
    toast({ title: "Vacina Registrada!", description: `${newVaccination.vaccineName} foi adicionada à caderneta de ${pet.nome}.` });
    router.push(`/vaccination-booklet/${pet.id}`);
  };
  
  const cardThemeClasses = () => {
    if (!pet || pet.status.value !== 'ativo') return "bg-muted/30";
    switch (pet.sexo) {
      case "Macho": return "theme-male";
      case "Fêmea": return "theme-female";
      default: return "theme-neutral-gender";
    }
  };

  if (isLoadingPet) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size={48} />
        <p className="ml-4 text-lg">Carregando...</p>
      </div>
    );
  }

  if (!pet) return null; // Should be redirected by useEffect

  const filteredVaccineProtocols = vaccineProtocols.filter(
    vp => vp.species.includes(pet.especie) || vp.id === "outra"
  );

  return (
    <div className={cn("container mx-auto py-8 px-4", cardThemeClasses())}>
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/vaccination-booklet/${pet.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Caderneta de {pet.nome}
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
           <div className="flex items-center space-x-3 mb-3">
             <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50">
                <Image
                    src={pet.fotoUrl || `https://placehold.co/100x100.png?text=${encodeURIComponent(pet.nome.charAt(0))}`}
                    alt={`Foto de ${pet.nome}`}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={`${pet.especie} ${pet.raca}`}
                />
            </div>
            <div>
                <CardTitle className="text-2xl font-bold text-primary">Registrar Nova Vacina para {pet.nome}</CardTitle>
                <CardDescription>
                    {pet.especie} - {pet.raca}
                </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="vaccineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo da Vacina<span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {filteredVaccineProtocols.map(protocol => (
                          <SelectItem key={protocol.id} value={protocol.id}>{protocol.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedVaccineType === "outra" && (
                <FormField
                  control={form.control}
                  name="specifiedVaccineName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Vacina (Especificar)<span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Digite o nome da vacina" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedProtocol && selectedProtocol.id !== "outra" && (
                <Card className="p-4 bg-muted/50 border-dashed">
                  <CardTitle className="text-md mb-2">Detalhes do Protocolo: {selectedProtocol.name}</CardTitle>
                  <div className="text-sm space-y-1">
                    <p><strong>Previne:</strong> {selectedProtocol.preventsDiseases.join(", ")}</p>
                    <p><strong>Categoria:</strong> {selectedProtocol.importance}</p>
                    {selectedProtocol.notes && <p><strong>Esquema Recomendado:</strong> {selectedProtocol.notes}</p>}
                  </div>
                </Card>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dose Aplicada<span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione a dose" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {availableDoses.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="administrationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data da Administração<span className="text-destructive">*</span></FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className="relative">
                                <Input
                                  placeholder="dd/mm/aaaa"
                                  value={adminDateInput}
                                  onChange={(e) => handleDateInputChange(e, "administrationDate")}
                                  onBlur={() => handleDateInputBlur(adminDateInput, "administrationDate")}
                                  className={cn("w-full pl-3 pr-10 text-left font-normal", !field.value && !adminDateInput && "text-muted-foreground")}
                                />
                                <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 cursor-pointer" />
                            </div>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                                form.setValue("administrationDate", date as Date, { shouldValidate: true });
                                if (date && isValidDate(date)) setAdminDateInput(formatDateToBrasil(date)); else setAdminDateInput("");
                            }}
                            disabled={(date) => date > new Date() || date < new Date("1950-01-01")}
                            initialFocus
                          />
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
                  name="boosterFrequencySelected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência do Reforço</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione a frequência" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {vaccineBoosterFrequenciesConstants.map(freq => (
                            <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nextDueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data da Próxima Dose</FormLabel>
                       <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className="relative">
                                <Input
                                  placeholder="dd/mm/aaaa"
                                  value={nextDueDateInput}
                                  onChange={(e) => handleDateInputChange(e, "nextDueDate")}
                                  onBlur={() => handleDateInputBlur(nextDueDateInput, "nextDueDate")}
                                  className={cn("w-full pl-3 pr-10 text-left font-normal", !field.value && !nextDueDateInput && "text-muted-foreground")}
                                  disabled={watchedBoosterFrequency !== "Definir Próxima Data Manualmente"}
                                />
                                <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 cursor-pointer" />
                            </div>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                                form.setValue("nextDueDate", date as Date, { shouldValidate: true });
                                if (date && isValidDate(date)) setNextDueDateInput(formatDateToBrasil(date)); else setNextDueDateInput("");
                            }}
                            disabled={(date) => date < (form.getValues("administrationDate") || new Date()) || watchedBoosterFrequency !== "Definir Próxima Data Manualmente"}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField control={form.control} name="lotNumber" render={({ field }) => (
                  <FormItem><FormLabel>Lote da Vacina</FormLabel><FormControl><Input placeholder="Número do lote" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="vetClinic" render={({ field }) => (
                    <FormItem><FormLabel>Clínica Veterinária</FormLabel><FormControl><Input placeholder="Nome da clínica" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="vetName" render={({ field }) => (
                    <FormItem><FormLabel>Veterinário(a) Responsável</FormLabel><FormControl><Input placeholder="Nome do(a) veterinário(a)" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl><Textarea placeholder="Alguma observação adicional sobre esta aplicação?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )} />

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push(`/vaccination-booklet/${pet.id}`)}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (<><LoadingSpinner className="mr-2" size={16}/> Salvando...</>) : (<><Save className="mr-2 h-4 w-4" /> Salvar Vacina</>)}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

