-- 1. Create tables
CREATE TABLE public.products (
  sku TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT REFERENCES public.products(sku),
  location TEXT NOT NULL CHECK (location IN ('ESTOQUE', 'GAVETA', 'MOSTRUÁRIO (VM)')),
  quantity INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sku, location)
);

CREATE TABLE public.movements_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT REFERENCES public.products(sku),
  from_location TEXT,
  to_location TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Setup RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements_log ENABLE ROW LEVEL SECURITY;

-- 3. Create simple Policies
-- For now, allow authenticated users to view and edit. 
-- In a real scenario, you'd check a 'role' column on auth.users for Gestor vs Operador.
CREATE POLICY "Allow authenticated users to select products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert/update products" ON public.products FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to select inventory" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert/update inventory" ON public.inventory FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to select movements" ON public.movements_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert movements" ON public.movements_log FOR INSERT TO authenticated WITH CHECK (true);

-- 4. RPC (Function) to handle the CIGAM Sync safely
-- This allows bulk upserting products from the Drag&Drop without complex client-side logic.
CREATE OR REPLACE FUNCTION sync_cigam_products(product_data JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prod RECORD;
BEGIN
  -- product_data should be an array of JSON objects: [{sku, name, price}]
  FOR prod IN SELECT * FROM jsonb_array_elements(product_data)
  LOOP
    INSERT INTO public.products (sku, name, price)
    VALUES (
      prod.value->>'sku', 
      prod.value->>'name', 
      (prod.value->>'price')::numeric
    )
    ON CONFLICT (sku) 
    DO UPDATE SET 
      name = EXCLUDED.name, 
      price = EXCLUDED.price,
      updated_at = CURRENT_TIMESTAMP;
  END LOOP;
END;
$$;
