
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react"; // useEffect was missing, added it back
import {
  Home,
  PawPrint,
  Stethoscope,
  BookMarked,
  Utensils,
  Activity,
  SprayCan,
  Users,
  Settings,
  ShieldQuestion,
  ClipboardList, // For Diagnósticos
  Pill,
  ShieldCheck,   // For Antiparasitários
  FileText,      // For Documentos
  BedDouble,
  School,
  Briefcase,
  Newspaper,
  ShoppingCart,
  HeartPulse,
  Handshake,
  HeartHandshake,
  Heart,
  Images,
  ClipboardCheck // For Exames - ADDED
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
    href: "/saude",
    icon: Stethoscope,
    isActive: (pathname) => pathname.startsWith("/saude") || pathname.startsWith("/vaccination-booklet"),
    subItems: [
      { href: "/saude/diagnosticos", label: "Diagnósticos", icon: ClipboardList, isActive: (pathname) => pathname.startsWith("/saude/diagnosticos") },
      { href: "/vaccination-booklet", label: "Vacinas", icon: BookMarked, isActive: (pathname) => pathname.startsWith("/vaccination-booklet") },
      { href: "/saude/vermifugos", label: "Vermífugos", icon: Pill, isActive: (pathname) => pathname.startsWith("/saude/vermifugos") },
      { href: "/saude/antipulgas", label: "Antiparasitários", icon: ShieldCheck, isActive: (pathname) => pathname.startsWith("/saude/antipulgas") },
      { href: "/saude/exames", label: "Exames", icon: ClipboardCheck, isActive: (pathname) => pathname.startsWith("/saude/exames") }, // MODIFIED
      { href: "/saude/documentos", label: "Documentos", icon: FileText, isActive: (pathname) => pathname.startsWith("/saude/documentos") }, // ADDED
    ],
  },
  { href: "/nutricao", label: "Nutrição", icon: Utensils, isActive: (pathname) => pathname.startsWith("/nutricao") },
  { href: "/routine/agenda", label: "Agenda de Atividades", icon: Activity, isActive: (pathname) => pathname.startsWith("/routine/agenda") },
  { href: "/higiene", label: "Higiene", icon: SprayCan, isActive: (pathname) => pathname.startsWith("/higiene") },
  { href: "/album", label: "Álbum", icon: Images, isActive: (pathname) => pathname.startsWith("/album") },
  { href: "/hospedagem", label: "Hospedagem", icon: BedDouble, isActive: (pathname) => pathname.startsWith("/hospedagem") },
  { href: "/creche", label: "Creche", icon: School, isActive: (pathname) => pathname.startsWith("/creche") },
  { href: "/pet-sitter", label: "Pet Sitter", icon: Briefcase, isActive: (pathname) => pathname.startsWith("/pet-sitter") },
  { href: "/shopping", label: "Shopping", icon: ShoppingCart, isActive: (pathname) => pathname.startsWith("/shopping") },
  { href: "/revista", label: "Revista Pet", icon: Newspaper, isActive: (pathname) => pathname.startsWith("/revista") },
  { href: "/adocao", label: "Adoção", icon: HeartHandshake, isActive: (pathname) => pathname.startsWith("/adocao") },
  { href: "/namoro-pet", label: "NamoroPet", icon: Heart, isActive: (pathname) => pathname.startsWith("/namoro-pet") },
];

const secondaryNavItems: NavItem[] = [
  { href: "/compartilhamentos", label: "Compartilhamentos", icon: Users, isActive: (pathname) => pathname.startsWith("/compartilhamentos") },
  { href: "/patrocinadores", label: "Patrocinadores", icon: Handshake, isActive: (pathname) => pathname.startsWith("/patrocinadores") },
  { href: "/espaco-petlovers", label: "Espaço Petlovers", icon: HeartPulse, isActive: (pathname) => pathname.startsWith("/espaco-petlovers") },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [saudeSubMenuOpen, setSaudeSubMenuOpen] = useState(false);

  const isSaudeActive = mainNavItems.find(item => item.label === "Saúde")?.isActive?.(pathname);

  useEffect(() => { // Changed useState to useEffect for correct hook usage
    if (isSaudeActive) {
      setSaudeSubMenuOpen(true);
    } else {
      // Optional: Collapse if not on a Saude page, depending on desired UX
      // setSaudeSubMenuOpen(false);
    }
  }, [isSaudeActive, pathname]); // Added pathname to dependency array

  const handleSaudeMenuClick = () => {
    setSaudeSubMenuOpen(prev => !prev);
    router.push("/saude");
  };

  const renderNavItem = (item: NavItem) => {
    const IconComponent = item.icon;
    const baseButtonClass = "w-full justify-start";
    let activeState = false;

    if (item.label === "Saúde") {
      activeState = !!isSaudeActive;
    } else if (item.href) {
      activeState = item.isActive ? item.isActive(pathname) : (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));
    } else if (item.subItems) { 
      activeState = item.isActive ? item.isActive(pathname) : item.subItems.some(subItem => subItem.isActive ? subItem.isActive(pathname) : pathname.startsWith(subItem.href));
    }

    if (item.subItems && item.subItems.length > 0) {
      if (item.label === "Saúde") {
        return (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              isActive={activeState}
              className={cn(baseButtonClass)}
              tooltip={item.label}
              onClick={handleSaudeMenuClick}
              data-state={saudeSubMenuOpen ? "open" : "closed"}
            >
              <IconComponent className="h-5 w-5" />
              <span>{item.label}</span>
            </SidebarMenuButton>
            {saudeSubMenuOpen && (
              <SidebarMenuSub>
                {item.subItems.map(subItem => (
                  <SidebarMenuSubItem
                    key={subItem.href}
                    className="my-1"
                  >
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
            )}
          </SidebarMenuItem>
        );
      } else {
        return (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              isActive={activeState}
              className={cn(baseButtonClass, item.href ? "" : "cursor-default")}
              tooltip={item.label}
            >
              <IconComponent className="h-5 w-5" />
              <span>{item.label}</span>
            </SidebarMenuButton>
            <SidebarMenuSub>
              {item.subItems.map(subItem => (
                <SidebarMenuSubItem key={subItem.href} className="my-1">
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
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
