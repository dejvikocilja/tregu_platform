import { supabase } from './supabase';
import { upsertUserProfile } from './database';

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      },
      emailRedirectTo: 'https://tregu-platform.vercel.app'
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
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const redirectUrl = 'https://tregu-platform.vercel.app';
  
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
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};
