'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useInventory } from '@/context/inventory-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PackageCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RejectedProductsPage() {
  const { products, updateProductStatus } = useInventory();
  const [filter, setFilter] = useState('');
  const { toast } = useToast();

  const rejectedProducts = products.filter(p => p.status === 'rejected');

  const filteredProducts = rejectedProducts.filter(p =>
    p.title.toLowerCase().includes(filter.toLowerCase())
  );
  
  const handleActivate = (productId: string) => {
    updateProductStatus(productId, 'active');
    toast({
        title: "Product Restored",
        description: "The product has been moved back to the active stock list.",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline">Rejected Products</h1>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Rejected Items</CardTitle>
            <Input
              placeholder="Filter products..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Buy Price</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={40}
                      height={40}
                      className="rounded-md"
                      data-ai-hint="product photo"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell className="text-right">{product.quantity}</TableCell>
                  <TableCell className="text-right">Tk. {product.buyPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleActivate(product.id)}>
                          <PackageCheck className="mr-2 h-4 w-4" />
                          <span>Restore to Stock</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No rejected products found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
