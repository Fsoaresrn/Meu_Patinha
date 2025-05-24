
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartHandshake, Search, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AdocaoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <HeartHandshake className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Adoção de Pets</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Encontre um novo companheiro ou anuncie um pet para adoção responsável.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <Image
            src="https://placehold.co/300x200.png?text=❤️+🏠+🐾"
            alt="Pets para adoção"
            width={300}
            height={200}
            className="mx-auto mb-6 rounded-lg shadow-md"
            data-ai-hint="adoption pet love"
          />
          <p className="text-muted-foreground text-left">
            A funcionalidade de "Adoção de Pets" está em desenvolvimento. Futuramente, você poderá:
          </p>
          <ul className="list-disc list-inside text-left text-sm text-muted-foreground space-y-1 pl-4">
            <li><strong>Anunciar Pets para Adoção:</strong> Crie um anúncio detalhado para pets que precisam de um novo lar.</li>
            <li><strong>Buscar Pets para Adotar:</strong> Navegue por anúncios de pets disponíveis para adoção.</li>
            <li><strong>Filtrar por Região:</strong> Encontre pets em diferentes localidades, não apenas na sua.</li>
            <li><strong>Ver Perfis dos Pets:</strong> Acesse informações, fotos e histórico (se compartilhado pelo anunciante).</li>
            <li><strong>Entrar em Contato:</strong> (Funcionalidade futura) Iniciar contato com o anunciante.</li>
          </ul>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" disabled>
              <Link href="#"> 
                <PlusCircle className="mr-2 h-5 w-5" />
                Anunciar Pet (Em breve)
              </Link>
            </Button>
            <Button asChild size="lg" disabled>
              <Link href="#">
                <Search className="mr-2 h-5 w-5" />
                Buscar Pets (Em breve)
              </Link>
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-8">
            Conectando pets a lares amorosos. Esta seção ajudará a dar uma nova chance para muitos animaizinhos!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
