"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Siren, UserCircle, LogOut, ShieldQuestion, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth.store';
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";


export function AppHeader() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { isMobile } = useSidebar();

  const handleEmergency = () => {
    window.open('https://www.google.com/maps/search/?api=1&query=clínicas+veterinárias+24h+próximas', '_blank');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'P'; // Patinha default
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger asChild><Button variant="ghost" size="icon"><Menu /></Button></SidebarTrigger>}
        <span className="font-semibold text-lg hidden sm:block">Meu Patinha</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="destructive" size="icon" onClick={handleEmergency} aria-label="Emergência Veterinária">
          <Siren className="h-5 w-5" />
        </Button>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  {/* Placeholder for user avatar image if available */}
                  {/* <AvatarImage src={user.avatarUrl} alt={user.nome} /> */}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user.nome)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.nome}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/meu-cadastro">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Meu Cadastro</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/terms">
                  <ShieldQuestion className="mr-2 h-4 w-4" />
                  <span>Termos de Uso</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
