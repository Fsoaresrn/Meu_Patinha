
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Handshake, Building, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Dados placeholder para os patrocinadores
const sponsors = [
  {
    id: 1,
    name: "PetShop Alegria",
    logoUrl: "https://placehold.co/200x100.png",
    description: "Oferecendo os melhores produtos e serviços para o seu pet desde 2010.",
    website: "#",
    category: "Produtos e Serviços",
    dataAiHint: "pet store",
  },
  {
    id: 2,
    name: "Clínica Veterinária VetCare",
    logoUrl: "https://placehold.co/200x100.png",
    description: "Cuidado completo e especializado para a saúde do seu animal de estimação.",
    website: "#",
    category: "Saúde Animal",
    dataAiHint: "veterinary clinic",
  },
  {
    id: 3,
    name: "Rações Super Premium MaxNutri",
    logoUrl: "https://placehold.co/200x100.png",
    description: "Nutrição balanceada para uma vida longa e saudável para cães e gatos.",
    website: "#",
    category: "Alimentação",
    dataAiHint: "pet food",
  },
  {
    id: 4,
    name: "Hotelzinho Cantinho Feliz",
    logoUrl: "https://placehold.co/200x100.png",
    description: "O melhor lugar para seu pet enquanto você viaja, com muito carinho e diversão.",
    website: "#",
    category: "Hospedagem e Lazer",
    dataAiHint: "pet hotel",
  },
];

// Componente para o card de patrocinador individual
const SponsorCard = ({ sponsor }: { sponsor: (typeof sponsors)[0] }) => {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-video relative w-full bg-muted">
          <Image
            src={sponsor.logoUrl}
            alt={`Logo de ${sponsor.name}`}
            layout="fill"
            objectFit="contain" // 'contain' para logos geralmente é melhor
            className="p-2" // Adiciona um pouco de padding ao redor do logo
            data-ai-hint={sponsor.dataAiHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow flex flex-col">
        <CardTitle className="text-xl font-semibold mb-2 text-primary">{sponsor.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-1">{sponsor.category}</CardDescription>
        <p className="text-sm text-foreground flex-grow mb-4">{sponsor.description}</p>
        {sponsor.website && sponsor.website !== "#" && (
           <Button asChild variant="outline" size="sm" className="mt-auto w-fit">
            <Link href={sponsor.website} target="_blank" rel="noopener noreferrer">
              Visitar Site
            </Link>
          </Button>
        )}
         {sponsor.website === "#" && (
           <Button variant="outline" size="sm" className="mt-auto w-fit" disabled>
              Site em breve
            </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default function PatrocinadoresPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-5xl mx-auto shadow-xl border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Handshake className="h-20 w-20 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold text-primary">Nossos Patrocinadores</CardTitle>
          <CardDescription className="text-xl text-muted-foreground mt-2">
            Agradecemos imensamente o apoio fundamental dos nossos patrocinadores, que nos ajudam a continuar nossa missão de cuidar dos pets.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-8">
          {sponsors.length === 0 ? (
            <div className="text-center py-10">
              <Building className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-foreground">Ainda estamos buscando nossos primeiros parceiros!</p>
              <p className="text-muted-foreground mt-2">
                Se sua empresa tem paixão por pets e deseja apoiar o Meu Patinha, entre em contato.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {sponsors.map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          )}

          <div className="mt-16 text-center p-8 border-2 border-dashed rounded-lg bg-muted/30">
            <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-3">Quer se tornar um patrocinador?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Junte-se a nós e ajude a construir um futuro melhor para os pets! Sua marca ganhará visibilidade em uma comunidade engajada de amantes de animais.
            </p>
            <Button size="lg" asChild>
              <Link href="/fale-conosco?assunto=patrocinio">
                Entre em Contato
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
