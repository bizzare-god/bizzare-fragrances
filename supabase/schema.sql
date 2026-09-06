-- ==============================================================================
-- DEPRECATION NOTICE: DO NOT USE THIS FILE IN PRODUCTION OR FOR ACTIVE MIGRATIONS
-- ==============================================================================
-- The authoritative database schema for Bizzare Fragrances (by Bizzare) is managed
-- exclusively via Prisma ORM at: `prisma/schema.prisma`.
-- All models (User, Vendor, Product, Category, Order, OrderItem, DeliveryProof,
-- AuditLog, PlatformSettings), enums (BUYER, VENDOR, COURIER, ADMIN), and relations
-- are maintained and migrated through Prisma.
--
-- This file is retained solely for historical architecture reference.
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'vendor', 'courier', 'customer');
CREATE TYPE vendor_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'picked_up', 'in_transit', 'delivered', 'cancelled');

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
