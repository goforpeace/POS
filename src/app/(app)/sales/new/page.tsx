
'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
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
  productId: z.string().min(1, "Please select a product"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  deliveryCharge: z.coerce.number().min(0).default(0),
});

type NewSaleFormValues = z.infer<typeof newSaleSchema>;

export default function NewSalePage() {
  const { products, addSale, getProductById } = useInventory();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<NewSaleFormValues>({
    resolver: zodResolver(newSaleSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      productId: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      deliveryCharge: 0,
    },
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = form;

  const [popoverOpen, setPopoverOpen] = useState(false);

  const selectedProductId = watch('productId');
  const quantity = watch('quantity');
  const unitPrice = watch('unitPrice');
  const discount = watch('discount');
  const deliveryCharge = watch('deliveryCharge');
  
  const selectedProduct = selectedProductId ? getProductById(selectedProductId) : null;
  
  useEffect(() => {
    if (selectedProduct) {
      setValue('unitPrice', selectedProduct.sellPrice);
      setValue('quantity', 1);
    } else {
      setValue('unitPrice', 0);
      setValue('quantity', 1);
    }
  }, [selectedProductId, selectedProduct, setValue]);
  
  const subtotal = (Number(unitPrice) || 0) * (Number(quantity) || 0);
  const total = subtotal - (Number(discount) || 0) + (Number(deliveryCharge) || 0);

  const onSubmit = (values: NewSaleFormValues) => {
    if (!selectedProduct) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a valid product.',
      });
      return;
    }

    if (values.quantity > selectedProduct.quantity) {
      toast({
        variant: 'destructive',
        title: 'Stock Error',
        description: `Not enough stock for ${selectedProduct.title}. Only ${selectedProduct.quantity} available.`,
      });
      return;
    }

    const newSale = addSale({
      customer: {
        name: values.customerName,
        phone: values.customerPhone,
        address: values.customerAddress,
      },
      product: selectedProduct,
      quantity: values.quantity,
      unitPrice: values.unitPrice,
      discount: values.discount,
      deliveryCharge: values.deliveryCharge,
      total: total,
    });

    toast({
      title: 'Sale Recorded',
      description: `Invoice ${newSale.id} has been created.`,
    });
    router.push(`/sales/invoice/${newSale.id}`);
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
                <FormField control={control} name="customerName" render={({ field }) => ( <FormItem> <FormLabel>Customer Name</FormLabel> <FormControl><Input placeholder="Full Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={control} name="customerPhone" render={({ field }) => ( <FormItem> <FormLabel>Phone Number</FormLabel> <FormControl><Input placeholder="01xxxxxxxxx" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={control} name="customerAddress" render={({ field }) => ( <FormItem className="md:col-span-2"> <FormLabel>Address</FormLabel> <FormControl><Input placeholder="Street, City" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={control}
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
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? products.find(
                                    (p) => p.id === field.value
                                  )?.title
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
                                  {products.filter(p => p.status === 'active' && p.quantity > 0).map((p) => (
                                    <CommandItem
                                      value={p.title}
                                      key={p.id}
                                      onSelect={() => {
                                        setValue("productId", p.id)
                                        setPopoverOpen(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          p.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {p.title}
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
                
                {selectedProduct && (
                   <div className="flex gap-4 items-start bg-muted p-4 rounded-lg">
                      <Image src={selectedProduct.image} alt={selectedProduct.title} width={100} height={100} className='rounded-md' data-ai-hint="product photo"/>
                      <div className='flex-1 grid grid-cols-2 gap-4'>
                        <FormField control={control} name="quantity" render={({ field }) => ( <FormItem> <FormLabel>Quantity</FormLabel> <FormControl><Input type="number" {...field} min={1} max={selectedProduct.quantity} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={control} name="unitPrice" render={({ field }) => ( <FormItem> <FormLabel>Sell Price (Tk.)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <div className='col-span-2 text-sm text-muted-foreground'>
                            <p>Stock Available: {selectedProduct.quantity}</p>
                            <p>Default Price: Tk. {selectedProduct.sellPrice.toLocaleString()}</p>
                        </div>
                      </div>
                   </div>
                )}
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
                  control={control} name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (Tk.)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={control} name="deliveryCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Charge (Tk.)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <hr/>
                <div className="flex justify-between text-xl font-bold"><span>Total</span><span>Tk. {total.toLocaleString()}</span></div>
                <Button type="submit" className="w-full" disabled={!selectedProductId}>Create Invoice</Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
