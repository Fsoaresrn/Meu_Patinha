
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { UserResponsibility, AuthUser } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { ufsBrasil, cidadesPorUF } from "@/lib/constants";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useRouter, useSearchParams } from "next/navigation";
import { calculatePasswordStrength, type PasswordStrengthResult } from "@/lib/password-utils";


const profileSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  tipoResponsabilidade: z.array(z.enum(["Tutor(a)", "Cuidador(a)", "Veterinário(a)"])).optional(),
  uf: z.string().min(2, "UF é obrigatória"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  endereco: z.string().optional(),
  cep: z.string().optional(),
  telefone: z.string().optional(),
});

const passwordSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
  confirmarNovaSenha: z.string(),
}).refine(data => data.novaSenha === data.confirmarNovaSenha, {
  message: "As novas senhas não coincidem",
  path: ["confirmarNovaSenha"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function MeuCadastroPage() {
  const { user, updateUser, logout, clearTempPasswordFlag, tempPasswordForcedReset } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registeredUsers, setRegisteredUsers] = useLocalStorage<AuthUser[]>("registered-users", []);
  const [newPasswordStrength, setNewPasswordStrength] = useState<PasswordStrengthResult | null>(null);

  const forcePasswordChange = searchParams.get('forcePasswordChange') === 'true' && tempPasswordForcedReset;

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

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

  useEffect(() => {
    if (user) {
      profileForm.reset({
        nome: user.nome,
        email: user.email,
        tipoResponsabilidade: user.tipoResponsabilidade, 
        uf: user.uf || "", // Default to empty string if not present
        cidade: user.cidade || "", // Default to empty string if not present
        endereco: user.endereco || "",
        cep: user.cep || "",
        telefone: user.telefone || "",
      });
    }
  }, [user, profileForm]);

  const selectedUf = profileForm.watch("uf");

  const onProfileSubmit = (data: ProfileFormValues) => {
    if (!user) return;
    
    const updatedUserFields = {
        nome: data.nome,
        email: data.email,
        tipoResponsabilidade: user.tipoResponsabilidade, 
        uf: data.uf,
        cidade: data.cidade,
        endereco: data.endereco,
        cep: data.cep,
        telefone: data.telefone,
    };
    updateUser(updatedUserFields);

    const userIndex = registeredUsers.findIndex(u => u.cpf === user.cpf);
    if (userIndex !== -1) {
        const updatedUsers = [...registeredUsers];
        updatedUsers[userIndex] = { 
            ...updatedUsers[userIndex], 
            ...updatedUserFields, 
            acceptedTerms: user.acceptedTerms, 
            tipoResponsabilidade: user.tipoResponsabilidade 
        };
        setRegisteredUsers(updatedUsers);
    }

    toast({ title: "Perfil Atualizado", description: "Suas informações foram salvas." });
  };

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
    setNewPasswordStrength(null); // Reset strength indicator
    if (forcePasswordChange) {
        router.push('/'); 
    }
  };

  if (!user) {
    router.push('/login');
    return <div className="flex h-screen items-center justify-center"><p>Redirecionando...</p></div>;
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      {forcePasswordChange && (
        <div className="p-4 mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
          <p className="font-bold">Redefinição de Senha Obrigatória</p>
          <p>Por favor, defina uma nova senha para continuar.</p>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Meu Cadastro</CardTitle>
          <CardDescription>Visualize e edite suas informações pessoais. Seu CPF ({user.cpf}) e Perfis da Conta não podem ser alterados aqui.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField control={profileForm.control} name="nome" render={({ field }) => (
                  <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={profileForm.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              
              <FormItem>
                <FormLabel>Perfis da Conta</FormLabel>
                <div className="flex flex-wrap gap-2 p-2 rounded-md border bg-muted/50">
                  {user.tipoResponsabilidade && user.tipoResponsabilidade.length > 0 ? (
                    user.tipoResponsabilidade.map(perfil => (
                      <Badge key={perfil} variant="secondary" className="text-sm">{perfil}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum perfil definido.</p>
                  )}
                </div>
                <FormDescription className="text-xs">
                  Os perfis da conta só podem ser alterados por um administrador do sistema.
                </FormDescription>
              </FormItem>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField control={profileForm.control} name="uf" render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); profileForm.setValue("cidade", ""); }} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{ufsBrasil.map(uf => <SelectItem key={uf.sigla} value={uf.sigla}>{uf.nome}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={profileForm.control} name="cidade" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedUf}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{(cidadesPorUF[selectedUf as keyof typeof cidadesPorUF] || []).map(cidade => <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={profileForm.control} name="endereco" render={({ field }) => (
                <FormItem><FormLabel>Endereço Completo (Rua, Nº, Bairro, etc.)</FormLabel><FormControl><Input placeholder="Opcional" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField control={profileForm.control} name="cep" render={({ field }) => (
                  <FormItem><FormLabel>CEP</FormLabel><FormControl><Input placeholder="Opcional: xxxxx-xxx" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={profileForm.control} name="telefone" render={({ field }) => (
                  <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="Opcional: (XX) XXXXX-XXXX" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" disabled={profileForm.formState.isSubmitting || forcePasswordChange}>Salvar Alterações</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Crie uma nova senha para sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
               <FormField control={passwordForm.control} name="senhaAtual" render={({ field }) => (
                <FormItem><FormLabel>{forcePasswordChange ? "Senha Provisória" : "Senha Atual"}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={passwordForm.control} name="novaSenha" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                  {newPasswordStrength && newPasswordStrength.label && (
                    <p className={`text-xs mt-1 ${newPasswordStrength.colorClass}`}>
                      Força da senha: {newPasswordStrength.label}
                    </p>
                  )}
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="confirmarNovaSenha" render={({ field }) => (
                <FormItem><FormLabel>Confirmar Nova Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>Alterar Senha</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
