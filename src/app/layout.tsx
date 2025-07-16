
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { InventoryProvider } from '@/context/inventory-context';
import { AuthProvider } from '@/context/auth-context';
import { usePathname } from 'next/navigation';
import ProtectedAppLayout from '@/components/protected-app-layout';

// This metadata is now static as we can't export it from a client component
// export const metadata: Metadata = {
//   title: 'Freesia Finds POS',
//   description: 'Point of Sale and Inventory Management for Freesia Finds',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Freesia Finds POS</title>
        <meta name="description" content="Point of Sale and Inventory Management for Freesia Finds" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <InventoryProvider>
            {isLoginPage ? (
              children
            ) : (
              <ProtectedAppLayout>
                {children}
              </ProtectedAppLayout>
            )}
            <Toaster />
          </InventoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
