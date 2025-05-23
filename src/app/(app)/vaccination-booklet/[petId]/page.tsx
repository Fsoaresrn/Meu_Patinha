
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuthStore } from "@/stores/auth.store";
import type { Pet, Vaccination, VaccineProtocolInfo } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PlusCircle, AlertTriangle, CalendarDays, Syringe, Edit2, Trash2 } from "lucide-react";
import { formatDateToBrasil, calculateAge, parseDateSafe } from "@/lib/date-utils";
import { vaccineProtocols } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// Simple Vaccination Card for listing
function VaccinationListItem({ vaccine, onDelete }: { vaccine: Vaccination; onDelete: (vaccineId: string) => void }) {
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;

  const getNextDueDateBadgeVariant = (nextDueDate?: string): "default" | "destructive" | "outline" | "secondary" => {
    if (!nextDueDate) return "outline";
    const dueDate = parseDateSafe(nextDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only

    if (!dueDate) return "outline";

    if (dueDate < today) return "destructive"; // Vencida
    // Adicionar lógica para "Próxima" ou "Em dia" se necessário
    return "default"; // Futura ou em dia
  };
  
  const getNextDueDateLabel = (nextDueDate?: string): string => {
    if (!nextDueDate) return "N/A";
    const dueDate = parseDateSafe(nextDueDate);
    if (!dueDate) return "Inválida";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) return "Vencida";
    return formatDateToBrasil(dueDate);
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{vaccine.vaccineName}</TableCell>
      <TableCell>{vaccine.dose}</TableCell>
      <TableCell>{vaccine.administrationDate}</TableCell>
      <TableCell>
        {vaccine.nextDueDate ? (
          <Badge variant={getNextDueDateBadgeVariant(vaccine.nextDueDate)}>
            {getNextDueDateLabel(vaccine.nextDueDate)}
          </Badge>
        ) : (
          "N/A"
        )}
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.push(`/vaccination-booklet/${petId}/edit/${vaccine.id}`)} aria-label="Editar Vacina">
          <Edit2 className="h-4 w-4" />
        </Button>
        <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="h-8 w-8" aria-label="Excluir Vacina">
              <Trash2 className="h-4 w-4" />
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                Tem certeza que deseja excluir o registro desta vacina ({vaccine.vaccineName} - {vaccine.dose})? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(vaccine.id)}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </TableCell>
    </TableRow>
  );
}


export default function PetVaccinationBookletPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [allPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const [vaccinations, setVaccinations] = useLocalStorage<Vaccination[]>(`vaccinations-data-${user?.cpf || 'default'}`, []);
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [petVaccinations, setPetVaccinations] = useState<Vaccination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (petId && user) {
      const foundPet = allPets.find(p => p.id === petId && (p.ownerId === user.cpf || p.secondaryTutorCpf === user.cpf));
      if (foundPet) {
        if (foundPet.status.value !== 'ativo') {
            toast({
                variant: "destructive",
                title: "Pet Não Ativo",
                description: `A caderneta de ${foundPet.nome} não pode ser acessada pois o status não é "ativo".`,
                duration: 7000,
            });
            router.push("/vaccination-booklet");
            return;
        }
        setPet(foundPet);
        const filteredVaccinations = vaccinations
          .filter(vac => vac.petId === petId)
          .sort((a, b) => (parseDateSafe(b.administrationDate)?.getTime() || 0) - (parseDateSafe(a.administrationDate)?.getTime() || 0)); // Sort by most recent first
        setPetVaccinations(filteredVaccinations);
      } else {
        toast({ variant: "destructive", title: "Pet não encontrado", description: "Não foi possível carregar as informações do pet." });
        router.push("/vaccination-booklet");
      }
      setIsLoading(false);
    } else if (!user) {
        router.push("/login");
    }
  }, [petId, allPets, user, router, vaccinations, toast]);

  const handleDeleteVaccine = (vaccineId: string) => {
    setVaccinations(prevVaccinations => prevVaccinations.filter(vac => vac.id !== vaccineId));
    toast({ title: "Vacina Excluída", description: "O registro da vacina foi removido." });
  };
  
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
        <p className="ml-4 text-lg">Carregando caderneta...</p>
      </div>
    );
  }

  if (!pet) {
    // This case should be handled by the redirect in useEffect, but as a fallback:
    return (
        <div className="container mx-auto py-8 px-4 text-center">
            <p>Pet não encontrado ou acesso não permitido.</p>
            <Button onClick={() => router.push("/vaccination-booklet")} className="mt-4">Voltar</Button>
        </div>
    );
  }
  
  const petAgeDisplay = pet.dataNascimento ? calculateAge(pet.dataNascimento).display : (pet.idade !== undefined ? `${pet.idade} ${pet.idade === 1 ? 'ano' : 'anos'} (aprox.)` : 'Idade não informada');

  return (
    <div className={cn("container mx-auto py-8 px-4", cardThemeClasses())}>
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/vaccination-booklet">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Seleção de Pets
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 shadow-md">
              <Image
                src={pet.fotoUrl || `https://placehold.co/100x100.png?text=${encodeURIComponent(pet.nome.charAt(0))}`}
                alt={`Foto de ${pet.nome}`}
                layout="fill"
                objectFit="cover"
                data-ai-hint={`${pet.especie} ${pet.raca}`}
              />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Caderneta de Vacinação: {pet.nome}</CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                {pet.especie} - {pet.raca} - {petAgeDisplay}
              </CardDescription>
            </div>
          </div>
           <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertTitle>Atenção Veterinária!</AlertTitle>
            <AlertDescription>
              O calendário vacinal ideal deve ser definido por um médico veterinário. Estas informações servem como lembrete e histórico.
            </AlertDescription>
          </Alert>
        </CardHeader>

        <CardContent>
          <div className="mb-6 text-right">
            <Button asChild>
              <Link href={`/vaccination-booklet/${pet.id}/new`}>
                <PlusCircle className="mr-2 h-4 w-4" /> Registrar Nova Vacina
              </Link>
            </Button>
          </div>

          {petVaccinations.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed rounded-lg">
              <Syringe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="font-semibold text-lg">Nenhuma vacina registrada para {pet.nome}.</p>
              <p className="text-muted-foreground">Comece adicionando a primeira vacina!</p>
            </div>
          ) : (
            <AlertDialog>
              <Table>
                <TableCaption>Lista de vacinas administradas para {pet.nome}.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vacina</TableHead>
                    <TableHead>Dose</TableHead>
                    <TableHead>Data Admin.</TableHead>
                    <TableHead>Próxima Dose</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {petVaccinations.map(vac => (
                    <VaccinationListItem key={vac.id} vaccine={vac} onDelete={handleDeleteVaccine} />
                  ))}
                </TableBody>
              </Table>
            </AlertDialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
