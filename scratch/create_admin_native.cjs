
const SUPABASE_URL = 'https://jqqfphjkopkcoxxfmman.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY');
  process.exit(1);
}

async function run() {
  const email = 'diego.fjddf@gmail.com';
  const password = 'Dfo@07011988';

  console.log(`Creating admin user: ${email}...`);

  // 1. Get Stanley tenant_id
  const tenantRes = await fetch(`${SUPABASE_URL}/rest/v1/tenants?name=eq.Stanley&select=id`, {
    headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
  });
  const tenants = await tenantRes.json();
  if (!tenants || tenants.length === 0) {
    console.error('Stanley tenant not found!');
    process.exit(1);
  }
  const tenantId = tenants[0].id;
  console.log(`Stanley Tenant ID: ${tenantId}`);

  // 2. Create user in Auth via Admin API (Management endpoint)
  // Note: We'll use the profiles upsert to grant permissions
  // To create a user we need the /auth/v1/admin/users endpoint
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { 
        'apikey': SERVICE_ROLE_KEY, 
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'admin' }
    })
  });

  let userId;
  if (authRes.ok) {
    const authData = await authRes.json();
    userId = authData.id;
    console.log(`User created in Auth! ID: ${userId}`);
  } else {
    const err = await authRes.json();
    if (err.message.includes('already registered')) {
        console.log('User already exists in Auth. Fetching ID...');
        const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
        });
        const users = await listRes.json();
        const user = users.find(u => u.email === email);
        if (user) {
            userId = user.id;
            console.log(`Found existing user ID: ${userId}. Updating password...`);
            await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 
                    'apikey': SERVICE_ROLE_KEY, 
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password, user_metadata: { role: 'admin' } })
            });
        }
    } else {
        console.error('Auth Error:', err);
        process.exit(1);
    }
  }

  if (userId) {
    // 3. Upsert Profile
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: { 
            'apikey': SERVICE_ROLE_KEY, 
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
            id: userId,
            tenant_id: tenantId,
            role: 'admin',
            full_name: 'Diego (Admin)'
        })
    });

    if (profileRes.ok) {
        console.log('Profile updated successfully!');
    } else {
        console.error('Profile Error:', await profileRes.text());
    }
  }
}

run();
