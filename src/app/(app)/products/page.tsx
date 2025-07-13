
'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useInventory, Product } from '@/context/inventory-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PackageX, Trash, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function ProductsPage() {
  const { products, updateProductStatus, deleteProduct } = useInventory();
  const [filter, setFilter] = useState('');
  const { toast } = useToast();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToView, setProductToView] = useState<Product | null>(null);

  const activeProducts = products.filter(p => p.status === 'active');

  const filteredProducts = activeProducts.filter(p =>
    p.title.toLowerCase().includes(filter.toLowerCase()) ||
    p.shipment.toLowerCase().includes(filter.toLowerCase())
  );
  
  const handleReject = (productId: string) => {
    updateProductStatus(productId, 'rejected');
    toast({
        title: "Product Rejected",
        description: "The product has been moved to the rejected list.",
    });
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      toast({
          title: "Product Deleted",
          description: "The product has been permanently removed.",
      });
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline">Stock List</h1>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Active Products</CardTitle>
            <Input
              placeholder="Filter by title or shipment..."
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
                <TableHead>Shipment</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Buy Price</TableHead>
                <TableHead className="text-right">Shipping Cost</TableHead>
                <TableHead className="text-right">Sell Price</TableHead>
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
                  <TableCell>{product.shipment}</TableCell>
                  <TableCell className="text-right">{product.quantity}</TableCell>
                  <TableCell className="text-right">Tk. {product.buyPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right">Tk. {product.shippingCost.toLocaleString()}</TableCell>
                  <TableCell className="text-right">Tk. {product.sellPrice.toLocaleString()}</TableCell>
                  <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => setProductToView(product)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReject(product.id)}>
                            <PackageX className="mr-2 h-4 w-4" />
                            <span>Reject</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => setProductToDelete(product)}>
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete</span>
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
              No products found.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product from your inventory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction className='bg-destructive hover:bg-destructive/90' onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!productToView} onOpenChange={(open) => !open && setProductToView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{productToView?.title}</DialogTitle>
             <DialogDescription>
                Shipment: {productToView?.shipment} | Quantity in stock: {productToView?.quantity}
              </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center p-4">
             {productToView?.image && (
                <Image
                  src={productToView.image}
                  alt={productToView.title}
                  width={300}
                  height={300}
                  className="rounded-lg object-cover"
                />
              )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

    