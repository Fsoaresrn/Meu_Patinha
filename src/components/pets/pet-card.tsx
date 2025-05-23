"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Pet } from "@/types";
import { cn } from "@/lib/utils";
import { calculateAge, parseDateSafe, formatDateToBrésil } from "@/lib/date-utils";
import { PawPrint,cake } from "lucide-react";


interface PetCardProps {
  pet: Pet;
}

export function PetCard({ pet }: PetCardProps) {
  const ageDisplay = pet.dataNascimento ? calculateAge(pet.dataNascimento).display : (pet.idade ? `${pet.idade} anos (aprox.)` : "Idade desconhecida");
  
  const cardThemeClasses = () => {
    if (pet.status.value !== 'ativo') return "opacity-60 bg-muted/50";
    switch (pet.sexo) {
      case "Macho":
        return "border-blue-500 hover:shadow-blue-500/20";
      case "Fêmea":
        return "border-pink-500 hover:shadow-pink-500/20";
      default:
        return "border-gray-400 hover:shadow-gray-500/20";
    }
  };

  return (
    <Card className={cn("flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl", cardThemeClasses())}>
      <CardHeader className="p-0 relative">
        <Link href={`/pets/${pet.id}`} className="block aspect-square w-full relative overflow-hidden rounded-t-lg">
          <Image
            src={pet.fotoUrl || `https://placehold.co/400x400.png?text=${encodeURIComponent(pet.nome.charAt(0))}`}
            alt={`Foto de ${pet.nome}`}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={`${pet.especie} ${pet.raca}`}
          />
        </Link>
        {pet.status.value !== 'ativo' && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              {pet.status.value === 'falecido' ? 'Falecido' : 
               pet.status.value === 'doado' ? 'Doado' :
               pet.status.value === 'perdido' ? 'Perdido' :
               'Inativo'}
            </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-semibold mb-1 truncate">
          <Link href={`/pets/${pet.id}`} className="hover:text-primary transition-colors">{pet.nome}</Link>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-1 truncate">{pet.raca}</CardDescription>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
         <PawPrint className="h-4 w-4 inline-block" /> {pet.especie}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cake"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2"/><path d="M16 16V8a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v8"/><path d="M12 21v-8"/><path d="M12 8V4"/><path d="M12 4h.01"/><path d="M16 8h.01"/><path d="M8 8h.01"/></svg>
          {ageDisplay}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/pets/${pet.id}`} className="w-full" passHref>
          <Button variant="outline" className="w-full">
            Ver Perfil
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
