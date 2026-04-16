const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yglzgrchxbsfxewiqtfi.supabase.co';
const supabaseKey = 'sb_publishable_E8AjYf6rvaQI5FujzIVvuA_rE8faWY8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.auth.getSession();
  console.log('Session:', data);
  console.log('Error:', error);
}

test();