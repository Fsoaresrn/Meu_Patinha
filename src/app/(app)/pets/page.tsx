"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Pet } from "@/types";
import { PetCard } from "@/components/pets/pet-card";
import { useAuthStore } from "@/stores/auth.store";
import Image from "next/image";

export default function MeusPetsPage() {
  const { user } = useAuthStore();
  const [allPets] = useLocalStorage<Pet[]>("all-pets-data", []);

  // Filter pets where the current user is ownerId or secondaryTutorId
  const userPets = allPets.filter(pet => pet.ownerId === user?.cpf || pet.secondaryTutorId === user?.cpf);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Pets</h1>
          <p className="text-muted-foreground">Gerencie os perfis dos seus companheiros.</p>
        </div>
        <Link href="/pets/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Pet
          </Button>
        </Link>
      </div>

      {userPets.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg bg-card">
           <Image src="https://placehold.co/200x200.png?text=🐾" alt="Nenhum pet" width={150} height={150} className="mb-6 rounded-full opacity-70" data-ai-hint="sad animal" />
          <h2 className="text-2xl font-semibold mb-2">Nenhum pet cadastrado ainda.</h2>
          <p className="text-muted-foreground mb-6">
            Clique no botão abaixo para adicionar seu primeiro amiguinho!
          </p>
          <Link href="/pets/new" passHref>
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Pet
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userPets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}
