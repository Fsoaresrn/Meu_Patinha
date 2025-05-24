
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CalendarClock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function RotinaPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Activity className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Rotina e Bem-Estar</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Gerencie a agenda de atividades, passeios, brincadeiras e outros compromissos importantes para o bem-estar do seu pet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <Image
            src="https://placehold.co/300x200.png?text=🐕‍➡️+🐈+🗓️"
            alt="Imagem de pets com calendário"
            width={300}
            height={200}
            className="mx-auto mb-6 rounded-lg shadow-md"
            data-ai-hint="happy pet schedule"
          />
          <p className="text-muted-foreground text-left">
            A funcionalidade de "Agenda de Atividades" está em desenvolvimento e será implementada aqui.
            Você poderá organizar e registrar diversos tipos de atividades, incluindo:
          </p>
          <ul className="list-disc list-inside text-left text-sm text-muted-foreground space-y-1 pl-4">
            <li><strong>Cuidados Diários:</strong> Alimentação, troca de água, escovação, limpeza da caixa de areia.</li>
            <li><strong>Atividades Físicas e Enriquecimento:</strong> Passeios, brincadeiras, adestramento, estímulos olfativos.</li>
            <li><strong>Saúde e Higiene:</strong> Aplicação de vermífugo/antipulgas, banhos, visitas ao veterinário, vacinação.</li>
            <li><strong>Socialização:</strong> Visitas a locais pet-friendly, encontros com outros animais e pessoas.</li>
            <li><strong>Monitoramento e Registros:</strong> Peso, comportamento, administração de medicamentos, dietas especiais.</li>
          </ul>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link href="/routine/agenda">
                <CalendarClock className="mr-2 h-5 w-5" />
                Acessar Agenda (Em breve)
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
