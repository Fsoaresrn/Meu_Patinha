
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react"; // Import LucideIcon type
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

// Define a type for navigation items, including potential sub-items
interface NavSubItem {
  href: string;
  label: string;
  isActive?: (pathname: string) => boolean; // Optional: for more complex active checks
}

interface NavItem {
  href?: string; // Optional if it's just a parent for sub-items
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
    href: "/saude", // Main link for the Health section
    isActive: (pathname) => pathname.startsWith("/saude") || pathname.startsWith("/vaccination-booklet"), // Active if on /saude or /vaccination-booklet
    subItems: [
      { href: "/vaccination-booklet", label: "Caderneta de Vacinação", isActive: (pathname) => pathname.startsWith("/vaccination-booklet") },
      // Add other health sub-items here if needed, e.g.,
      // { href: "/saude/symptom-history-overview", label: "Histórico de Sintomas" },
    ],
  },
  { href: "/nutricao", label: "Nutrição", icon: Utensils, isActive: (pathname) => pathname.startsWith("/nutricao") },
  { href: "/routine", label: "Rotina e Bem-Estar", icon: Activity, isActive: (pathname) => pathname.startsWith("/routine") },
  { href: "/higiene", label: "Higiene", icon: SprayCan, isActive: (pathname) => pathname.startsWith("/higiene") },
];

const secondaryNavItems: NavItem[] = [
  { href: "/convites", label: "Convites", icon: Mail, isActive: (pathname) => pathname.startsWith("/convites") },
];

const termsNavItem: NavItem = { href: "/terms", label: "Termos de Uso", icon: ShieldQuestion, isActive: (pathname) => pathname === "/terms" };


export function AppSidebar() {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem) => (
    <SidebarMenuItem key={item.label}>
      {item.href ? (
        <Link href={item.href} passHref legacyBehavior>
          <SidebarMenuButton
            asChild
            isActive={item.isActive ? item.isActive(pathname) : (item.href !== "/" && pathname.startsWith(item.href))}
            className="w-full justify-start"
            tooltip={item.label}
          >
            <a>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </a>
          </SidebarMenuButton>
        </Link>
      ) : (
        // If no href, it's a parent for sub-items, render a non-link button or just text
         <SidebarMenuButton
            isActive={item.isActive ? item.isActive(pathname) : false}
            className="w-full justify-start cursor-default"
            tooltip={item.label}
            disabled // Or style differently
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </SidebarMenuButton>
      )}
      {item.subItems && item.subItems.length > 0 && (
        <SidebarMenuSub>
          {item.subItems.map(subItem => (
            <SidebarMenuSubItem key={subItem.href}>
              <Link href={subItem.href} passHref legacyBehavior>
                <SidebarMenuSubButton
                  isActive={subItem.isActive ? subItem.isActive(pathname) : pathname.startsWith(subItem.href)}
                >
                  {subItem.label}
                </SidebarMenuSubButton>
              </Link>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
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
          {/* {renderNavItem(termsNavItem)} */}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
