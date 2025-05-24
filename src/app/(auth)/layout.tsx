
import type { ReactNode } from 'react';
import Image from 'next/image';
import { Logo } from '@/components/shared/logo'; // Usaremos o logo existente

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Coluna Esquerda - Visível em telas médias e maiores */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-2/5 flex-col items-center justify-center bg-primary/10 p-8 text-center shadow-lg">
        <Image
          src="https://placehold.co/800x1000.png?text=Imagem+do+Pet"
          alt="Imagem de um pet amigável"
          layout="fill"
          objectFit="cover"
          priority
          className="opacity-30"
          data-ai-hint="dog animal pet"
        />
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-5xl font-bold text-primary mb-4">
            Meu Patinha
          </h1>
          <p className="text-xl text-primary/80 max-w-xs">
            Compartilhe momentos com seu amigo e cuide do bem-estar dele.
          </p>
          {/* Futuramente, aqui poderá entrar o botão "CONSTRUÍDO COM..." se desejar */}
        </div>
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo className="mb-4" iconSize={48} textSize="text-3xl" />
            {/* O título da ação (ex: "Acesse sua conta") virá do children */}
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-xl sm:p-8">
            {children}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Meu Patinha. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
