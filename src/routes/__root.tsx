import { Outlet, createRootRoute, HeadContent, Scripts, ScrollRestoration, redirect } from '@tanstack/react-router'
import * as React from 'react'

import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { AuthProviderWrapper } from "@/components/AuthProvider"

// Import global styles
import '@/index.css'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    try {
      const res = await fetch('http://localhost:3000/api/config/setup-status');
      if (res.ok) {
        const { configured, edition } = await res.json();
        
        if (location.pathname === '/setup') {
          if (edition === 'datacenter') {
            throw redirect({ to: '/dashboard' });
          }
          return;
        }

        if (!configured) {
          throw redirect({ to: '/setup' });
        }
      } else {
        if (location.pathname === '/setup') return;
      }
    } catch (e) {
      if (e instanceof Response) throw e;
      console.error('Failed to check setup status', e);
      if (location.pathname === '/setup') return;
    }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Argon Dashboard',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <AuthProviderWrapper>
              <TooltipProvider>
                <Outlet />
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </AuthProviderWrapper>
          </ThemeProvider>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
