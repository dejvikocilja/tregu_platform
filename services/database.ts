import { supabase } from './supabase';
import { Listing, Category, ListingType } from '../types';

// Retry helper
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.warn(`Retry ${i + 1}/${maxRetries} after error:`, error);
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
};

export const getListings = async () => {
  console.log('🔍 Fetching listings from Supabase...');
  
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('is_boosted', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('❌ Error fetching listings:', error);
      throw error;
    }
    
    console.log(`✅ Successfully fetched ${data?.length || 0} listings`);
    
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
  });
};

export const getUserListings = async (userId: string) => {
  console.log(`🔍 Fetching listings for user ${userId}...`);
  
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ Successfully fetched ${data?.length || 0} user listings`);
    
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
  });
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
  console.log('📝 Creating new listing...');
  
  return retryOperation(async () => {
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
        contact_clicks: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Successfully created listing:', data.id);
    await incrementUserListingCount(listingData.user_id);
    return data;
  });
};

export const deleteListing = async (listingId: string) => {
  console.log(`🗑️ Deleting listing ${listingId}...`);
  
  return retryOperation(async () => {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);
    
    if (error) throw error;
    console.log('✅ Successfully deleted listing');
  });
};

export const getUserProfile = async (userId: string) => {
  console.log(`🔍 Fetching user profile ${userId}...`);
  
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    console.log('✅ Successfully fetched user profile');
    return data;
  });
};

export const upsertUserProfile = async (userId: string, profile: any) => {
  console.log(`📝 Upserting user profile ${userId}...`);
  
  return retryOperation(async () => {
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
    console.log('✅ Successfully upserted user profile');
    return data;
  });
};

const incrementUserListingCount = async (userId: string) => {
  try {
    await supabase.rpc('increment_user_listing_count', { user_id: userId });
  } catch (error) {
    console.error('Error incrementing listing count:', error);
  }
};
