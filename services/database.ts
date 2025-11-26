import { supabase } from './supabase';
import { Listing, Category, ListingType } from '../types';

// ============================================
// LISTINGS
// ============================================

export const getListings = async () => {
  console.log('🔍 Fetching listings from Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('is_boosted', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching listings:', error);
      throw error;
    }
    
    console.log(`✅ Successfully fetched ${data?.length || 0} listings`);
    
    // Transform data to match frontend Listing type
    const transformedData = (data || []).map(listing => ({
      id: listing.id,
      userId: listing.user_id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      currency: listing.currency,
      category: listing.category as Category,
      location: listing.location,
      images: listing.images || [],
      createdAt: listing.created_at,
      type: listing.is_boosted ? ListingType.FEATURED : ListingType.STANDARD,
      views: listing.views || 0,
      contactClicks: listing.contact_clicks || 0,
      status: listing.status
    }));
    
    return transformedData;
  } catch (error) {
    console.error('❌ Fatal error in getListings:', error);
    return [];
  }
};

export const getListing = async (listingId: string) => {
  console.log(`🔍 Fetching listing ${listingId}...`);
  
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching listing:', error);
      throw error;
    }
    
    console.log('✅ Successfully fetched listing');
    return data;
  } catch (error) {
    console.error('❌ Fatal error in getListing:', error);
    throw error;
  }
};

export const getUserListings = async (userId: string) => {
  console.log(`🔍 Fetching listings for user ${userId}...`);
  
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching user listings:', error);
      throw error;
    }
    
    console.log(`✅ Successfully fetched ${data?.length || 0} user listings`);
    
    // Transform data to match frontend Listing type
    const transformedData = (data || []).map(listing => ({
      id: listing.id,
      userId: listing.user_id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      currency: listing.currency,
      category: listing.category as Category,
      location: listing.location,
      images: listing.images || [],
      createdAt: listing.created_at,
      type: listing.is_boosted ? ListingType.FEATURED : ListingType.STANDARD,
      views: listing.views || 0,
      contactClicks: listing.contact_clicks || 0,
      status: listing.status
    }));
    
    return transformedData;
  } catch (error) {
    console.error('❌ Fatal error in getUserListings:', error);
    return [];
  }
};

export const createListing = async (listingData: {
  user_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  location: string;
  images: string[];
  is_boosted?: boolean;
}) => {
  console.log('📝 Creating new listing...', listingData);
  
  try {
    const { data, error } = await supabase
      .from('listings')
      .insert({
        user_id: listingData.user_id,
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        currency: listingData.currency,
        category: listingData.category,
        location: listingData.location,
        images: listingData.images,
        is_boosted: listingData.is_boosted || false,
        status: 'active',
        views: 0,
        contact_clicks: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating listing:', error);
      throw error;
    }
    
    console.log('✅ Successfully created listing:', data.id);
    
    // Update user's listing count
    await incrementUserListingCount(listingData.user_id);
    
    return data;
  } catch (error) {
    console.error('❌ Fatal error in createListing:', error);
    throw error;
  }
};

export const updateListing = async (listingId: string, updates: any) => {
  console.log(`📝 Updating listing ${listingId}...`);
  
  try {
    const { data, error } = await supabase
      .from('listings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating listing:', error);
      throw error;
    }
    
    console.log('✅ Successfully updated listing');
    return data;
  } catch (error) {
    console.error('❌ Fatal error in updateListing:', error);
    throw error;
  }
};

export const deleteListing = async (listingId: string) => {
  console.log(`🗑️ Deleting listing ${listingId}...`);
  
  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);
    
    if (error) {
      console.error('❌ Error deleting listing:', error);
      throw error;
    }
    
    console.log('✅ Successfully deleted listing');
  } catch (error) {
    console.error('❌ Fatal error in deleteListing:', error);
    throw error;
  }
};

export const incrementViews = async (listingId: string) => {
  try {
    const { error } = await supabase
      .from('listings')
      .update({ views: supabase.raw('views + 1') })
      .eq('id', listingId);
    
    if (error) console.error('Error incrementing views:', error);
  } catch (error) {
    console.error('Fatal error incrementing views:', error);
  }
};

export const incrementContactClicks = async (listingId: string) => {
  try {
    const { error } = await supabase
      .from('listings')
      .update({ contact_clicks: supabase.raw('contact_clicks + 1') })
      .eq('id', listingId);
    
    if (error) console.error('Error incrementing contact clicks:', error);
  } catch (error) {
    console.error('Fatal error incrementing contact clicks:', error);
  }
};

// ============================================
// USERS
// ============================================

export const getUserProfile = async (userId: string) => {
  console.log(`🔍 Fetching user profile ${userId}...`);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching user profile:', error);
      throw error;
    }
    
    console.log('✅ Successfully fetched user profile');
    return data;
  } catch (error) {
    console.error('❌ Fatal error in getUserProfile:', error);
    throw error;
  }
};

export const upsertUserProfile = async (userId: string, profile: any) => {
  console.log(`📝 Upserting user profile ${userId}...`);
  
  try {
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
    
    if (error) {
      console.error('❌ Error upserting user profile:', error);
      throw error;
    }
    
    console.log('✅ Successfully upserted user profile');
    return data;
  } catch (error) {
    console.error('❌ Fatal error in upsertUserProfile:', error);
    throw error;
  }
};

const incrementUserListingCount = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        listing_count: supabase.raw('listing_count + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error incrementing user listing count:', error);
    }
  } catch (error) {
    console.error('Fatal error incrementing listing count:', error);
  }
};

// ============================================
// CATEGORIES (for future use)
// ============================================

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};
