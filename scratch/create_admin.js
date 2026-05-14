
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jqqfphjkopkcoxxfmman.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcWZwaGprb3BrY294eGZtbWFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODcxOTA2OCwiZXhwIjoyMDk0Mjk1MDY4fQ.QLQrW0cVCciHTZpqlUEJbbQ7q5JDvnp7XOOjxkuHV0w';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  const email = 'diego.fjddf@gmail.com';
  const password = 'Dfo@07011988';
  const tenantSlug = 'stanley';

  console.log(`Creating user ${email}...`);
  
  // 1. Create or get user
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  let userId;
  if (userError) {
    if (userError.message.includes('already registered')) {
      console.log('User already exists, fetching ID...');
      const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
      const existing = users.users.find(u => u.email === email);
      if (!existing) throw new Error('Could not find existing user');
      userId = existing.id;
    } else {
      throw userError;
    }
  } else {
    userId = userData.user.id;
    console.log(`User created with ID: ${userId}`);
  }

  // 2. Get tenant ID
  console.log(`Finding tenant ${tenantSlug}...`);
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (tenantError) throw tenantError;
  const tenantId = tenant.id;

  // 3. Add to tenant_members as admin
  console.log(`Adding user to tenant ${tenantSlug} as admin...`);
  const { error: memberError } = await supabase
    .from('tenant_members')
    .upsert({
      tenant_id: tenantId,
      user_id: userId,
      role: 'admin'
    }, { onConflict: 'tenant_id,user_id' });

  if (memberError) throw memberError;

  // 4. Also make him a platform admin (global admin)
  console.log('Making user a platform admin...');
  const { error: platformError } = await supabase
    .from('platform_admins')
    .upsert({ user_id: userId });

  if (platformError) {
    console.warn('Could not make platform admin (maybe table doesnt exist?):', platformError.message);
  }

  console.log('Done! Admin user created and assigned successfully.');
}

createAdmin().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
