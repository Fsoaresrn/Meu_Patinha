"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/hooks/use-toast";
import type { AuthUser } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocalStorage } from "@/hooks/use-local-storage"; // To find user

const loginSchema = z.object({
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14, "CPF inválido"), // Allow for xxx.xxx.xxx-xx
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Dummy user data for now, replace with actual user fetching logic
const getRegisteredUsers = () => {
  if (typeof window !== "undefined") {
    const usersRaw = localStorage.getItem("registered-users");
    return usersRaw ? JSON.parse(usersRaw) as AuthUser[] : [];
  }
  return [];
};


export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginUser = useAuthStore((state) => state.login);
  const { toast } = useToast();
  const [registeredUsers] = useLocalStorage<AuthUser[]>("registered-users", []);


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      cpf: "",
      senha: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    // Simulate login
    const user = registeredUsers.find(u => u.cpf === data.cpf);

    if (user) {
      // In a real app, password would be hashed and compared on the backend
      // For demo, we check plain text password or temporary password
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
                <FormLabel>CPF</FormLabel>
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
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Sua senha" {...field} />
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
