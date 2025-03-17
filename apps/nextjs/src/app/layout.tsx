import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/react";

import "@/app/globals.css";

import { Toaster } from "sonner";

import { env } from "@/env";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://agendar.tec.br"
      : "http://localhost:3000",
  ),
  title: "Agendar",
  description: "Agendamento online e gestão",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <NuqsAdapter>
          <TRPCReactProvider>{props.children}</TRPCReactProvider>
        </NuqsAdapter>
        <Toaster richColors />
      </body>
    </html>
  );
}
