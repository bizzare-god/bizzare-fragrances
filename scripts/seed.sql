-- Seed: Bizzare Fragrances store catalog
-- Idempotent: categories upsert by name; products upsert by fixed seed id.
-- Prices are in Nigerian Naira (NGN); Paystack converts *100 to kobo.

-- Categories (collections)
INSERT INTO "Category" (id, name)
VALUES
  ('seed-cat-signature-noir',   'Signature Noir'),
  ('seed-cat-amber-house',      'The Amber House'),
  ('seed-cat-fresh-atelier',    'Fresh Atelier'),
  ('seed-cat-floral-reserve',   'Floral Reserve'),
  ('seed-cat-gourmand-garden',  'Gourmand Garden')
ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name;

-- Products
INSERT INTO "Product" (
  id, "categoryId", name, brand, description, "scentFamily", "volumeMl",
  "topNotes", "middleNotes", "baseNotes", price, stock, images, "isActive", "createdAt", "updatedAt"
)
VALUES
  (
    'seed-p-001', 'seed-cat-signature-noir',
    'Oud Impérial', 'Bizzare Fragrances',
    'A regal, smoky oud worn like a dark velvet coat. Saffron ignites the opening, rose threads the heart, and agarwood burns into a leather-and-amber base.',
    'Woody', 100,
    ARRAY['Saffron', 'Bergamot'],
    ARRAY['Rose Damascena', 'Patchouli'],
    ARRAY['Agarwood (Oud)', 'Amber', 'Musk'],
    320000.00, 12, ARRAY[]::text[], true, now(), now()
  ),
  (
    'seed-p-002', 'seed-cat-amber-house',
    'Éclat d''Ambre Noir', 'Bizzare Fragrances',
    'Molten amber and warm vanilla wrapped in cardamom smoke. An oriental glow that sits close to the skin and lingers for hours.',
    'Oriental', 100,
    ARRAY['Cardamom', 'Pink Pepper'],
    ARRAY['Labdanum', 'Myrrh'],
    ARRAY['Amber', 'Vanilla Bourbon', 'Tonka Bean'],
    280000.00, 15, ARRAY[]::text[], true, now(), now()
  ),
  (
    'seed-p-003', 'seed-cat-floral-reserve',
    'Nuit d''Orchidée', 'Bizzare Fragrances',
    'Velvety orchid and jasmine sambac gliding over creamy sandalwood. A nocturnal floral for evenings that refuse to end early.',
    'Floral', 100,
    ARRAY['Black Currant', 'Mandarin'],
    ARRAY['Orchid', 'Jasmine Sambac'],
    ARRAY['Sandalwood', 'White Musk'],
    245000.00, 10, ARRAY[]::text[], true, now(), now()
  ),
  (
    'seed-p-004', 'seed-cat-fresh-atelier',
    'Cristal de Citron', 'Bizzare Fragrances',
    'Sunlight in a bottle: Sicilian lemon and neroli cut through the heat, settling on crisp white cedar. Effervescent and impeccably tailored.',
    'Citrus', 100,
    ARRAY['Sicilian Lemon', 'Petitgrain'],
    ARRAY['Neroli', 'Verbena'],
    ARRAY['White Cedar', 'Musk'],
    198000.00, 18, ARRAY[]::text[], true, now(), now()
  ),
  (
    'seed-p-005', 'seed-cat-fresh-atelier',
    'Vetiver Sauvage', 'Bizzare Fragrances',
    'A green, rain-washed vetiver with lavender sharpenings and a damp oakmoss trail. The clean, confident every-day signature.',
    'Aromatic', 100,
    ARRAY['Grapefruit', 'Bergamot'],
    ARRAY['Vetiver', 'Lavandin'],
    ARRAY['Patchouli', 'Oakmoss'],
    192000.00, 14, ARRAY[]::text[], true, now(), now()
  ),
  (
    'seed-p-006', 'seed-cat-gourmand-garden',
    'Café Gourmand', 'Bizzare Fragrances',
    'Espresso, praline and toffee over warm cinnamon—like the last spoon of a perfect affogato. A dessert you wear, never lose.',
    'Gourmand', 100,
    ARRAY['Espresso', 'Bitter Orange'],
    ARRAY['Toffee', 'Cinnamon'],
    ARRAY['Praline', 'Vanilla'],
    235000.00, 8, ARRAY[]::text[], true, now(), now()
  ),
  (
    'seed-p-007', 'seed-cat-floral-reserve',
    'Rose Écarlate', 'Bizzare Fragrances',
    'Crimson roses and ripe lychee, backed by cedar and clean musk. Opulent without ever tipping into the obvious.',
    'Floral', 100,
    ARRAY['Lychee', 'Raspberry'],
    ARRAY['Rose Centifolia', 'Peony'],
    ARRAY['Musk', 'Cedarwood'],
    250000.00, 11, ARRAY[]::text[], true, now(), now()
  ),
  (
    'seed-p-008', 'seed-cat-signature-noir',
    'Oud de Royale', 'Bizzare Fragrances',
    'The crown piece: incense, nutmeg and Bulgarian rose over a deep oud-leather accord. Reserved for occasions that deserve their own name.',
    'Woody', 100,
    ARRAY['Incense', 'Nutmeg'],
    ARRAY['Oud', 'Bulgarian Rose'],
    ARRAY['Leather', 'Amber', 'Vetiver'],
    385000.00, 6, ARRAY[]::text[], true, now(), now()
  ),
  (
    'seed-p-009', 'seed-cat-amber-house',
    'Ambre de Nice', 'Bizzare Fragrances',
    'Sun-baked amber softened with sweet myrrh and a whisper of rum. Golden, honeyed and unmistakably warm.',
    'Oriental', 100,
    ARRAY['Bergamot', 'Cinnamon'],
    ARRAY['Amber', 'Myrrh'],
    ARRAY['Vanilla', 'Tonka Bean', 'Sandalwood'],
    265000.00, 9, ARRAY[]::text[], true, now(), now()
  ),
  (
    'seed-p-010', 'seed-cat-floral-reserve',
    'Fleur d''Ylang', 'Bizzare Fragrances',
    'A half-flacon of ylang-ylang, frangipani and ripe pear on a creamy vanilla-sandal base. Bright, island-calm and utterly charming.',
    'Floral', 50,
    ARRAY['Bergamot', 'Pear'],
    ARRAY['Ylang-Ylang', 'Frangipani'],
    ARRAY['Vanilla', 'Sandalwood'],
    165000.00, 20, ARRAY[]::text[], true, now(), now()
  )
ON CONFLICT (id) DO UPDATE SET
  "categoryId" = EXCLUDED."categoryId",
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  description = EXCLUDED.description,
  "scentFamily" = EXCLUDED."scentFamily",
  "volumeMl" = EXCLUDED."volumeMl",
  "topNotes" = EXCLUDED."topNotes",
  "middleNotes" = EXCLUDED."middleNotes",
  "baseNotes" = EXCLUDED."baseNotes",
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  images = EXCLUDED.images,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = now();