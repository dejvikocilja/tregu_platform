import { supabase } from './supabase';
import { upsertUserProfile } from './database';

// Get current origin dynamically
const getRedirectUrl = () => {
     return import.meta.env.VITE_APP_URL || 'https://tregu-platform.vercel.app';
   };

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: getRedirectUrl()
      }
    });

    if (error) throw error;

    if (data.user) {
      try {
        await upsertUserProfile(data.user.id, {
          id: data.user.id,
          email: email,
          name: name,
          free_listing_used: false,
          listing_count: 0,
          is_verified: false,
          role: 'user'
        } as any);
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return data;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const redirectUrl = getRedirectUrl();
    
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

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Get session error:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};
