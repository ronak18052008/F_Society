"use client";

import { NivasaProvider, useSupabaseSync } from "@/store/nivasa-store";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastViewport } from "@/components/ui/toast";

function SupabaseAuthSync({ children }: { children: React.ReactNode }) {
  useSupabaseSync();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NivasaProvider>
      <SupabaseAuthSync>
        <ThemeProvider>
          {children}
          <ToastViewport />
        </ThemeProvider>
      </SupabaseAuthSync>
    </NivasaProvider>
  );
}
