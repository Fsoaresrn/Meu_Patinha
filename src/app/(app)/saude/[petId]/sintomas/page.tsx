
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuthStore } from "@/stores/auth.store";
import type { Pet, SymptomLog } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, AlertTriangle, Lightbulb, Activity, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { checkSymptoms, type CheckSymptomsInput, type CheckSymptomsOutput } from "@/ai/flows/ai-symptom-checker";

const symptomSchema = z.object({
  symptomsDescription: z.string().min(10, { message: "Descreva os sintomas com pelo menos 10 caracteres." }).max(2000, {message: "Limite de 2000 caracteres atingido."}),
});

type SymptomFormValues = z.infer<typeof symptomSchema>;

export default function PetSintomasPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [allPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const [symptomLogs, setSymptomLogs] = useLocalStorage<SymptomLog[]>(`symptom-logs-${user?.cpf || 'geral'}`, []);
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoadingPet, setIsLoadingPet] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CheckSymptomsOutput | null>(null);
  const [currentFollowUpSymptoms, setCurrentFollowUpSymptoms] = useState<string[]>([]);
  const [selectedFollowUpSymptoms, setSelectedFollowUpSymptoms] = useState<string[]>([]);


  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      symptomsDescription: "",
    },
  });

  useEffect(() => {
    if (petId) {
      const foundPet = allPets.find(p => p.id === petId && (p.ownerId === user?.cpf || p.secondaryTutorId === user?.cpf));
      if (foundPet) {
        if (foundPet.status.value !== 'ativo') {
            toast({
                variant: "destructive",
                title: "Pet Não Ativo",
                description: `O pet ${foundPet.nome} não está com status "ativo". Não é possível registrar sintomas.`,
                duration: 5000,
            });
            router.push("/saude");
        } else {
            setPet(foundPet);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Pet não encontrado",
          description: "Não foi possível carregar as informações do pet selecionado ou você não tem permissão.",
        });
        router.push("/saude");
      }
      setIsLoadingPet(false);
    }
  }, [petId, allPets, user, router, toast]);

  const handleFollowUpSymptomToggle = (symptom: string) => {
    setSelectedFollowUpSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const onSubmit = async (data: SymptomFormValues) => {
    if (!pet || !user) {
      toast({ variant: "destructive", title: "Erro", description: "Informações do pet ou usuário não encontradas." });
      return;
    }

    setIsSubmitting(true);
    setAnalysisResult(null); // Limpa resultado anterior para indicar nova análise

    const inputForAI: CheckSymptomsInput = {
      petName: pet.nome,
      species: pet.especie,
      breed: pet.raca,
      age: pet.idade || (pet.dataNascimento ? new Date().getFullYear() - new Date(pet.dataNascimento).getFullYear() : 0),
      symptoms: data.symptomsDescription,
      additionalSymptoms: selectedFollowUpSymptoms.length > 0 ? selectedFollowUpSymptoms : undefined,
    };

    try {
      const result = await checkSymptoms(inputForAI);
      setAnalysisResult(result);

      if (result.needsMoreInfo && result.suggestedFollowUpSymptoms && result.suggestedFollowUpSymptoms.length > 0) {
        setCurrentFollowUpSymptoms(result.suggestedFollowUpSymptoms);
        setSelectedFollowUpSymptoms([]); // Limpa selecionados para próxima rodada de feedback
        toast({
          title: "Mais informações necessárias",
          description: "A IA precisa de mais detalhes. Selecione os sintomas adicionais abaixo e analise novamente.",
          duration: 7000,
        });
      } else {
        setCurrentFollowUpSymptoms([]); // Limpa se não precisar de mais info
        toast({
          title: "Análise Concluída",
          description: "A IA processou os sintomas. Veja os resultados abaixo.",
        });
      }

      // Salvar log do sintoma
      const newLog: SymptomLog = {
        id: new Date().toISOString(),
        petId: pet.id,
        date: new Date().toISOString(),
        symptomsDescription: data.symptomsDescription,
        additionalSymptomsSelected: inputForAI.additionalSymptoms,
        aiDiagnosis: result.potentialDiagnoses,
        aiImmediateActions: result.immediateCareSuggestions,
        aiDisclaimer: result.disclaimer,
        aiNeedsMoreInfo: result.needsMoreInfo,
        aiSuggestedFollowUp: result.suggestedFollowUpSymptoms,
      };
      setSymptomLogs(prevLogs => [...prevLogs, newLog]);

    } catch (error) {
      console.error("Erro ao verificar sintomas:", error);
      toast({
        variant: "destructive",
        title: "Erro na Análise",
        description: "Não foi possível realizar a análise dos sintomas. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  if (isLoadingPet) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Carregando dados do pet...</p>
      </div>
    );
  }

  if (!pet) {
    return null; 
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/saude">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Seleção de Pets
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
              <CardTitle className="text-2xl font-bold text-primary">Análise de Sintomas para {pet.nome}</CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                {pet.especie} - {pet.raca} - {pet.idade !== undefined ? `${pet.idade} anos` : (pet.dataNascimento ? `${new Date().getFullYear() - new Date(pet.dataNascimento).getFullYear()} anos` : 'Idade não informada')}
              </CardDescription>
            </div>
          </div>
           <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Importante!</AlertTitle>
            <AlertDescription>
              Esta ferramenta é um auxílio e <strong>não substitui</strong> a consulta com um veterinário.
              Em caso de emergência, procure um profissional imediatamente.
            </AlertDescription>
          </Alert>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="symptomsDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Descreva os Sintomas do Pet<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Vômito frequente nas últimas 24h, falta de apetite, apatia. Detalhe o máximo possível."
                        className="min-h-[120px] resize-y"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Seja o mais detalhado possível para uma análise mais precisa. (Máx. 2000 caracteres)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {analysisResult && analysisResult.needsMoreInfo && currentFollowUpSymptoms.length > 0 && (
                <FormItem className="p-4 border rounded-md bg-muted/50">
                  <FormLabel className="text-lg font-semibold text-primary">Para um diagnóstico mais preciso, seu pet também apresenta algum destes sintomas?</FormLabel>
                  <FormDescription>Selecione os sintomas aplicáveis abaixo e clique em "Analisar Sintomas" novamente.</FormDescription>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t">
                    {currentFollowUpSymptoms.map((symptom) => (
                      <Button
                        key={symptom}
                        type="button"
                        variant={selectedFollowUpSymptoms.includes(symptom) ? "default" : "outline"}
                        onClick={() => handleFollowUpSymptomToggle(symptom)}
                        className="w-full justify-start text-left h-auto py-2"
                        disabled={isSubmitting}
                      >
                        <span className="flex-1">{symptom}</span>
                        {selectedFollowUpSymptoms.includes(symptom) && <ShieldCheck className="h-4 w-4 ml-2 text-primary-foreground"/>}
                      </Button>
                    ))}
                  </div>
                </FormItem>
              )}


            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-4">
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analisar Sintomas
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>

        {analysisResult && !analysisResult.needsMoreInfo && analysisResult.potentialDiagnoses && (
          <CardContent className="mt-6 border-t pt-6 space-y-4">
            <h3 className="text-xl font-semibold text-primary mb-3 flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-yellow-400" /> Resultados da Análise da IA
            </h3>
            
            {analysisResult.potentialDiagnoses && (
              <Alert>
                <Lightbulb className="h-5 w-5" />
                <AlertTitle className="font-semibold">Diagnósticos Potenciais</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside ml-4">
                    {analysisResult.potentialDiagnoses.split(',').map(diag => diag.trim()).filter(diag => diag).map((diag, index) => (
                      <li key={index}>{diag}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {analysisResult.immediateCareSuggestions && (
              <Alert>
                <Activity className="h-5 w-5" />
                <AlertTitle className="font-semibold">Sugestões de Cuidados Imediatos</AlertTitle>
                 <AlertDescription>
                  <ul className="list-disc list-inside ml-4">
                    {analysisResult.immediateCareSuggestions.split(',').map(sug => sug.trim()).filter(sug => sug).map((sug, index) => (
                      <li key={index}>{sug}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {analysisResult.disclaimer && (
              <Alert variant="destructive">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-semibold">Aviso Importante</AlertTitle>
                <AlertDescription>{analysisResult.disclaimer}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>
      {pet && (
        <div className="mt-6 text-center">
            <Link href={`/pets/${pet.id}/symptom-history`} className="text-sm text-primary hover:underline">
                Ver Histórico de Sintomas de {pet.nome}
            </Link>
        </div>
      )}
    </div>
  );
}

    