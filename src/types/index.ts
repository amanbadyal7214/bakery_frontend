export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  // optional fields that may come from backend
  rating?: number;
  flavor?: string[];
  ingredients?: string[];
  tasteDescription?: string;
}

export interface Order {
  id: string;
  customerId: number;
  customerName: string;
  items: string;
  total: number;
  status: 'Delivered' | 'Processing' | 'Pending' | 'Cancelled';
  date: string;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  loyaltyPoints: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  itemsCount: number;
  status: 'Active' | 'Inactive';
}

export interface Payment {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  method: string;
  status: 'Completed' | 'Pending' | 'Refunded';
  date: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  address: string;
  driverName: string;
  status: 'Delivered' | 'Out for Delivery' | 'Pending';
  time: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  avatar?: string;
}
