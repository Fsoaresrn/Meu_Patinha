
"use client";

import { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
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
import { formatDateToBrasil } from "@/lib/date-utils";

const symptomSchema = z.object({
  symptomsDescription: z.string().min(10, { message: "Descreva os sintomas com pelo menos 10 caracteres." }).max(2000, {message: "Limite de 2000 caracteres atingido."}),
  additionalSymptoms: z.array(z.string()).optional(),
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
      additionalSymptoms: [],
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
    setAnalysisResult(null); // Limpa resultado anterior
    // A linha abaixo que atualizava currentFollowUpSymptoms foi removida, pois os sintomas de acompanhamento são parte do input da IA.

    const inputForAI: CheckSymptomsInput = {
      petName: pet.nome,
      species: pet.especie,
      breed: pet.raca,
      age: pet.idade || 0, // TODO: Calcular idade em anos a partir de dataNascimento ou ageInMonths
      symptoms: data.symptomsDescription,
      additionalSymptoms: selectedFollowUpSymptoms.length > 0 ? selectedFollowUpSymptoms : undefined,
    };

    try {
      const result = await checkSymptoms(inputForAI);
      setAnalysisResult(result);
      setCurrentFollowUpSymptoms(result.suggestedFollowUpSymptoms || []);
      setSelectedFollowUpSymptoms([]); // Limpa selecionados para próxima rodada

      // Salvar log do sintoma
      const newLog: SymptomLog = {
        id: new Date().toISOString(), // Gerar ID único
        petId: pet.id,
        date: new Date().toISOString(),
        symptomsDescription: data.symptomsDescription,
        additionalSymptomsSelected: inputForAI.additionalSymptoms,
        aiDiagnosis: result.potentialDiagnoses,
        aiHomeTreatments: result.immediateCareSuggestions, // Ajustar conforme o output da IA
        aiImmediateActions: result.immediateCareSuggestions, // Ou criar campo específico
        aiDisclaimer: result.disclaimer,
        aiNeedsMoreInfo: result.needsMoreInfo,
        aiSuggestedFollowUp: result.suggestedFollowUpSymptoms,
      };
      setSymptomLogs(prevLogs => [...prevLogs, newLog]);

      toast({
        title: "Análise Concluída",
        description: "A IA processou os sintomas. Veja os resultados abaixo.",
      });
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
  
  const handleRefineSymptoms = () => {
    if (!analysisResult || !analysisResult.suggestedFollowUpSymptoms || analysisResult.suggestedFollowUpSymptoms.length === 0) return;
    
    // Prepara para uma nova submissão. O texto original é mantido.
    // Os sintomas de acompanhamento selecionados serão usados na próxima chamada onSubmit.
    // Limpa apenas o resultado da análise anterior para que o usuário veja que está "refinando".
    setAnalysisResult(null); 
    // A descrição dos sintomas não é limpa, permitindo ao usuário editá-la se desejar.
    // form.resetField("symptomsDescription"); // Não resetar a descrição principal
    form.setValue("additionalSymptoms", selectedFollowUpSymptoms); // Atualiza o form com os sintomas selecionados para a próxima submissão

    // Re-chama onSubmit com os dados atuais do formulário, que agora incluem os additionalSymptoms selecionados
    // O ideal é que o usuário clique em "Analisar Sintomas" novamente após selecionar os sintomas de acompanhamento.
    // Esta função apenas prepara o estado.
    // O usuário pode clicar em "Analisar Sintomas" novamente.
    // Se quiser submeter automaticamente: form.handleSubmit(onSubmit)();
    // Mas é melhor que o usuário confirme clicando no botão.
    toast({
      title: "Pronto para Refinar",
      description: "Selecione os sintomas adicionais e clique em 'Analisar Sintomas' novamente.",
    });
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
    // Mensagem de pet não encontrado já tratada no useEffect, router.push deve ter redirecionado
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
                {pet.especie} - {pet.raca} - {pet.idade} anos
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
              
              {currentFollowUpSymptoms.length > 0 && !analysisResult?.potentialDiagnoses && (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Sintomas Adicionais (Se houver):</FormLabel>
                  <FormDescription>A IA sugeriu verificar estes sintomas. Selecione os que se aplicam:</FormDescription>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
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
              {analysisResult?.needsMoreInfo && analysisResult.suggestedFollowUpSymptoms && analysisResult.suggestedFollowUpSymptoms.length > 0 && (
                 <Button type="button" variant="outline" onClick={handleRefineSymptoms} disabled={isSubmitting || selectedFollowUpSymptoms.length === 0} className="w-full">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Refinar com Sintomas Adicionais Selecionados
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>

        {analysisResult && (
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
            
            {analysisResult.needsMoreInfo && analysisResult.suggestedFollowUpSymptoms && analysisResult.suggestedFollowUpSymptoms.length > 0 && (
                 <Alert variant="default" className="bg-blue-50 border-blue-300">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    <AlertTitle className="font-semibold text-blue-700">Mais Informações Necessárias</AlertTitle>
                    <AlertDescription className="text-blue-600">
                    A IA precisa de mais detalhes para uma análise mais precisa. Considere os seguintes sintomas. Se aplicável, selecione-os acima e clique em "Refinar com Sintomas Adicionais Selecionados" e depois em "Analisar Sintomas" novamente.
                    <ul className="list-disc list-inside ml-4 mt-2">
                        {analysisResult.suggestedFollowUpSymptoms.map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                        ))}
                    </ul>
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
        )}
      </Card>
      <div className="mt-6 text-center">
        <Link href={`/pets/${pet.id}/symptom-history`} className="text-sm text-primary hover:underline">
            Ver Histórico de Sintomas de {pet.nome}
        </Link>
      </div>
    </div>
  );
}

