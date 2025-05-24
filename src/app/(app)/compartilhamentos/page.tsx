
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Share2, CheckSquare, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Placeholder para um card de compartilhamento
const SharedPetCardPlaceholder = ({ type }: { type: "meu" | "comigo" }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-lg">Nome do Pet Placeholder</CardTitle>
          <CardDescription>Espécie - Raça</CardDescription>
        </div>
        <Image 
            src="https://placehold.co/60x60.png?text=🐾" 
            alt="Foto do Pet" 
            width={50} 
            height={50} 
            className="rounded-full border"
            data-ai-hint="animal pet"
        />
      </div>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground space-y-1">
      {type === "meu" ? (
        <p>Compartilhado com: <span className="font-medium text-foreground">email.do.usuario@example.com</span></p>
      ) : (
        <p>Compartilhado por: <span className="font-medium text-foreground">email.do.tutor@example.com</span></p>
      )}
      <p>Data do Compartilhamento: <span className="font-medium text-foreground">DD/MM/AAAA</span></p>
      <p>Status: <span className="font-medium text-primary">Aceito</span></p>
    </CardContent>
    <CardContent className="pt-3 flex gap-2">
        <Button variant="outline" size="sm" disabled>Ver Perfil</Button>
        {type === "meu" && <Button variant="destructive" size="sm" disabled>Revogar</Button>}
        {type === "comigo" && <Button variant="destructive" size="sm" disabled>Recusar</Button>}
    </CardContent>
  </Card>
);

export default function CompartilhamentosPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Users className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Gerenciar Compartilhamentos</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Acompanhe os perfis de pets que você compartilhou e os que foram compartilhados com você.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="meus-compartilhamentos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="meus-compartilhamentos">
                <Share2 className="mr-2 h-4 w-4" /> Meus Compartilhamentos
              </TabsTrigger>
              <TabsTrigger value="compartilhados-comigo">
                <CheckSquare className="mr-2 h-4 w-4" /> Compartilhados Comigo
              </TabsTrigger>
            </TabsList>
            <TabsContent value="meus-compartilhamentos" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Pets que você compartilhou:</h3>
                <p className="text-sm text-muted-foreground">
                  Funcionalidade em desenvolvimento. Aqui você verá os perfis dos seus pets que você concedeu acesso a outros usuários (veterinários, cuidadores, etc.).
                </p>
                {/* Placeholder Cards */}
                <SharedPetCardPlaceholder type="meu" />
                <div className="text-center mt-4">
                     <Button disabled><Share2 className="mr-2 h-4 w-4" /> Compartilhar Novo Pet (Em breve)</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="compartilhados-comigo" className="mt-6">
               <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Pets compartilhados com você:</h3>
                <p className="text-sm text-muted-foreground">
                  Funcionalidade em desenvolvimento. Aqui aparecerão os perfis de pets que outros tutores compartilharam com você.
                </p>
                {/* Placeholder Cards */}
                <SharedPetCardPlaceholder type="comigo" />
                 <div className="text-center mt-4">
                    <p className="text-xs text-muted-foreground">
                        Você poderá aceitar ou recusar convites de compartilhamento aqui.
                    </p>
                 </div>
              </div>
            </TabsContent>
          </Tabs>
           <p className="text-xs text-muted-foreground text-center mt-8">
            Esta seção permitirá um controle granular sobre o acesso aos dados dos seus pets, facilitando a colaboração com veterinários e cuidadores.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
