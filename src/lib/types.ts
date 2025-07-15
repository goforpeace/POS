
export interface Product {
  id: string;
  image: string;
  title: string;
  quantity: number;
  buyPrice: number;
  shippingCost: number;
  sellPrice: number;
  status: 'active' | 'rejected';
  description?: string;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
}

export interface SaleItem {
    product: Product;
    quantity: number;
    unitPrice: number;
    title: string; // Allow for custom titles on invoice
}

export interface Sale {
  id: string;
  customer: Customer;
  items: SaleItem[];
  discount: number;
  deliveryCharge: number;
  total: number;
  date: Date;
}
