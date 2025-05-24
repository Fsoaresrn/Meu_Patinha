
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { AuthUser } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { calculatePasswordStrength, type PasswordStrengthResult } from "@/lib/password-utils";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
import Link from "next/link";


const THEME_STORAGE_KEY = "meu-patinha-theme";

const passwordSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
  confirmarNovaSenha: z.string(),
}).refine(data => data.novaSenha === data.confirmarNovaSenha, {
  message: "As novas senhas não coincidem",
  path: ["confirmarNovaSenha"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;


export default function ConfiguracoesPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, updateUser, clearTempPasswordFlag, tempPasswordForcedReset } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registeredUsers, setRegisteredUsers] = useLocalStorage<AuthUser[]>("registered-users", []);
  const [newPasswordStrength, setNewPasswordStrength] = useState<PasswordStrengthResult | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const forcePasswordChange = searchParams.get('forcePasswordChange') === 'true' && tempPasswordForcedReset;


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
      initialDarkMode = prefersDarkMode; 
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

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" },
  });

  const watchedNewPassword = passwordForm.watch("novaSenha");

  useEffect(() => {
    if (watchedNewPassword) {
      setNewPasswordStrength(calculatePasswordStrength(watchedNewPassword));
    } else {
      setNewPasswordStrength(null);
    }
  }, [watchedNewPassword]);

  const onPasswordSubmit = (data: PasswordFormValues) => {
    if (!user) return;

    const storedPassword = localStorage.getItem(`password-${user.cpf}`);
    const isTempPasswordMatch = user.temporaryPassword === data.senhaAtual;

    if (storedPassword !== data.senhaAtual && !isTempPasswordMatch) {
      passwordForm.setError("senhaAtual", { message: "Senha atual incorreta." });
      toast({ variant: "destructive", title: "Erro", description: "Senha atual incorreta." });
      return;
    }

    localStorage.setItem(`password-${user.cpf}`, data.novaSenha);
    if (isTempPasswordMatch) {
      updateUser({ temporaryPassword: undefined }); 
      const userIndex = registeredUsers.findIndex(u => u.cpf === user.cpf);
        if (userIndex !== -1) {
            const updatedUsers = [...registeredUsers];
            updatedUsers[userIndex] = { ...updatedUsers[userIndex], temporaryPassword: undefined };
            setRegisteredUsers(updatedUsers);
        }
      clearTempPasswordFlag(); 
    }
    
    toast({ title: "Senha Alterada", description: "Sua senha foi alterada com sucesso." });
    passwordForm.reset();
    setNewPasswordStrength(null); 
    if (forcePasswordChange) {
        router.push('/'); 
    }
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

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-1">Alterar Senha</h3>
            <CardDescription className="text-sm text-muted-foreground mb-4">
              Crie uma nova senha para sua conta.
            </CardDescription>
            {forcePasswordChange && (
              <div className="p-3 mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md text-sm">
                <p className="font-bold">Redefinição de Senha Obrigatória</p>
                <p>Por favor, defina uma nova senha para continuar.</p>
              </div>
            )}
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 p-4 rounded-md border bg-background">
                 <FormField control={passwordForm.control} name="senhaAtual" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{forcePasswordChange ? "Senha Provisória" : "Senha Atual"}<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          aria-label={showCurrentPassword ? "Esconder senha" : "Mostrar senha"}
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={passwordForm.control} name="novaSenha" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? "Esconder senha" : "Mostrar senha"}
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    {newPasswordStrength && newPasswordStrength.label && newPasswordStrength.score > 0 && (
                      <div className="mt-2 space-y-1">
                         <Progress
                          value={newPasswordStrength.score * 25}
                          className={cn(
                            "h-2",
                            {
                              "[&>div]:!bg-destructive": newPasswordStrength.score === 1, 
                              "[&>div]:!bg-orange-500": newPasswordStrength.score === 2, 
                              "[&>div]:!bg-green-500": newPasswordStrength.score === 3, 
                              "[&>div]:!bg-green-700": newPasswordStrength.score === 4, 
                            }
                          )}
                          aria-label={`Força da senha: ${newPasswordStrength.label}`}
                        />
                        <p className={`text-xs ${newPasswordStrength.colorClass}`}>
                          Força da senha: {newPasswordStrength.label}
                        </p>
                      </div>
                    )}
                    {newPasswordStrength && newPasswordStrength.score === 0 && newPasswordStrength.label && (
                        <p className={`text-xs mt-1 ${newPasswordStrength.colorClass}`}>
                          Força da senha: {newPasswordStrength.label}
                        </p>
                    )}
                  </FormItem>
                )} />
                <FormField control={passwordForm.control} name="confirmarNovaSenha" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmNewPassword ? "text" : "password"}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          aria-label={showConfirmNewPassword ? "Esconder senha" : "Mostrar senha"}
                        >
                          {showConfirmNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>Alterar Senha</Button>
              </form>
            </Form>
          </section>
          
        </CardContent>
      </Card>
    </div>
  );
}

    