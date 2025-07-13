'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Home,
  Package,
  PlusCircle,
  PackageX,
  ShoppingCart,
  DollarSign,
  Sparkles,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const isActive = (path: string, exact = false) => {
    return exact ? pathname === path : pathname.startsWith(path);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent text-accent-foreground">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-headline font-bold text-gray-800">
              Freesia Finds
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/" legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={isActive('/', true)}
                  tooltip="Dashboard"
                >
                  <Home />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <Collapsible>
              <CollapsibleTrigger className='w-full'>
                <SidebarMenuButton isActive={isActive('/products')} className='justify-between'>
                  <div className='flex items-center gap-2'>
                    <Package />
                    <span>Products</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenu className="ml-4 my-1">
                  <SidebarMenuItem>
                    <Link href="/products" legacyBehavior passHref>
                      <SidebarMenuButton size="sm" isActive={isActive('/products', true)}>
                        <Package />
                        <span>Stock List</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/products/add" legacyBehavior passHref>
                      <SidebarMenuButton size="sm" isActive={isActive('/products/add')}>
                        <PlusCircle />
                        <span>Add Product</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/products/rejected" legacyBehavior passHref>
                      <SidebarMenuButton size="sm" isActive={isActive('/products/rejected')}>
                        <PackageX />
                        <span>Rejected List</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible>
                <CollapsibleTrigger className='w-full'>
                    <SidebarMenuButton isActive={isActive('/sales')} className='justify-between'>
                        <div className='flex items-center gap-2'>
                          <ShoppingCart />
                          <span>Sales</span>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenu className="ml-4 my-1">
                        <SidebarMenuItem>
                            <Link href="/sales/new" legacyBehavior passHref>
                                <SidebarMenuButton size="sm" isActive={isActive('/sales/new')}>
                                    <DollarSign />
                                    <span>New Sale</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>

            <SidebarMenuItem>
              <Link href="/price-advisor" legacyBehavior passHref>
                <SidebarMenuButton isActive={isActive('/price-advisor')}>
                  <Sparkles />
                  <span>Price Advisor</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="https://placehold.co/100x100.png" />
                <AvatarFallback>FF</AvatarFallback>
              </Avatar>
              <span className="font-semibold">Store Manager</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="max-h-screen overflow-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:justify-end">
          <SidebarTrigger className="sm:hidden" />
          <Button variant="outline">Today: {new Date().toLocaleDateString()}</Button>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppShell;
