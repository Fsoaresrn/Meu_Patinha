
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/hooks/use-toast";
import type { AuthUser, UserResponsibility } from "@/types";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TermsContent } from "@/components/terms/terms-content";


const responsabilidadesDisponiveis: { id: UserResponsibility; label: string }[] = [
  { id: "Tutor(a)", label: "Tutor(a) de Pet" },
  { id: "Cuidador(a)", label: "Cuidador(a) Profissional" },
  { id: "Veterinário(a)", label: "Profissional Veterinário(a)" },
];

const signupSchema = z.object({
  nomeCompleto: z.string().min(3, "Nome completo é obrigatório"),
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido. Use o formato xxx.xxx.xxx-xx ou xxxxxxxxxxx"),
  tipoResponsabilidade: z.array(z.enum(["Tutor(a)", "Cuidador(a)", "Veterinário(a)"]))
    .min(1, "Selecione ao menos um tipo de responsabilidade."),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  confirmarSenha: z.string(),
  telefoneDdd: z.string().optional(),
  telefoneNumero: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar os termos e condições.",
  }),
}).refine(data => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const loginUser = useAuthStore((state) => state.login);
  const { toast } = useToast();
  const [registeredUsers, setRegisteredUsers] = useLocalStorage<AuthUser[]>("registered-users", []);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nomeCompleto: "",
      cpf: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      tipoResponsabilidade: [],
      acceptTerms: false,
      telefoneDdd: "",
      telefoneNumero: "",
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    const { nomeCompleto, cpf, tipoResponsabilidade, email, senha, telefoneDdd, telefoneNumero } = data;
    
    const formattedCpf = cpf.replace(/[^\d]/g, ""); 

    if (registeredUsers.find(u => u.cpf === formattedCpf)) {
      toast({ variant: "destructive", title: "Erro de cadastro", description: "CPF já cadastrado." });
      form.setError("cpf", { message: "CPF já cadastrado." });
      return;
    }
    if (registeredUsers.find(u => u.email === email)) {
      toast({ variant: "destructive", title: "Erro de cadastro", description: "E-mail já cadastrado." });
      form.setError("email", { message: "E-mail já cadastrado." });
      return;
    }

    const newUser: AuthUser = {
      cpf: formattedCpf,
      nome: nomeCompleto,
      email,
      tipoResponsabilidade: tipoResponsabilidade,
      // uf e cidade serão opcionais e preenchidos no Meu Cadastro
      // uf: "", 
      // cidade: "", 
      telefone: (telefoneDdd && telefoneNumero) ? `(${telefoneDdd}) ${telefoneNumero}` : undefined,
      acceptedTerms: false, 
    };

    localStorage.setItem(`password-${newUser.cpf}`, senha);
    setRegisteredUsers([...registeredUsers, newUser]);
    
    toast({ title: "Cadastro realizado com sucesso!", description: "Você já pode fazer login." });
    loginUser(newUser); 
    router.push("/terms"); 
  };

  return (
    <>
      <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight text-foreground">
        Crie sua conta
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="nomeCompleto" render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="cpf" render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl><Input placeholder="xxx.xxx.xxx-xx" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField
            control={form.control}
            name="tipoResponsabilidade"
            render={() => (
              <FormItem>
                <div className="mb-2">
                  <FormLabel className="text-base">Perfis da Conta</FormLabel>
                  <FormDescription>
                    Selecione um ou mais perfis. Isso definirá funcionalidades disponíveis.
                  </FormDescription>
                </div>
                {responsabilidadesDisponiveis.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="tipoResponsabilidade"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-center space-x-3 space-y-0 mb-2 p-3 border rounded-md hover:bg-muted/50"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                return checked
                                  ? field.onChange([...currentValue, item.id])
                                  : field.onChange(
                                      currentValue.filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField control={form.control} name="senha" render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl><Input type="password" placeholder="Crie uma senha" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="confirmarSenha" render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha</FormLabel>
                <FormControl><Input type="password" placeholder="Confirme sua senha" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          
          <FormDescription>Telefone (opcional):</FormDescription>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField control={form.control} name="telefoneDdd" render={({ field }) => (
              <FormItem><FormLabel className="text-sm">DDD</FormLabel><FormControl><Input placeholder="XX" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="telefoneNumero" render={({ field }) => (
              <FormItem><FormLabel className="text-sm">Número</FormLabel><FormControl><Input placeholder="xxxxxxxxx" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <FormField control={form.control} name="acceptTerms" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Li e aceito os {" "}
                  <Dialog>
                    <DialogTrigger asChild>
                      <span className="text-primary hover:underline cursor-pointer">
                        Termos de Uso e Responsabilidade e Política de Privacidade
                      </span>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Termos de Uso e Responsabilidade e Política de Privacidade do Meu Patinha</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="flex-grow h-[calc(90vh-150px)] w-full rounded-md border p-4">
                        <TermsContent />
                      </ScrollArea>
                      <DialogFooter className="mt-auto pt-4">
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Fechar</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )} />

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link href="/login" legacyBehavior>
          <a className="font-medium text-primary hover:underline">
            Faça login
          </a>
        </Link>
      </p>
    </>
  );
}

    
