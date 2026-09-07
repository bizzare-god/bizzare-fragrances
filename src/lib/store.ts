'use client';

import { useCallback, useEffect, useState } from 'react';
import { Order, OrderStatus, Product, Profile, UserRole } from '@/types';

const USER_CACHE_KEY = 'bf_cached_user_v2';
const PRODUCTS_CACHE_KEY = 'bf_cached_products_v3';
const ORDERS_CACHE_KEY = 'bf_cached_orders_v2';

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'The request could not be completed.');
  return body as T;
}

export function useStore() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Synchronous cache hydration on client mount
  useEffect(() => {
    try {
      let hasCachedContent = false;
      const cachedUser = localStorage.getItem(USER_CACHE_KEY);
      if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        if (parsedUser && parsedUser.id) {
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
          hasCachedContent = true;
        }
      }
      const cachedProducts = localStorage.getItem(PRODUCTS_CACHE_KEY);
      if (cachedProducts) {
        const parsedProducts = JSON.parse(cachedProducts);
        if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
          setProducts(parsedProducts);
          hasCachedContent = true;
        }
      }
      const cachedOrders = localStorage.getItem(ORDERS_CACHE_KEY);
      if (cachedOrders) {
        const parsedOrders = JSON.parse(cachedOrders);
        if (Array.isArray(parsedOrders)) {
          setOrders(parsedOrders);
        }
      }
      if (hasCachedContent) {
        setIsLoading(false);
      }
    } catch (e) {
      console.warn('Failed to load local store cache:', e);
    }
  }, []);

  // Parallel Stale-While-Revalidate Refresh
  const refreshStore = useCallback(async () => {
    setDataError(null);
    try {
      const [sessionResult, productResult] = await Promise.all([
        requestJson<{ user: Profile | null }>('/api/auth/me').catch(() => ({ user: null })),
        requestJson<{ products: Product[] }>('/api/products').catch((error) => {
          setDataError(error instanceof Error ? error.message : 'Unable to load the boutique collection.');
          return null;
        }),
      ]);

      const user = sessionResult?.user;
      if (productResult && Array.isArray(productResult.products)) {
        setProducts(productResult.products);
        try {
          localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(productResult.products));
        } catch {}
      }

      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        try {
          localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
        } catch {}

        const orderResult = await requestJson<{ orders: Order[] }>('/api/orders').catch((error) => {
          setDataError(error instanceof Error ? error.message : 'Unable to load orders.');
          return { orders: [] };
        });
        setOrders(orderResult.orders || []);
        try {
          localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(orderResult.orders || []));
        } catch {}
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setOrders([]);
        setProfiles([]);
        try {
          localStorage.removeItem(USER_CACHE_KEY);
          localStorage.removeItem(ORDERS_CACHE_KEY);
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStore();
  }, [refreshStore]);

  // Dedicated On-Demand Admin Data Fetcher
  const fetchAdminData = useCallback(async () => {
    try {
      const usersResult = await requestJson<{ users: Profile[] }>('/api/admin/users').catch(() => null);
      if (usersResult?.users) setProfiles(usersResult.users);
    } catch (e) {
      console.error('Failed to load admin dashboard data:', e);
    }
  }, []);

  const authenticate = useCallback(async (profile: Profile) => {
    setCurrentUser(profile);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(profile));
    } catch {}
    void refreshStore();
  }, [refreshStore]);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setOrders([]);
    setProfiles([]);
    try {
      localStorage.removeItem(USER_CACHE_KEY);
      localStorage.removeItem(ORDERS_CACHE_KEY);
    } catch {}
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    await requestJson('/api/products', { method: 'POST', body: JSON.stringify(product) });
    await refreshStore();
  }, [refreshStore]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    await requestJson(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    await refreshStore();
  }, [refreshStore]);

  const deleteProduct = useCallback(async (id: string) => {
    await requestJson(`/api/products/${id}`, { method: 'DELETE' });
    await refreshStore();
  }, [refreshStore]);

  const placeOrder = useCallback(async (orderData: { items: { product: Product; quantity: number }[]; shipping_address: string; phone: string; notes?: string }) => {
    const result = await requestJson<{
      order: Order;
      payment?: {
        status: string;
        reference?: string;
        authorization_url?: string;
        access_code?: string;
      };
    }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: orderData.items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
        shipping_address: orderData.shipping_address,
        phone: orderData.phone,
        notes: orderData.notes,
      }),
    });
    await refreshStore();
    return result;
  }, [refreshStore]);

  const initializePayment = useCallback(async (orderId: string) => {
    const result = await requestJson<{
      success: boolean;
      authorization_url: string;
      access_code: string;
      reference: string;
    }>('/api/payments/paystack/initialize', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
    return result;
  }, []);

  const verifyPayment = useCallback(async (reference: string) => {
    const result = await requestJson<{
      success: boolean;
      message: string;
      order: Order;
    }>('/api/payments/paystack/verify', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
    await refreshStore();
    return result.order;
  }, [refreshStore]);

  const cancelOrder = useCallback(async (orderId: string) => {
    const result = await requestJson<{
      success: boolean;
      order: Order;
    }>(`/api/orders/${orderId}/cancel`, {
      method: 'PATCH',
    });
    await refreshStore();
    return result.order;
  }, [refreshStore]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    await requestJson(`/api/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await refreshStore();
  }, [refreshStore]);

  const updateProfileRole = useCallback(async (userId: string, role: UserRole) => {
    await requestJson('/api/admin/users', { method: 'PATCH', body: JSON.stringify({ userId, role }) });
    await Promise.all([refreshStore(), fetchAdminData()]);
  }, [refreshStore, fetchAdminData]);

  return {
    currentUser,
    setCurrentUser,
    profiles,
    products,
    orders,
    isAuthenticated,
    isLoading,
    dataError,
    refreshStore,
    fetchAdminData,
    authenticate,
    signOut,
    updateProfileRole,
    addProduct,
    updateProduct,
    deleteProduct,
    placeOrder,
    initializePayment,
    verifyPayment,
    cancelOrder,
    updateOrderStatus,
  };
}
