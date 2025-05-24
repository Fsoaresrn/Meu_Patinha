
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, BookMarked, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Pet, Vaccination, VaccineProtocolInfo } from "@/types";
import { useAuthStore } from "@/stores/auth.store";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { vaccineProtocols as allVaccineProtocols } from "@/lib/constants";
import { parseDateSafe, calculateAge } from "@/lib/date-utils";

// Componente de Card de Pet Simplificado para Seleção
function PetVaccinationCard({ pet }: { pet: Pet }) {
  const [allVaccinations] = useLocalStorage<Vaccination[]>(`vaccinations-data-${useAuthStore.getState().user?.cpf || 'default'}`, []);
  const [alerts, setAlerts] = useState<string[]>([]);

  const cardThemeClasses = () => {
    if (pet.status.value !== 'ativo') return "opacity-70 bg-muted/30 hover:bg-muted/40";
    switch (pet.sexo) {
      case "Macho":
        return "theme-male hover:bg-blue-100/80 dark:hover:bg-blue-900/60";
      case "Fêmea":
        return "theme-female hover:bg-pink-100/80 dark:hover:bg-pink-900/60";
      default:
        return "theme-neutral-gender hover:bg-green-100/80 dark:hover:bg-green-900/60";
    }
  };

  const petVaccinationLink = `/vaccination-booklet/${pet.id}`; 

  const petAgeInfo = useMemo(() => {
    if (pet.dataNascimento) {
      return calculateAge(pet.dataNascimento);
    } else if (pet.idade !== undefined) {
      const today = new Date();
      const birthYear = today.getFullYear() - pet.idade;
      // Estimativa grosseira, assumindo aniversário no início do ano para cálculo de meses/semanas
      const estimatedBirthDate = new Date(birthYear, 0, 1); 
      return calculateAge(estimatedBirthDate);
    }
    return { years: 0, months: 0, days: 0, totalWeeks: 0, display: "Idade desconhecida" };
  }, [pet.dataNascimento, pet.idade]);


  useEffect(() => {
    if (!pet || pet.status.value !== 'ativo') {
      setAlerts([]);
      return;
    }

    const petVaccs = allVaccinations.filter(v => v.petId === pet.id);
    const relevantProtocols = allVaccineProtocols.filter(
      p => p.species.includes(pet.especie) && p.importance === "Essencial" && p.id !== "outra"
    );

    const currentAlerts: string[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    relevantProtocols.forEach(protocol => {
      const existingPetVaccinationsForProtocol = petVaccs.filter(v => v.vaccineType === protocol.id || v.vaccineName === protocol.name);

      if (existingPetVaccinationsForProtocol.length === 0) {
        // Lógica simplificada para "não iniciada"
        // Se a primeira dose recomendada tem uma idade (ex: "(6-8 semanas)") e o pet já passou dessa idade.
        // Esta é uma aproximação, pois "6-8 semanas" é um intervalo.
        const firstRecommendedDoseLabel = protocol.recommendedDoses?.[0]?.toLowerCase() || "";
        let minAgeWeeks = 0;
        if (firstRecommendedDoseLabel.includes("semanas")) {
          const match = firstRecommendedDoseLabel.match(/(\d+)(?:-(\d+))?\s*semana/);
          if (match && match[1]) {
            minAgeWeeks = parseInt(match[1], 10);
          }
        }
        
        if (minAgeWeeks > 0 && petAgeInfo.totalWeeks > minAgeWeeks + 4) { // Adiciona uma margem
           currentAlerts.push(`${protocol.name}: Não iniciada (sugerido).`);
        } else if (minAgeWeeks === 0 && petAgeInfo.totalWeeks > 16) { // Para vacinas sem idade de início clara, se pet > 4 meses
            currentAlerts.push(`${protocol.name}: Não iniciada (verificar).`);
        }

      } else {
        // Verifica reforço vencido para vacinas iniciadas
        const sortedVaccs = existingPetVaccinationsForProtocol.sort((a, b) => {
          const dateA = parseDateSafe(a.administrationDate);
          const dateB = parseDateSafe(b.administrationDate);
          return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        });
        const latestVaccination = sortedVaccs[0];

        if (latestVaccination?.nextDueDate) {
          const nextDueDate = parseDateSafe(latestVaccination.nextDueDate);
          if (nextDueDate && nextDueDate < today) {
            currentAlerts.push(`${latestVaccination.vaccineName}: Reforço vencido em ${formatDateToBrasil(nextDueDate)}.`);
          }
        }
      }
    });
    setAlerts(currentAlerts);
  }, [pet, allVaccinations, petAgeInfo.totalWeeks]);

  return (
    <Link href={petVaccinationLink} className="block group">
      <Card className={cn("transition-all duration-200 ease-in-out shadow-md hover:shadow-xl", cardThemeClasses())}>
        <CardContent className="p-4 flex items-start space-x-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-background group-hover:border-primary transition-colors">
            <Image
              src={pet.fotoUrl || `https://placehold.co/100x100.png?text=${encodeURIComponent(pet.nome.charAt(0))}`}
              alt={`Foto de ${pet.nome}`}
              layout="fill"
              objectFit="cover"
              data-ai-hint={`${pet.especie} ${pet.raca}`}
            />
          </div>
          <div className="flex-1 min-w-0"> {/* Adicionado min-w-0 para truncamento funcionar */}
            <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors truncate">{pet.nome}</CardTitle>
                {alerts.length > 0 && <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 ml-2" />}
            </div>
            <CardDescription className="text-sm truncate">{pet.especie} - {pet.raca}</CardDescription>
            {pet.status.value !== 'ativo' && (
                 <p className="text-xs text-destructive font-semibold mt-1">Status: {pet.status.value}</p>
            )}
            {alerts.length > 0 && pet.status.value === 'ativo' && (
              <div className="mt-1.5 space-y-0.5">
                {alerts.slice(0, 2).map((alertMsg, index) => ( // Mostra no máximo 2 alertas diretamente
                  <p key={index} className="text-xs text-destructive truncate">
                    <AlertTriangle className="inline-block h-3 w-3 mr-1" />
                    {alertMsg}
                  </p>
                ))}
                {alerts.length > 2 && (
                  <p className="text-xs text-destructive">E mais...</p>
                )}
              </div>
            )}
          </div>
          <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors self-center flex-shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}


export default function VaccinationBookletPage() {
  const { user } = useAuthStore();
  const [allPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const userPets = allPets.filter(pet => pet.ownerId === user?.cpf || pet.secondaryTutorCpf === user?.cpf);
  const activeUserPets = userPets.filter(pet => pet.status.value === 'ativo');

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BookMarked className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Caderneta de Vacinação</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Selecione um pet para visualizar e gerenciar o histórico de vacinação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {userPets.length === 0 ? (
            <div className="text-center p-6 border-2 border-dashed rounded-lg bg-muted/20 mt-6">
              <Image
                src="https://placehold.co/150x150.png?text=🐾"
                alt="Nenhum pet cadastrado"
                width={100}
                height={100}
                className="mx-auto mb-4 rounded-full opacity-80"
                data-ai-hint="cute animal"
              />
              <p className="text-foreground mb-2">Você ainda não cadastrou nenhum pet.</p>
              <p className="text-muted-foreground mb-4">
                Para acessar a caderneta de vacinação, primeiro adicione um perfil para seu pet.
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/pets/new">Cadastrar Pet</Link>
              </Button>
            </div>
          ) : activeUserPets.length === 0 ? (
             <div className="text-center p-6 border rounded-md bg-muted/50 mt-6">
              <Image 
                src="https://placehold.co/150x150.png?text=🩹" 
                alt="Nenhum pet ativo" 
                width={100} 
                height={100} 
                className="mx-auto mb-4 rounded-full opacity-80"
                data-ai-hint="sad pet"
              />
              <p className="text-foreground mb-2">Você não possui pets com status "ativo".</p>
              <p className="text-muted-foreground">
                A caderneta de vacinação só pode ser acessada para pets ativos. Verifique o status dos seus pets em "Meus Pets".
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Selecione o Pet:</h3>
              {activeUserPets.map(pet => (
                <PetVaccinationCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
          
          {userPets.length > 0 && activeUserPets.length < userPets.length && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Pets com status diferente de "ativo" não são listados aqui para acesso à caderneta.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    