
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SprayCan, ListChecks } from "lucide-react"; // Ícone relevante e para o botão
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
          <p className="text-muted-foreground text-left">
            A funcionalidade de "Controle de Higiene" está em desenvolvimento e será implementada aqui.
            Você poderá organizar e registrar diversos tipos de cuidados de higiene, incluindo:
          </p>
          <ul className="list-disc list-inside text-left text-sm text-muted-foreground space-y-1 pl-4">
            <li><strong>Banhos:</strong> Registro de frequência, produtos utilizados.</li>
            <li><strong>Tosas:</strong> Tipos de tosa (higiênica, completa, da raça), datas.</li>
            <li><strong>Escovação de Dentes:</strong> Frequência e observações.</li>
            <li><strong>Corte de Unhas:</strong> Datas e anotações.</li>
            <li><strong>Limpeza de Orelhas:</strong> Frequência, produtos e observações.</li>
            <li><strong>Limpeza de Olhos:</strong> Cuidados e produtos utilizados.</li>
            <li><strong>Outros Cuidados:</strong> Registros de cuidados específicos conforme a necessidade do pet.</li>
          </ul>
          
          <div className="mt-6">
            <Button asChild size="lg">
              <Link href="#"> {/* Link para futura página de registros /higiene/registros */}
                <ListChecks className="mr-2 h-5 w-5" />
                Acessar Registros (Em breve)
              </Link>
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-8">
            Por enquanto, você pode continuar explorando as outras funcionalidades do Meu Patinha!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
