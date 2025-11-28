import { supabase } from './supabase';
import { upsertUserProfile } from './database';

// Get redirect URL from environment or detect dynamically
const getRedirectUrl = (): string => {
  // Priority 1: Explicit environment variable (most reliable)
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl) {
    console.log('🔗 Using configured redirect URL:', envUrl);
    return envUrl;
  }
  
  // Priority 2: Current origin (for development and preview deployments)
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('🔗 Using detected redirect URL:', origin);
    return origin;
  }
  
  // Priority 3: Fallback to production URL
  const fallbackUrl = 'https://tregu-platform.vercel.app';
  console.warn('⚠️ Using fallback redirect URL:', fallbackUrl);
  console.warn('   Set VITE_APP_URL in your .env file for better reliability');
  return fallbackUrl;
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  try {
    console.log('📝 Starting email signup process...');
    
    const redirectUrl = getRedirectUrl();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      console.error('❌ Signup error:', error.message);
      throw error;
    }

    console.log('✅ Signup successful, user ID:', data.user?.id);

    // Create user profile in database
    if (data.user) {
      try {
        console.log('📝 Creating user profile...');
        await upsertUserProfile(data.user.id, {
          id: data.user.id,
          email: email,
          name: name,
          free_listing_used: false,
          listing_count: 0,
          is_verified: !!data.user.email_confirmed_at,
          role: 'user'
        } as any);
        console.log('✅ User profile created');
      } catch (profileError: any) {
        console.error('❌ Error creating profile:', profileError);
        // Don't throw - user is created, profile can be created later
      }
    }

    return data;
  } catch (error: any) {
    console.error('❌ Sign up error:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('already registered')) {
      throw new Error('This email is already registered. Please login instead.');
    }
    if (error.message?.includes('invalid email')) {
      throw new Error('Please provide a valid email address.');
    }
    if (error.message?.includes('password')) {
      throw new Error('Password must be at least 6 characters long.');
    }
    
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting email login process...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Login error:', error.message);
      throw error;
    }

    console.log('✅ Login successful, user ID:', data.user?.id);
    return data;
    
  } catch (error: any) {
    console.error('❌ Sign in error:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('Invalid login credentials')) {
      throw new Error('Invalid email or password. Please try again.');
    }
    if (error.message?.includes('Email not confirmed')) {
      throw new Error('Please confirm your email before logging in. Check your inbox.');
    }
    
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    console.log('🔐 Starting Google login process...');
    
    const redirectUrl = getRedirectUrl();
    console.log('🔗 Google OAuth redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      console.error('❌ Google sign in error:', error.message);
      throw error;
    }
    
    console.log('✅ Google OAuth initiated');
    return data;
    
  } catch (error: any) {
    console.error('❌ Google sign in error:', error);
    throw new Error('Failed to sign in with Google. Please try again.');
  }
};

export const signOut = async () => {
  try {
    console.log('👋 Signing out...');
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    console.log('✅ Successfully signed out');
  } catch (error: any) {
    console.error('❌ Sign out error:', error);
    throw error;
  }
};

export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Get session error:', error);
      return null;
    }
    
    if (session) {
      console.log('✅ Active session found, user:', session.user.email);
    } else {
      console.log('ℹ️ No active session');
    }
    
    return session;
  } catch (error) {
    console.error('❌ Get session error:', error);
    return null;
  }
};

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  console.log('👂 Setting up auth state listener...');
  
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth state changed:', event, session ? `User: ${session.user.email}` : 'No session');
    callback(event, session);
  });
};

// Helper to check if user email is confirmed
export const isEmailConfirmed = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user?.email_confirmed_at;
  } catch {
    return false;
  }
};

// Helper to resend confirmation email
export const resendConfirmationEmail = async (email: string) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    
    if (error) throw error;
    
    console.log('✅ Confirmation email resent');
    return true;
  } catch (error: any) {
    console.error('❌ Error resending confirmation email:', error);
    throw error;
  }
};
