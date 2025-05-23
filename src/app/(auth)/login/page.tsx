
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react"; // Import useState
import { Eye, EyeOff } from "lucide-react"; // Import icons

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/hooks/use-toast";
import type { AuthUser } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocalStorage } from "@/hooks/use-local-storage"; 

const loginSchema = z.object({
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14, "CPF inválido"), 
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginUser = useAuthStore((state) => state.login);
  const { toast } = useToast();
  const [registeredUsers] = useLocalStorage<AuthUser[]>("registered-users", []);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      cpf: "",
      senha: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    const user = registeredUsers.find(u => u.cpf === data.cpf.replace(/[^\d]/g, ""));

    if (user) {
      const isTempPasswordLogin = user.temporaryPassword === data.senha;
      const isRegularPasswordLogin = localStorage.getItem(`password-${user.cpf}`) === data.senha;

      if (isRegularPasswordLogin || isTempPasswordLogin) {
        loginUser(user, isTempPasswordLogin);
        toast({ title: "Login bem-sucedido!", description: `Bem-vindo(a) de volta, ${user.nome}!` });
        
        const redirectUrl = searchParams.get('redirect') || '/';
        router.push(redirectUrl);

      } else {
        toast({ variant: "destructive", title: "Erro de login", description: "CPF ou senha incorretos." });
      }
    } else {
      toast({ variant: "destructive", title: "Erro de login", description: "Usuário não encontrado." });
    }
  };

  return (
    <>
      <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight text-foreground">
        Acesse sua conta
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF<span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Seu CPF (somente números)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="senha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha<span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Form>
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/recuperar-senha" legacyBehavior>
          <a className="font-medium text-primary hover:underline">
            Esqueceu a senha?
          </a>
        </Link>
        <Link href="/signup" legacyBehavior>
          <a className="font-medium text-primary hover:underline">
            Crie sua conta
          </a>
        </Link>
      </div>
    </>
  );
}
