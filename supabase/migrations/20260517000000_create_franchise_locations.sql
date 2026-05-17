
-- Create the franchise locations configuration table
CREATE TABLE IF NOT EXISTS public.franchise_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    location_name TEXT NOT NULL, -- Matches 'location' in public.products (e.g. 'Brasília Shopping')
    whatsapp_number TEXT NOT NULL,
    telegram_username TEXT,
    address TEXT NOT NULL,
    maps_url TEXT NOT NULL,
    instagram_handle TEXT,
    working_hours TEXT NOT NULL DEFAULT 'Segunda a Sábado: 10h às 22h | Domingo: 14h às 20h',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique index to make slug unique per tenant
CREATE UNIQUE INDEX IF NOT EXISTS franchise_locations_tenant_slug_uidx ON public.franchise_locations (tenant_id, slug);
CREATE INDEX IF NOT EXISTS franchise_locations_tenant_id_idx ON public.franchise_locations (tenant_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.franchise_locations ENABLE ROW LEVEL SECURITY;

-- Select policy: Allow anonymous/public reads so catalog page works
DROP POLICY IF EXISTS "Anyone can read franchise locations" ON public.franchise_locations;
CREATE POLICY "Anyone can read franchise locations"
ON public.franchise_locations
FOR SELECT
USING (true);

-- Manage policy: Only tenant admins can insert/update/delete locations
DROP POLICY IF EXISTS "Tenant admins can manage franchise locations" ON public.franchise_locations;
CREATE POLICY "Tenant admins can manage franchise locations"
ON public.franchise_locations
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.tenant_members tm
        WHERE tm.tenant_id = franchise_locations.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.tenant_members tm
        WHERE tm.tenant_id = franchise_locations.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role = 'admin'
    )
);

-- Update public.products select policy to allow anonymous/public reads (so unauthenticated customers can load the catalog!)
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
CREATE POLICY "Anyone can read products"
ON public.products
FOR SELECT
USING (true);

-- Seed defaults for 'default' and 'stanley' tenants
DO $$
DECLARE
    default_tenant_id UUID;
    stanley_tenant_id UUID;
BEGIN
    SELECT id INTO default_tenant_id FROM public.tenants WHERE slug = 'default';
    SELECT id INTO stanley_tenant_id FROM public.tenants WHERE slug = 'stanley';

    IF default_tenant_id IS NOT NULL THEN
        INSERT INTO public.franchise_locations (tenant_id, slug, name, location_name, whatsapp_number, address, maps_url, instagram_handle)
        VALUES (
            default_tenant_id,
            'brasilia-shopping',
            'Stanley Brasília Shopping',
            'Brasília Shopping',
            '5561999999999',
            'SCN Quadra 5, Bloco A - Asa Norte, Brasília - DF, 70715-900',
            'https://maps.app.goo.gl/DF5xP3F8pHRDLPmPA',
            'stanley.df'
        )
        ON CONFLICT (tenant_id, slug) DO NOTHING;
    END IF;

    IF stanley_tenant_id IS NOT NULL THEN
        INSERT INTO public.franchise_locations (tenant_id, slug, name, location_name, whatsapp_number, address, maps_url, instagram_handle)
        VALUES (
            stanley_tenant_id,
            'brasilia-shopping',
            'Stanley Brasília Shopping',
            'Brasília Shopping',
            '5561999999999',
            'SCN Quadra 5, Bloco A - Asa Norte, Brasília - DF, 70715-900',
            'https://maps.app.goo.gl/DF5xP3F8pHRDLPmPA',
            'stanley.df'
        )
        ON CONFLICT (tenant_id, slug) do nothing;
    END IF;
END $$;
