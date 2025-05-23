"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Stethoscope, BookMarked, PawPrint, Utensils, Activity, SprayCan } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Logo } from "@/components/shared/logo"; 

const featureCards = [
  {
    title: "Diagnóstico de Sintomas",
    description: "Utilize nossa IA para uma análise preliminar dos sintomas do seu pet.",
    icon: Stethoscope,
    link: "/saude/diagnosticos", 
    color: "text-red-500",
  },
  {
    title: "Acompanhamento de Vacinação",
    description: "Mantenha a caderneta de vacinação do seu pet sempre atualizada.",
    icon: BookMarked,
    link: "/vaccination-booklet",
    color: "text-blue-500",
  },
  {
    title: "Perfis dos Pets",
    description: "Informações completas e histórico de cada um dos seus companheiros.",
    icon: PawPrint,
    link: "/pets",
    color: "text-yellow-500",
  },
  {
    title: "Planos Alimentares",
    description: "Gere planos nutricionais personalizados com auxílio da nossa IA.",
    icon: Utensils,
    link: "/nutricao",
    color: "text-green-500",
  },
  {
    title: "Agenda de Atividades",
    description: "Organize a rotina de passeios, brincadeiras e outros compromissos.",
    icon: Activity,
    link: "/routine/agenda",
    color: "text-purple-500",
  },
  {
    title: "Controle de Higiene",
    description: "Registre banhos, tosas e outros cuidados de higiene do seu pet.",
    icon: SprayCan,
    link: "/higiene",
    color: "text-teal-500",
  },
];

export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-10 p-6 rounded-lg shadow-md bg-card flex flex-col items-center text-center">
        <Logo className="mb-4" iconSize={48} textSize="text-3xl" /> 
        <h1 className="text-4xl font-bold text-primary mb-2">Bem-vindo(a) ao Meu Patinha!</h1>
        {user && <p className="text-xl text-foreground">Olá, {user.nome.split(' ')[0]}! Estamos felizes em te ver por aqui.</p>}
        <p className="mt-2 text-muted-foreground">
          Tudo o que você precisa para cuidar da saúde e bem-estar do seu melhor amigo, em um só lugar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureCards.map((feature) => (
          <Card key={feature.title} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <feature.icon className={`h-10 w-10 ${feature.color}`} />
              <div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
            <div className="p-6 pt-0">
              <Link href={feature.link} passHref>
                <Button className="w-full">Acessar</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}