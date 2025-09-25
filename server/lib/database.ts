import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Database initialization function
export async function initializeDatabase() {
  try {
    // Check if we can connect to the database
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('Database tables not found. Please run the migration scripts.');
      return false;
    }
    
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
