import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback
const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key] || fallback;
  if (!value) {
    console.error(`❌ Missing environment variable: ${key}`);
  }
  return value || '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Validation with helpful error messages
if (!supabaseUrl || !supabaseAnonKey) {
  const errors: string[] = [];
  
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is missing');
  }
  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing');
  }
  
  console.error('❌ Supabase Configuration Error:', errors.join(', '));
  console.error('📝 To fix this:');
  console.error('   1. Create a .env file in your project root');
  console.error('   2. Add your Supabase credentials:');
  console.error('      VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('      VITE_SUPABASE_ANON_KEY=your-anon-key');
  console.error('   3. Get credentials from: https://app.supabase.com/project/_/settings/api');
  console.error('');
  console.error('   For production (Vercel/Netlify):');
  console.error('   1. Go to your project settings');
  console.error('   2. Add environment variables in the dashboard');
  console.error('   3. Redeploy your application');
  
  throw new Error(`Missing Supabase credentials: ${errors.join(', ')}`);
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  console.error('❌ Invalid VITE_SUPABASE_URL format:', supabaseUrl);
  throw new Error('VITE_SUPABASE_URL must be a valid URL');
}

console.log('🔧 Supabase Configuration:');
console.log('   URL:', supabaseUrl);
console.log('   Key:', supabaseAnonKey.substring(0, 20) + '...');

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce', // More secure auth flow
  },
  global: {
    headers: {
      'X-Client-Info': 'tregu-platform@1.0.0'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Test connection on initialization
let connectionTested = false;

export const testSupabaseConnection = async () => {
  if (connectionTested) return true;
  
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const { count, error } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      console.error('   Error details:', {
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return false;
    }
    
    console.log('✅ Supabase connected successfully');
    console.log(`   Listings in database: ${count ?? 0}`);
    connectionTested = true;
    return true;
    
  } catch (error: any) {
    console.error('❌ Supabase connection test failed:', error);
    console.error('   This might be due to:');
    console.error('   - Incorrect Supabase URL or API key');
    console.error('   - Network issues');
    console.error('   - CORS configuration in Supabase');
    console.error('   - Database tables not created yet');
    return false;
  }
};

// Test connection on module load (non-blocking)
testSupabaseConnection();

// Helper functions
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('✅ User signed out successfully');
  } catch (error: any) {
    console.error('❌ Sign out error:', error);
    throw error;
  }
};

// Health check function
export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('id')
      .limit(1);
    
    return { 
      healthy: !error, 
      error: error?.message,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return { 
      healthy: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};
