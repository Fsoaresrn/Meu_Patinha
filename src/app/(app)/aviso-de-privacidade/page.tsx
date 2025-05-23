
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PrivacyPolicySection } from "@/components/terms/terms-content";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AvisoDePrivacidadePage() {
  const router = useRouter();

  return (
    <div className="container mx-auto flex max-w-3xl flex-col items-center justify-center py-12">
      <div className="w-full rounded-lg border bg-card p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-center text-3xl font-bold text-primary">Política de Privacidade do Meu Patinha</h1>
          <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="mb-6 h-[calc(100vh-250px)] max-h-[600px] w-full rounded-md border p-4">
          <PrivacyPolicySection />
           <p className="mt-6 text-xs text-center text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </ScrollArea>
        <div className="text-center">
            <Button onClick={() => router.back()}>
                Fechar
            </Button>
        </div>
      </div>
    </div>
  );
}
