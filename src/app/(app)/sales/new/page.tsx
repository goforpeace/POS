
'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
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
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

const newSaleSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().min(11, 'Valid phone number is required'),
  customerAddress: z.string().min(5, 'Address is required'),
  productId: z.string({ required_error: 'Please select a product.' }),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  sellPrice: z.coerce.number().min(0, 'Sell price cannot be negative'),
  discount: z.coerce.number().min(0).default(0),
});

export default function NewSalePage() {
  const { products, addSale, getProductById } = useInventory();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const form = useForm<z.infer<typeof newSaleSchema>>({
    resolver: zodResolver(newSaleSchema),
    defaultValues: {
      customerName: '', customerPhone: '', customerAddress: '',
      quantity: 1,
      sellPrice: 0,
      discount: 0
    },
  });

  const { watch, setValue } = form;
  const productId = watch('productId');
  const quantity = watch('quantity');
  const discount = watch('discount');
  const sellPrice = watch('sellPrice');

  React.useEffect(() => {
    if (productId) {
      const product = getProductById(productId);
      if (product) {
        setSelectedProduct(product);
        setValue('sellPrice', product.sellPrice);
        if (quantity > product.quantity) {
            setValue('quantity', product.quantity)
        }
      }
    } else {
      setSelectedProduct(null);
    }
  }, [productId, getProductById, setValue, quantity]);

  const onSubmit = (values: z.infer<typeof newSaleSchema>) => {
    if (!selectedProduct) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a product.' });
        return;
    }
    if (values.quantity > selectedProduct.quantity) {
        form.setError('quantity', { message: 'Not enough stock available.' });
        return;
    }

    const total = values.sellPrice * values.quantity - values.discount;

    const newSale = addSale({
        customer: {
            name: values.customerName,
            phone: values.customerPhone,
            address: values.customerAddress,
        },
        product: selectedProduct,
        quantity: values.quantity,
        unitPrice: values.sellPrice,
        discount: values.discount,
        total,
    });
    
    toast({
        title: "Sale Recorded",
        description: `Invoice ${newSale.id} created successfully.`,
    });
    router.push(`/sales/invoice/${newSale.id}`);
  };
  
  const availableProducts = products.filter(p => p.status === 'active' && p.quantity > 0);
  const subtotal = sellPrice * quantity;
  const total = subtotal - discount;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline">Record a New Sale</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control} name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl><Input placeholder="Full Name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control} name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="01xxxxxxxxx" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control} name="customerAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input placeholder="Street, City" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
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
                              aria-expanded={popoverOpen}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? availableProducts.find(
                                    (p) => p.id === field.value
                                  )?.title
                                : "Select a product"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search product..." />
                            <CommandList>
                                <CommandEmpty>No product found.</CommandEmpty>
                                <CommandGroup>
                                {availableProducts.map((p) => (
                                    <CommandItem
                                      key={p.id}
                                      value={p.title}
                                      onSelect={() => {
                                        setValue("productId", p.id)
                                        setPopoverOpen(false)
                                      }}
                                    >
                                    <div className='flex items-center gap-4 w-full'>
                                        <Image src={p.image} alt={p.title} width={40} height={40} className='rounded-md' data-ai-hint="product photo"/>
                                        <div className='flex-1'>
                                            <div className='font-medium'>{p.title}</div>
                                            <div className='text-xs text-muted-foreground'>Stock: {p.quantity}</div>
                                        </div>
                                        <Check
                                            className={cn(
                                            "mr-2 h-4 w-4",
                                            p.id === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                        />
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
                 <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control} name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl><Input type="number" min="1" max={selectedProduct?.quantity} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control} name="sellPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sell Price (Tk.)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                <div className="flex justify-between"><span>Price per item</span><span>Tk. {sellPrice.toLocaleString()}</span></div>
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
                <Button type="submit" className="w-full" disabled={!selectedProduct}>Create Invoice</Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
