
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, Sale } from '@/lib/types';
import { mockProducts, mockSales } from '@/lib/mock-data';

interface InventoryContextType {
  products: Product[];
  sales: Sale[];
  addProduct: (product: Omit<Product, 'id' | 'status'>) => void;
  deleteProduct: (productId: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Sale;
  deleteSale: (saleId: string) => void;
  updateProductStatus: (productId: string, status: 'active' | 'rejected') => void;
  getProductById: (productId: string) => Product | undefined;
  getSaleById: (saleId: string) => Sale | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const INVOICE_COUNTER_KEY = 'invoiceCounter';
const INITIAL_INVOICE_NUMBER = 12320;

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [invoiceCounter, setInvoiceCounter] = useState<number>(INITIAL_INVOICE_NUMBER);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('products');
      const storedSales = localStorage.getItem('sales');
      const storedInvoiceCounter = localStorage.getItem(INVOICE_COUNTER_KEY);

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(mockProducts);
      }
      
      if (storedSales) {
        setSales(JSON.parse(storedSales).map((s: any) => ({...s, date: new Date(s.date)})));
      } else {
        setSales(mockSales);
      }

      if (storedInvoiceCounter) {
        const counter = parseInt(storedInvoiceCounter, 10);
        if (!isNaN(counter)) {
          setInvoiceCounter(counter);
        } else {
          setInvoiceCounter(INITIAL_INVOICE_NUMBER);
        }
      } else {
        // If no counter, determine from existing sales or start fresh
        const maxId = mockSales.reduce((max, sale) => {
            if (sale.id.startsWith('Inv-')) {
                const num = parseInt(sale.id.split('-')[1], 10);
                return num > max ? num : max;
            }
            return max;
        }, 0);
        setInvoiceCounter(maxId > 0 ? maxId + 1 : INITIAL_INVOICE_NUMBER);
      }

    } catch (error) {
        console.error("Failed to parse from localStorage", error);
        setProducts(mockProducts);
        setSales(mockSales);
        setInvoiceCounter(INITIAL_INVOICE_NUMBER);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
        localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products, isLoaded]);
  
  useEffect(() => {
    if (isLoaded) {
        localStorage.setItem('sales', JSON.stringify(sales));
        localStorage.setItem(INVOICE_COUNTER_KEY, invoiceCounter.toString());
    }
  }, [sales, invoiceCounter, isLoaded]);

  const addProduct = (productData: Omit<Product, 'id' | 'status'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      status: 'active',
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'date'>): Sale => {
    const nextCounter = invoiceCounter + 1;
    const newSale: Sale = {
      ...saleData,
      id: `Inv-${nextCounter}`,
      date: new Date(),
    };
    
    setSales(prev => [newSale, ...prev]);
    setInvoiceCounter(nextCounter);

    setProducts(prev => prev.map(p => 
        p.id === newSale.product.id 
        ? {...p, quantity: p.quantity - newSale.quantity}
        : p
    ));
    return newSale;
  };

  const deleteSale = (saleId: string) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;

    // Add product quantity back to stock
    setProducts(prev => prev.map(p =>
      p.id === saleToDelete.product.id
        ? { ...p, quantity: p.quantity + saleToDelete.quantity }
        : p
    ));

    // Remove sale from sales list
    setSales(prev => prev.filter(s => s.id !== saleId));
  };


  const updateProductStatus = (productId: string, status: 'active' | 'rejected') => {
    setProducts(prev => prev.map(p => 
        p.id === productId ? {...p, status} : p
    ));
  };
  
  const getProductById = (productId: string) => {
      return products.find(p => p.id === productId);
  }

  const getSaleById = (saleId: string) => {
      return sales.find(s => s.id === saleId);
  }


  return (
    <InventoryContext.Provider value={{ products, sales, addProduct, deleteProduct, addSale, deleteSale, updateProductStatus, getProductById, getSaleById }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

// Also exporting types to be used in components
export type { Product, Sale };

    