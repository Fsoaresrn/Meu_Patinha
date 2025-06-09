
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Search, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NamoroPetPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">NamoroPet - Encontre um Par</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Registre seu cão ou gato para encontrar um par ideal para acasalamento ou busque por pets disponíveis na sua região.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {/* Imagem removida conforme solicitado */}
          <p className="text-muted-foreground text-left mt-4">
            A funcionalidade "NamoroPet" está em desenvolvimento. Futuramente, você poderá:
          </p>
          <ul className="list-disc list-inside text-left text-sm text-muted-foreground space-y-1 pl-4">
            <li><strong>Registrar seu Pet:</strong> Adicione o perfil do seu cão ou gato interessado em acasalar.</li>
            <li><strong>Buscar por Pares:</strong> Navegue por pets (cães e gatos) disponíveis em diferentes regiões.</li>
            <li><strong>Filtros Avançados:</strong> Busque por raça, idade, localização e outras características.</li>
            <li><strong>Ver Perfis Detalhados:</strong> Acesse informações, fotos e histórico de saúde (se compartilhado).</li>
            <li><strong>Entrar em Contato:</strong> (Funcionalidade futura) Iniciar conversa com o tutor do pet de interesse.</li>
          </ul>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" disabled>
              <Link href="#"> 
                <PlusCircle className="mr-2 h-5 w-5" />
                Registrar Pet para Namoro (Em breve)
              </Link>
            </Button>
            <Button asChild size="lg" disabled>
              <Link href="#">
                <Search className="mr-2 h-5 w-5" />
                Buscar um Par (Em breve)
              </Link>
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-8">
            Ajudando a conectar pets para momentos especiais! Esta funcionalidade será desenvolvida em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
