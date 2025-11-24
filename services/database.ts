import { supabase } from './supabase';

// Get all active listings
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

// Get a single listing
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

// Get user's listings
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

// Create listing
export const createListing = async (listing: any) => {
  const { data, error } = await supabase
    .from('listings')
    .insert(listing)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Update listing
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

// Delete listing
export const deleteListing = async (listingId: string) => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId);
  
  if (error) throw error;
};

// Increment views
export const incrementViews = async (listingId: string) => {
  const { error } = await supabase.rpc('increment_views', {
    listing_id: listingId
  });
  
  if (error) console.error('Error incrementing views:', error);
};

// Increment contact clicks
export const incrementContactClicks = async (listingId: string) => {
  const { error } = await supabase.rpc('increment_contact_clicks', {
    listing_id: listingId
  });
  
  if (error) console.error('Error incrementing contact clicks:', error);
};

// Get categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return data || [];
};
// Get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Create or update user profile
export const upsertUserProfile = async (userId: string, profile: any) => {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      ...profile,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
