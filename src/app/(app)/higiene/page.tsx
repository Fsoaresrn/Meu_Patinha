
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SprayCan, ListChecks } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // Importar o Calendário

export default function HigienePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SprayCan className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Controle de Higiene</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Gerencie e visualize no calendário os registros de banhos, tosas, escovação de dentes e outros cuidados de higiene do seu pet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="flex justify-center my-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border shadow"
              disabled={(date) => date > new Date() || date < new Date("2000-01-01")} 
              initialFocus
            />
          </div>
          <p className="text-muted-foreground text-left">
            A funcionalidade de "Controle de Higiene" está em desenvolvimento. Futuramente, você poderá registrar e visualizar no calendário acima diversos tipos de cuidados de higiene, incluindo:
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
                Acessar Registros de Higiene (Em breve)
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
