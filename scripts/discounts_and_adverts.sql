DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DiscountType') THEN
    CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');
  END IF;
END $$;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "discountType" "DiscountType",
  ADD COLUMN IF NOT EXISTS "discountPercent" INTEGER,
  ADD COLUMN IF NOT EXISTS "discountPrice" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "discountEndsAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "StorePromo" (
  "id" TEXT NOT NULL,
  "discountPercent" INTEGER,
  "discountEndsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StorePromo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Advert" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "linkUrl" TEXT,
  "buttonText" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Advert_pkey" PRIMARY KEY ("id")
);

INSERT INTO "StorePromo" ("id") VALUES ('storewide')
ON CONFLICT ("id") DO NOTHING;