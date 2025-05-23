
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Pet, DewormerLog } from "@/types";
import { useAuthStore } from "@/stores/auth.store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDate, formatDateToBrasil, isValidDate, parseDateSafe } from "@/lib/date-utils";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";

const dewormerSchema = z.object({
  productName: z.string().min(1, "Nome do produto é obrigatório."),
  administrationDate: z.date({ required_error: "Data da administração é obrigatória." }),
  nextDueDate: z.date().optional(),
  dosage: z.string().optional(),
  notes: z.string().optional(),
});

type DewormerFormValues = z.infer<typeof dewormerSchema>;

export default function NewDewormerPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [allPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const [dewormerLogs, setDewormerLogs] = useLocalStorage<DewormerLog[]>(`dewormer-logs-data-${user?.cpf || 'default'}`, []);
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoadingPet, setIsLoadingPet] = useState(true);

  const [adminDateInput, setAdminDateInput] = useState<string>("");
  const [nextDueDateInput, setNextDueDateInput] = useState<string>("");


  const form = useForm<DewormerFormValues>({
    resolver: zodResolver(dewormerSchema),
    defaultValues: {
      productName: "",
      administrationDate: undefined,
      nextDueDate: undefined,
      dosage: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (petId && user) {
      const foundPet = allPets.find(p => p.id === petId && (p.ownerId === user.cpf || p.secondaryTutorCpf === user.cpf));
      setPet(foundPet || null);
      setIsLoadingPet(false);
    } else if (!user) {
      router.push('/login');
    }
  }, [petId, allPets, user, router]);

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "administrationDate" | "nextDueDate") => {
    const typedValue = e.target.value;
    if (fieldName === "administrationDate") setAdminDateInput(typedValue);
    else setNextDueDateInput(typedValue);

    const dateFormatRegex = /^(?:\d{1,2}(?:\/(?:\d{1,2}(?:\/\d{0,4})?)?)?)?$/;
    if (typedValue.length <= 10 && (typedValue === "" || dateFormatRegex.test(typedValue))) {
        if (typedValue.length === 10 && typedValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const parsedDate = parseDateSafe(typedValue);
            if (isValidDate(parsedDate)) {
                form.setValue(fieldName, parsedDate as Date, { shouldValidate: true });
            } else {
                form.setValue(fieldName, undefined, { shouldValidate: true });
            }
        } else if (typedValue === "") {
           form.setValue(fieldName, undefined, { shouldValidate: true });
        }
    }
  };
  
  const handleDateInputBlur = (dateString: string, fieldName: "administrationDate" | "nextDueDate") => {
    const parsedDate = parseDateSafe(dateString);
    if (isValidDate(parsedDate)) {
        form.setValue(fieldName, parsedDate as Date, { shouldValidate: true });
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


  const onSubmit = (data: DewormerFormValues) => {
    if (!pet || !user) return;

    const newLog: DewormerLog = {
      id: `${pet.id}-deworm-${Date.now()}`,
      petId: pet.id,
      productName: data.productName,
      administrationDate: formatDate(data.administrationDate, "dd/MM/yyyy"),
      nextDueDate: data.nextDueDate ? formatDate(data.nextDueDate, "dd/MM/yyyy") : undefined,
      dosage: data.dosage,
      notes: data.notes,
    };

    setDewormerLogs(prev => [...prev, newLog]);
    toast({ title: "Vermífugo Registrado!", description: `Aplicação de ${data.productName} registrada para ${pet.nome}.` });
    router.push(`/saude/vermifugos/${pet.id}`);
  };

  if (isLoadingPet) {
    return <div className="flex h-screen items-center justify-center"><LoadingSpinner size={32} /> Carregando...</div>;
  }

  if (!pet) {
    return <div className="container mx-auto py-8">Pet não encontrado ou acesso não permitido.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/saude/vermifugos/${pet.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Vermífugos de {pet.nome}
          </Link>
        </Button>
      </div>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Registrar Nova Aplicação de Vermífugo</CardTitle>
          <CardDescription>Para {pet.nome}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto<span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Ex: Drontal, Vermivet" {...field} /></FormControl>
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
              <FormField
                control={form.control}
                name="nextDueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Próxima Dose (Opcional)</FormLabel>
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
                          disabled={(date) => date < (form.getValues("administrationDate") || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosagem (Opcional)</FormLabel>
                    <FormControl><Input placeholder="Ex: 1 comprimido, 0.5ml" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (Opcional)</FormLabel>
                    <FormControl><Textarea placeholder="Alguma observação adicional?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <LoadingSpinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Aplicação
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    