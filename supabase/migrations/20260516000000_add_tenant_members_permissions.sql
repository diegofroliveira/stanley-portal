
-- Add permissions column to tenant_members to support granular menu visibility
ALTER TABLE public.tenant_members 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"menus": ["overview", "estoque", "clientes", "vendedores"], "actions": ["import", "status_update"]}';

-- Update the view to include the new column
create or replace view public.tenant_members_with_email
with (security_invoker = true)
as
select
  tm.tenant_id,
  tm.user_id,
  tm.role,
  tm.permissions,
  tm.created_at,
  u.email
from public.tenant_members tm
left join auth.users u on u.id = tm.user_id;
