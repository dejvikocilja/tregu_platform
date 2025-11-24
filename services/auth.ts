import { supabase } from './supabase';
import { upsertUserProfile } from './database';

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, name: string) => {
  console.log('🔵 signUpWithEmail called with:', { email, name });
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      }
    }
  });

  console.log('🔵 Supabase signUp response:', { data, error });

  if (error) {
    console.error('❌ Sign up error:', error);
    throw error;
  }

  // Create user profile in public.users table
  if (data.user) {
    console.log('🔵 Creating user profile for user:', data.user.id);
    
    try {
      await upsertUserProfile(data.user.id, {
        id: data.user.id,
        email: email,
        name: name,
        free_listing_used: false,
        listing_count: 0,
        is_verified: true,
        role: 'user'
      } as any);
      console.log('✅ User profile created successfully');
    } catch (profileError) {
      console.error('❌ Error creating profile:', profileError);
      throw profileError;
    }
  }

  return data;
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  console.log('🔵 signInWithEmail called');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log('🔵 Sign in response:', { data, error });

  if (error) {
    console.error('❌ Sign in error:', error);
    throw error;
  }
  
  return data;
};

// Sign in with Google
export const signInWithGoogle = async () => {
  console.log('🔵 signInWithGoogle called');
  console.log('🔵 Redirect URL:', `${window.location.origin}/auth/callback`);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}`
    }
  });

  console.log('🔵 Google OAuth response:', { data, error });

  if (error) {
    console.error('❌ Google sign in error:', error);
    throw error;
  }
  
  return data;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};
