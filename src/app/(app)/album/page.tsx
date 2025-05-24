
"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Pet } from "@/types";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Images, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PetPhotoCard = ({ pet }: { pet: Pet }) => {
  const cardThemeClasses = () => {
    if (pet.status.value !== 'ativo') return "opacity-50"; // Esmaecer se não ativo
    switch (pet.sexo) {
      case "Macho": return "theme-male";
      case "Fêmea": return "theme-female";
      default: return "theme-neutral-gender";
    }
  };

  return (
    <Link href={`/pets/${pet.id}`} className="block group">
      <Card className={cn("overflow-hidden shadow-md hover:shadow-lg transition-shadow", cardThemeClasses())}>
        <div className="aspect-square relative w-full">
          <Image
            src={pet.fotoUrl || `https://placehold.co/300x300.png?text=${encodeURIComponent(pet.nome.charAt(0))}`}
            alt={`Foto de ${pet.nome}`}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={`${pet.especie} ${pet.raca}`}
          />
        </div>
        <CardContent className="p-2 text-center">
          <p className="text-sm font-medium truncate text-card-foreground">{pet.nome}</p>
          <p className="text-xs text-muted-foreground truncate">{pet.especie}</p>
        </CardContent>
      </Card>
    </Link>
  );
};


export default function AlbumPage() {
  const [allPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const [petsWithPhotos, setPetsWithPhotos] = useState<Pet[]>([]);

  useEffect(() => {
    const filteredPets = allPets.filter(pet => pet.fotoUrl && pet.fotoUrl.startsWith('data:image'));
    setPetsWithPhotos(filteredPets);
  }, [allPets]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Images className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Álbum de Fotos dos Pets</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Uma galeria com as melhores recordações dos seus companheiros.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          {petsWithPhotos.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg bg-card">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2 text-foreground">Nenhuma foto encontrada.</p>
              <p className="text-muted-foreground mb-4">
                Cadastre seus pets com fotos para vê-los aqui ou adicione fotos aos perfis existentes.
              </p>
              <Button asChild>
                <Link href="/pets/new">Cadastrar Novo Pet</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {petsWithPhotos.map((pet) => (
                <PetPhotoCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
