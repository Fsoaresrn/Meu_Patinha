
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PawPrint,
  Stethoscope,
  BookMarked,
  Utensils,
  Activity,
  SprayCan, // Using SprayCan for Higiene, Shower is not in lucide
  Mail,
  // MessageSquare, // Removido daqui
  // UserCircle, // Removido daqui
  Settings,
  ShieldQuestion,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"; // Assuming this is the shadcn sidebar

const mainNavItems = [
  { href: "/", label: "Casinha", icon: Home },
  { href: "/pets", label: "Meus Pets", icon: PawPrint },
  { href: "/saude", label: "Saúde", icon: Stethoscope },
  { href: "/vaccination-booklet", label: "Caderneta de Vacinação", icon: BookMarked },
  { href: "/nutricao", label: "Nutrição", icon: Utensils },
  { href: "/routine", label: "Rotina e Bem-Estar", icon: Activity },
  { href: "/higiene", label: "Higiene", icon: SprayCan },
];

const secondaryNavItems = [
  { href: "/convites", label: "Convites", icon: Mail },
  // { href: "/fale-conosco", label: "Fale Conosco", icon: MessageSquare }, // Movido para o menu do usuário
];

// const accountNavItem = { href: "/meu-cadastro", label: "Meu Cadastro", icon: UserCircle }; // Removido daqui, está no app-header
const termsNavItem = { href: "/terms", label: "Termos de Uso", icon: ShieldQuestion };


export function AppSidebar() {
  const pathname = usePathname();

  const renderNavItem = (item: { href: string; label: string; icon: React.ElementType }) => (
    <SidebarMenuItem key={item.href}>
      <Link href={item.href} passHref legacyBehavior>
        <SidebarMenuButton
          asChild
          isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
          className="w-full justify-start"
          tooltip={item.label}
        >
          <a>
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </a>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-4">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        <SidebarMenu>
          {mainNavItems.map(renderNavItem)}
        </SidebarMenu>
        <SidebarSeparator className="my-4" />
        <SidebarMenu>
          {secondaryNavItems.map(renderNavItem)}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {/* {renderNavItem(accountNavItem)} // Removido */}
          {/* Optionally add terms link here if needed, or keep in avatar menu */}
          {/* {renderNavItem(termsNavItem)} */}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
