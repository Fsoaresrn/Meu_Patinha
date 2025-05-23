
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Pet } from "@/types";
import { useAuthStore } from "@/stores/auth.store";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function PetSelectionCard({ pet }: { pet: Pet }) {
  const cardThemeClasses = () => {
    if (pet.status.value !== 'ativo') return "opacity-70 bg-muted/30 hover:bg-muted/40";
    switch (pet.sexo) {
      case "Macho": return "theme-male hover:bg-blue-100/80 dark:hover:bg-blue-900/60";
      case "Fêmea": return "theme-female hover:bg-pink-100/80 dark:hover:bg-pink-900/60";
      default: return "theme-neutral-gender hover:bg-green-100/80 dark:hover:bg-green-900/60";
    }
  };

  return (
    <Link href={`/saude/exames/${pet.id}`} className="block group">
      <Card className={cn("transition-all duration-200 ease-in-out shadow-md hover:shadow-xl", cardThemeClasses())}>
        <CardContent className="p-4 flex items-center space-x-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-background group-hover:border-primary transition-colors">
            <Image
              src={pet.fotoUrl || `https://placehold.co/100x100.png?text=${encodeURIComponent(pet.nome.charAt(0))}`}
              alt={`Foto de ${pet.nome}`}
              layout="fill"
              objectFit="cover"
              data-ai-hint={`${pet.especie} ${pet.raca}`}
            />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">{pet.nome}</CardTitle>
            <CardDescription className="text-sm">{pet.especie} - {pet.raca}</CardDescription>
            {pet.status.value !== 'ativo' && (
                 <p className="text-xs text-destructive font-semibold mt-1">Status: {pet.status.value}</p>
            )}
          </div>
          <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ExamesPage() {
  const { user } = useAuthStore();
  const [allPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const userPets = allPets.filter(pet => pet.ownerId === user?.cpf || pet.secondaryTutorCpf === user?.cpf);
  const activeUserPets = userPets.filter(pet => pet.status.value === 'ativo');

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FileText className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Histórico de Exames e Documentos</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Selecione um pet para visualizar e adicionar exames, receitas e outros documentos médicos.
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
                Para utilizar o histórico de exames, primeiro adicione um perfil para seu pet.
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
                O histórico de exames só pode ser usado para pets ativos. Verifique o status dos seus pets em "Meus Pets".
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Seus Pets Ativos:</h3>
              {activeUserPets.map(pet => (
                <PetSelectionCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
          
          {userPets.length > 0 && activeUserPets.length < userPets.length && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Pets com status diferente de "ativo" não são listados aqui para o histórico de exames.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    