
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, CalendarIcon, UploadCloud, XCircle } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Pet, MedicalDocument, MedicalDocumentType } from "@/types";
import { useAuthStore } from "@/stores/auth.store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDate, formatDateToBrasil, isValidDate, parseDateSafe } from "@/lib/date-utils";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";
import { medicalDocumentTypesConstants } from "@/lib/constants";
import Image from "next/image"; // Para preview de imagem, se o documento for uma imagem

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
// Permitir tipos de documentos comuns, incluindo imagens e PDF
const ALLOWED_DOC_TYPES = ["image/jpeg", "image/png", "image/bmp", "image/webp", "application/pdf"];


const documentSchema = z.object({
  documentName: z.string().min(1, "Nome do documento é obrigatório."),
  documentType: z.enum(medicalDocumentTypesConstants as [MedicalDocumentType, ...MedicalDocumentType[]], {
    required_error: "Tipo de documento é obrigatório.",
  }),
  issueDate: z.date({ required_error: "Data de emissão é obrigatória." }),
  fileDataUrl: z.string().optional(), // Armazenará o Data URL do arquivo
  fileName: z.string().optional(),
  notes: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export default function NewDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [allPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const [medicalDocuments, setMedicalDocuments] = useLocalStorage<MedicalDocument[]>(`medical-docs-data-${user?.cpf || 'default'}`, []);
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoadingPet, setIsLoadingPet] = useState(true);
  const [filePreview, setFilePreview] = useState<string | null>(null); // Para Data URL
  const [isImageFile, setIsImageFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [issueDateInput, setIssueDateInput] = useState<string>("");

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentName: "",
      documentType: undefined,
      issueDate: undefined,
      fileDataUrl: undefined,
      fileName: undefined,
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!ALLOWED_DOC_TYPES.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Tipo de arquivo inválido",
          description: `Por favor, selecione um arquivo PNG, JPG, BMP, WEBP ou PDF. (Recebido: ${file.type})`,
        });
        setFilePreview(null);
        form.setValue("fileDataUrl", undefined);
        form.setValue("fileName", undefined);
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: `O arquivo deve ter no máximo ${MAX_FILE_SIZE_MB}MB. (Tamanho: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        });
        setFilePreview(null);
        form.setValue("fileDataUrl", undefined);
        form.setValue("fileName", undefined);
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      form.setValue("fileName", file.name);
      setIsImageFile(file.type.startsWith("image/"));

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFilePreview(result);
        form.setValue("fileDataUrl", result, { shouldValidate: true });
      };
      reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "Erro ao ler arquivo",
            description: "Não foi possível processar o arquivo.",
        });
        setFilePreview(null);
        form.setValue("fileDataUrl", undefined);
        form.setValue("fileName", undefined);
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
      reader.readAsDataURL(file);
    } else {
        setFilePreview(null);
        form.setValue("fileDataUrl", undefined);
        form.setValue("fileName", undefined);
    }
  };

  const removeFile = () => {
    setFilePreview(null);
    setIsImageFile(false);
    form.setValue("fileDataUrl", undefined);
    form.setValue("fileName", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typedValue = e.target.value;
    setIssueDateInput(typedValue);
    const dateFormatRegex = /^(?:\d{1,2}(?:\/(?:\d{1,2}(?:\/\d{0,4})?)?)?)?$/;
    if (typedValue.length <= 10 && (typedValue === "" || dateFormatRegex.test(typedValue))) {
        if (typedValue.length === 10 && typedValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const parsedDate = parseDateSafe(typedValue);
            if (isValidDate(parsedDate)) {
                form.setValue("issueDate", parsedDate as Date, { shouldValidate: true });
            } else {
                form.setValue("issueDate", undefined, { shouldValidate: true });
            }
        } else if (typedValue === "") {
           form.setValue("issueDate", undefined, { shouldValidate: true });
        }
    }
  };
  
  const handleDateInputBlur = (dateString: string) => {
    const parsedDate = parseDateSafe(dateString);
    if (isValidDate(parsedDate)) {
        form.setValue("issueDate", parsedDate as Date, { shouldValidate: true });
        setIssueDateInput(formatDateToBrasil(parsedDate));
    } else {
        if (dateString === "") {
            form.setValue("issueDate", undefined, { shouldValidate: true });
        } else {
            form.setValue("issueDate", undefined, { shouldValidate: true });
            setIssueDateInput(dateString);
        }
    }
  };


  const onSubmit = (data: DocumentFormValues) => {
    if (!pet || !user) return;

    const newDocument: MedicalDocument = {
      id: `${pet.id}-doc-${Date.now()}`,
      petId: pet.id,
      documentName: data.documentName,
      documentType: data.documentType,
      issueDate: formatDate(data.issueDate, "dd/MM/yyyy"),
      fileDataUrl: data.fileDataUrl,
      fileName: data.fileName,
      notes: data.notes,
    };

    setMedicalDocuments(prev => [...prev, newDocument]);
    toast({ title: "Documento Registrado!", description: `${data.documentName} foi adicionado para ${pet.nome}.` });
    router.push(`/saude/exames/${pet.id}`);
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
          <Link href={`/saude/exames/${pet.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Exames de {pet.nome}
          </Link>
        </Button>
      </div>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Registrar Novo Exame/Documento Médico</CardTitle>
          <CardDescription>Para {pet.nome}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="documentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Documento<span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Ex: Hemograma Completo, Raio-X Tórax" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento<span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {medicalDocumentTypesConstants.map(type => (
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
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Emissão/Exame<span className="text-destructive">*</span></FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className="relative">
                                <Input
                                  placeholder="dd/mm/aaaa"
                                  value={issueDateInput}
                                  onChange={handleDateInputChange}
                                  onBlur={() => handleDateInputBlur(issueDateInput)}
                                  className={cn("w-full pl-3 pr-10 text-left font-normal", !field.value && !issueDateInput && "text-muted-foreground")}
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
                              form.setValue("issueDate", date as Date, { shouldValidate: true });
                              if (date && isValidDate(date)) setIssueDateInput(formatDateToBrasil(date)); else setIssueDateInput("");
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
                  name="fileDataUrl" // Campo oculto que armazena o data URL
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arquivo do Documento (Opcional)</FormLabel>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-full p-4 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}>
                          <FormControl>
                            <Input
                              type="file"
                              accept={ALLOWED_DOC_TYPES.join(",")}
                              className="hidden" 
                              ref={fileInputRef}
                              onChange={handleFileChange}
                            />
                          </FormControl>
                          {filePreview ? (
                            <div className="relative w-full mx-auto group">
                              {isImageFile ? (
                                 <Image src={filePreview} alt="Preview do documento" width={150} height={150} className="rounded-md object-contain mx-auto h-48"/>
                              ) : (
                                <div className="text-center p-4 bg-muted rounded-md">
                                  <FileText className="h-12 w-12 mx-auto mb-2 text-primary" />
                                  <p className="text-sm font-medium">{form.getValues("fileName") || "Arquivo selecionado"}</p>
                                  <p className="text-xs text-muted-foreground">Preview não disponível para este tipo de arquivo.</p>
                                </div>
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                aria-label="Remover arquivo"
                              >
                                <XCircle className="h-5 w-5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground py-6">
                              <UploadCloud className="h-12 w-12 mb-2" />
                              <p className="text-sm">Clique para carregar um arquivo</p>
                              <p className="text-xs">(PDF, PNG, JPG, etc. - Máx {MAX_FILE_SIZE_MB}MB)</p>
                            </div>
                          )}
                        </div>
                      </div>
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
                    <FormControl><Textarea placeholder="Resultados principais, recomendações ou outras notas." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <LoadingSpinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar Documento
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    