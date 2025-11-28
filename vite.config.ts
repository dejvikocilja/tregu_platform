import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Validate critical environment variables at build time
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(key => !env[key]);
  
  if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars);
    console.error('Please add them to your .env file');
  }
  
  // Log env vars status (without exposing values)
  console.log('🔧 Environment variables check:');
  console.log('  VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('  VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('  VITE_GEMINI_API_KEY:', env.VITE_GEMINI_API_KEY ? '✅ Set' : '⚠️ Optional');
  console.log('  VITE_APP_URL:', env.VITE_APP_URL ? '✅ Set' : '⚠️ Optional');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/',
      },
    },
    // Explicitly define env vars to ensure they're available at runtime
    define: {
      __SUPABASE_URL__: JSON.stringify(env.VITE_SUPABASE_URL),
      __SUPABASE_ANON_KEY__: JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      __GEMINI_API_KEY__: JSON.stringify(env.VITE_GEMINI_API_KEY),
      __APP_URL__: JSON.stringify(env.VITE_APP_URL),
    },
    // Ensure env vars are included in the build
    envPrefix: 'VITE_',
  };
});
