
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { AuthUser } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { ufsBrasil, cidadesPorUF } from "@/lib/constants";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Link from "next/link";

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

type ProfileFormValues = z.infer<typeof profileSchema>;

const PRIVACY_NOTICE_STORAGE_KEY = "meu-patinha-privacy-notice-seen";

export default function MeuCadastroPage() {
  const { user, updateUser, tempPasswordForcedReset } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registeredUsers, setRegisteredUsers] = useLocalStorage<AuthUser[]>("registered-users", []);
  const [showPrivacyNoticeModal, setShowPrivacyNoticeModal] = useState(false);

  const forcePasswordChange = searchParams.get('forcePasswordChange') === 'true' && tempPasswordForcedReset;

  useEffect(() => {
    const noticeSeen = localStorage.getItem(PRIVACY_NOTICE_STORAGE_KEY);
    if (!noticeSeen) {
      setShowPrivacyNoticeModal(true);
    }
  }, []);

  const handlePrivacyNoticeAccept = () => {
    localStorage.setItem(PRIVACY_NOTICE_STORAGE_KEY, 'true');
    setShowPrivacyNoticeModal(false);
  };

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        nome: user.nome,
        email: user.email,
        tipoResponsabilidade: user.tipoResponsabilidade, 
        uf: user.uf || "", 
        cidade: user.cidade || "", 
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


  if (!user) {
    // This should be handled by AuthGuard, but as a fallback
    router.push('/login');
    return <div className="flex h-screen items-center justify-center"><p>Redirecionando...</p></div>;
  }

  return (
    <>
      <Dialog open={showPrivacyNoticeModal} onOpenChange={setShowPrivacyNoticeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aviso de Privacidade</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              O Meu Patinha utiliza cookies e outras tecnologias semelhantes para
              melhorar a sua experiência. Consulte o nosso{" "}
              <Link href="/aviso-de-privacidade" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                Aviso de Privacidade
              </Link>{" "}
              para saber mais.
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={handlePrivacyNoticeAccept}>
              Ok, entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto space-y-8 py-8">
        {forcePasswordChange && (
          <div className="p-4 mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
            <p className="font-bold">Redefinição de Senha Obrigatória</p>
            <p>
              Por favor, defina uma nova senha na página de {" "}
              <Link href="/configuracoes?forcePasswordChange=true" className="font-semibold text-yellow-800 hover:underline">
                Configurações
              </Link>
              {" "}para continuar.
            </p>
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
                    <FormItem><FormLabel>Nome Completo<span className="text-destructive">*</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={profileForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>E-mail<span className="text-destructive">*</span></FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
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
                      <FormLabel>UF<span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={(value) => { field.onChange(value); profileForm.setValue("cidade", ""); }} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent>{ufsBrasil.map(uf => <SelectItem key={uf.sigla} value={uf.sigla}>{uf.nome}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={profileForm.control} name="cidade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade<span className="text-destructive">*</span></FormLabel>
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
                    <FormItem><FormLabel>CEP</FormLabel><FormControl><Input placeholder="xxxxx-xxx" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={profileForm.control} name="telefone" render={({ field }) => (
                    <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(XX) XXXXX-XXXX" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <Button type="submit" disabled={profileForm.formState.isSubmitting || forcePasswordChange}>Salvar Alterações</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

      </div>
    </>
  );
}

    