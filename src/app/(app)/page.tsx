
'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowUpRight, Calendar as CalendarIcon, DollarSign, Package, ShoppingBag, Users, PackageX, TrendingUp } from 'lucide-react';
import FacebookLogo from '@/components/icons/FacebookLogo';
import DeliveryLogo from '@/components/icons/DeliveryLogo';
import { useInventory } from '@/context/inventory-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

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
  const [timeFilter, setTimeFilter] = useState('7days');
  const [shipmentFilter, setShipmentFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [monthFilter, setMonthFilter] = useState((new Date().getMonth() + 1).toString());
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();

  const uniqueShipments = useMemo(() => ['all', ...Array.from(new Set(products.map(p => p.shipment)))], [products]);
  const availableYears = useMemo(() => {
    const years = new Set(sales.map(s => new Date(s.date).getFullYear()));
    return Array.from(years).sort((a,b) => b-a);
  }, [sales]);

  const filteredProducts = useMemo(() => {
    if (shipmentFilter === 'all') return products.filter(p => p.status === 'active');
    return products.filter(p => p.shipment === shipmentFilter && p.status === 'active');
  }, [products, shipmentFilter]);

  const rejectedStockValue = products
    .filter(p => p.status === 'rejected')
    .reduce((acc, p) => acc + (p.buyPrice + p.shippingCost) * p.quantity, 0);

  const filteredSales = useMemo(() => {
    let tempSales = sales;

    if (shipmentFilter !== 'all') {
        tempSales = tempSales.filter(s => s.product && s.product.shipment === shipmentFilter);
    }

    const now = new Date();
    switch (timeFilter) {
      case '7days':
        const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        return tempSales.filter(s => new Date(s.date) >= sevenDaysAgo);
      case '15days':
        const fifteenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15);
        return tempSales.filter(s => new Date(s.date) >= fifteenDaysAgo);
      case '30days':
        const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        return tempSales.filter(s => new Date(s.date) >= thirtyDaysAgo);
      case 'month':
        return tempSales.filter(s => {
          const saleDate = new Date(s.date);
          return saleDate.getFullYear() === parseInt(yearFilter) && saleDate.getMonth() + 1 === parseInt(monthFilter);
        });
      case 'year':
        return tempSales.filter(s => new Date(s.date).getFullYear() === parseInt(yearFilter));
      case 'custom':
        if (customDateRange?.from && customDateRange?.to) {
          const from = new Date(customDateRange.from.setHours(0,0,0,0));
          const to = new Date(customDateRange.to.setHours(23,59,59,999));
          return tempSales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= from && saleDate <= to;
          });
        }
        return [];
      default:
        return tempSales;
    }
  }, [sales, timeFilter, shipmentFilter, yearFilter, monthFilter, customDateRange]);
  
  const getProductRevenue = (sale: typeof sales[0]) => {
    return sale.total - (sale.deliveryCharge || 0);
  };

  const totalRevenue = filteredSales.reduce((acc, sale) => acc + getProductRevenue(sale), 0);
  
  const totalProfit = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
      if (!sale.product) {
        return acc; // Skip this sale if product info is missing
      }
      const revenue = getProductRevenue(sale);
      const costOfGoods = (sale.product.buyPrice + sale.product.shippingCost) * sale.quantity;
      const profit = revenue - costOfGoods;
      return acc + profit;
    }, 0);
  }, [filteredSales]);

  const dailySales = sales
    .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((acc, sale) => acc + getProductRevenue(sale), 0);
  
  const totalStock = filteredProducts.reduce((acc, p) => acc + p.quantity, 0);
  const stockValue = filteredProducts.reduce((acc, p) => acc + (p.buyPrice + p.shippingCost) * p.quantity, 0);

  const salesDataForChart = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString('en-CA');
    const existing = acc.find(item => item.date === date);
    const revenue = getProductRevenue(sale);
    if(existing) {
        existing.total += revenue;
    } else {
        acc.push({ date, total: revenue });
    }
    return acc;
  }, [] as {date: string, total: number}[]).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-5xl font-headline font-bold" style={{ color: '#A74AC7' }}>Welcome to Freesia Finds</h1>
          <p className="mt-2 text-lg">Your Point of Sale & Inventory Dashboard</p>
        </div>
      <Card className="relative w-full h-64 overflow-hidden">
        <Image src="/7492437.png" alt="Freesia Finds Banner" layout="fill" objectFit="cover" data-ai-hint="fashion boutique" />
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatCard title="Daily Sales" value={`Tk. ${dailySales.toLocaleString()}`} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} description="Total sales for today" />
        <StatCard title="Total Sales" value={`Tk. ${totalRevenue.toLocaleString()}`} icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />} description="Based on current filters" />
        <StatCard title="Total Profit" value={`Tk. ${totalProfit.toLocaleString()}`} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} description="Based on current filters" />
        <StatCard title="Total Stock" value={totalStock.toLocaleString()} icon={<Package className="h-4 w-4 text-muted-foreground" />} description="Active stock" />
        <StatCard title="Price of Stock" value={`Tk. ${stockValue.toLocaleString()}`} icon={<Users className="h-4 w-4 text-muted-foreground" />} description="Active stock value" />
        <StatCard title="Rejected Stock Value" value={`Tk. ${rejectedStockValue.toLocaleString()}`} icon={<PackageX className="h-4 w-4 text-muted-foreground" />} description="Total value of rejected items" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <CardTitle>Sales Report</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
                <Select onValueChange={setShipmentFilter} defaultValue={shipmentFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Shipment" /></SelectTrigger>
                    <SelectContent>
                        {uniqueShipments.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Shipments' : s}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Button variant={timeFilter === '7days' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('7days')}>Last 7 Days</Button>
                <Button variant={timeFilter === '15days' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('15days')}>Last 15 Days</Button>
                <Button variant={timeFilter === '30days' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('30days')}>Last 30 Days</Button>
                <Button variant={timeFilter === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('month')}>Month</Button>
                <Button variant={timeFilter === 'year' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('year')}>Year</Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={timeFilter === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeFilter('custom')}
                      className="w-[240px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange?.from ? (
                        customDateRange.to ? (
                          <>
                            {format(customDateRange.from, "LLL dd, y")} -{" "}
                            {format(customDateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(customDateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Custom Range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={customDateRange?.from}
                      selected={customDateRange}
                      onSelect={setCustomDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                {timeFilter === 'month' && (
                     <>
                        <Select onValueChange={setMonthFilter} defaultValue={monthFilter}>
                            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Month" /></SelectTrigger>
                            <SelectContent>
                                {Array.from({length: 12}, (_, i) => i + 1).map(m => <SelectItem key={m} value={m.toString()}>{new Date(0, m-1).toLocaleString('default', { month: 'long' })}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={setYearFilter} defaultValue={yearFilter}>
                            <SelectTrigger className="w-[100px]"><SelectValue placeholder="Year" /></SelectTrigger>
                            <SelectContent>
                                {availableYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                     </>
                )}
                {timeFilter === 'year' && (
                    <Select onValueChange={setYearFilter} defaultValue={yearFilter}>
                        <SelectTrigger className="w-[100px]"><SelectValue placeholder="Year" /></SelectTrigger>
                        <SelectContent>
                            {availableYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
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

    