
import type { ReactNode } from 'react';
import Image from 'next/image';
import { Logo } from '@/components/shared/logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Coluna Esquerda - Imagem Centralizada */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col items-center justify-center bg-background p-8 shadow-lg">
        <Image
          src="/petz.jpeg"
          alt="Imagem com diversos pets amigáveis"
          layout="intrinsic" // Alterado de fill para intrinsic
          width={800} // Largura intrínseca da imagem (ajuste se necessário)
          height={600} // Altura intrínseca da imagem (ajuste se necessário)
          priority
          className="rounded-lg shadow-md max-w-full h-auto" // Adicionado estilo e responsividade
        />
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Mantendo a estrutura original da coluna direita, removendo conflitos de merge */}
        <div className="w-full max-w-xs"> {/* Usando max-w-xs consistentemente */}
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo className="mb-4" iconSize={48} textSize="text-3xl" />
             {/* Descrição opcional pode ser adicionada aqui se necessário, mas removida para limpar conflitos */}
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

