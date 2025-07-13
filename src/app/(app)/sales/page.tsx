'use client';
import React, { useState } from 'react';
import { useInventory } from '@/context/inventory-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash, Eye, Download } from 'lucide-react';
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

export default function SalesListPage() {
  const { sales, deleteSale } = useInventory();
  const [filter, setFilter] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const filteredSales = sales.filter(s =>
    s.product.title.toLowerCase().includes(filter.toLowerCase()) ||
    s.customer.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.id.toLowerCase().includes(filter.toLowerCase())
  ).sort((a,b) => b.date.getTime() - a.date.getTime());
  
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
    const dataToExport = filteredSales.map(sale => ({
      "Invoice ID": sale.id,
      "Date": format(sale.date, 'yyyy-MM-dd'),
      "Customer Name": sale.customer.name,
      "Customer Phone": sale.customer.phone,
      "Customer Address": sale.customer.address,
      "Product Title": sale.product.title,
      "Product Shipment": sale.product.shipment,
      "Quantity": sale.quantity,
      "Unit Price": sale.product.sellPrice,
      "Discount": sale.discount,
      "Total": sale.total,
    }));

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
          <div className="flex justify-between items-center">
            <CardTitle>All Sales</CardTitle>
            <div className='flex gap-2 items-center'>
              <Input
                placeholder="Filter by product, customer, invoice ID..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleDownloadCSV} variant='outline'>
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
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
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
                  <TableCell>{sale.product.title}</TableCell>
                  <TableCell className="text-right">{sale.quantity}</TableCell>
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
              No sales found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
