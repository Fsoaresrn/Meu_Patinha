
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth.store"; 
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { AuthUser } from "@/types";
import { useLocalStorage } from "@/hooks/use-local-storage";


const recoverySchema = z.object({
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido."),
  email: z.string().email("E-mail inválido."),
});

type RecoveryFormValues = z.infer<typeof recoverySchema>;

export default function RecoverPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [registeredUsers, setRegisteredUsers] = useLocalStorage<AuthUser[]>("registered-users", []);

  const form = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      cpf: "",
      email: "",
    },
  });

  const onSubmit = (data: RecoveryFormValues) => {
    const formattedCpf = data.cpf.replace(/[^\d]/g, "");
    const userIndex = registeredUsers.findIndex(u => u.cpf === formattedCpf && u.email === data.email);

    if (userIndex !== -1) {
      // Gera senha alfanumérica de 8 caracteres
      const tempPassword = Math.random().toString(36).slice(2, 10);
      
      const updatedUsers = [...registeredUsers];
      updatedUsers[userIndex] = { ...updatedUsers[userIndex], temporaryPassword: tempPassword, acceptedTerms: updatedUsers[userIndex].acceptedTerms || false };
      setRegisteredUsers(updatedUsers);

      toast({
        title: "Senha Provisória Gerada",
        description: `Uma senha provisória foi gerada: ${tempPassword}. Use-a para fazer login e redefinir sua senha.`,
        duration: 10000, 
      });
      router.push("/login");
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "CPF ou e-mail não encontrado ou não correspondem.",
      });
    }
  };

  return (
    <>
      <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight text-foreground">
        Recuperar Senha
      </h2>
      <p className="mb-4 text-sm text-center text-muted-foreground">
        Informe seu CPF e e-mail cadastrados. Uma senha provisória será "enviada" para você.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input placeholder="Seu CPF" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Enviando..." : "Enviar Senha Provisória"}
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-center text-sm">
        <Link href="/login" legacyBehavior>
          <a className="font-medium text-primary hover:underline">
            Voltar para o Login
          </a>
        </Link>
      </p>
    </>
  );
}
