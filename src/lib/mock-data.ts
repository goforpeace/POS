
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
    description: 'A beautiful and elegant lace dress, perfect for formal occasions. Made from high-quality materials for a comfortable fit.'
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
    description: 'A comfortable and stylish cotton kurti for daily wear. Features a unique print and a modern design.'
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
    description: 'An exquisite designer silk saree with intricate patterns. Ideal for weddings and grand celebrations.'
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
    description: 'A soft, hand-woven scarf made from organic wool. Comes in various colors.'
  },
];

export const mockSales: Sale[] = [
  {
    id: 'Inv-12318',
    customer: { name: 'Aisha Ahmed', phone: '01700000001', address: '123 Gulshan, Dhaka' },
    items: [{ product: mockProducts[0], quantity: 1, unitPrice: mockProducts[0].sellPrice, title: mockProducts[0].title }],
    discount: 100,
    deliveryCharge: 60,
    total: 2360,
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: 'Inv-12319',
    customer: { name: 'Fatima Khan', phone: '01800000002', address: '456 Banani, Dhaka' },
    items: [{ product: mockProducts[1], quantity: 2, unitPrice: mockProducts[1].sellPrice, title: mockProducts[1].title }],
    discount: 0,
    deliveryCharge: 0,
    total: 3060,
    date: new Date(new Date().setDate(new Date().getDate() - 3)),
  },
  {
    id: 'Inv-12320',
    customer: { name: 'Jannat Ferdous', phone: '01900000003', address: '789 Dhanmondi, Dhaka' },
    items: [{ product: mockProducts[2], quantity: 1, unitPrice: mockProducts[2].sellPrice, title: mockProducts[2].title }],
    discount: 500,
    deliveryCharge: 120,
    total: 8980,
    date: new Date(new Date().setDate(new Date().getDate() - 5)),
  },
];
