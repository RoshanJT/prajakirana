import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "PRAJAKIRANA SEVA CHARITABLE TRUST",
  description: "Manage donors, campaigns, and communications efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>
        <div className="app-container">
          <AuthProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
