"use client";

import { NestoraProvider } from "@/store/nestora-store";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastViewport } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NestoraProvider>
        {children}
        <ToastViewport />
      </NestoraProvider>
    </ThemeProvider>
  );
}
