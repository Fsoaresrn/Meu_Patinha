"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function FaleConoscoPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Fale Conosco</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Adoraríamos ouvir de você! Entre em contato para dúvidas, sugestões ou suporte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Informações de Contato (Simuladas)</h3>
            
            <div className="flex items-start space-x-3 p-4 rounded-md border bg-background hover:bg-muted/50 transition-colors">
              <Mail className="h-6 w-6 text-primary mt-1" />
              <div>
                <p className="font-medium text-foreground">E-mail:</p>
                <a href="mailto:contato@meupatinha.app.br" className="text-primary hover:underline">
                  contato@meupatinha.app.br
                </a>
                <p className="text-xs text-muted-foreground">Para suporte técnico e dúvidas gerais.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-md border bg-background hover:bg-muted/50 transition-colors">
              <Phone className="h-6 w-6 text-primary mt-1" />
              <div>
                <p className="font-medium text-foreground">Telefone:</p>
                <p className="text-foreground">(XX) XXXX-XXXX (Simulado)</p>
                <p className="text-xs text-muted-foreground">Atendimento de Segunda a Sexta, das 9h às 18h.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-md border bg-background hover:bg-muted/50 transition-colors">
              <MapPin className="h-6 w-6 text-primary mt-1" />
              <div>
                <p className="font-medium text-foreground">Endereço:</p>
                <p className="text-foreground">Rua Fictícia dos Pets, 123</p>
                <p className="text-foreground">Bairro Patinhas Felizes, Cidade Animalândia - UF</p>
                <p className="text-xs text-muted-foreground">(Endereço simulado para fins de demonstração)</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">
              Acompanhe-nos nas redes sociais (links simulados):
            </p>
            <div className="flex justify-center space-x-4 mt-2">
              <a href="#" className="text-primary hover:underline">Facebook</a>
              <a href="#" className="text-primary hover:underline">Instagram</a>
              <a href="#" className="text-primary hover:underline">Twitter</a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
