
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { School, CalendarPlus } from "lucide-react"; // Ícone relevante e para o botão
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function CrechePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <School className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Controle de Creche</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Gerencie os registros de creche do seu pet, incluindo datas, locais, atividades e observações importantes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <Image
            src="https://placehold.co/300x200.png?text=🧸+🐾+🎒"
            alt="Imagem de pet em creche ou com brinquedos"
            width={300}
            height={200}
            className="mx-auto mb-6 rounded-lg shadow-md"
            data-ai-hint="pet daycare play"
          />
          <p className="text-muted-foreground text-left">
            A funcionalidade de "Controle de Creche" está em desenvolvimento e será implementada aqui.
            Você poderá organizar e registrar diversos detalhes sobre as estadias do seu pet na creche, como:
          </p>
          <ul className="list-disc list-inside text-left text-sm text-muted-foreground space-y-1 pl-4">
            <li><strong>Datas:</strong> Data de entrada e saída, dias da semana.</li>
            <li><strong>Local:</strong> Nome da creche ou do cuidador.</li>
            <li><strong>Contato do Local/Responsável:</strong> Telefone, e-mail.</li>
            <li><strong>Custo:</strong> Valor da diária, pacote mensal.</li>
            <li><strong>Atividades Realizadas:</strong> Brincadeiras, socialização, alimentação.</li>
            <li><strong>Observações do Dia:</strong> Comportamento do pet, intercorrências, feedback da creche.</li>
          </ul>
          
          <div className="mt-6">
            <Button asChild size="lg" disabled> {/* Botão desabilitado por enquanto */}
              <Link href="#"> {/* Link para futura página de registros /creche/registros ou /creche/new */}
                <CalendarPlus className="mr-2 h-5 w-5" />
                Registrar Nova Estadia na Creche (Em breve)
              </Link>
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-8">
            Esta funcionalidade ajudará a manter um registro completo das atividades e cuidados do seu pet na creche!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
