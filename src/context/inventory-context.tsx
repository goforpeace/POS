"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale } from '@/lib/types';
import { mockProducts, mockSales } from '@/lib/mock-data';

interface InventoryContextType {
  products: Product[];
  sales: Sale[];
  addProduct: (product: Omit<Product, 'id' | 'status'>) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Sale;
  updateProductStatus: (productId: string, status: 'active' | 'rejected') => void;
  getProductById: (productId: string) => Product | undefined;
  getSaleById: (saleId: string) => Sale | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('products');
      const storedSales = localStorage.getItem('sales');

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
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
        setProducts(mockProducts);
        setSales(mockSales);
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
    }
  }, [sales, isLoaded]);

  const addProduct = (productData: Omit<Product, 'id' | 'status'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod${Date.now()}`,
      status: 'active',
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'date'>): Sale => {
    const newSale: Sale = {
      ...saleData,
      id: `sale${Date.now()}`,
      date: new Date(),
    };
    
    setSales(prev => [newSale, ...prev]);

    setProducts(prev => prev.map(p => 
        p.id === newSale.product.id 
        ? {...p, quantity: p.quantity - newSale.quantity}
        : p
    ));
    return newSale;
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
    <InventoryContext.Provider value={{ products, sales, addProduct, addSale, updateProductStatus, getProductById, getSaleById }}>
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
