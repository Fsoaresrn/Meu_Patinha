"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function TermsPage() {
  const { user, setAcceptedTerms, isLoading } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.acceptedTerms) {
      router.replace("/"); // Redirect if terms already accepted
    }
  }, [user, isLoading, router]);

  const handleAcceptTerms = () => {
    if (!isChecked) {
      toast({
        variant: "destructive",
        title: "Atenção",
        description: "Você deve marcar a caixa para aceitar os termos.",
      });
      return;
    }
    setAcceptedTerms();
    toast({
      title: "Termos Aceitos!",
      description: "Obrigado por aceitar nossos termos. Aproveite o Meu Patinha!",
    });
    router.push("/");
  };

  if (isLoading || (!isLoading && user?.acceptedTerms)) {
    // Show loading or let AuthGuard handle redirect if already accepted
    return <div className="flex h-screen items-center justify-center"><p>Carregando...</p></div>;
  }

  return (
    <div className="container mx-auto flex max-w-3xl flex-col items-center justify-center py-12">
      <div className="w-full rounded-lg border bg-card p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-primary">Termos de Uso</h1>
        <ScrollArea className="mb-6 h-96 w-full rounded-md border p-4">
          <h2 className="mb-2 text-xl font-semibold">1. Aceitação dos Termos</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Ao acessar e usar o aplicativo Meu Patinha ("Aplicativo"), você concorda em cumprir e estar vinculado a estes Termos de Uso ("Termos"). Se você não concorda com estes Termos, não utilize o Aplicativo.
          </p>
          <h2 className="mb-2 text-xl font-semibold">2. Descrição do Serviço</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            O Meu Patinha é uma plataforma para ajudar tutores de animais de estimação a gerenciar informações sobre a saúde, rotina e bem-estar de seus pets. As funcionalidades incluem perfis de pets, registros médicos, ferramentas de diagnóstico auxiliadas por IA, planejamento nutricional, entre outros.
          </p>
          <h2 className="mb-2 text-xl font-semibold">3. Uso da Inteligência Artificial</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            As funcionalidades de diagnóstico de sintomas e planejamento nutricional utilizam Inteligência Artificial (IA). As informações fornecidas pela IA são para fins informativos e de auxílio, NÃO substituindo o diagnóstico, aconselhamento ou tratamento veterinário profissional. Sempre consulte um veterinário qualificado para quaisquer questões relacionadas à saúde do seu pet. O Meu Patinha não se responsabiliza por decisões tomadas com base nas sugestões da IA.
          </p>
          <h2 className="mb-2 text-xl font-semibold">4. Responsabilidade do Usuário</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Você é responsável por manter a confidencialidade dos dados da sua conta e por todas as atividades que ocorram sob sua conta. Você concorda em fornecer informações verdadeiras, precisas, atuais e completas durante o cadastro e ao usar o Aplicativo.
          </p>
          <h2 className="mb-2 text-xl font-semibold">5. Privacidade</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Nossa Política de Privacidade descreve como coletamos, usamos e protegemos suas informações pessoais. Ao usar o Aplicativo, você concorda com a coleta e uso de informações de acordo com nossa Política de Privacidade (simulada para este projeto). Todos os dados são armazenados localmente no seu dispositivo (localStorage) e não são enviados para servidores externos, exceto para interações com serviços de IA, conforme necessário para funcionalidades específicas.
          </p>
           <h2 className="mb-2 text-xl font-semibold">6. Limitação de Responsabilidade</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            O Aplicativo é fornecido "como está" e "conforme disponível". Não garantimos que o Aplicativo será ininterrupto, livre de erros ou seguro. Em nenhuma circunstância o Meu Patinha será responsável por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou da incapacidade de usar o Aplicativo.
          </p>
          <h2 className="mb-2 text-xl font-semibold">7. Modificações nos Termos</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Reservamo-nos o direito de modificar estes Termos a qualquer momento. Notificaremos sobre quaisquer alterações publicando os novos Termos no Aplicativo. Seu uso continuado do Aplicativo após tais modificações constituirá sua aceitação dos novos Termos.
          </p>
          <p className="mt-6 text-xs text-center text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </ScrollArea>
        <div className="mb-6 flex items-center space-x-2">
          <Checkbox id="accept-terms" checked={isChecked} onCheckedChange={(checked) => setIsChecked(checked as boolean)} />
          <Label htmlFor="accept-terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Eu li e concordo com os Termos de Uso do Meu Patinha.
          </Label>
        </div>
        <Button onClick={handleAcceptTerms} className="w-full">
          Continuar
        </Button>
      </div>
    </div>
  );
}
