
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Settings,
  ChevronDown,
  ClipboardList,
  MessageSquareQuote,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (path: string, exact = false) => {
    return exact ? pathname === path : pathname.startsWith(path);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="Freesia Finds Logo" width={150} height={38} />
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/">
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
                <SidebarMenuButton asChild isActive={isActive('/products')} className='justify-between'>
                    <CollapsibleTrigger className='w-full'>
                        <div className='flex items-center gap-2'>
                            <Package />
                            <span>Products</span>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                </SidebarMenuButton>
              <CollapsibleContent>
                <SidebarMenu className="ml-4 my-1">
                  <SidebarMenuItem>
                    <Link href="/products">
                      <SidebarMenuButton size="sm" isActive={isActive('/products', true)}>
                        <Package />
                        <span>Stock List</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/products/add">
                      <SidebarMenuButton size="sm" isActive={isActive('/products/add')}>
                        <PlusCircle />
                        <span>Add Product</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/products/description">
                      <SidebarMenuButton size="sm" isActive={isActive('/products/description')}>
                        <MessageSquareQuote />
                        <span>Description</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/products/rejected">
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
                <SidebarMenuButton asChild isActive={isActive('/sales')} className='justify-between'>
                    <CollapsibleTrigger className='w-full'>
                        <div className='flex items-center gap-2'>
                          <ShoppingCart />
                          <span>Sales</span>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                </SidebarMenuButton>
                <CollapsibleContent>
                    <SidebarMenu className="ml-4 my-1">
                        <SidebarMenuItem>
                            <Link href="/sales">
                                <SidebarMenuButton size="sm" isActive={isActive('/sales', true)}>
                                    <ClipboardList />
                                    <span>Sales List</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/sales/new">
                                <SidebarMenuButton size="sm" isActive={isActive('/sales/new')}>
                                    <DollarSign />
                                    <span>New Sale</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>

          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="logo company" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-semibold truncate">{user?.email}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem disabled>Profile</DropdownMenuItem>
                <DropdownMenuItem disabled>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
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
