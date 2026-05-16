
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jqqfphjkopkcoxxfmman.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
  const email = 'diego.fjddf@gmail.com';
  const password = 'Dfo@07011988';

  console.log(`Creating/Updating admin user: ${email}...`);

  // 1. Get Stanley tenant_id
  const { data: tenant } = await supabase.from('tenants').select('id').eq('name', 'Stanley').single();
  if (!tenant) {
    console.error('Stanley tenant not found!');
    process.exit(1);
  }
  const tenantId = tenant.id;
  console.log(`Stanley Tenant ID: ${tenantId}`);

  // 2. Create user in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin' }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
        console.log('User already exists in Auth. Updating metadata...');
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users.users.find(u => u.email === email);
        if (user) {
            await supabase.auth.admin.updateUserById(user.id, {
                password,
                user_metadata: { role: 'admin' }
            });
            console.log('User password and metadata updated.');
            // Continue to profile update
            await updateProfile(user.id, tenantId);
        }
    } else {
        console.error('Auth Error:', authError);
    }
  } else {
    console.log('User created in Auth!');
    await updateProfile(authData.user.id, tenantId);
  }
}

async function updateProfile(userId, tenantId) {
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    tenant_id: tenantId,
    role: 'admin',
    full_name: 'Diego (Admin)'
  });

  if (profileError) {
    console.error('Profile Error:', profileError);
  } else {
    console.log('Profile updated successfully!');
  }
}

run();
