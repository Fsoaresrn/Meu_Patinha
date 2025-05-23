"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/hooks/use-toast";
import type { AuthUser, UserResponsibility } from "@/types";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ufsBrasil, cidadesPorUF } from "@/lib/constants"; // Assuming these are defined

const signupSchema = z.object({
  nomeCompleto: z.string().min(3, "Nome completo é obrigatório"),
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido. Use o formato xxx.xxx.xxx-xx ou xxxxxxxxxxx"),
  tipoResponsabilidade: z.enum(["Tutor(a)", "Cuidador(a)", "Veterinário(a)"], {
    required_error: "Tipo de responsabilidade é obrigatório.",
  }),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  confirmarSenha: z.string(),
  uf: z.string().min(2, "UF é obrigatória"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  enderecoRua: z.string().optional(),
  enderecoNumero: z.string().optional(),
  enderecoComplemento: z.string().optional(),
  enderecoBairro: z.string().optional(),
  cep: z.string().optional(),
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
      uf: "",
      cidade: "",
      acceptTerms: false,
    },
  });

  const selectedUf = form.watch("uf");

  const onSubmit = (data: SignupFormValues) => {
    const { nomeCompleto, cpf, tipoResponsabilidade, email, senha, uf, cidade, enderecoRua, enderecoNumero, enderecoComplemento, enderecoBairro, cep, telefoneDdd, telefoneNumero } = data;
    
    const formattedCpf = cpf.replace(/[^\d]/g, ""); // Normalize CPF

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
      tipoResponsabilidade: tipoResponsabilidade as UserResponsibility,
      uf,
      cidade,
      endereco: `${enderecoRua || ''}${enderecoNumero ? ', ' + enderecoNumero : ''}${enderecoComplemento ? ' - ' + enderecoComplemento : ''}${enderecoBairro ? '. Bairro: ' + enderecoBairro : ''}`.trim() || undefined,
      cep: cep || undefined,
      telefone: (telefoneDdd && telefoneNumero) ? `(${telefoneDdd}) ${telefoneNumero}` : undefined,
      acceptedTerms: false, // Terms accepted on first login after signup
    };

    // Simulate saving password securely (e.g., hash it and store on backend)
    // For demo, store in localStorage (NOT FOR PRODUCTION)
    localStorage.setItem(`password-${newUser.cpf}`, senha);

    setRegisteredUsers([...registeredUsers, newUser]);
    
    toast({ title: "Cadastro realizado com sucesso!", description: "Você já pode fazer login." });
    loginUser(newUser); // Log in the user directly
    router.push("/terms"); // Redirect to terms page first
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
          <FormField control={form.control} name="tipoResponsabilidade" render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Responsabilidade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Tutor(a)">Tutor(a)</SelectItem>
                  <SelectItem value="Cuidador(a)">Cuidador(a)</SelectItem>
                  <SelectItem value="Veterinário(a)">Veterinário(a)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField control={form.control} name="uf" render={({ field }) => (
              <FormItem>
                <FormLabel>UF</FormLabel>
                <Select onValueChange={(value) => { field.onChange(value); form.setValue("cidade", ""); }} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {ufsBrasil.map(uf => <SelectItem key={uf.sigla} value={uf.sigla}>{uf.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="cidade" render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedUf}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Cidade" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {(cidadesPorUF[selectedUf as keyof typeof cidadesPorUF] || []).map(cidade => <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          
          {/* Optional address fields could be in an Accordion or hidden by default */}
          <FormDescription>Informações de endereço (opcional):</FormDescription>
           <FormField control={form.control} name="enderecoRua" render={({ field }) => (
            <FormItem><FormLabel className="text-sm">Rua</FormLabel><FormControl><Input placeholder="Nome da rua" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField control={form.control} name="enderecoNumero" render={({ field }) => (
              <FormItem><FormLabel className="text-sm">Número</FormLabel><FormControl><Input placeholder="Nº" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="enderecoComplemento" render={({ field }) => (
              <FormItem><FormLabel className="text-sm">Complemento</FormLabel><FormControl><Input placeholder="Apto, Bloco" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
           <FormField control={form.control} name="enderecoBairro" render={({ field }) => (
            <FormItem><FormLabel className="text-sm">Bairro</FormLabel><FormControl><Input placeholder="Seu bairro" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
           <FormField control={form.control} name="cep" render={({ field }) => (
            <FormItem><FormLabel className="text-sm">CEP</FormLabel><FormControl><Input placeholder="xxxxx-xxx" {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormDescription>Telefone (opcional):</FormDescription>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField control={form.control} name="telefoneDdd" render={({ field }) => (
              <FormItem><FormLabel className="text-sm">DDD</FormLabel><FormControl><Input placeholder="XX" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="telefoneNumero" render={({ field }) => (
              <FormItem><FormLabel className="text-sm">Número</FormLabel><FormControl><Input placeholder="xxxxxxxxx" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <FormField control={form.control} name="acceptTerms" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Li e aceito os <Link href="/terms" target="_blank" className="text-primary hover:underline">Termos de Uso</Link></FormLabel>
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
