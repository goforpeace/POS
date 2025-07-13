'use server';

/**
 * @fileOverview AI-powered tool that analyzes product pricing and sales data to suggest optimal selling prices and discount amounts.
 *
 * - priceAdvisor - A function that handles the price advising process.
 * - PriceAdvisorInput - The input type for the priceAdvisor function.
 * - PriceAdvisorOutput - The return type for the priceAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PriceAdvisorInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  buyPrice: z.number().describe('The price at which the product was bought.'),
  shippingCost: z.number().describe('The cost of shipping the product.'),
  currentSellPrice: z.number().describe('The current selling price of the product.'),
  recentSalesData: z.string().describe('A summary of recent sales data for the product, including quantity sold and average discount given.'),
  competitorPrices: z.string().describe('A list of competitor prices for the same product.'),
});
export type PriceAdvisorInput = z.infer<typeof PriceAdvisorInputSchema>;

const PriceAdvisorOutputSchema = z.object({
  suggestedSellPrice: z.number().describe('The suggested optimal selling price for the product.'),
  suggestedDiscountAmount: z.number().describe('The suggested discount amount to offer on the product.'),
  reasoning: z.string().describe('The reasoning behind the suggested selling price and discount amount.'),
});
export type PriceAdvisorOutput = z.infer<typeof PriceAdvisorOutputSchema>;

export async function priceAdvisor(input: PriceAdvisorInput): Promise<PriceAdvisorOutput> {
  return priceAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'priceAdvisorPrompt',
  input: {schema: PriceAdvisorInputSchema},
  output: {schema: PriceAdvisorOutputSchema},
  prompt: `You are an expert pricing advisor for Freesia Finds, a retail store. Analyze the following product information and sales data to suggest an optimal selling price and discount amount to maximize profits and stay competitive. All monetary amounts should be in Tk.

Product Name: {{{productName}}}
Buy Price: {{{buyPrice}}}
Shipping Cost: {{{shippingCost}}}
Current Sell Price: {{{currentSellPrice}}}
Recent Sales Data: {{{recentSalesData}}}
Competitor Prices: {{{competitorPrices}}}

Consider all factors, including cost, sales data, and competitor prices, to provide a well-reasoned suggestion. Provide reasoning behind the suggested selling price and discount amount.

Output should be formatted as JSON.
`,
});

const priceAdvisorFlow = ai.defineFlow(
  {
    name: 'priceAdvisorFlow',
    inputSchema: PriceAdvisorInputSchema,
    outputSchema: PriceAdvisorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
