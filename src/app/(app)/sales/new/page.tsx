
'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInventory } from '@/context/inventory-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const saleProductSchema = z.object({
  productId: z.string(),
  title: z.string(),
  image: z.string(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  sellPrice: z.coerce.number().min(0, 'Sell price cannot be negative'),
  maxStock: z.coerce.number(),
});

const newSaleSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().min(11, 'Valid phone number is required'),
  customerAddress: z.string().min(5, 'Address is required'),
  products: z.array(saleProductSchema).min(1, "Please add at least one product."),
  discount: z.coerce.number().min(0).default(0),
});

type NewSaleFormValues = z.infer<typeof newSaleSchema>;

const ProductSelector = ({ onProductSelected }: { onProductSelected: (product: Product) => void }) => {
    const { products } = useInventory();
    const [popoverOpen, setPopoverOpen] = useState(false);
    const availableProducts = products.filter(p => p.status === 'active' && p.quantity > 0);

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                >
                    Select a product to add...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search product..." />
                    <CommandList>
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup>
                            {availableProducts.map((p) => (
                                <CommandItem
                                    key={p.id}
                                    value={p.id}
                                    onSelect={(currentValue) => {
                                        const selected = availableProducts.find(prod => prod.id === currentValue);
                                        if (selected) {
                                            onProductSelected(selected);
                                        }
                                        setPopoverOpen(false);
                                    }}
                                >
                                    <div className='flex items-center gap-4 w-full'>
                                        <Image src={p.image} alt={p.title} width={40} height={40} className='rounded-md' data-ai-hint="product photo"/>
                                        <div className='flex-1'>
                                            <div className='font-medium'>{p.title}</div>
                                            <div className='text-xs text-muted-foreground'>Stock: {p.quantity}</div>
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default function NewSalePage() {
  const { products, addSale, getProductById } = useInventory();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<NewSaleFormValues>({
    resolver: zodResolver(newSaleSchema),
    defaultValues: {
      customerName: '', customerPhone: '', customerAddress: '',
      products: [],
      discount: 0,
    },
  });

  const { control, handleSubmit, watch, formState: { errors } } = form;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "products",
  });

  const watchedProducts = watch("products");
  const discount = watch("discount");

  const handleProductSelected = (product: Product) => {
    const existingProductIndex = fields.findIndex(item => item.productId === product.id);
    if (existingProductIndex !== -1) {
        const existingProduct = fields[existingProductIndex];
        if (existingProduct.quantity < product.quantity) {
             update(existingProductIndex, {
                ...existingProduct,
                quantity: existingProduct.quantity + 1,
            });
        } else {
            toast({ variant: 'destructive', title: 'Stock limit reached', description: `Cannot add more ${product.title}.` });
        }
    } else {
      append({
        productId: product.id,
        title: product.title,
        image: product.image,
        quantity: 1,
        sellPrice: product.sellPrice,
        maxStock: product.quantity,
      });
    }
  };

  const subtotal = watchedProducts.reduce((acc, p) => acc + (p.sellPrice * p.quantity), 0);
  const total = subtotal - discount;

  const onSubmit = (values: NewSaleFormValues) => {
    // Logic for creating invoice with multiple products will be implemented here
    toast({
        title: "Multi-product sale ready!",
        description: `Ready to create an invoice for ${values.products.length} products.`,
    });
    console.log(values);
    // router.push(`/sales/invoice/${newSale.id}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline">Record a New Sale</h1>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="customerName" render={({ field }) => ( <FormItem> <FormLabel>Customer Name</FormLabel> <FormControl><Input placeholder="Full Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="customerPhone" render={({ field }) => ( <FormItem> <FormLabel>Phone Number</FormLabel> <FormControl><Input placeholder="01xxxxxxxxx" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="customerAddress" render={({ field }) => ( <FormItem className="md:col-span-2"> <FormLabel>Address</FormLabel> <FormControl><Input placeholder="Street, City" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <ProductSelector onProductSelected={handleProductSelected} />
                {errors.products && <p className="text-sm font-medium text-destructive">{errors.products.message}</p>}
                
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead className="w-[120px]">Quantity</TableHead>
                                <TableHead className="w-[150px]">Unit Price (Tk.)</TableHead>
                                <TableHead className="text-right w-[150px]">Total (Tk.)</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No products added yet.
                                    </TableCell>
                                </TableRow>
                            )}
                            {fields.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Image src={item.image} alt={item.title} width={40} height={40} className="rounded-md" data-ai-hint="product photo" />
                                    </TableCell>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>
                                        <Controller
                                            control={control}
                                            name={`products.${index}.quantity`}
                                            render={({ field }) => (
                                                <Input type="number" {...field} min="1" max={item.maxStock} className="h-8"/>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Controller
                                            control={control}
                                            name={`products.${index}.sellPrice`}
                                            render={({ field }) => (
                                                <Input type="number" {...field} className="h-8"/>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {(watchedProducts[index].quantity * watchedProducts[index].sellPrice).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(index)}>
                                            <X className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review the details before confirming.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span>Subtotal</span><span>Tk. {subtotal.toLocaleString()}</span></div>
                <FormField
                  control={form.control} name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (Tk.)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <hr/>
                <div className="flex justify-between text-xl font-bold"><span>Total</span><span>Tk. {total.toLocaleString()}</span></div>
                <Button type="submit" className="w-full" disabled={fields.length === 0}>Create Invoice</Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}

    