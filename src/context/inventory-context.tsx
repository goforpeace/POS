
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  writeBatch,
  getDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, Sale, SaleItem } from '@/lib/types';
import { mockProducts, mockSales } from '@/lib/mock-data';

type AddSaleData = Omit<Sale, 'id' | 'date'>;

interface InventoryContextType {
  products: Product[];
  sales: Sale[];
  addProduct: (product: Omit<Product, 'id' | 'status'>) => Promise<void>;
  updateProduct: (productId: string, updatedData: Partial<Omit<Product, 'id'>>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addSale: (sale: AddSaleData) => Promise<Sale>;
  deleteSale: (saleId: string) => Promise<void>;
  updateProductStatus: (productId: string, status: 'active' | 'rejected') => Promise<void>;
  getProductById: (productId: string) => Product | undefined;
  getSaleById: (saleId: string) => Sale | undefined;
  loading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const INVOICE_COUNTER_DOC_ID = 'invoice_counter';

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const productsQuery = query(collection(db, 'products'), orderBy('title'));
    const salesQuery = query(collection(db, 'sales'), orderBy('date', 'desc'));

    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate(), // Convert Firestore Timestamp to Date
        } as Sale;
      });
      setSales(salesData);
    }, (error) => {
      console.error("Error fetching sales:", error);
    });

    // Seed initial data if collections are empty
    const seedData = async () => {
      if (products.length === 0 && sales.length === 0) {
        console.log("No data found, seeding initial data...");
        const productPromises = mockProducts.map(p => {
            const { id, ...data } = p; // remove mock id
            return addDoc(collection(db, 'products'), data)
        });
        const salePromises = mockSales.map(s => {
            const { id, ...data } = s; // remove mock id
            return addDoc(collection(db, 'sales'), data)
        });
        await Promise.all([...productPromises, ...salePromises]);
        console.log("Seeding complete.");
      }
    };
    // Note: Simple seeding like this might run multiple times on dev server with hot reload.
    // In a real app, this should be a more robust, one-time script.
    // seedData();

    return () => {
      unsubscribeProducts();
      unsubscribeSales();
    };
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'status'>) => {
    const newProduct = { ...productData, status: 'active' as 'active' | 'rejected' };
    await addDoc(collection(db, 'products'), newProduct);
  };

  const updateProduct = async (productId: string, updatedData: Partial<Omit<Product, 'id'>>) => {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, updatedData);
  };

  const deleteProduct = async (productId: string) => {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
  };

  const addSale = async (saleData: AddSaleData): Promise<Sale> => {
    const counterRef = doc(db, 'counters', INVOICE_COUNTER_DOC_ID);

    try {
        const newInvoiceNumber = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            if (!counterDoc.exists()) {
                transaction.set(counterRef, { current: 12321 }); // Initial value
                return 12321;
            }
            const newCount = counterDoc.data().current + 1;
            transaction.update(counterRef, { current: newCount });
            return newCount;
        });

        const newSale = {
          ...saleData,
          id: `Inv-${newInvoiceNumber}`,
          date: new Date(),
        };

        // Use a batch write to add sale and update product quantities atomically
        const batch = writeBatch(db);

        const saleRef = doc(collection(db, 'sales'));
        batch.set(saleRef, {
            ...saleData,
            date: newSale.date, // Use server timestamp for consistency
        });

        newSale.items.forEach(item => {
          const productRef = doc(db, 'products', item.product.id);
          batch.update(productRef, {
            quantity: item.product.quantity - item.quantity,
          });
        });

        await batch.commit();

        // The onSnapshot listener will update the local state, so we just return the new sale object
        // We'll give it the ID from the locally created reference.
        return { ...newSale, id: saleRef.id };

    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
    }
  };

  const deleteSale = async (saleId: string) => {
    const saleRef = doc(db, 'sales', saleId);
    const saleDoc = await getDoc(saleRef);
    if (!saleDoc.exists()) return;

    const saleToDelete = saleDoc.data() as Omit<Sale, 'id' | 'date'> & { date: any };
    
    const batch = writeBatch(db);
    batch.delete(saleRef); // Delete the sale record

    // Add product quantity back to stock for each item
    if (saleToDelete.items && Array.isArray(saleToDelete.items)) {
      saleToDelete.items.forEach(item => {
        const productRef = doc(db, 'products', item.product.id);
        const product = products.find(p => p.id === item.product.id);
        if (product) {
          batch.update(productRef, {
            quantity: product.quantity + item.quantity,
          });
        }
      });
    }
    
    await batch.commit();
  };


  const updateProductStatus = async (productId: string, status: 'active' | 'rejected') => {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, { status });
  };
  
  const getProductById = (productId: string) => {
      return products.find(p => p.id === productId);
  }

  const getSaleById = (saleId: string) => {
      const sale = sales.find(s => s.id === saleId);
      if(!sale) return undefined;
      // Ensure product data within sale items is up-to-date
      const items = sale.items.map(item => ({
        ...item,
        product: getProductById(item.product.id) || item.product
      }));
      return { ...sale, items };
  }


  return (
    <InventoryContext.Provider value={{ products, sales, addProduct, updateProduct, deleteProduct, addSale, deleteSale, updateProductStatus, getProductById, getSaleById, loading }}>
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

export type { Product, Sale, SaleItem };
