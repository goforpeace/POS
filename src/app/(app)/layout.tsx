import 'react-to-print/build/dist/index.css';
import AppShell from '@/components/app-shell';
import React from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
