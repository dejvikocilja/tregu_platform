import { supabase } from './supabase';

export const getListings = async () => {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      users:user_id (name, email, is_verified),
      categories:category_id (name, slug)
    `)
    .eq('status', 'active')
    .order('is_boosted', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getListing = async (listingId: string) => {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      users:user_id (name, email, phone, is_verified, created_at),
      categories:category_id (name, slug)
    `)
    .eq('id', listingId)
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserListings = async (userId: string) => {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      categories:category_id (name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createListing = async (listing: any) => {
  const { data, error } = await supabase
    .from('listings')
    .insert(listing)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateListing = async (listingId: string, updates: any) => {
  const { data, error } = await supabase
    .from('listings')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', listingId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteListing = async (listingId: string) => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId);
  
  if (error) throw error;
};

export const incrementViews = async (listingId: string) => {
  const { error } = await supabase.rpc('increment_views', {
    listing_id: listingId
  });
  
  if (error) console.error('Error incrementing views:', error);
};

export const incrementContactClicks = async (listingId: string) => {
  const { error } = await supabase.rpc('increment_contact_clicks', {
    listing_id: listingId
  });
  
  if (error) console.error('Error incrementing contact clicks:', error);
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const upsertUserProfile = async (userId: string, profile: any) => {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: profile.email,
      name: profile.name,
      phone: profile.phone || null,
      avatar_url: profile.avatar_url || null,
      location: profile.location || null,
      free_listing_used: profile.free_listing_used || false,
      listing_count: profile.listing_count || 0,
      is_verified: profile.is_verified || false,
      role: profile.role || 'user',
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
