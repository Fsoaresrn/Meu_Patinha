"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Stethoscope, 
  BookMarked, 
  Pill, 
  ShieldCheck, 
  FileText,
  ClipboardList,
  ClipboardCheck, // Added ClipboardCheck
  LucideIcon
} from "lucide-react";

interface HealthCardData {
  title: string;
  description: string;
  icon: LucideIcon;
  link: string;
  color: string;
}

const healthFeatureCards: HealthCardData[] = [
  {
    title: "Diagnósticos",
    description: "Analise sintomas e acompanhe os diagnósticos do seu pet.",
    icon: ClipboardList,
    link: "/saude/diagnosticos",
    color: "text-red-500",
  },
  {
    title: "Vacinas",
    description: "Mantenha o histórico de vacinação do seu pet sempre atualizado.",
    icon: BookMarked,
    link: "/vaccination-booklet",
    color: "text-blue-500",
  },
  {
    title: "Vermífugos",
    description: "Controle e registre a aplicação de vermífugos.",
    icon: Pill,
    link: "/saude/vermifugos",
    color: "text-orange-500",
  },
  {
    title: "Antiparasitários",
    description: "Gerencie a proteção contra pulgas, carrapatos e outros parasitas.",
    icon: ShieldCheck,
    link: "/saude/antipulgas",
    color: "text-cyan-500",
  },
  {
    title: "Exames", // MODIFIED
    description: "Acompanhe e gerencie os resultados dos exames laboratoriais e de imagem do seu pet.", // MODIFIED
    icon: ClipboardCheck, // MODIFIED
    link: "/saude/exames",
    color: "text-purple-500", // MODIFIED
  },
  {
    title: "Documentos", // ADDED
    description: "Mantenha todos os documentos importantes do seu pet organizados e acessíveis.", // ADDED
    icon: FileText, // ADDED
    link: "/saude/documentos", // ADDED
    color: "text-indigo-500", // ADDED
  },
];

export default function SaudePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-10 p-6 rounded-lg shadow-md bg-card flex flex-col items-center text-center">
        <Stethoscope className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-primary mb-2">Saúde do Pet</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Gerencie todos os aspectos da saúde do seu companheiro. Acesse rapidamente as seções de diagnósticos, vacinas, vermífugos, antiparasitários, exames e documentos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthFeatureCards.map((feature) => (
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
