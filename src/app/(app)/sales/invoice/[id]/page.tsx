
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useInventory } from '@/context/inventory-context';
import { Sale } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import FreesiaLogo from '@/components/icons/FreesiaLogo';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export default function InvoicePage() {
  const params = useParams();
  const { getSaleById } = useInventory();
  const [sale, setSale] = useState<Sale | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      const foundSale = getSaleById(params.id as string);
      setSale(foundSale || null);
    }
  }, [params.id, getSaleById]);

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
  });
  

  if (!sale) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Invoice not found.</p>
      </div>
    );
  }

  const unitPrice = sale.product.sellPrice;
  const subtotal = unitPrice * sale.quantity;

  return (
    <>
      <div className="flex justify-between items-center mb-6 print-hidden">
        <h1 className="text-3xl font-headline">Invoice Details</h1>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <Printer className="h-4 w-4" />
          Print / Download
        </button>

      </div>
      <div ref={invoiceRef}>
        <style type="text/css" media="print">
          {`
            @page { 
              size: auto; 
              margin: 0mm; 
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-area {
              margin: 20mm;
            }
            .print-hidden { 
              display: none; 
            }
          `}
        </style>
        <Card id="invoice-content" className="w-full max-w-4xl mx-auto p-8 shadow-none border print-area">
          <CardHeader className="flex flex-row justify-between items-start border-b pb-4">
            <div>
              <FreesiaLogo />
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
                  <TableCell className="text-right">
                    Tk. {unitPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    Tk. {subtotal.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex justify-end mt-8">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    Tk. {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>- Tk. {sale.discount.toLocaleString()}</span>
                </div>
                {sale.deliveryCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span>+ Tk. {sale.deliveryCharge.toLocaleString()}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Tk. {sale.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-16 text-sm text-muted-foreground">
              <h4 className="font-semibold text-foreground mb-2">Terms & Conditions</h4>
              <p>
                All our products are dispatched with Quality Control (QC) checks. If you
                encounter any issues, please record a clear video during unpacking and inform
                us within 1 day to ensure relevant action is taken
              </p>
            </div>
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Thank you for choosing us!</p>
              <p>If you have any questions, please contact us at www.facebook.com/freesia.finds .</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
