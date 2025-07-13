'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useInventory } from '@/context/inventory-context';
import { Sale } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function InvoicePage() {
  const params = useParams();
  const { getSaleById } = useInventory();
  const [sale, setSale] = useState<Sale | null>(null);

  useEffect(() => {
    if (params.id) {
      const foundSale = getSaleById(params.id as string);
      setSale(foundSale || null);
    }
  }, [params.id, getSaleById]);

  const handlePrint = () => {
    window.print();
  };

  if (!sale) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Invoice not found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-headline">Invoice Details</h1>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print / Download
        </Button>
      </div>
      <Card id="invoice-content" className="w-full max-w-4xl mx-auto p-8 shadow-lg">
        <CardHeader className="flex flex-row justify-between items-start border-b pb-4">
            <div>
                <h1 className="text-4xl font-headline text-gray-800">Freesia Finds</h1>
                <p className="text-muted-foreground">Dhaka, Bangladesh</p>
            </div>
            <div>
                <CardTitle className="text-3xl text-right">Invoice</CardTitle>
                <p className="text-right">#{sale.id}</p>
            </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p>{sale.customer.name}</p>
              <p>{sale.customer.address}</p>
              <p>{sale.customer.phone}</p>
            </div>
            <div className="text-right">
                <h3 className="font-semibold mb-2">Date of Issue:</h3>
                <p>{new Date(sale.date).toLocaleDateString()}</p>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{sale.product.title}</TableCell>
                <TableCell className="text-center">{sale.quantity}</TableCell>
                <TableCell className="text-right">Tk. {sale.product.sellPrice.toLocaleString()}</TableCell>
                <TableCell className="text-right">Tk. {(sale.product.sellPrice * sale.quantity).toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="flex justify-end mt-8">
            <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Tk. {(sale.product.sellPrice * sale.quantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Discount</span>
                    <span>- Tk. {sale.discount.toLocaleString()}</span>
                </div>
                <hr/>
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>Tk. {sale.total.toLocaleString()}</span>
                </div>
            </div>
          </div>

          <div className="mt-16 text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
            <p>If you have any questions, please contact us.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
