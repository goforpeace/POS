
export interface Product {
  id: string;
  image: string;
  title: string;
  shipment: string;
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

export interface Sale {
  id: string;
  customer: Customer;
  product: Product;
  quantity: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  date: Date;
}
