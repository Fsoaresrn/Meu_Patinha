
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";

const THEME_STORAGE_KEY = "meu-patinha-theme";

export default function ConfiguracoesPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Efeito para carregar o tema do localStorage e aplicar na montagem
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    let initialDarkMode = false;
    if (storedTheme === "dark") {
      initialDarkMode = true;
    } else if (storedTheme === "light") {
      initialDarkMode = false;
    } else {
      initialDarkMode = prefersDarkMode; // Usa preferência do sistema se nada estiver no localStorage
    }
    
    setIsDarkMode(initialDarkMode);
    if (initialDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Efeito para salvar a preferência de tema e aplicar a classe dark
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "light");
    }
  }, [isDarkMode]);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Configurações</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Ajuste as preferências do aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Preferências de Tema</h3>
            <div className="flex items-center justify-between p-4 rounded-md border bg-background hover:bg-muted/50 transition-colors">
              <Label htmlFor="theme-switch" className="flex items-center space-x-2 cursor-pointer">
                {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                <span className="text-foreground">
                  {isDarkMode ? "Modo Escuro" : "Modo Claro"}
                </span>
              </Label>
              <Switch
                id="theme-switch"
                checked={isDarkMode}
                onCheckedChange={handleThemeChange}
                aria-label="Alternar tema entre claro e escuro"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Sua preferência de tema é salva no seu navegador.
            </p>
          </section>

          {/* Adicionar outras seções de configuração aqui no futuro */}
          
        </CardContent>
      </Card>
    </div>
  );
}
