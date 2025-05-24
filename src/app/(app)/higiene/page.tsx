
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SprayCan } from "lucide-react"; // Ícone relevante
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HigienePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SprayCan className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Controle de Higiene</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Gerencie os registros de banhos, tosas, escovação de dentes e outros cuidados de higiene do seu pet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <Image
            src="https://placehold.co/300x200.png?text=🛁+🐩+✂️"
            alt="Imagem de pet em cuidados de higiene"
            width={300}
            height={200}
            className="mx-auto mb-6 rounded-lg shadow-md"
            data-ai-hint="pet grooming bath"
          />
          <p className="text-muted-foreground">
            A funcionalidade de "Controle de Higiene" está em desenvolvimento e será implementada aqui.
            Você poderá registrar banhos, tosas, corte de unhas, limpeza de orelhas e outros cuidados essenciais.
          </p>
          {/* Adicionar link para futura página de registro de higiene quando criada */}
          {/* 
          <div className="mt-6">
            <Button asChild size="lg" disabled>
              <Link href="/higiene/novo-registro"> 
                Registrar Higiene (Em breve)
              </Link>
            </Button>
          </div>
          */}
           <p className="text-xs text-muted-foreground mt-8">
            Por enquanto, você pode continuar explorando as outras funcionalidades do Meu Patinha!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
