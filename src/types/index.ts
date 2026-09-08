export type UserRole = 'admin' | 'buyer';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type ScentFamily =
  | 'Woody'
  | 'Floral'
  | 'Oriental'
  | 'Fresh'
  | 'Gourmand'
  | 'Citrus'
  | 'Aromatic'
  | 'Other';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  shipping_state?: string;
  shipping_city?: string;
  shipping_street?: string;
  shipping_landmark?: string;
  shipping_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  scent_family: ScentFamily;
  category?: string;
  volume_ml: number;
  top_notes: string[];
  middle_notes: string[];
  base_notes: string[];
  price: number;
  stock: number;
  description?: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  shipping_address: string;
  phone: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}
