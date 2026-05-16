
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

  console.log(`Creating/Updating admin user: ${email}...`);

  // 1. Fetch user ID first to see if they exist
  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
  });
  const usersData = await listRes.json();
  const usersList = usersData.users || usersData;
  const existingUser = usersList.find(u => u.email === email);

  let userId;
  if (existingUser) {
    userId = existingUser.id;
    console.log(`User exists. ID: ${userId}. Updating...`);
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 
            'apikey': SERVICE_ROLE_KEY, 
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, user_metadata: { role: 'admin' } })
    });
  } else {
    console.log('Creating new user...');
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
    const authData = await authRes.json();
    if (authRes.ok) {
        userId = authData.id;
        console.log(`User created! ID: ${userId}`);
    } else {
        console.error('Auth Create Error:', authData);
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
