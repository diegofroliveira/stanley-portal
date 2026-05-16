
import { supabase } from '../lib/supabaseClient';
import { UserMembership, UserPermissions } from '../types';

export async function listTenantMembers(tenantId: string): Promise<UserMembership[]> {
  const { data, error } = await supabase
    .from('tenant_members_with_email')
    .select('*')
    .eq('tenant_id', tenantId);

  if (error) throw error;
  return data as UserMembership[];
}

export async function manageUser(payload: {
  action: 'create' | 'update' | 'remove';
  tenant_id: string;
  user_id?: string;
  email?: string;
  password?: string;
  role?: string;
  permissions?: UserPermissions;
}) {
  const { data, error } = await supabase.functions.invoke('admin_manage_user', {
    body: payload,
  });

  if (error) throw error;
  return data;
}
