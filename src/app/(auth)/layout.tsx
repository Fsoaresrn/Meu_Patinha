
import type { ReactNode } from 'react';
import Image from 'next/image';
import { PawPrint } from 'lucide-react'; // Revertendo para PawPrint

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-primary/10 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center rounded-full bg-primary p-3 text-primary-foreground shadow-lg">
            {/* Revertendo para PawPrint */}
            <PawPrint size={40} /> 
          </div>
          <h1 className="text-4xl font-bold text-primary">Meu Patinha</h1>
          <p className="mt-2 text-muted-foreground">
            Seu companheiro digital para o cuidado do seu pet.
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
