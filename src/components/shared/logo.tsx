import Link from 'next/link';
import { PawPrint } from 'lucide-react'; // Importado o PawPrint padrão
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
}

export function Logo({ className, iconSize = 28, textSize = "text-2xl", showText = true }: LogoProps) {
  const getPaddingForIconSize = () => {
    if (iconSize <= 20) return "p-1.5"; // Ajustado para melhor visual com tamanhos menores
    if (iconSize <= 32) return "p-2";   // Para o tamanho padrão de 28 e um pouco mais
    if (iconSize <= 48) return "p-3";   // Para tamanhos maiores como 40 ou 48
    return "p-4"; // Para tamanhos muito grandes
  };

  return (
    <Link href="/" className={cn("flex items-center gap-2 text-primary hover:opacity-90 transition-opacity", className)}>
      <div className={cn(
        "flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md",
        getPaddingForIconSize()
      )}>
        <PawPrint style={{ width: iconSize, height: iconSize }} />
      </div>
      {showText && <span className={cn("font-bold", textSize)}>Meu Patinha</span>}
    </Link>
  );
}
