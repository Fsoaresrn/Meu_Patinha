
"use client";

import type { AuthUser } from '@/types';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { PasswordInput } from '@/components/ui/password-input';
import Link from 'next/link';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const login = useAuthStore.getState().login;


    // Recupera a lista de usuários registrados do localStorage
    const registeredUsersString = localStorage.getItem('registered-users'); // Chave corrigida para "registered-users"
    if (registeredUsersString) {
      const registeredUsers: AuthUser[] = JSON.parse(registeredUsersString);

      // Tenta encontrar o usuário pelo CPF
      const user = registeredUsers.find(user => user.cpf === cpf.replace(/\D/g, '')); // Normaliza CPF no login também

      if (user) {
        // Verifica se a senha corresponde (senha regular ou senha temporária)
        const storedPassword = localStorage.getItem(`password-${user.cpf}`);
        const isTempPasswordLogin = user.temporaryPassword === senha; // Verifica a senha temporária do objeto do usuário

        if (storedPassword === senha || isTempPasswordLogin) {
            login(user, isTempPasswordLogin); // Usa a função de login do store
            toast({ title: "Login bem-sucedido!", description: `Bem-vindo(a) de volta, ${user.nome}!` });
            
            const redirectUrl = searchParams.get('redirect') || '/';
            router.push(redirectUrl);
    
          } else {
            toast({ variant: "destructive", title: "Erro de login", description: "Usuário ou senha incorretos." });
          } 
        } else {
          toast({ variant: "destructive", title: "Erro de login", description: "Usuário não encontrado." });
        }
      } else {
         toast({ variant: "destructive", title: "Erro de login", description: "Nenhum usuário cadastrado." });
      }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label htmlFor="cpf">Usuário<span className="text-destructive">*</span></Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="Seu usuário (CPF)"
              type="text"
              autoFocus
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Senha<span className="text-destructive">*</span></Label>
            <PasswordInput
              id="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <Button type="submit">Entrar</Button>
        </div>
      </form>
      <div className="text-sm text-muted-foreground">
        Esqueceu a senha? <Link href="/recuperar-senha" className="text-primary hover:underline">Recupere aqui</Link>
      </div>
    </div>
  )
}
