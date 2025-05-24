
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Search } from "lucide-react"; // Ícone relevante e para o botão de busca futuro
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function PetSitterPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Briefcase className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Encontrar Pet Sitter</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Localize cuidadores qualificados que oferecem serviços de pet sitting na sua residência ou na deles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <Image
            src="https://placehold.co/300x200.png?text=🏠+🐾+❤️"
            alt="Imagem de cuidador com pet"
            width={300}
            height={200}
            className="mx-auto mb-6 rounded-lg shadow-md"
            data-ai-hint="pet sitter caregiver"
          />
          <p className="text-muted-foreground text-left">
            A funcionalidade de "Encontrar Pet Sitter" está em desenvolvimento. Futuramente, você poderá:
          </p>
          <ul className="list-disc list-inside text-left text-sm text-muted-foreground space-y-1 pl-4">
            <li><strong>Buscar Cuidadores:</strong> Encontre usuários cadastrados como "Cuidador(a)".</li>
            <li><strong>Filtrar por Localização:</strong> Busque por cuidadores na sua cidade ou região.</li>
            <li><strong>Ver Perfis:</strong> Acesse o perfil do cuidador para mais informações (se compartilhado).</li>
            <li><strong>Serviços Oferecidos:</strong> Verifique se o cuidador atende em domicílio ou hospeda pets.</li>
            <li><strong>Entrar em Contato:</strong> (Funcionalidade futura) Iniciar contato com o pet sitter.</li>
          </ul>
          
          <div className="mt-6">
            <Button asChild size="lg" disabled> {/* Botão desabilitado por enquanto */}
              <Link href="#"> {/* Link para futura página de busca */}
                <Search className="mr-2 h-5 w-5" />
                Buscar Pet Sitters (Em breve)
              </Link>
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-8">
            Esta seção ajudará você a encontrar o cuidado ideal para seu pet quando você precisar!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
