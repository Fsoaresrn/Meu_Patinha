
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Pet } from "@/types";
import { useAuthStore } from "@/stores/auth.store";
import Image from "next/image";

export default function SaudePage() {
  const { user } = useAuthStore();
  const [allPets] = useLocalStorage<Pet[]>("all-pets-data", []);
  const userPets = allPets.filter(pet => pet.ownerId === user?.cpf || pet.secondaryTutorId === user?.cpf);

  // TODO: Implementar a lógica de seleção de pet e formulário de sintomas.
  // Por enquanto, esta página serve como placeholder e introdução ao módulo.

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Stethoscope className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Módulo de Saúde Pet</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Ferramentas e informações para auxiliar no acompanhamento da saúde do seu companheiro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border-l-4 border-primary bg-primary/10 rounded-md">
            <h3 className="text-xl font-semibold text-primary mb-2">Verificador de Sintomas (Em Breve)</h3>
            <p className="text-foreground mb-3">
              Em breve, você poderá usar nossa ferramenta de IA para uma análise preliminar dos sintomas do seu pet.
              Isso ajudará a entender possíveis causas e a decidir os próximos passos.
            </p>
            <div className="flex items-start space-x-2 p-3 rounded-md border bg-background text-sm">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-muted-foreground">
                <strong>Importante:</strong> As sugestões fornecidas pela IA são para fins informativos e 
                <strong>não substituem</strong> o diagnóstico e aconselhamento de um médico veterinário.
                Consulte sempre um profissional para questões de saúde do seu pet.
              </p>
            </div>
          </div>

          {userPets.length === 0 ? (
            <div className="text-center p-6 border rounded-md bg-muted/50">
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
                Para utilizar as funcionalidades de saúde, primeiro adicione um perfil para seu pet.
              </p>
              <Button asChild>
                <Link href="/pets/new">Cadastrar Pet</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center p-6 border rounded-md bg-muted/50">
               <Image 
                src="https://placehold.co/150x150.png?text=🩺" 
                alt="Funcionalidade em desenvolvimento" 
                width={100} 
                height={100} 
                className="mx-auto mb-4 rounded-full opacity-80"
                data-ai-hint="health care"
              />
              <p className="text-foreground mb-2">
                A funcionalidade completa do Verificador de Sintomas está em desenvolvimento.
              </p>
              <p className="text-muted-foreground">
                Em breve, você poderá selecionar um dos seus pets abaixo para iniciar uma análise:
              </p>
              <ul className="mt-3 text-left max-w-xs mx-auto">
                {userPets.map(pet => (
                  <li key={pet.id} className="text-foreground p-1 border-b border-border last:border-b-0">
                    {pet.nome} ({pet.especie})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Enquanto isso, explore outras funcionalidades do Meu Patinha!
            </p>
            <Button variant="outline" className="mt-2" asChild>
              <Link href="/">Voltar para a Casinha</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
