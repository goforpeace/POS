

'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useInventory, Product } from '@/context/inventory-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PackageX, Trash, Eye, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';


const editProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  buyPrice: z.coerce.number().min(0, 'Buy price cannot be negative'),
  shippingCost: z.coerce.number().min(0, 'Shipping cost cannot be negative'),
  sellPrice: z.coerce.number().min(0, 'Sell price cannot be negative'),
  description: z.string().optional(),
});


export default function ProductsPage() {
  const { products, updateProductStatus, deleteProduct, updateProduct } = useInventory();
  const [filter, setFilter] = useState('');
  const { toast } = useToast();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToView, setProductToView] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const form = useForm<z.infer<typeof editProductSchema>>({
    resolver: zodResolver(editProductSchema),
  });

  useEffect(() => {
    if (productToEdit) {
      form.reset(productToEdit);
    }
  }, [productToEdit, form]);


  const activeProducts = products.filter(p => p.status === 'active');

  const filteredProducts = activeProducts.filter(p =>
    p.title.toLowerCase().includes(filter.toLowerCase())
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

  const handleEditSubmit = (values: z.infer<typeof editProductSchema>) => {
    if (productToEdit) {
      updateProduct(productToEdit.id, values);
      toast({
        title: 'Product Updated',
        description: `${values.title} has been updated successfully.`,
      });
      setProductToEdit(null);
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
              placeholder="Filter by title..."
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
                           <DropdownMenuItem onClick={() => setProductToEdit(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{productToView?.title}</DialogTitle>
             <DialogDescription>
                Quantity in stock: {productToView?.quantity}
              </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
             {productToView?.image && (
                <Image
                  src={productToView.image}
                  alt={productToView.title}
                  width={300}
                  height={300}
                  className="rounded-lg object-cover w-full"
                />
              )}
              <div className="space-y-4">
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-sm text-muted-foreground">{productToView?.description || 'No description available.'}</p>
              </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!productToEdit} onOpenChange={(open) => !open && setProductToEdit(null)}>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)}>
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Make changes to the product details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="buyPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Buy Price</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shippingCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ship Cost</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                          control={form.control}
                          name="sellPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sell Price</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                   </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
