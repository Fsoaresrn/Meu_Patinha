
import type { ReactNode } from 'react';
import { Logo } from '@/components/shared/logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xs">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="mb-4" iconSize={48} textSize="text-3xl" />
          <p className="text-sm text-muted-foreground">
            Bem-vindo! Acesse sua conta e tenha tudo para acompanhar a saúde e o bem-estar do seu melhor amigo em um só lugar.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-xl sm:p-8">
          {children}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Meu Patinha. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
