import { Order, Product } from '@/types';

type ProductRecord = {
  id: string;
  name: string;
  brand: string;
  description?: string | null;
  scentFamily: string;
  volumeMl: number;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  price: { toString(): string } | number;
  stock: number;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: { name: string } | null;
};

export function productDto(product: ProductRecord): Product {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    description: product.description || undefined,
    scent_family: product.scentFamily as Product['scent_family'],
    category: product.category?.name,
    volume_ml: product.volumeMl,
    top_notes: product.topNotes,
    middle_notes: product.middleNotes,
    base_notes: product.baseNotes,
    price: Number(product.price),
    stock: product.stock,
    image_url: product.images[0] || '',
    is_active: product.isActive,
    created_at: product.createdAt.toISOString(),
    updated_at: product.updatedAt.toISOString(),
  };
}

type OrderRecord = {
  id: string;
  buyerId: string;
  totalAmount: { toString(): string } | number;
  paymentStatus: string;
  paymentReference?: string | null;
  paystackReference?: string | null;
  paidAt?: Date | null;
  status: string;
  shippingAddress: string;
  phone: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  buyer?: { name: string };
  items?: Array<{
    id: string;
    productId: string;
    quantity: number;
    priceAtPurchase: { toString(): string } | number;
    product: { name: string; images: string[]; volumeMl: number };
  }>;
};

export function orderDto(order: OrderRecord): Order {
  const totalAmountNum = Number(order.totalAmount);

  return {
    id: order.id,
    customer_id: order.buyerId,
    customer_name: order.buyer?.name,
    status: order.status.toLowerCase() as Order['status'],
    payment_status: order.paymentStatus.toLowerCase() as Order['payment_status'],
    total_amount: totalAmountNum,
    shipping_address: order.shippingAddress,
    phone: order.phone,
    notes: order.notes || undefined,
    created_at: order.createdAt.toISOString(),
    updated_at: order.updatedAt.toISOString(),
    items: order.items?.map((item) => ({
      id: item.id,
      order_id: order.id,
      product_id: item.productId,
      product_name: `${item.product.name} (${item.product.volumeMl}ml)`,
      product_image: item.product.images[0],
      quantity: item.quantity,
      unit_price: Number(item.priceAtPurchase),
      total_price: Number(item.priceAtPurchase) * item.quantity,
    })),
  };
}
