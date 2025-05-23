// src/components/shared/rgb-paw-icon.tsx
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function RgbPawIcon({ size = 28, className, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  // Paths originais do ícone PawPrint da biblioteca Lucide
  const lucidePawPrintPaths = (
    <>
      <circle cx="11" cy="4" r="2"/>
      <circle cx="18" cy="8" r="2"/>
      <circle cx="4" cy="8" r="2"/>
      <path d="M11.5 12.5c0 .46-.07.91-.2 1.34-.13.43-.3.84-.51 1.21-.21.37-.46.7-.76 1-.3.3-.64.55-.99.72-.35.17-.72.28-1.09.28-.4 0-.79-.12-1.14-.35-.35-.23-.65-.54-.89-.9-.24-.36-.42-.77-.54-1.23-.12-.46-.18-.95-.18-1.47 0-1.55.78-2.81 1.75-3.51.21-.15.43-.28.66-.39.23-.11.47-.19.71-.26.24-.07.49-.1.74-.1.28 0 .55.03.81.1.26.07.51.16.75.28.24.12.47.26.68.42.19.14.36.3.51.48.09.1.17.21.25.31.18.25.33.52.45.81.12.29.19.6.19.93Z"/>
      <path d="M17 12.5c0 .46-.07.91-.2 1.34-.13.43-.3.84-.51 1.21-.21.37-.46.7-.76 1-.3.3-.64.55-.99.72-.35.17-.72.28-1.09.28-.4 0-.79-.12-1.14-.35-.35-.23-.65-.54-.89-.9-.24-.36-.42-.77-.54-1.23-.12-.46-.18-.95-.18-1.47 0-1.55.78-2.81 1.75-3.51.21-.15.43-.28.66-.39.23-.11.47-.19.71-.26.24-.07.49-.1.74-.1.28 0 .55.03.81.1.26.07.51.16.75.28.24.12.47.26.68.42.19.14.36.3.51.48.09.1.17.21.25.31.18.25.33.52.45.81.12.29.19.6.19.93Z"/>
    </>
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}
    >
      {/* Contorno Azul (mais externo) */}
      <g fill="none" stroke="#0000FF" strokeWidth="5.5">
        {lucidePawPrintPaths}
      </g>
      {/* Contorno Verde (intermediário) */}
      <g fill="none" stroke="#00FF00" strokeWidth="4">
        {lucidePawPrintPaths}
      </g>
      {/* Contorno Vermelho (mais interno) */}
      <g fill="none" stroke="#FF0000" strokeWidth="2.5">
        {lucidePawPrintPaths}
      </g>
      
      {/* Forma principal do ícone - desenhada por último para ficar no topo */}
      {/* Utiliza currentColor para a cor principal, permitindo que seja definida pelo tema */}
      <g stroke="currentColor" strokeWidth="1.5" fill="currentColor">
        {lucidePawPrintPaths}
      </g>
    </svg>
  );
}
