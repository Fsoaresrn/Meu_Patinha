
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Construction } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AgendaPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-amber-500/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CalendarDays className="h-16 w-16 text-amber-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-amber-600">Agenda de Atividades</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Aqui você poderá visualizar e registrar todas as atividades do seu pet em um calendário interativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <Image
            src="https://placehold.co/300x200.png?text=🚧+📅+🐾"
            alt="Calendário em construção"
            width={300}
            height={200}
            className="mx-auto mb-6 rounded-lg shadow-md"
            data-ai-hint="calendar construction pet"
          />
          <div className="flex items-center justify-center text-amber-700 dark:text-amber-400 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-md border border-amber-300 dark:border-amber-700">
            <Construction className="h-6 w-6 mr-3 flex-shrink-0" />
            <p className="font-semibold">Esta funcionalidade está em desenvolvimento!</p>
          </div>
          <p className="text-muted-foreground">
            Em breve, você poderá adicionar passeios, horários de alimentação, brincadeiras, consultas veterinárias e muito mais, diretamente no calendário do seu pet.
          </p>
          <div className="mt-6">
            <Button variant="outline" asChild>
              <Link href="/routine">
                Voltar para Rotina e Bem-Estar
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
