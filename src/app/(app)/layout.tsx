
'use client';
import AppShell from '@/components/app-shell';
import React, { useState, useEffect } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return <AppShell>{isClient ? children : null}</AppShell>;
}
