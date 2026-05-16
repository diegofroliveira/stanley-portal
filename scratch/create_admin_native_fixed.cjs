
const SUPABASE_URL = 'https://jqqfphjkopkcoxxfmman.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY');
  process.exit(1);
}

async function run() {
  const email = 'diego.fjddf@gmail.com';
  const password = 'Dfo@07011988';
  const tenantId = 'eeb741b7-8c0c-4890-b390-75a23b558977'; // Stanley

  console.log(`Creating admin user: ${email}...`);

  // 1. Create user in Auth via Admin API
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
    if (err.message && err.message.includes('already registered')) {
        console.log('User already exists in Auth. Fetching ID...');
        const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
        });
        const users = await listRes.json();
        const user = users.users ? users.users.find(u => u.email === email) : users.find(u => u.email === email);
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
    // 2. Insert into tenant_members
    const memberRes = await fetch(`${SUPABASE_URL}/rest/v1/tenant_members`, {
        method: 'POST',
        headers: { 
            'apikey': SERVICE_ROLE_KEY, 
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
            tenant_id: tenantId,
            user_id: userId,
            role: 'admin'
        })
    });

    if (memberRes.ok) {
        console.log('Tenant membership updated successfully!');
    } else {
        console.error('Member Error:', await memberRes.text());
    }
  }
}

run();
