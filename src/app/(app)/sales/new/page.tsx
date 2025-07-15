
'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInventory, SaleItem } from '@/context/inventory-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const newSaleSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().min(11, 'Valid phone number is required'),
  customerAddress: z.string().min(5, 'Address is required'),
  discount: z.coerce.number().min(0).default(0),
  deliveryCharge: z.coerce.number().min(0).default(0),
});

type NewSaleFormValues = z.infer<typeof newSaleSchema>;

export default function NewSalePage() {
  const { products, addSale, getProductById } = useInventory();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const form = useForm<NewSaleFormValues>({
    resolver: zodResolver(newSaleSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      discount: 0,
      deliveryCharge: 0,
    },
  });

  const { control, handleSubmit, watch } = form;

  const discount = watch('discount');
  const deliveryCharge = watch('deliveryCharge');
  
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const total = subtotal - (Number(discount) || 0) + (Number(deliveryCharge) || 0);

  const handleAddItem = () => {
    if (!selectedProductId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a product to add.' });
      return;
    }
    const product = getProductById(selectedProductId);
    if (!product) return;

    const existingItem = items.find(item => item.product.id === product.id);
    if(existingItem) {
        handleQuantityChange(product.id, existingItem.quantity + 1);
        return;
    }

    const newItem: SaleItem = {
      product: product,
      quantity: 1,
      unitPrice: product.sellPrice,
      title: product.title,
    };
    setItems(prev => [...prev, newItem]);
  };
  
  const handleRemoveItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = getProductById(productId);
    if (product && newQuantity > product.quantity) {
      toast({ variant: 'destructive', title: 'Stock Error', description: `Only ${product.quantity} units available.` });
      return;
    }
    if (newQuantity < 1) {
        handleRemoveItem(productId);
        return;
    }
    setItems(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: newQuantity } : item));
  };

  const handlePriceChange = (productId: string, newPrice: number) => {
    setItems(prev => prev.map(item => item.product.id === productId ? { ...item, unitPrice: newPrice } : item));
  };
  
  const handleTitleChange = (productId: string, newTitle: string) => {
    setItems(prev => prev.map(item => item.product.id === productId ? { ...item, title: newTitle } : item));
  }

  const onSubmit = async (values: NewSaleFormValues) => {
    if (items.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please add at least one product to the sale.' });
      return;
    }
    setIsSubmitting(true);

    try {
        const newSale = await addSale({
          customer: {
            name: values.customerName,
            phone: values.customerPhone,
            address: values.customerAddress,
          },
          items: items,
          discount: values.discount,
          deliveryCharge: values.deliveryCharge,
          total: total,
        });

        toast({ title: 'Sale Recorded', description: `Invoice ${newSale.id} has been created.` });
        router.push(`/sales/invoice/${newSale.id}`);
    } catch (error) {
        console.error("Failed to create sale:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to record the sale. Please try again.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline">Record a New Sale</h1>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Add products to this order.</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className="flex gap-2">
                    <Select onValueChange={setSelectedProductId} value={selectedProductId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                             {products.filter(p => p.status === 'active' && p.quantity > 0).map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    <div className="flex items-center gap-2">
                                        <Image src={p.image} alt={p.title} width={24} height={24} className="rounded-sm" />
                                        <span>{p.title} (Stock: {p.quantity})</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button type="button" onClick={handleAddItem}><Plus className='mr-2 h-4 w-4'/> Add Item</Button>
                </div>

                <div className="space-y-4">
                  {items.length === 0 && <p className="text-muted-foreground text-center py-4">No items in this order yet.</p>}
                  {items.map(item => (
                     <div key={item.product.id} className="flex gap-4 items-start bg-muted p-4 rounded-lg">
                        <Image src={item.product.image} alt={item.product.title} width={80} height={80} className='rounded-md' data-ai-hint="product photo"/>
                        <div className='flex-1 space-y-2'>
                           <Input value={item.title} onChange={(e) => handleTitleChange(item.product.id, e.target.value)} className="font-bold"/>
                           <div className="grid grid-cols-2 gap-2">
                                <Input type="number" value={item.quantity} onChange={e => handleQuantityChange(item.product.id, parseInt(e.target.value))} min={1} max={item.product.quantity} />
                                <Input type="number" value={item.unitPrice} onChange={e => handlePriceChange(item.product.id, parseFloat(e.target.value))} />
                           </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(item.product.id)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                     </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8 sticky top-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review the details before confirming.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span>Subtotal</span><span>Tk. {subtotal.toLocaleString()}</span></div>
                <FormField control={control} name="discount" render={({ field }) => (
                    <FormItem><FormLabel>Discount (Tk.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name="deliveryCharge" render={({ field }) => (
                    <FormItem><FormLabel>Delivery Charge (Tk.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <hr/>
                <div className="flex justify-between text-xl font-bold"><span>Total</span><span>Tk. {total.toLocaleString()}</span></div>
                <Button type="submit" className="w-full" disabled={items.length === 0 || isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Invoice
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
