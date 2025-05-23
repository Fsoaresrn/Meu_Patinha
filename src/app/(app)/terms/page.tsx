
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
        description: "Você deve marcar a caixa para aceitar os termos e a política de privacidade.",
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
    return <div className="flex h-screen items-center justify-center"><p>Carregando...</p></div>;
  }

  return (
    <div className="container mx-auto flex max-w-3xl flex-col items-center justify-center py-12">
      <div className="w-full rounded-lg border bg-card p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-primary">Termos de Uso e Política de Privacidade do Meu Patinha</h1>
        <ScrollArea className="mb-6 h-[500px] w-full rounded-md border p-4">
          <h2 className="mb-2 text-xl font-semibold">Termos de Uso</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Ao acessar e usar o aplicativo Meu Patinha ("Aplicativo"), você concorda em cumprir e estar vinculado a estes Termos de Uso ("Termos"). Se você não concorda com estes Termos, não utilize o Aplicativo.
          </p>
          
          <h3 className="mb-2 text-lg font-semibold">1. Descrição do Serviço</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            O Meu Patinha é uma plataforma para ajudar tutores de animais de estimação a gerenciar informações sobre a saúde, rotina e bem-estar de seus pets. As funcionalidades incluem perfis de pets, registros médicos, ferramentas de diagnóstico auxiliadas por IA, planejamento nutricional, entre outros.
          </p>
          
          <h3 className="mb-2 text-lg font-semibold">2. Uso da Inteligência Artificial e Responsabilidade</h3>
          <p className="mb-2 text-sm text-muted-foreground">
            As funcionalidades de diagnóstico de sintomas e planejamento nutricional utilizam Inteligência Artificial (IA). As informações fornecidas pela IA são para fins informativos e de auxílio preliminar, <strong>NÃO substituindo, em hipótese alguma, o diagnóstico, aconselhamento ou tratamento veterinário profissional.</strong>
          </p>
          <p className="mb-2 text-sm text-muted-foreground">
            <strong>É fundamental compreender que as sugestões da IA são baseadas em padrões e dados, e não constituem um diagnóstico veterinário definitivo.</strong> A saúde do seu animal de estimação é uma responsabilidade séria.
          </p>
          <p className="mb-2 text-sm text-muted-foreground">
            <strong>Você concorda e reconhece que:</strong>
          </p>
          <ul className="mb-4 ml-6 list-disc text-sm text-muted-foreground">
            <li>Sempre consultará um médico veterinário qualificado para quaisquer questões relacionadas à saúde do seu pet, especialmente para confirmação de diagnósticos e planos de tratamento.</li>
            <li>O veterinário poderá (e provavelmente irá) solicitar exames complementares para um diagnóstico preciso e confiável.</li>
            <li>Você não deve tomar decisões críticas de tratamento ou manejo da saúde do seu pet baseando-se unicamente nas sugestões fornecidas pela IA do Aplicativo.</li>
            <li>O Meu Patinha e seus desenvolvedores não se responsabilizam por diagnósticos incorretos, decisões tomadas com base nas sugestões da IA sem a devida consulta e acompanhamento veterinário profissional, ou por quaisquer consequências advindas do uso indevido das informações fornecidas pela ferramenta de IA.</li>
          </ul>
          
          <h3 className="mb-2 text-lg font-semibold">3. Responsabilidade do Usuário</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Você é responsável por manter a confidencialidade dos dados da sua conta e por todas as atividades que ocorram sob sua conta. Você concorda em fornecer informações verdadeiras, precisas, atuais e completas durante o cadastro e ao usar o Aplicativo.
          </p>
          
          <h3 className="mb-2 text-lg font-semibold">4. Limitação de Responsabilidade</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            O Aplicativo é fornecido "como está" e "conforme disponível". Não garantimos que o Aplicativo será ininterrupto, livre de erros ou seguro. Em nenhuma circunstância o Meu Patinha será responsável por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou da incapacidade de usar o Aplicativo, incluindo, mas não se limitando a, decisões tomadas com base nas funcionalidades de IA sem o devido acompanhamento veterinário.
          </p>
          
          <h3 className="mb-2 text-lg font-semibold">5. Modificações nos Termos</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Reservamo-nos o direito de modificar estes Termos e a Política de Privacidade a qualquer momento. Notificaremos sobre quaisquer alterações publicando os novos termos no Aplicativo. Seu uso continuado do Aplicativo após tais modificações constituirá sua aceitação dos novos termos.
          </p>

          <div className="my-6 border-t pt-6">
            <h2 className="mb-4 text-xl font-semibold">Política de Privacidade</h2>
            <p className="mb-2 text-sm text-muted-foreground">
              Esta Política de Privacidade descreve como o Meu Patinha coleta, usa e protege suas informações pessoais, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) do Brasil.
            </p>

            <h3 className="mb-2 text-lg font-semibold">1. Coleta de Dados</h3>
            <p className="mb-1 text-sm text-muted-foreground">Coletamos as seguintes informações:</p>
            <ul className="mb-2 ml-6 list-disc text-sm text-muted-foreground">
              <li><strong>Informações de Cadastro:</strong> Nome, CPF, e-mail, perfis de responsabilidade selecionados (Tutor(a), Cuidador(a), Veterinário(a)), e, opcionalmente, UF, cidade, endereço, CEP e telefone, caso fornecidos na seção "Meu Cadastro".</li>
              <li><strong>Dados dos Pets:</strong> Todas as informações que você cadastra sobre seus animais, como nome, espécie, raça, histórico médico, vacinas, sintomas relatados, etc.</li>
              <li><strong>Dados de Uso da IA:</strong> Informações fornecidas às funcionalidades de Inteligência Artificial, como descrição de sintomas, idade, peso e espécie do pet para diagnósticos ou planos nutricionais. Estes dados são enviados a serviços de IA (atualmente Google AI via Genkit) para processamento. As informações de identificação pessoal do tutor (como nome, CPF, e-mail) NÃO são enviadas para estas ferramentas de IA, apenas os dados do pet relevantes para a funcionalidade.</li>
            </ul>
            <p className="mb-4 text-sm text-muted-foreground">
              <strong>Armazenamento:</strong> A maioria dos seus dados pessoais e dos seus pets são armazenados localmente no seu navegador (utilizando `localStorage`). Isso significa que os dados residem no seu dispositivo.
            </p>
            
            <h3 className="mb-2 text-lg font-semibold">2. Uso dos Dados</h3>
            <p className="mb-1 text-sm text-muted-foreground">Utilizamos seus dados para:</p>
            <ul className="mb-4 ml-6 list-disc text-sm text-muted-foreground">
              <li>Permitir o seu acesso e uso das funcionalidades do Aplicativo.</li>
              <li>Gerenciar os perfis e informações dos seus pets.</li>
              <li>Operar as funcionalidades de Inteligência Artificial para fornecer sugestões de diagnóstico e planos nutricionais.</li>
              <li>Permitir o funcionamento da funcionalidade de recuperação de senha (onde uma senha provisória pode ser gerada e armazenada temporariamente).</li>
              <li>Melhorar a experiência do usuário e a qualidade do Aplicativo (de forma anônima e agregada, se aplicável).</li>
            </ul>

            <h3 className="mb-2 text-lg font-semibold">3. Compartilhamento de Dados</h3>
            <p className="mb-1 text-sm text-muted-foreground">
              Não vendemos ou alugamos seus dados pessoais. O compartilhamento ocorre nas seguintes circunstâncias:
            </p>
            <ul className="mb-4 ml-6 list-disc text-sm text-muted-foreground">
              <li><strong>Serviços de IA:</strong> Conforme mencionado, dados anonimizados do pet e sintomas/informações relevantes são enviados a provedores de IA para o funcionamento das ferramentas de diagnóstico e nutrição.</li>
              <li><strong>Compartilhamento Controlado pelo Usuário:</strong> Se você utilizar funcionalidades de compartilhamento do perfil do pet com veterinários ou cuidadores (se implementado), você controlará com quem essas informações são compartilhadas.</li>
              <li><strong>Obrigações Legais:</strong> Se exigido por lei ou ordem judicial.</li>
            </ul>

            <h3 className="mb-2 text-lg font-semibold">4. Segurança dos Dados</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Como os dados são armazenados principalmente no `localStorage` do seu dispositivo, a segurança desses dados depende das medidas de segurança do seu próprio dispositivo e navegador. Recomendamos manter seu sistema operacional e navegador atualizados. Para dados enviados a serviços de IA, confiamos nas políticas de segurança dos provedores desses serviços.
            </p>

            <h3 className="mb-2 text-lg font-semibold">5. Seus Direitos como Titular (LGPD)</h3>
            <p className="mb-1 text-sm text-muted-foreground">Você tem o direito de:</p>
            <ul className="mb-4 ml-6 list-disc text-sm text-muted-foreground">
              <li><strong>Acesso:</strong> Solicitar acesso aos dados que temos sobre você (principalmente visíveis diretamente no app).</li>
              <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados (você pode fazer isso diretamente nas seções "Meu Cadastro" e nos perfis dos pets).</li>
              <li><strong>Eliminação/Exclusão:</strong> Você pode excluir perfis de pets. Para excluir sua conta ou dados específicos do `localStorage`, você pode limpar os dados do site nas configurações do seu navegador.</li>
              <li><strong>Informação sobre compartilhamento:</strong> Saber com quais entidades seus dados são compartilhados (conforme descrito nesta política).</li>
            </ul>

            <h3 className="mb-2 text-lg font-semibold">6. Cookies e Tecnologias Semelhantes</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Utilizamos `localStorage` para armazenar suas preferências e dados da sessão. Não utilizamos cookies de rastreamento de terceiros para publicidade.
            </p>
            
            <h3 className="mb-2 text-lg font-semibold">7. Crianças e Adolescentes</h3>
            <p className="mb-4 text-sm text-muted-foreground">
             O Meu Patinha não se destina a menores de 18 anos. Não coletamos intencionalmente informações de menores de idade. Se tomarmos conhecimento de que coletamos dados de um menor sem o consentimento dos pais, tomaremos medidas para remover essas informações.
            </p>

            <h3 className="mb-2 text-lg font-semibold">8. Contato</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Se tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco através da seção "Fale Conosco" no Aplicativo.
            </p>
          </div>

          <p className="mt-6 text-xs text-center text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </ScrollArea>
        <div className="mb-6 flex items-center space-x-2">
          <Checkbox id="accept-terms" checked={isChecked} onCheckedChange={(checked) => setIsChecked(checked as boolean)} />
          <Label htmlFor="accept-terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Eu li e concordo com os Termos de Uso e com a Política de Privacidade do Meu Patinha.
          </Label>
        </div>
        <Button onClick={handleAcceptTerms} className="w-full">
          Continuar
        </Button>
      </div>
    </div>
  );
}
