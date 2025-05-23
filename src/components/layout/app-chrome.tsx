"use client";

import type { ReactNode } from 'react';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { SidebarProvider } from "@/components/ui/sidebar";

export function AppChrome({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col bg-background">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
