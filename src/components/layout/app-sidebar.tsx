
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react"; 
import {
  Home,
  PawPrint,
  Stethoscope,
  BookMarked,
  Utensils,
  Activity,
  SprayCan, 
  Mail,
  Settings,
  ShieldQuestion,
  ClipboardList,
  Pill,
  ShieldCheck,
  FileText,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

interface NavSubItem {
  href: string;
  label: string;
  icon?: LucideIcon; 
  isActive?: (pathname: string) => boolean; 
}

interface NavItem {
  href?: string; 
  label: string;
  icon: LucideIcon;
  isActive?: (pathname: string) => boolean;
  subItems?: NavSubItem[];
}

const mainNavItems: NavItem[] = [
  { href: "/", label: "Casinha", icon: Home, isActive: (pathname) => pathname === "/" },
  { href: "/pets", label: "Meus Pets", icon: PawPrint, isActive: (pathname) => pathname.startsWith("/pets") },
  {
    label: "Saúde",
    icon: Stethoscope,
    isActive: (pathname) => pathname.startsWith("/saude") || pathname.startsWith("/vaccination-booklet"),
    subItems: [
      { href: "/saude/diagnosticos", label: "Diagnósticos", icon: ClipboardList, isActive: (pathname) => pathname.startsWith("/saude/diagnosticos") },
      { href: "/vaccination-booklet", label: "Caderneta de Vacinação", icon: BookMarked, isActive: (pathname) => pathname.startsWith("/vaccination-booklet") },
      { href: "/saude/vermifugos", label: "Vermífugos", icon: Pill, isActive: (pathname) => pathname.startsWith("/saude/vermifugos") },
      { href: "/saude/antipulgas", label: "Antipulgas e Carrapatos", icon: ShieldCheck, isActive: (pathname) => pathname.startsWith("/saude/antipulgas") },
      { href: "/saude/exames", label: "Exames e Documentos", icon: FileText, isActive: (pathname) => pathname.startsWith("/saude/exames") },
    ],
  },
  { href: "/nutricao", label: "Nutrição", icon: Utensils, isActive: (pathname) => pathname.startsWith("/nutricao") },
  { href: "/routine", label: "Rotina e Bem-Estar", icon: Activity, isActive: (pathname) => pathname.startsWith("/routine") },
  { href: "/higiene", label: "Higiene", icon: SprayCan, isActive: (pathname) => pathname.startsWith("/higiene") },
];

const secondaryNavItems: NavItem[] = [
  { href: "/convites", label: "Convites", icon: Mail, isActive: (pathname) => pathname.startsWith("/convites") },
];

export function AppSidebar() {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const IconComponent = item.icon;
    const baseButtonClass = "w-full justify-start";
    // Ajuste para isActive: Se o item tem href, usa a lógica antiga. Se não tem (é um agrupador),
    // verifica se algum subitem está ativo.
    let activeState = false;
    if (item.href) {
      activeState = item.isActive ? item.isActive(pathname) : (item.href !== "/" && pathname.startsWith(item.href));
    } else if (item.subItems) {
      activeState = item.subItems.some(subItem => subItem.isActive ? subItem.isActive(pathname) : pathname.startsWith(subItem.href));
    }


    if (item.subItems && item.subItems.length > 0) {
      return (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton
            isActive={activeState}
            className={cn(baseButtonClass, item.href ? "" : "cursor-default")} // Parent is not a link if it has subItems AND no href
            tooltip={item.label}
          >
            <IconComponent className="h-5 w-5" />
            <span>{item.label}</span>
          </SidebarMenuButton>
          <SidebarMenuSub>
            {item.subItems.map(subItem => (
              <SidebarMenuSubItem key={subItem.href}>
                <Link href={subItem.href} passHref legacyBehavior>
                  <SidebarMenuSubButton
                    isActive={subItem.isActive ? subItem.isActive(pathname) : pathname.startsWith(subItem.href)}
                  >
                    {subItem.icon && <subItem.icon className="h-4 w-4 mr-2" />}
                    {subItem.label}
                  </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.label}>
        {item.href ? (
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={activeState}
              className={baseButtonClass}
              tooltip={item.label}
            >
              <a>
                <IconComponent className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        ) : (
          // Caso de um item sem href e sem subItems (não deveria acontecer com a estrutura atual, mas é um fallback)
          <SidebarMenuButton
            isActive={activeState}
            className={cn(baseButtonClass, "cursor-default")}
            tooltip={item.label}
            disabled 
          >
            <IconComponent className="h-5 w-5" />
            <span>{item.label}</span>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    );
  };


  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-4">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        <SidebarMenu>
          {mainNavItems.map(item => renderNavItem(item))}
        </SidebarMenu>
        <SidebarSeparator className="my-4" />
        <SidebarMenu>
          {secondaryNavItems.map(item => renderNavItem(item))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {/* {renderNavItem(termsNavItem)} */}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

    