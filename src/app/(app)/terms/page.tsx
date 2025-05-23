
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TermsContent } from "@/components/terms/terms-content"; // Importar o novo componente

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
        <h1 className="mb-6 text-center text-3xl font-bold text-primary">Termos de Uso e Responsabilidade e Política de Privacidade do Meu Patinha</h1>
        <ScrollArea className="mb-6 h-[500px] w-full rounded-md border p-4">
          <TermsContent /> {/* Usar o novo componente aqui */}
        </ScrollArea>
        <div className="mb-6 flex items-center space-x-2">
          <Checkbox id="accept-terms" checked={isChecked} onCheckedChange={(checked) => setIsChecked(checked as boolean)} />
          <Label htmlFor="accept-terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Eu li e concordo com os Termos de Uso e Responsabilidade e com a Política de Privacidade do Meu Patinha.
          </Label>
        </div>
        <Button onClick={handleAcceptTerms} className="w-full">
          Continuar
        </Button>
      </div>
    </div>
  );
}

    
