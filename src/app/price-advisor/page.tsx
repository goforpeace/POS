
'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInventory } from '@/context/inventory-context';
import { priceAdvisor, PriceAdvisorInput, PriceAdvisorOutput } from '@/ai/flows/price-advisor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

const PriceAdvisorSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  buyPrice: z.coerce.number().min(0),
  shippingCost: z.coerce.number().min(0),
  currentSellPrice: z.coerce.number().min(0),
  recentSalesData: z.string().min(1, "Sales data is required"),
  competitorPrices: z.string().min(1, "Competitor prices are required"),
});

export default function PriceAdvisorPage() {
  const { products } = useInventory();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PriceAdvisorOutput | null>(null);

  const form = useForm<z.infer<typeof PriceAdvisorSchema>>({
    resolver: zodResolver(PriceAdvisorSchema),
    defaultValues: {
      productName: '',
      buyPrice: 0,
      shippingCost: 0,
      currentSellPrice: 0,
      recentSalesData: 'Sold 15 units in the last month with an average discount of 5%.',
      competitorPrices: 'Similar products range from Tk. 2200 to Tk. 2800.',
    },
  });

  const { setValue, watch } = form;
  const selectedProductId = watch('productId');

  React.useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        setValue('productName', product.title);
        setValue('buyPrice', product.buyPrice);
        setValue('shippingCost', product.shippingCost);
        setValue('currentSellPrice', product.sellPrice);
      }
    }
  }, [selectedProductId, products, setValue]);

  const onSubmit = async (values: z.infer<typeof PriceAdvisorSchema>) => {
    setIsLoading(true);
    setResult(null);
    try {
      const input: PriceAdvisorInput = {
        productName: values.productName,
        buyPrice: values.buyPrice,
        shippingCost: values.shippingCost,
        currentSellPrice: values.currentSellPrice,
        recentSalesData: values.recentSalesData,
        competitorPrices: values.competitorPrices,
      };
      const response = await priceAdvisor(input);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get price suggestion.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-headline flex items-center gap-2"><Sparkles className='text-accent'/> AI Price Advisor</h1>
        <p className="text-muted-foreground">Get AI-powered suggestions for optimal pricing and discounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Fill in the details or select an existing product.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Existing Product (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product to pre-fill form" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField control={form.control} name="productName" render={({ field }) => (
                    <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="buyPrice" render={({ field }) => (
                        <FormItem><FormLabel>Buy Price (Tk.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="shippingCost" render={({ field }) => (
                        <FormItem><FormLabel>Shipping Cost (Tk.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="currentSellPrice" render={({ field }) => (
                    <FormItem><FormLabel>Current Sell Price (Tk.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="recentSalesData" render={({ field }) => (
                    <FormItem><FormLabel>Recent Sales Data</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="competitorPrices" render={({ field }) => (
                    <FormItem><FormLabel>Competitor Prices</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Get Suggestion
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-8">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>AI Recommendation</CardTitle>
                <CardDescription>Our AI's analysis will appear here.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>}
                
                {result && !isLoading && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-primary/30">
                            <h4 className="text-sm font-semibold text-primary-foreground/80">Suggested Sell Price</h4>
                            <p className="text-2xl font-bold text-primary-foreground">Tk. {result.suggestedSellPrice.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-primary/30">
                            <h4 className="text-sm font-semibold text-primary-foreground/80">Suggested Discount</h4>
                            <p className="text-2xl font-bold text-primary-foreground">Tk. {result.suggestedDiscountAmount.toLocaleString()}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Reasoning</h4>
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{result.reasoning}</p>
                    </div>
                  </div>
                )}

                {!result && !isLoading && (
                    <div className="flex flex-col justify-center items-center h-48 text-center text-muted-foreground">
                        <Sparkles className="h-10 w-10 mb-4"/>
                        <p>Your pricing suggestion is just a click away.</p>
                    </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
