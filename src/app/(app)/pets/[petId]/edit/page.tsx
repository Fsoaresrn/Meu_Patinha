
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Pet } from "@/types";
import { useAuthStore } from "@/stores/auth.store";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import Image from "next/image";

// Por enquanto, esta página será um placeholder.
// O formulário de edição será similar ao de criação.

export default function EditarPetPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;
  const { user } = useAuthStore();
  const [allPets, setAllPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (petId && user) {
      const foundPet = allPets.find(p => p.id === petId && (p.ownerId === user.cpf || p.secondaryTutorCpf === user.cpf));
      setPet(foundPet || null);
      setIsLoading(false);
    } else if (!user) {
      router.push('/login');
    }
  }, [petId, allPets, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size={32} /> <span className="ml-2">Carregando dados do pet...</span>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-destructive">Pet não encontrado ou você não tem permissão para editá-lo.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/pets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Meus Pets
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/pets/${pet.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Perfil de {pet.nome}
          </Link>
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50">
              <Image
                src={pet.fotoUrl || `https://placehold.co/100x100.png?text=${encodeURIComponent(pet.nome.charAt(0))}`}
                alt={`Foto de ${pet.nome}`}
                layout="fill"
                objectFit="cover"
                data-ai-hint={`${pet.especie} ${pet.raca}`}
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-primary flex items-center">
                <Edit className="mr-2 h-6 w-6" />
                Editar Perfil de {pet.nome}
              </CardTitle>
              <CardDescription>
                Modifique as informações do seu pet.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <p className="text-lg font-semibold text-muted-foreground">
              Formulário de Edição em Desenvolvimento
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              A funcionalidade completa para editar os dados de {pet.nome} será implementada aqui em breve.
            </p>
          </div>
          {/* Aqui entraria o formulário de edição, similar ao de pets/new/page.tsx */}
        </CardContent>
      </Card>
    </div>
  );
}
