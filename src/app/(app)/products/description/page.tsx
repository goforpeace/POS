
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useInventory, Product } from '@/context/inventory-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Eye, Pencil } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

const descriptionSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  description: z.string().min(10, "Description must be at least 10 characters long."),
});

type DescriptionFormValues = z.infer<typeof descriptionSchema>;

export default function ProductDescriptionPage() {
  const { products, updateProduct } = useInventory();
  const { toast } = useToast();
  const [filter, setFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const form = useForm<DescriptionFormValues>({
    resolver: zodResolver(descriptionSchema),
    defaultValues: {
      productId: '',
      description: '',
    }
  });

  const { setValue, watch, reset } = form;
  const selectedProductId = watch('productId');
  const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);

  useEffect(() => {
    if (selectedProduct) {
      setValue('description', selectedProduct.description || '');
    }
  }, [selectedProduct, setValue]);

  useEffect(() => {
    if (editingProduct) {
      reset({
        productId: editingProduct.id,
        description: editingProduct.description || '',
      });
    }
  }, [editingProduct, reset]);

  const onSubmit = (values: DescriptionFormValues) => {
    updateProduct(values.productId, { description: values.description });
    toast({
      title: "Description Updated",
      description: `The description for the selected product has been saved.`,
    });
    reset({ productId: '', description: '' });
  };

  const onEditSubmit = (values: DescriptionFormValues) => {
    updateProduct(values.productId, { description: values.description });
    toast({
      title: "Description Updated",
      description: `The description for ${editingProduct?.title} has been updated.`,
    });
    setEditingProduct(null);
  };

  const productsWithDescription = useMemo(() => {
    return products.filter(p => (p.description || '').toLowerCase().includes(filter.toLowerCase()));
  }, [products, filter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add/Edit Description</CardTitle>
              <CardDescription>Select a product to add or update its description.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Product</FormLabel>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                              >
                                {field.value
                                  ? <span className='flex items-center gap-2'>
                                      <Image src={products.find(p => p.id === field.value)?.image || ''} alt="" width={20} height={20} className='rounded-sm' />
                                      {products.find(p => p.id === field.value)?.title}
                                    </span>
                                  : "Select a product"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Search product..." />
                              <CommandList>
                                  <CommandEmpty>No product found.</CommandEmpty>
                                  <CommandGroup>
                                    {products.filter(p => p.status === 'active').map((p) => (
                                      <CommandItem
                                        value={p.title}
                                        key={p.id}
                                        onSelect={() => {
                                          setValue("productId", p.id)
                                          setPopoverOpen(false)
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", p.id === field.value ? "opacity-100" : "opacity-0")} />
                                        <div className="flex items-center gap-2">
                                          <Image src={p.image} alt={p.title} width={24} height={24} className="rounded-sm" />
                                          <span>{p.title}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter a detailed description..." {...field} rows={6} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={!selectedProductId}>Save Description</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Product Descriptions</CardTitle>
                <Input
                  placeholder="Search descriptions..."
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
                    <TableHead>Product</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsWithDescription.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{product.description}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setViewingProduct(product)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {productsWithDescription.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  No descriptions found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!viewingProduct} onOpenChange={(open) => !open && setViewingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewingProduct?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
             <Image src={viewingProduct?.image || ''} alt={viewingProduct?.title || ''} width={200} height={200} className="rounded-md mx-auto" />
             <p className="text-sm text-muted-foreground">{viewingProduct?.description}</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)}>
              <DialogHeader>
                <DialogTitle>Edit Description for {editingProduct?.title}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                 <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={8} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
