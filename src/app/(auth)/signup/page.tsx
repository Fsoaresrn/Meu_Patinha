
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react"; // Import icons

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
import { calculatePasswordStrength, type PasswordStrengthResult } from "@/lib/password-utils";
import { Progress } from "@/components/ui/progress";
import { cn, formatPhoneNumberForDisplay } from "@/lib/utils";


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
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmarSenha: z.string(),
  telefoneDdd: z.string()
    .refine(val => val === undefined || val === "" || /^\d{2}$/.test(val), {
      message: "DDD deve conter 2 dígitos numéricos ou ser deixado em branco",
    })
    .optional(),
  telefoneNumero: z.string()
    .refine(val => val === undefined || val === "" || /^\d{8}$/.test(val), {
      message: "Número deve conter 8 dígitos numéricos ou ser deixado em branco",
    })
    .optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar os Termos de Uso e Responsabilidade e Política de Privacidade.",
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
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const watchedPassword = form.watch("senha");

  useEffect(() => {
    if (watchedPassword) {
      setPasswordStrength(calculatePasswordStrength(watchedPassword));
    } else {
      setPasswordStrength(null);
    }
  }, [watchedPassword]);

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
      uf: "", 
      cidade: "", 
      telefone: (telefoneDdd && telefoneNumero) ? `(${telefoneDdd}) ${formatPhoneNumberForDisplay(telefoneNumero)}` : undefined,
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
              <FormLabel>Nome Completo<span className="text-destructive">*</span></FormLabel>
              <FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="cpf" render={({ field }) => (
            <FormItem>
              <FormLabel>CPF<span className="text-destructive">*</span></FormLabel>
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
                  <FormLabel className="text-base">Perfis da Conta<span className="text-destructive">*</span></FormLabel>
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
              <FormLabel>E-mail<span className="text-destructive">*</span></FormLabel>
              <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField control={form.control} name="senha" render={({ field }) => (
              <FormItem>
                <FormLabel>Senha<span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Crie uma senha"
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
                {passwordStrength && passwordStrength.label && passwordStrength.score > 0 && (
                  <div className="mt-2 space-y-1">
                    <Progress
                      value={passwordStrength.score * 25}
                      className={cn(
                        "h-2",
                        {
                          "[&>div]:!bg-destructive": passwordStrength.score === 1, 
                          "[&>div]:!bg-orange-500": passwordStrength.score === 2, 
                          "[&>div]:!bg-green-500": passwordStrength.score === 3, 
                          "[&>div]:!bg-green-700": passwordStrength.score === 4, 
                        }
                      )}
                      aria-label={`Força da senha: ${passwordStrength.label}`}
                    />
                    <p className={`text-xs ${passwordStrength.colorClass}`}>
                      Força da senha: {passwordStrength.label}
                    </p>
                  </div>
                )}
                 {passwordStrength && passwordStrength.score === 0 && passwordStrength.label && (
                    <p className={`text-xs mt-1 ${passwordStrength.colorClass}`}>
                      Força da senha: {passwordStrength.label}
                    </p>
                )}
              </FormItem>
            )} />
            <FormField control={form.control} name="confirmarSenha" render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha<span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Esconder senha" : "Mostrar senha"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          
          <FormDescription>Telefone:</FormDescription>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField 
              control={form.control} 
              name="telefoneDdd" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">DDD</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="XX" 
                      {...field} 
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "").slice(0, 2);
                        field.onChange(numericValue);
                      }}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="telefoneNumero" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Número</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="XXXXX-XXX" 
                      {...field} 
                      value={formatPhoneNumberForDisplay(field.value)}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "").slice(0, 8);
                        field.onChange(numericValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
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
                  <span className="text-destructive">*</span>
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
