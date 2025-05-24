
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble, CalendarPlus } from "lucide-react"; // Ícone relevante e para o botão
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HospedagemPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BedDouble className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Controle de Hospedagem</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Gerencie os registros de hospedagem do seu pet, incluindo datas, locais, responsáveis e observações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <Image
            src="https://placehold.co/300x200.png?text=🏨+🐾+💼"
            alt="Imagem de pet em hotel ou viagem"
            width={300}
            height={200}
            className="mx-auto mb-6 rounded-lg shadow-md"
            data-ai-hint="pet hotel travel"
          />
          <p className="text-muted-foreground text-left">
            A funcionalidade de "Controle de Hospedagem" está em desenvolvimento e será implementada aqui.
            Você poderá organizar e registrar diversos detalhes sobre as estadias do seu pet, como:
          </p>
          <ul className="list-disc list-inside text-left text-sm text-muted-foreground space-y-1 pl-4">
            <li><strong>Datas:</strong> Data de check-in e check-out.</li>
            <li><strong>Local:</strong> Nome do hotelzinho, casa de cuidador, etc.</li>
            <li><strong>Contato do Local/Responsável:</strong> Telefone, e-mail.</li>
            <li><strong>Custo:</strong> Valor da diária ou do período.</li>
            <li><strong>Instruções Especiais:</strong> Medicação, alimentação específica, rotina.</li>
            <li><strong>Observações:</strong> Comportamento do pet durante a estadia, intercorrências.</li>
          </ul>
          
          <div className="mt-6">
            <Button asChild size="lg" disabled> {/* Botão desabilitado por enquanto */}
              <Link href="#"> {/* Link para futura página de registros /hospedagem/registros ou /hospedagem/new */}
                <CalendarPlus className="mr-2 h-5 w-5" />
                Registrar Nova Hospedagem (Em breve)
              </Link>
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-8">
            Esta funcionalidade permitirá um melhor planejamento e acompanhamento das hospedagens do seu companheiro!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
