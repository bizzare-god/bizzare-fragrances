'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Order, OrderStatus, Product, Profile, ScentFamily, UserRole } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Sparkles,
  Users,
  DollarSign,
  Package,
  Search,
  Truck,
  TrendingUp,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  Check,
  Filter,
  EyeOff,
  Loader2,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';

interface AdminDashboardViewProps {
  profiles: Profile[];
  products: Product[];
  orders: Order[];
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const scentFamilies: (ScentFamily | 'ALL')[] = [
  'ALL',
  'Woody',
  'Floral',
  'Oriental',
  'Fresh',
  'Gourmand',
  'Citrus',
  'Aromatic',
  'Other',
];

export function AdminDashboardView({
  profiles,
  products,
  orders,
  onUpdateRole,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState('orders');

  // Filter States
  const [userSearch, setUserSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productFamilyFilter, setProductFamilyFilter] = useState<ScentFamily | 'ALL'>('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // Add Product Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('Bizzare Fragrance');
  const [formScentFamily, setFormScentFamily] = useState<ScentFamily>('Woody');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('15');
  const [formVolume, setFormVolume] = useState('100');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Image upload state
  const [formImageUploading, setFormImageUploading] = useState(false);
  const [formImageError, setFormImageError] = useState('');

  // Bulk catalog selection
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Admin catalog source: ALL fragrances (active + hidden), unlike the storefront's public list
  const [catalog, setCatalog] = useState<Product[]>(products);

  const reloadCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/products?all=true', { cache: 'no-store' });
      const data = (await res.json().catch(() => null)) as { products?: Product[] } | null;
      if (!res.ok) throw new Error('Unable to load the catalog.');
      const nextProducts = data?.products as Product[] | undefined;
      if (nextProducts && Array.isArray(nextProducts)) {
        setCatalog(nextProducts);
        setSelectedProductIds((prev) => prev.filter((id) => nextProducts.some((p) => p.id === id)));
      }
    } catch (err) {
      console.error('Failed to reload the boutique catalog:', err);
    }
  }, []);

  useEffect(() => {
    void reloadCatalog();
  }, [reloadCatalog]);

  // Metrics
  const totalRevenue = useMemo(
    () => orders.filter((o) => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_amount, 0),
    [orders]
  );
  const lowStockProducts = useMemo(() => catalog.filter((p) => p.stock < 5), [catalog]);
  const pendingFulfillmentCount = useMemo(
    () => orders.filter((o) => o.status === 'processing' || o.status === 'pending').length,
    [orders]
  );
  const completedOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'delivered').length,
    [orders]
  );

  // Filtered Lists
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const q = userSearch.toLowerCase();
      return p.full_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.phone && p.phone.includes(q));
    });
  }, [profiles, userSearch]);

  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      const q = productSearch.toLowerCase();
      const matchesQuery = product.name.toLowerCase().includes(q) || product.brand.toLowerCase().includes(q);
      const matchesFamily = productFamilyFilter === 'ALL' || product.scent_family === productFamilyFilter;
      const matchesLowStock = !showLowStockOnly || product.stock < 5;
      return matchesQuery && matchesFamily && matchesLowStock;
    });
  }, [catalog, productSearch, productFamilyFilter, showLowStockOnly]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (orderStatusFilter === 'ALL') return true;
      return order.status === orderStatusFilter;
    });
  }, [orders, orderStatusFilter]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice || !formStock) return;
    setIsSubmitting(true);
    try {
      await onAddProduct({
        name: formName.trim(),
        brand: formBrand.trim() || 'Bizzare Fragrance',
        scent_family: formScentFamily,
        price: parseFloat(formPrice),
        stock: parseInt(formStock, 10),
        volume_ml: parseInt(formVolume, 10) || 100,
        image_url: formImage.trim(),
        description: formDescription.trim(),
        top_notes: formNotes ? formNotes.split(',').map((s) => s.trim()).filter(Boolean) : [],
        middle_notes: [],
        base_notes: [],
        is_active: true,
      });
      await reloadCatalog();
      setShowAddModal(false);
      setFormName('');
      setFormPrice('');
      setFormStock('15');
      setFormDescription('');
      setFormNotes('');
      setFormImage('');
      setFormImageError('');
    } catch (err) {
      console.error('Failed to create fragrance:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormImageError('');
    setFormImageUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Image upload failed. Please try again.');
      setFormImage(data.url);
    } catch (err) {
      setFormImageError(err instanceof Error ? err.message : 'Unable to upload image.');
    } finally {
      setFormImageUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleUpdateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      await onUpdateProduct(id, updates);
      await reloadCatalog();
    },
    [onUpdateProduct, reloadCatalog]
  );

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredProducts.map((p) => p.id);
    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedProductIds.includes(id));
    setSelectedProductIds(allSelected ? [] : visibleIds);
  };

  const bulkSetActive = async (active: boolean) => {
    if (selectedProductIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(selectedProductIds.map((id) => onUpdateProduct(id, { is_active: active })));
      await reloadCatalog();
      setSelectedProductIds([]);
    } catch (err) {
      console.error('Bulk catalog update failed:', err);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    const confirmed = window.confirm(
      `Permanently delete ${selectedProductIds.length} fragrance${selectedProductIds.length > 1 ? 's' : ''}? This cannot be undone.`
    );
    if (!confirmed) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(selectedProductIds.map((id) => onDeleteProduct(id)));
      await reloadCatalog();
      setSelectedProductIds([]);
    } catch (err) {
      console.error('Bulk catalog delete failed:', err);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const deleteProduct = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Permanently delete "${name}"? This cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await onDeleteProduct(id);
      await reloadCatalog();
    } catch (err) {
      console.error('Failed to delete fragrance:', err);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="emerald">DELIVERED</Badge>;
      case 'shipped':
        return <Badge variant="secondary">SHIPPED</Badge>;
      case 'processing':
        return <Badge variant="amber">PROCESSING</Badge>;
      case 'cancelled':
        return <Badge variant="red">CANCELLED</Badge>;
      default:
        return <Badge variant="default">PENDING</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-20 text-brown-deep">
      {/* LUXURY EXECUTIVE BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-brown-dark/60 bg-gradient-to-r from-black via-brown-espresso to-brown-deep p-6 text-white shadow-2xl sm:p-8">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-brown-warm/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brown-warm/40 bg-brown/30 text-brown-warm shadow-inner">
              <Sparkles className="h-7 w-7 text-brown-warm" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl font-bold tracking-wide text-white sm:text-3xl">
                  BIZZARE FRAGRANCES STUDIO
                </h1>
                <span className="rounded-md border border-brown-warm/30 bg-brown-warm/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-brown-warm">
                  (by Bizzare)
                </span>
              </div>
              <p className="mt-1 text-xs text-cream-muted sm:text-sm">
                Direct-to-consumer boutique control: manage exclusive fragrance creations, track client orders, and fulfill shipments.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-mono text-cream-muted/70">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  Boutique Active & Synced
                </span>
                <span>•</span>
                <span>Sole Merchant: Bizzare</span>
                <span>•</span>
                <span>Direct 100% Boutique Revenue</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brown-warm px-5 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-lg transition-all hover:bg-cream-light hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Fragrance</span>
          </button>
        </div>
      </div>

      {/* BOUTIQUE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-cream-border bg-white p-5 shadow-card-soft transition-all hover:border-emerald-500/40 hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Total Boutique Revenue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-serif text-2xl font-bold text-emerald-700">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="mt-1 text-[11px] text-emerald-800/70">100% direct client revenue</p>
        </div>

        {/* Fulfillment Queue */}
        <div className="relative overflow-hidden rounded-2xl border border-cream-border bg-white p-5 shadow-card-soft transition-all hover:border-amber-500/40 hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Fulfillment Queue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-serif text-2xl font-bold text-amber-900">
            {pendingFulfillmentCount}{' '}
            <span className="text-sm font-normal text-amber-700">
              {pendingFulfillmentCount === 1 ? 'order' : 'orders'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-800/70">Awaiting shipment / prep</p>
        </div>

        {/* Fragrance Catalog */}
        <div className="relative overflow-hidden rounded-2xl border border-cream-border bg-white p-5 shadow-card-soft transition-all hover:border-brown-warm/40 hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brown-deep/60">
              Fragrance Collection
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brown/10 text-brown">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-serif text-2xl font-bold text-brown-deep">
            {catalog.length}{' '}
            <span className="text-sm font-normal text-brown-deep/60">scents</span>
          </div>
          <p className="mt-1 text-[11px] text-brown-deep/60">
            {lowStockProducts.length > 0 ? `${lowStockProducts.length} low in stock` : 'All scents in stock'}
          </p>
        </div>

        {/* Completed Shipments */}
        <div className="relative overflow-hidden rounded-2xl border border-cream-border bg-white p-5 shadow-card-soft transition-all hover:border-blue-500/40 hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-blue-900">
              Completed Orders
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-serif text-2xl font-bold text-blue-900">
            {completedOrdersCount}{' '}
            <span className="text-sm font-normal text-blue-700">/ {orders.length} total</span>
          </div>
          <p className="mt-1 text-[11px] text-blue-800/70">Delivered safely to clients</p>
        </div>
      </div>

      {/* STUDIO NAVIGATION TABS */}
      <Tabs
        tabs={[
          { id: 'orders', label: 'Customer Orders', icon: <DollarSign className="h-4 w-4" />, count: orders.length },
          { id: 'products', label: 'Fragrance Collection', icon: <Package className="h-4 w-4" />, count: catalog.length },
          { id: 'users', label: 'Client Directory', icon: <Users className="h-4 w-4" />, count: profiles.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: CUSTOMER ORDERS & FULFILLMENT */}
      {activeTab === 'orders' && (
        <Card>
          <CardHeader className="flex flex-col gap-4 border-b border-cream-border pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Customer Orders & Fulfillment</CardTitle>
              <CardDescription>
                Directly manage and update customer order dispatch status from preparation to delivery.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(['ALL', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setOrderStatusFilter(status)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                    orderStatusFilter === status
                      ? 'bg-brown text-white shadow-sm'
                      : 'border border-cream-border bg-white text-brown-deep/65 hover:border-brown hover:text-brown-deep'
                  }`}
                >
                  {status === 'ALL' ? `All (${orders.length})` : status}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center">
                <Truck className="mx-auto h-8 w-8 text-brown-deep/30" />
                <h3 className="mt-3 font-serif text-lg font-bold text-brown-deep">No orders in this category</h3>
                <p className="mt-1 text-xs text-brown-deep/60">New client orders will appear here as soon as they are placed.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Client & Contact</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Fulfillment Status</TableHead>
                    <TableHead className="text-right">Fulfillment Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs font-bold text-brown-deep">
                        <div>
                          <span>#{order.id.slice(-6).toUpperCase()}</span>
                          <span className="block text-[10px] font-normal text-brown-deep/60">
                            {formatDate(order.created_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <span className="font-bold text-brown-deep">{order.customer_name || 'Valued Client'}</span>
                          <span className="block font-mono text-brown-deep/70">{order.phone}</span>
                          <span className="block max-w-[200px] truncate text-[11px] text-brown-deep/60" title={order.shipping_address}>
                            {order.shipping_address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-1.5 text-xs text-brown-deep">
                              <span className="font-bold text-brown">{item.quantity}x</span>
                              <span className="max-w-[160px] truncate">{item.product_name}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-serif text-sm font-bold text-brown">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.payment_status === 'paid' ? 'emerald' : 'amber'}>
                          {order.payment_status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="h-8 rounded-lg border border-cream-border bg-white px-2 font-mono text-xs font-bold text-brown-deep focus:border-brown focus:outline-none"
                            aria-label={`Update status for order ${order.id}`}
                          >
                            <option value="pending">PENDING</option>
                            <option value="processing">PROCESSING</option>
                            <option value="shipped">SHIPPED</option>
                            <option value="delivered">DELIVERED</option>
                            <option value="cancelled">CANCELLED</option>
                          </select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: FRAGRANCE CATALOG MANAGEMENT */}
      {activeTab === 'products' && (
        <Card>
          <CardHeader className="flex flex-col gap-4 border-b border-cream-border pb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Fragrance Collection & Stock Management</CardTitle>
                <CardDescription>
                  Manage the official Bizzare Fragrances boutique catalog, update stock counts, or add new bespoke scents.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-60">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brown-deep/40" />
                  <Input
                    placeholder="Search fragrance name or notes..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="h-9 pl-9 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold uppercase tracking-wider transition-all ${
                    showLowStockOnly
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : 'border-cream-border bg-white text-brown-deep/70 hover:border-brown hover:text-brown-deep'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                  <span>Low Stock ({lowStockProducts.length})</span>
                </button>
                <Button
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                  className="gap-1.5 text-xs font-bold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Perfume</span>
                </Button>
              </div>
            </div>

            {/* Scent Family Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {scentFamilies.map((family) => (
                <button
                  key={family}
                  type="button"
                  onClick={() => setProductFamilyFilter(family)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                    productFamilyFilter === family
                      ? 'bg-brown text-white shadow-sm'
                      : 'border border-cream-border bg-white text-brown-deep/65 hover:border-brown hover:text-brown-deep'
                  }`}
                >
                  {family}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center">
                <Package className="mx-auto h-8 w-8 text-brown-deep/30" />
                <h3 className="mt-3 font-serif text-lg font-bold text-brown-deep">No fragrances match this filter</h3>
                <p className="mt-1 text-xs text-brown-deep/60">Try clearing filters or adding a new fragrance creation.</p>
              </div>
            ) : (
              <>
                {selectedProductIds.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brown/20 bg-brown/5 px-4 py-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-brown">
                      {selectedProductIds.length} fragrance{selectedProductIds.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => bulkSetActive(true)}
                        disabled={isBulkUpdating}
                        className="gap-1.5 text-xs font-bold"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Activate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => bulkSetActive(false)}
                        disabled={isBulkUpdating}
                        className="gap-1.5 text-xs font-bold"
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                        Hide
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => void bulkDelete()}
                        disabled={isBulkUpdating}
                        className="gap-1.5 text-xs font-bold"
                      >
                        {isBulkUpdating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <input
                          type="checkbox"
                          checked={
                            filteredProducts.length > 0 &&
                            filteredProducts.every((p) => selectedProductIds.includes(p.id))
                          }
                          onChange={toggleSelectAllVisible}
                          className="h-4 w-4 cursor-pointer accent-brown"
                          aria-label="Select all fragrances"
                        />
                      </TableHead>
                      <TableHead>Fragrance</TableHead>
                      <TableHead>Olfactory Family</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Live Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="h-4 w-4 cursor-pointer accent-brown"
                            aria-label={`Select ${product.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-semibold text-brown-deep">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-12 w-12 shrink-0 rounded-lg border border-cream-border object-cover"
                          />
                          <div>
                            <span className="font-serif text-sm font-bold text-brown-deep">{product.name}</span>
                            <span className="block font-mono text-[10px] text-brown-warm">
                              {product.volume_ml}ml • {product.brand}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-block rounded-md bg-brown/10 px-2.5 py-1 font-mono text-xs font-bold text-brown">
                          {product.scent_family}
                        </span>
                      </TableCell>
                      <TableCell className="font-serif font-bold text-brown">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              void handleUpdateProduct(product.id, {
                                stock: Math.max(product.stock - 1, 0),
                                is_active: product.stock - 1 > 0,
                              })
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-cream-border bg-white font-bold text-brown-deep hover:border-brown hover:bg-cream-soft"
                            aria-label={`Decrease stock for ${product.name}`}
                          >
                            -
                          </button>
                          <span
                            className={`min-w-10 text-center font-mono text-xs font-bold ${
                              product.stock >= 5 ? 'text-emerald-700' : 'text-red-700'
                            }`}
                          >
                            {product.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              void handleUpdateProduct(product.id, {
                                stock: product.stock + 1,
                                is_active: true,
                              })
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-cream-border bg-white font-bold text-brown-deep hover:border-brown hover:bg-cream-soft"
                            aria-label={`Increase stock for ${product.name}`}
                          >
                            +
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.is_active && product.stock > 0
                              ? 'emerald'
                              : product.is_active
                                ? 'amber'
                                : 'red'
                          }
                        >
                          {product.is_active && product.stock > 0
                            ? 'AVAILABLE'
                            : product.is_active
                              ? 'OUT OF STOCK'
                              : 'HIDDEN'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant={product.is_active ? 'danger' : 'default'}
                            onClick={() => void handleUpdateProduct(product.id, { is_active: !product.is_active })}
                            className="text-xs font-bold"
                          >
                            {product.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void deleteProduct(product.id, product.name)}
                            className="text-xs font-bold text-red-700 hover:bg-red-50 hover:text-red-800"
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: CLIENT DIRECTORY */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader className="flex flex-col gap-4 border-b border-cream-border pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Client Directory</CardTitle>
              <CardDescription>
                Registered boutique clients and authorized boutique managers.
              </CardDescription>
            </div>
            <div className="relative min-w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brown-deep/40" />
              <Input
                placeholder="Search clients by name, email, or phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="h-9 pl-9 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredProfiles.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="mx-auto h-8 w-8 text-brown-deep/30" />
                <h3 className="mt-3 font-serif text-lg font-bold text-brown-deep">No clients match your search</h3>
                <p className="mt-1 text-xs text-brown-deep/60">Try searching with a different name or email.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Account Role</TableHead>
                    <TableHead>Member Since</TableHead>
                    <TableHead className="text-right">Privilege</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((user) => {
                    const initials = user.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-semibold text-brown-deep">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cream-border bg-cream-soft font-mono text-xs font-bold text-brown">
                              {initials}
                            </div>
                            <span className="font-medium text-brown-deep">{user.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-brown-deep/80">{user.email}</TableCell>
                        <TableCell className="font-mono text-xs text-brown-deep/60">{user.phone || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'secondary' : 'default'}>
                            {user.role === 'admin' ? 'BOUTIQUE OWNER' : 'CLIENT'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-brown-deep/60">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <select
                            value={user.role}
                            onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
                            className="h-8 rounded-lg border border-cream-border bg-white px-2 font-mono text-xs font-bold text-brown-deep focus:border-brown focus:outline-none"
                            aria-label={`Change role for ${user.full_name}`}
                          >
                            <option value="buyer">CLIENT (BUYER)</option>
                            <option value="admin">BOUTIQUE ADMIN</option>
                          </select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ADD FRAGRANCE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-cream-border bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-cream-border pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-brown-deep">Add New Fragrance</h3>
                <p className="text-xs text-brown-deep/60">Introduce a new bespoke creation to the Bizzare collection.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-brown-deep/60 hover:bg-cream-soft hover:text-brown-deep"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brown-deep">Fragrance Name *</label>
                  <Input
                    required
                    placeholder="e.g. Noir Santal Extrait"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brown-deep">Brand</label>
                  <Input
                    placeholder="Bizzare Fragrance"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brown-deep">Olfactory Family</label>
                  <select
                    value={formScentFamily}
                    onChange={(e) => setFormScentFamily(e.target.value as ScentFamily)}
                    className="mt-1 h-10 w-full rounded-lg border border-cream-border bg-white px-3 text-sm text-brown-deep focus:border-brown focus:outline-none"
                  >
                    {scentFamilies.filter((f) => f !== 'ALL').map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brown-deep">Price (₦) *</label>
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="e.g. 85000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brown-deep">Initial Stock *</label>
                  <Input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 15"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brown-deep">Volume (ml)</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formVolume}
                    onChange={(e) => setFormVolume(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brown-deep">
                    Fragrance Image
                  </label>
                  <div className="mt-1.5 space-y-2">
                    {formImage ? (
                      <div className="relative overflow-hidden rounded-lg border border-cream-border">
                        <img
                          src={formImage}
                          alt="Fragrance preview"
                          className="h-36 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormImage('')}
                          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                          aria-label="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : formImageUploading ? (
                      <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-cream-border bg-cream-soft">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brown">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading to storage...
                        </div>
                      </div>
                    ) : (
                      <label className="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-cream-border bg-cream-soft text-center text-brown-deep/60 transition-colors hover:border-brown hover:text-brown">
                        <UploadCloud className="h-6 w-6 text-brown" />
                        <span className="px-4 text-xs font-bold uppercase tracking-wider">
                          Click to upload image
                        </span>
                        <span className="px-4 text-[10px] text-brown-deep/50">
                          JPG, PNG, or WebP up to 10 MB — stored in boutique cloud storage
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => void handleImageUpload(e)}
                        />
                      </label>
                    )}
                    {formImageError && (
                      <p className="text-xs font-bold text-red-700">{formImageError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brown-deep">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the mood, fragrance journey, and sensory inspiration..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-cream-border p-3 text-sm text-brown-deep focus:border-brown focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brown-deep">
                  Fragrance Notes & Accords (comma separated)
                </label>
                <Input
                  placeholder="e.g. Bergamot, Cardamom, Turkish Rose, Iris, Oud, Sandalwood, Amber"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-cream-border pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2 font-bold"
                >
                  {isSubmitting ? 'Adding Fragrance...' : 'Publish Fragrance'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
