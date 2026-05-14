
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jqqfphjkopkcoxxfmman.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcWZwaGprb3BrY294eGZtbWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MTkwNjgsImV4cCI6MjA5NDI5NTA2OH0.rwKdULlgWFAKEjR6_Tt4lVT5TR7sK5D5qbVNtqSjzCc';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function checkTable() {
  console.log('Checking tenant_cigam_config...');
  const { data, error } = await supabase
    .from('tenant_cigam_config')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Error or table not found:', error.message);
  } else {
    console.log('Columns found:', Object.keys(data[0] || {}).join(', '));
  }
}

checkTable();
