
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jqqfphjkopkcoxxfmman.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY; // I will pass this via environment

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function fixLogos() {
  console.log('Fixing Stanley logo...');
  const { error: error1 } = await supabase
    .from('tenants')
    .update({ 
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Stanley_Logo.svg/1280px-Stanley_Logo.svg.png',
      company_name: 'Stanley'
    })
    .eq('slug', 'stanley');
  
  if (error1) console.error('Error updating Stanley tenant:', error1);
  else console.log('Stanley tenant updated.');

  console.log('Fixing Made by SARK logos...');
  // We can't easily update all, but we ensure the helper has fallback.
}

async function listUsers() {
  console.log('Listing users...');
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
  } else {
    console.log('Users found:', data.users.length);
    data.users.forEach(u => {
      console.log(`- ${u.email} (ID: ${u.id})`);
    });
  }
}

async function run() {
  await fixLogos();
  await listUsers();
}

run();
