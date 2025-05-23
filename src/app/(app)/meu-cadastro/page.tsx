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
import { useToast } from "@/hooks/use-toast";
import type { UserResponsibility, AuthUser } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ufsBrasil, cidadesPorUF } from "@/lib/constants";
import { useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useRouter, useSearchParams } from "next/navigation";


const profileSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  tipoResponsabilidade: z.enum(["Tutor(a)", "Cuidador(a)", "Veterinário(a)"]),
  uf: z.string().min(2, "UF é obrigatória"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  endereco: z.string().optional(),
  cep: z.string().optional(),
  telefone: z.string().optional(),
});

const passwordSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"), // Simplified, no min length check for current
  novaSenha: z.string().min(8, "Nova senha deve ter no mínimo 8 caracteres"),
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

  const forcePasswordChange = searchParams.get('forcePasswordChange') === 'true' && tempPasswordForcedReset;

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        nome: user.nome,
        email: user.email,
        tipoResponsabilidade: user.tipoResponsabilidade,
        uf: user.uf,
        cidade: user.cidade,
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
        tipoResponsabilidade: data.tipoResponsabilidade as UserResponsibility,
        uf: data.uf,
        cidade: data.cidade,
        endereco: data.endereco,
        cep: data.cep,
        telefone: data.telefone,
    };
    updateUser(updatedUserFields);

    // Also update in the persisted list of all users
    const userIndex = registeredUsers.findIndex(u => u.cpf === user.cpf);
    if (userIndex !== -1) {
        const updatedUsers = [...registeredUsers];
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], ...updatedUserFields, acceptedTerms: user.acceptedTerms };
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
    // Clear temporary password if it was used
    if (isTempPasswordMatch) {
      updateUser({ temporaryPassword: undefined }); // Clear from Zustand state
      const userIndex = registeredUsers.findIndex(u => u.cpf === user.cpf);
        if (userIndex !== -1) {
            const updatedUsers = [...registeredUsers];
            updatedUsers[userIndex] = { ...updatedUsers[userIndex], temporaryPassword: undefined };
            setRegisteredUsers(updatedUsers);
        }
      clearTempPasswordFlag(); // Clear the force reset flag in Zustand
    }
    
    toast({ title: "Senha Alterada", description: "Sua senha foi alterada com sucesso." });
    passwordForm.reset();
    if (forcePasswordChange) {
        router.push('/'); // Redirect to home after forced password change
    }
  };

  if (!user) {
    // AuthGuard should prevent this, but as a fallback
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
          <CardDescription>Visualize e edite suas informações pessoais. Seu CPF ({user.cpf}) não pode ser alterado.</CardDescription>
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
              <FormField control={profileForm.control} name="tipoResponsabilidade" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Responsabilidade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Tutor(a)">Tutor(a)</SelectItem>
                      <SelectItem value="Cuidador(a)">Cuidador(a)</SelectItem>
                      <SelectItem value="Veterinário(a)">Veterinário(a)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField control={profileForm.control} name="uf" render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); profileForm.setValue("cidade", ""); }} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent><mrow ufsBrasil.map(uf => <SelectItem key={uf.sigla} value={uf.sigla}>{uf.nome}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={profileForm.control} name="cidade" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedUf}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                <FormItem><FormLabel>Nova Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
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
