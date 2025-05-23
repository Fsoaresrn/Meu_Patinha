import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a clean, modern sans-serif font
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ZustandHydration } from '@/components/store/zustand-hydration'; // Helper for Zustand

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Changed from geist to inter as per "Clean, modern, sans-serif font"
});

export const metadata: Metadata = {
  title: 'Meu Patinha - Gerenciador Pet',
  description: 'Gerencie a saúde e bem-estar do seu pet de forma fácil e intuitiva.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ZustandHydration />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
