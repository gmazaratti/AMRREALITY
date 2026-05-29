-- ═══════════════════════════════════════════
--  AMR Reality — Supabase Database Setup
--  Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════

-- 1. Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tees', 'hoodies', 'outerwear', 'bottoms')),
  price INTEGER NOT NULL,
  description TEXT DEFAULT '',
  details TEXT[] DEFAULT '{}',
  badge TEXT DEFAULT NULL,
  sizes TEXT[] DEFAULT '{S,M,L,XL,2XL}',
  sold_out BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 4.5,
  review_count INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  delivery_info TEXT DEFAULT 'Free shipping on orders over $120 CAD. Standard delivery: 5–8 business days. Express delivery: 2–3 business days ($15 CAD). Hassle-free returns within 14 days of delivery. Items must be unworn with tags attached.',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 4. Public read policies
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);

-- 5. Admin write policies
-- ⚠️ REPLACE 'admin@amrreality.com' with YOUR admin email
CREATE POLICY "Admin insert products" ON products FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@amrreality.com');
CREATE POLICY "Admin update products" ON products FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'admin@amrreality.com');
CREATE POLICY "Admin delete products" ON products FOR DELETE
  USING (auth.jwt() ->> 'email' = 'admin@amrreality.com');

CREATE POLICY "Admin insert reviews" ON reviews FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@amrreality.com');
CREATE POLICY "Admin update reviews" ON reviews FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'admin@amrreality.com');
CREATE POLICY "Admin delete reviews" ON reviews FOR DELETE
  USING (auth.jwt() ->> 'email' = 'admin@amrreality.com');

-- 6. Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. Seed data (your existing products)
INSERT INTO products (name, slug, category, price, badge, details, images, sort_order) VALUES
  ('RBA Jersey Tee', 'rba-jersey-tee', 'tees', 85, 'New',
   ARRAY['100% Premium Cotton', 'Oversized relaxed fit', 'Screen-printed graphics', 'Reinforced stitching', 'Pre-washed for softness', 'Designed in Montreal, QC'],
   ARRAY['products/placeholder.jpg'], 1),
  ('Reality Sport Tee', 'reality-sport-tee', 'tees', 90, 'Limited',
   ARRAY['100% Premium Cotton', 'Athletic cut', 'Embroidered logo', 'Reinforced stitching'],
   ARRAY['products/placeholder.jpg'], 2),
  ('Heritage Hoodie', 'heritage-hoodie', 'hoodies', 145, NULL,
   ARRAY['80/20 Cotton-Poly blend', 'Heavyweight 380gsm', 'Kangaroo pocket', 'Ribbed cuffs'],
   ARRAY['products/placeholder.jpg'], 3),
  ('Montreal Bomber', 'montreal-bomber', 'outerwear', 210, 'New',
   ARRAY['Nylon shell', 'Quilted lining', 'Ribbed collar and cuffs', 'Zip front closure'],
   ARRAY['products/placeholder.jpg'], 4),
  ('Utility Cargo Pant', 'utility-cargo-pant', 'bottoms', 120, NULL,
   ARRAY['100% Cotton twill', 'Relaxed fit', 'Six pocket design', 'Adjustable waist'],
   ARRAY['products/placeholder.jpg'], 5),
  ('Cross Logo Tee', 'cross-logo-tee', 'tees', 75, NULL,
   ARRAY['100% Premium Cotton', 'Regular fit', 'Screen-printed logo', 'Pre-shrunk'],
   ARRAY['products/placeholder.jpg'], 6),
  ('Washed Reality Hoodie', 'washed-reality-hoodie', 'hoodies', 135, 'Limited',
   ARRAY['100% Cotton', 'Acid wash finish', 'Heavyweight 400gsm', 'Drop shoulder'],
   ARRAY['products/placeholder.jpg'], 7),
  ('Vintage Bomber', 'vintage-bomber', 'outerwear', 195, NULL,
   ARRAY['Satin shell', 'Vintage wash', 'Embroidered back panel', 'Zip front'],
   ARRAY['products/placeholder.jpg'], 8),
  ('AMR Oversized Tee', 'amr-oversized-tee', 'tees', 80, 'New',
   ARRAY['100% Premium Cotton', 'Oversized fit', 'Back print graphic', 'Boxy silhouette'],
   ARRAY['products/placeholder.jpg'], 9),
  ('Raw Denim Pant', 'raw-denim-pant', 'bottoms', 130, NULL,
   ARRAY['14oz raw selvedge denim', 'Straight leg', 'Chain stitch hemming', 'Japanese fabric'],
   ARRAY['products/placeholder.jpg'], 10),
  ('77 Pullover', '77-pullover', 'hoodies', 140, NULL,
   ARRAY['80/20 Cotton-Poly blend', 'Pullover style', 'Embroidered 77 graphic', 'Fleece lined'],
   ARRAY['products/placeholder.jpg'], 11),
  ('Jaffna Graphic Tee', 'jaffna-graphic-tee', 'tees', 85, 'Limited',
   ARRAY['100% Premium Cotton', 'Relaxed fit', 'Heritage graphic print', 'Designed in Montreal'],
   ARRAY['products/placeholder.jpg'], 12);

-- 8. Seed some reviews
INSERT INTO reviews (product_id, author, rating, text) VALUES
  ((SELECT id FROM products WHERE slug = 'rba-jersey-tee'), 'Marcus T.', 5, 'Best quality tee I''ve ever owned. The fit is perfect.'),
  ((SELECT id FROM products WHERE slug = 'rba-jersey-tee'), 'Priya K.', 5, 'Looks even better in person. Heavyweight fabric, clean printing.'),
  ((SELECT id FROM products WHERE slug = 'rba-jersey-tee'), 'Jordan L.', 4, 'Love the design. Runs slightly large — size down if between sizes.'),
  ((SELECT id FROM products WHERE slug = 'heritage-hoodie'), 'Anika R.', 5, 'Heaviest hoodie I own. Worth every penny.'),
  ((SELECT id FROM products WHERE slug = 'heritage-hoodie'), 'Devon M.', 5, 'The quality is insane for the price. Feels like a $300 hoodie.'),
  ((SELECT id FROM products WHERE slug = 'montreal-bomber'), 'Tyler S.', 5, 'This bomber is everything. Perfect for Montreal weather.'),
  ((SELECT id FROM products WHERE slug = 'utility-cargo-pant'), 'Sam W.', 4, 'Great fit, lots of pockets. The fabric softens up nicely after a few washes.');

-- 9. Update review counts
UPDATE products SET review_count = (
  SELECT COUNT(*) FROM reviews WHERE reviews.product_id = products.id
);

-- 10. Create storage bucket for product images
-- ⚠️ Do this manually in Supabase Dashboard:
--   Storage → Create bucket → Name: "product-images"
--   Make it PUBLIC
--   Add policy: Allow authenticated users to upload
