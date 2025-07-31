import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: 'Dashboard Financeiro',
  description: 'Sistema de gestão financeira pessoal',
  keywords: ['finanças', 'dashboard', 'controle financeiro', 'gestão pessoal'],
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinanceApp"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9IiMyNTYzZWIiLz4KPHBhdGggZD0iTTk2IDQ4QzY5LjQ5IDQ4IDQ4IDY5LjQ5IDQ4IDk2QzQ4IDEyMi41MSA2OS40OSAxNDQgOTYgMTQ0QzEyMi41MSAxNDQgMTQ0IDEyMi41MSAxNDQgOTZDMTQ0IDY5LjQ5IDEyMi41MSA0OCA5NiA0OFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04MCA4OEgxMTJWMTI4SDgwVjg4WiIgZmlsbD0iIzI1NjNlYiIvPgo8cGF0aCBkPSJNNzIgNzJIMTIwVjEyMEg3MlY3MloiIHN0cm9rZT0iIzI1NjNlYiIgc3Ryb2tlLXdpZHRoPSI0Ii8+Cjwvc3ZnPgo=", type: "image/svg+xml" }
    ],
    apple: [
      { url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9IiMyNTYzZWIiLz4KPHBhdGggZD0iTTk2IDQ4QzY5LjQ5IDQ4IDQ4IDY5LjQ5IDQ4IDk2QzQ4IDEyMi41MSA2OS40OSAxNDQgOTYgMTQ0QzEyMi41MSAxNDQgMTQ0IDEyMi41MSAxNDQgOTZDMTQ0IDY5LjQ5IDEyMi41MSA0OCA5NiA0OFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04MCA4OEgxMTJWMTI4SDgwVjg4WiIgZmlsbD0iIzI1NjNlYiIvPgo8cGF0aCBkPSJNNzIgNzJIMTIwVjEyMEg3MlY3MloiIHN0cm9rZT0iIzI1NjNlYiIgc3Ryb2tlLXdpZHRoPSI0Ii8+Cjwvc3ZnPgo=", type: "image/svg+xml" }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FinanceApp" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
