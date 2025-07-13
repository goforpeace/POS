'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowUpRight, DollarSign, Package, ShoppingBag, Users } from 'lucide-react';
import FacebookLogo from '@/components/icons/FacebookLogo';
import DeliveryLogo from '@/components/icons/DeliveryLogo';
import { useInventory } from '@/context/inventory-context';

const StatCard = ({ title, value, icon, description }: { title: string; value: string; icon: React.ReactNode; description: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { sales, products } = useInventory();
  const [timeFilter, setTimeFilter] = useState(7); // 7, 15, 30

  const filterSalesByDays = (days: number) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);
    return sales.filter(sale => sale.date >= pastDate);
  };
  
  const filteredSales = filterSalesByDays(timeFilter);

  const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
  const dailySales = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).reduce((acc, sale) => acc + sale.total, 0);
  const totalStock = products.reduce((acc, p) => acc + p.quantity, 0);
  const stockValue = products.reduce((acc, p) => acc + (p.buyPrice * p.quantity), 0);

  const salesDataForChart = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString('en-CA');
    const existing = acc.find(item => item.date === date);
    if(existing) {
        existing.total += sale.total;
    } else {
        acc.push({ date, total: sale.total });
    }
    return acc;
  }, [] as {date: string, total: number}[]).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return (
    <div className="flex flex-col gap-6">
      <Card className="relative w-full h-64 overflow-hidden">
        <Image src="/7492437.png" alt="Freesia Finds Banner" layout="fill" objectFit="cover" data-ai-hint="fashion boutique" />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-5xl font-headline font-bold">Welcome to Freesia Finds</h1>
          <p className="mt-2 text-lg">Your Point of Sale & Inventory Dashboard</p>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="secondary" size="icon" asChild>
            <Link href="https://facebook.com/freesia.finds" target="_blank">
              <FacebookLogo className="w-5 h-5" />
            </Link>
          </Button>
          <Button variant="secondary" size="icon" asChild>
            <Link href="https://merchant.pathao.com/courier/dashboard" target="_blank">
              <DeliveryLogo className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Daily Sales" value={`Tk. ${dailySales.toLocaleString()}`} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} description="Total sales for today" />
        <StatCard title="Total Sales" value={`Tk. ${totalRevenue.toLocaleString()}`} icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />} description={`Revenue for the last ${timeFilter} days`} />
        <StatCard title="Total Stock" value={totalStock.toLocaleString()} icon={<Package className="h-4 w-4 text-muted-foreground" />} description="Total units available in stock" />
        <StatCard title="Price of Stock" value={`Tk. ${stockValue.toLocaleString()}`} icon={<Users className="h-4 w-4 text-muted-foreground" />} description="Total value of current stock" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Sales Report</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant={timeFilter === 7 ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter(7)}>Last 7 Days</Button>
              <Button variant={timeFilter === 15 ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter(15)}>Last 15 Days</Button>
              <Button variant={timeFilter === 30 ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter(30)}>Last 30 Days</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesDataForChart}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Tk.${value/1000}k`} />
                <Tooltip 
                    cursor={{fill: 'hsl(var(--accent))'}}
                    contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    labelClassName='font-bold'
                    formatter={(value: number) => [`Tk. ${value.toLocaleString()}`, 'Sales']}
                />
                <Bar dataKey="total" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
