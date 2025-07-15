
'use client';
import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/inventory-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash, Eye, Download, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Papa from 'papaparse';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function SalesListPage() {
  const { sales, deleteSale } = useInventory();
  const [filter, setFilter] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();

  const filteredSales = useMemo(() => {
    let tempSales = sales.filter(s =>
      s.customer.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.id.toLowerCase().includes(filter.toLowerCase()) ||
      (s.items && s.items.some(item => item.product.title.toLowerCase().includes(filter.toLowerCase())))
    );

    const now = new Date();
    switch (timeFilter) {
      case 'all':
        // No date filter
        break;
      case '7days':
        const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        tempSales = tempSales.filter(s => new Date(s.date) >= sevenDaysAgo);
        break;
      case '30days':
        const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        tempSales = tempSales.filter(s => new Date(s.date) >= thirtyDaysAgo);
        break;
      case 'custom':
        if (customDateRange?.from && customDateRange?.to) {
          const from = new Date(customDateRange.from.setHours(0,0,0,0));
          const to = new Date(customDateRange.to.setHours(23,59,59,999));
          tempSales = tempSales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= from && saleDate <= to;
          });
        } else {
            return [];
        }
        break;
      default:
        break;
    }

    return tempSales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  }, [sales, filter, timeFilter, customDateRange]);
  
  const handleDelete = (saleId: string) => {
    deleteSale(saleId);
    toast({
        title: "Sale Deleted",
        description: "The sale has been removed and stock has been updated.",
    });
  };

  const handleViewInvoice = (saleId: string) => {
    router.push(`/sales/invoice/${saleId}`);
  };

  const handleDownloadCSV = () => {
    const dataToExport = filteredSales.flatMap(sale => 
        sale.items.map(item => ({
            "Invoice ID": sale.id,
            "Date": format(sale.date, 'yyyy-MM-dd'),
            "Customer Name": sale.customer.name,
            "Customer Phone": sale.customer.phone,
            "Customer Address": sale.customer.address,
            "Product Title": item.product.title,
            "Quantity": item.quantity,
            "Unit Price": item.unitPrice,
            "Item Total": item.quantity * item.unitPrice,
            "Invoice Discount": sale.discount,
            "Invoice Delivery Charge": sale.deliveryCharge,
            "Invoice Total": sale.total,
        }))
    );

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sales_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline">Sales List</h1>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <CardTitle>All Sales</CardTitle>
            <div className='flex gap-2 items-center flex-wrap'>
              <Input
                placeholder="Filter by product, customer, ID..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-xs"
              />
              <div className="flex items-center gap-2">
                <Button variant={timeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('all')}>All Time</Button>
                <Button variant={timeFilter === '7days' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('7days')}>Last 7 Days</Button>
                <Button variant={timeFilter === '30days' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('30days')}>Last 30 Days</Button>

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
              </div>

              <Button onClick={handleDownloadCSV} variant='outline' disabled={filteredSales.length === 0}>
                <Download className='mr-2 h-4 w-4' />
                Download CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{sale.id}</TableCell>
                  <TableCell>{sale.customer.name}</TableCell>
                  <TableCell>
                     {sale.items && sale.items.length > 0
                        ? sale.items.map(item => `${item.product.title} (x${item.quantity})`).join(', ')
                        : 'N/A'
                     }
                  </TableCell>
                  <TableCell className="text-right">Tk. {sale.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewInvoice(sale.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Invoice</span>
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the sale record and restock the product quantity.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(sale.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredSales.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No sales found for the selected period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
