'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInventory } from '@/context/inventory-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const addProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  buyPrice: z.coerce.number().min(0, 'Buy price cannot be negative'),
  shippingCost: z.coerce.number().min(0, 'Shipping cost cannot be negative'),
  markup: z.coerce.number().min(0, 'Markup cannot be negative'),
  sellPrice: z.coerce.number().min(0),
  image: z.string().url('Must be a valid URL'),
});

export default function AddProductPage() {
  const { addProduct } = useInventory();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof addProductSchema>>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      title: '',
      quantity: 0,
      buyPrice: 0,
      shippingCost: 0,
      markup: 50,
      sellPrice: 0,
      image: 'https://placehold.co/400x400.png',
    },
  });

  const { watch, setValue } = form;
  const buyPrice = watch('buyPrice');
  const shippingCost = watch('shippingCost');
  const markup = watch('markup');
  const imageUrl = watch('image');

  React.useEffect(() => {
    const totalCost = (buyPrice || 0) + (shippingCost || 0);
    const calculatedSellPrice = totalCost * (1 + (markup || 0) / 100);
    setValue('sellPrice', parseFloat(calculatedSellPrice.toFixed(2)));
  }, [buyPrice, shippingCost, markup, setValue]);

  const onSubmit = (values: z.infer<typeof addProductSchema>) => {
    addProduct({
      title: values.title,
      quantity: values.quantity,
      buyPrice: values.buyPrice,
      shippingCost: values.shippingCost,
      sellPrice: values.sellPrice,
      image: values.image,
    });
    toast({
        title: "Product Added",
        description: `${values.title} has been added to your inventory.`,
    });
    router.push('/products');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline">Add New Product</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Elegant Lace Dress" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-6">
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
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
                <Card>
                    <CardHeader><CardTitle>Image Preview</CardTitle></CardHeader>
                    <CardContent>
                        {imageUrl && <Image src={imageUrl} alt="preview" width={400} height={400} className="rounded-lg" data-ai-hint="product photo"/>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                            control={form.control}
                            name="buyPrice"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Buy Price (Tk.)</FormLabel>
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
                                <FormLabel>Ship Cost (Tk.)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="markup"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Markup (%)</FormLabel>
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
                                <FormLabel>Sell Price (Auto-generated)</FormLabel>
                                <FormControl>
                                <Input type="number" readOnly className="bg-muted" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Product</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
