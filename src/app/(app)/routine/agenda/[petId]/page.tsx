
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuthStore } from "@/stores/auth.store";
import type { Pet } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CalendarDays, Construction, PlusCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";
import { calculateAge } from "@/lib/date-utils";
import { Calendar } from "@/components/ui/calendar"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PetAgendaPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;
  const { user } = useAuthStore();
  const [allPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (petId && user) {
      const foundPet = allPets.find(p => p.id === petId && (p.ownerId === user?.cpf || p.secondaryTutorCpf === user?.cpf));
      setPet(foundPet || null);
      setIsLoading(false);
    } else if (!user) {
      router.push("/login");
    }
  }, [petId, allPets, user, router]);

  const cardThemeClasses = () => {
    if (!pet || pet.status.value !== 'ativo') return "bg-muted/30";
    switch (pet.sexo) {
      case "Macho": return "theme-male";
      case "Fêmea": return "theme-female";
      default: return "theme-neutral-gender";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size={48} />
        <p className="ml-4 text-lg">Carregando agenda do pet...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-destructive mb-4">Pet não encontrado ou acesso não permitido.</p>
        <Button asChild variant="outline">
          <Link href="/routine/agenda">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Seleção de Pets
          </Link>
        </Button>
      </div>
    );
  }
  
  if (pet.status.value !== 'ativo') {
     return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-destructive mb-4">
          A agenda de {pet.nome} não pode ser acessada pois seu status é "{pet.status.value}".
        </p>
        <Button asChild variant="outline">
          <Link href="/routine/agenda">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Seleção de Pets
          </Link>
        </Button>
      </div>
    );
  }

  const petAgeDisplay = pet.dataNascimento ? calculateAge(pet.dataNascimento).display : (pet.idade !== undefined ? `${pet.idade} ${pet.idade === 1 ? 'ano' : 'anos'} (aprox.)` : 'Idade não informada');

  return (
    <div className={cn("container mx-auto py-8 px-4", cardThemeClasses())}>
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/routine/agenda">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Seleção de Pets
          </Link>
        </Button>
      </div>

      <Card className="max-w-3xl mx-auto shadow-lg border-amber-500/20">
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
                <CardTitle className="text-3xl font-bold text-amber-600">Agenda de Atividades: {pet.nome}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                    {pet.especie} - {pet.raca} - {petAgeDisplay}
                </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="flex justify-center my-6">
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border shadow"
                disabled={(date) => date > new Date() || date < new Date("2000-01-01")} // Exemplo de desabilitar datas
                initialFocus
            />
          </div>
          
           <div className="mt-8">
            <Button size="lg" >
              <PlusCircle className="mr-2 h-5 w-5" />
              Cadastrar Nova Atividade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
