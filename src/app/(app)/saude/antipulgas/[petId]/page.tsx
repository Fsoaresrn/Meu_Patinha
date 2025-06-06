
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Pet, AntipulgasLog } from "@/types";
import { useAuthStore } from "@/stores/auth.store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

// Placeholder - esta página será desenvolvida futuramente
export default function PetAntipulgasPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;
  const { user } = useAuthStore();
  const [allPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (petId && user) {
      const foundPet = allPets.find(p => p.id === petId && (p.ownerId === user.cpf || p.secondaryTutorCpf === user.cpf));
      setPet(foundPet || null);
      setIsLoading(false);
    } else if(!user) {
      router.push('/login');
    }
  }, [petId, allPets, user, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><LoadingSpinner size={32} /> Carregando...</div>;
  }

  if (!pet) {
    return <div className="container mx-auto py-8">Pet não encontrado ou acesso não permitido.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/saude/antipulgas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Seleção de Pets
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Controle de Antipulgas de {pet.nome}</CardTitle>
          <CardDescription>
            Visualize o histórico e adicione novos registros de antipulgas/carrapatos.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="mb-4 text-right">
            <Button asChild>
              <Link href={`/saude/antipulgas/${pet.id}/new`}>
                <PlusCircle className="mr-2 h-4 w-4" /> Registrar Antipulgas
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">
            Funcionalidade de listagem de antipulgas e calendário de aplicação será implementada aqui.
          </p>
          {/* TODO: Listar AntipulgasLog e implementar calendário */}
        </CardContent>
      </Card>
    </div>
  );
}

    