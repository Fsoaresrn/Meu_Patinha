import Link from 'next/link';
// import { PawPrint } from 'lucide-react'; // Removido o PawPrint original
import { RgbPawIcon } from './rgb-paw-icon'; // Importado o novo ícone
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
}

export function Logo({ className, iconSize = 28, textSize = "text-2xl", showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-primary hover:opacity-90 transition-opacity", className)}>
      <RgbPawIcon size={iconSize} /> {/* Substituído PawPrint por RgbPawIcon */}
      {showText && <span className={cn("font-bold", textSize)}>Meu Patinha</span>}
    </Link>
  );
}
