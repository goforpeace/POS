
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowUpRight, Calendar as CalendarIcon, DollarSign, Package, ShoppingBag, Users, PackageX, TrendingUp, Calculator } from 'lucide-react';
import FacebookLogo from '@/components/icons/FacebookLogo';
import DeliveryLogo from '@/components/icons/DeliveryLogo';
import { useInventory } from '@/context/inventory-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

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
  const { sales, products, getProductById } = useInventory();
  const [isClient, setIsClient] = useState(false);
  const [timeFilter, setTimeFilter] = useState('7days');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [monthFilter, setMonthFilter] = useState((new Date().getMonth() + 1).toString());
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();

  // State for Profit Calculator
  const [calcProductId, setCalcProductId] = useState<string>('');
  const [calcSellPrice, setCalcSellPrice] = useState<string>('');
  
  const selectedProductForCalc = useMemo(() => {
    if(!calcProductId) return null;
    return getProductById(calcProductId);
  }, [calcProductId, getProductById]);

  useEffect(() => {
    if (selectedProductForCalc) {
      setCalcSellPrice(selectedProductForCalc.sellPrice.toString());
    } else {
      setCalcSellPrice('');
    }
  }, [selectedProductForCalc]);

  const productCost = useMemo(() => {
    if (!selectedProductForCalc) return 0;
    return selectedProductForCalc.buyPrice + selectedProductForCalc.shippingCost;
  }, [selectedProductForCalc]);

  const expectedProfit = useMemo(() => {
    const sellPrice = parseFloat(calcSellPrice);
    if (!selectedProductForCalc || isNaN(sellPrice)) return 0;
    return sellPrice - productCost;
  }, [calcSellPrice, productCost, selectedProductForCalc]);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const availableYears = useMemo(() => {
    const years = new Set(sales.map(s => new Date(s.date).getFullYear()));
    return Array.from(years).sort((a,b) => b-a);
  }, [sales]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.status === 'active');
  }, [products]);

  const rejectedStockValue = products
    .filter(p => p.status === 'rejected')
    .reduce((acc, p) => acc + (p.buyPrice + p.shippingCost) * p.quantity, 0);

  const filteredSales = useMemo(() => {
    let tempSales = sales;

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
  }, [sales, timeFilter, yearFilter, monthFilter, customDateRange]);
  
  const getProductRevenue = (sale: typeof sales[0]) => {
    return sale.total - (sale.deliveryCharge || 0);
  };

  const totalRevenue = filteredSales.reduce((acc, sale) => acc + getProductRevenue(sale), 0);
  
  const totalProfit = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
      const revenue = getProductRevenue(sale);
      if (!sale.items || !Array.isArray(sale.items)) {
          return acc + revenue; // Or some other default behavior
      }
      const costOfGoods = sale.items.reduce((itemAcc, item) => {
        // Here we need to find the original product to get its cost
        const originalProduct = getProductById(item.product.id);
        if (originalProduct) {
          return itemAcc + (originalProduct.buyPrice + originalProduct.shippingCost) * item.quantity;
        }
        return itemAcc;
      }, 0);
      const profit = revenue - costOfGoods;
      return acc + profit;
    }, 0);
  }, [filteredSales, getProductById]);

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

  if (!isClient) {
    return null; // Or a loading spinner
  }

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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <CardTitle>Sales Report</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
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
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5"/> Profit Calculator</CardTitle>
                <CardDescription>Quickly calculate expected profit for a product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select onValueChange={setCalcProductId} value={calcProductId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a product..." />
                    </SelectTrigger>
                    <SelectContent>
                        {products.filter(p => p.status === 'active').map(p => (
                            <SelectItem key={p.id} value={p.id}>
                                <div className="flex items-center gap-2">
                                    <Image src={p.image} alt={p.title} width={24} height={24} className="rounded-sm" data-ai-hint="product photo" />
                                    <span>{p.title}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {selectedProductForCalc && (
                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Product Cost:</span>
                            <span className="font-bold">Tk. {productCost.toLocaleString()}</span>
                        </div>
                         <div className="space-y-2">
                             <label className="text-sm font-medium">Sell Price:</label>
                             <Input 
                                type="number" 
                                placeholder="Enter sell price" 
                                value={calcSellPrice} 
                                onChange={(e) => setCalcSellPrice(e.target.value)}
                             />
                         </div>
                         <div className="flex justify-between items-center pt-2 border-t">
                            <span className="font-bold text-base text-foreground">Expected Profit:</span>
                            <span className={`font-bold text-lg ${expectedProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>Tk. {expectedProfit.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
