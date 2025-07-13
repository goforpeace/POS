import type { Product, Sale } from './types';

export const mockProducts: Product[] = [
  {
    id: 'prod1',
    image: 'https://placehold.co/400x400.png',
    title: 'Elegant Lace Dress',
    quantity: 10,
    buyPrice: 1500,
    shippingCost: 100,
    sellPrice: 2400,
    status: 'active',
  },
  {
    id: 'prod2',
    image: 'https://placehold.co/400x400.png',
    title: 'Casual Cotton Kurti',
    quantity: 25,
    buyPrice: 800,
    shippingCost: 50,
    sellPrice: 1530,
    status: 'active',
  },
  {
    id: 'prod3',
    image: 'https://placehold.co/400x400.png',
    title: 'Designer Silk Saree',
    quantity: 5,
    buyPrice: 5000,
    shippingCost: 200,
    sellPrice: 9360,
    status: 'active',
  },
    {
    id: 'prod4',
    image: 'https://placehold.co/400x400.png',
    title: 'Hand-woven Scarf',
    quantity: 12,
    buyPrice: 300,
    shippingCost: 50,
    sellPrice: 500,
    status: 'rejected',
  },
];

export const mockSales: Sale[] = [
  {
    id: 'sale1',
    customer: { name: 'Aisha Ahmed', phone: '01700000001', address: '123 Gulshan, Dhaka' },
    product: mockProducts[0],
    quantity: 1,
    discount: 100,
    total: 2300,
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: 'sale2',
    customer: { name: 'Fatima Khan', phone: '01800000002', address: '456 Banani, Dhaka' },
    product: mockProducts[1],
    quantity: 2,
    discount: 0,
    total: 3060,
    date: new Date(new Date().setDate(new Date().getDate() - 3)),
  },
  {
    id: 'sale3',
    customer: { name: 'Jannat Ferdous', phone: '01900000003', address: '789 Dhanmondi, Dhaka' },
    product: mockProducts[2],
    quantity: 1,
    discount: 500,
    total: 8860,
    date: new Date(new Date().setDate(new Date().getDate() - 5)),
  },
];
