
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Pet } from "@/types";
import { cn } from "@/lib/utils";
import { calculateAge } from "@/lib/date-utils";
import { PawPrint, Edit3, Trash2, AlertTriangle } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
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
import { useState } from "react";


interface PetCardProps {
  pet: Pet;
}

export function PetCard({ pet }: PetCardProps) {
  const [allPets, setAllPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const ageDisplay = pet.dataNascimento 
    ? calculateAge(pet.dataNascimento).display 
    : (pet.idade ? `${pet.idade} ${pet.idade === 1 ? 'ano' : 'anos'} (aprox.)` : "Idade desconhecida");
  
  const cardThemeClasses = () => {
    if (pet.status.value !== 'ativo') return "opacity-70 bg-muted/30";
    
    switch (pet.sexo) {
      case "Macho":
        return "theme-male";
      case "Fêmea":
        return "theme-female";
      default: // "Não especificado" or any other value
        return "theme-neutral-gender";
    }
  };

  const handleDeletePet = () => {
    try {
      const updatedPets = allPets.filter(p => p.id !== pet.id);
      setAllPets(updatedPets);
      toast({
        title: "Pet Removido!",
        description: `${pet.nome} foi removido(a) com sucesso.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover pet",
        description: "Não foi possível remover o pet. Tente novamente.",
      });
    }
    setIsAlertOpen(false);
  };

  const getStatusBadgeVariant = (statusValue: Pet['status']['value']): "default" | "secondary" | "destructive" | "outline" => {
    switch (statusValue) {
      case 'ativo':
        return 'default'; 
      case 'falecido':
      case 'perdido':
        return 'destructive';
      case 'doado':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  const getStatusDisplay = (statusValue: Pet['status']['value']): string => {
    switch (statusValue) {
      case 'ativo': return 'Ativo';
      case 'falecido': return 'Falecido';
      case 'doado': return 'Doado';
      case 'perdido': return 'Perdido';
      case 'outro': return 'Outro';
      default: return 'Desconhecido';
    }
  }

  return (
    <Card className={cn("flex flex-col transition-all duration-300 ease-in-out", cardThemeClasses())}>
      <CardHeader className="p-0 relative">
        <Link href={`/pets/${pet.id}`} className="block aspect-[4/3] w-full relative overflow-hidden rounded-t-lg group">
          <Image
            src={pet.fotoUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(pet.nome.charAt(0))}`}
            alt={`Foto de ${pet.nome}`}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={`${pet.especie} ${pet.raca}`}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-1.5">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold mb-0 truncate leading-tight">
              <Link href={`/pets/${pet.id}`} className="hover:text-primary transition-colors">{pet.nome}</Link>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground truncate leading-tight">{pet.raca}</CardDescription>
          </div>
          <PawPrint className="h-6 w-6 text-primary/70 mt-0.5" />
        </div>
        
        <p className="text-xs text-muted-foreground"><strong className="font-medium text-foreground">Registro PET:</strong> PET-{pet.id}</p>
        <p className="text-xs text-muted-foreground"><strong className="font-medium text-foreground">Sexo:</strong> {pet.sexo}</p>
        <p className="text-xs text-muted-foreground"><strong className="font-medium text-foreground">Idade:</strong> {ageDisplay}</p>
        {pet.porte && <p className="text-xs text-muted-foreground"><strong className="font-medium text-foreground">Porte:</strong> {pet.porte}</p>}
        {pet.peso !== undefined && pet.peso !== null && <p className="text-xs text-muted-foreground"><strong className="font-medium text-foreground">Peso:</strong> {String(pet.peso).replace('.',',')} kg</p>}
        
        <div className="flex items-center text-xs text-muted-foreground">
          <strong className="font-medium text-foreground mr-1">Status:</strong> 
          <Badge variant={getStatusBadgeVariant(pet.status.value)} className="text-xs py-0.5 px-1.5 h-auto">
            {getStatusDisplay(pet.status.value)}
          </Badge>
        </div>

      </CardContent>
      <CardFooter className="p-3 border-t mt-auto">
        <div className="flex w-full gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/pets/${pet.id}/edit`}>
              <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Editar
            </Link>
          </Button>
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="flex-1">
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                </div>
              </AlertDialogHeader>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o perfil de <strong>{pet.nome}</strong>? Esta ação não poderá ser desfeita.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletePet}
                  className={cn(buttonVariants({variant: "destructive"}))}
                >
                  Sim, Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
