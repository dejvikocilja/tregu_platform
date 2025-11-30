import { supabase } from './supabase';
import { Listing, Category, ListingType } from '../types';

// Retry helper with exponential backoff
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i); // Exponential backoff
        console.warn(`Retry ${i + 1}/${maxRetries} after error. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
};

/**
 * Get all active listings from database
 */
export const getListings = async (): Promise<Listing[]> => {
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
      throw new Error(`Failed to fetch listings: ${error.message}`);
    }
    
    console.log(`✅ Successfully fetched ${data?.length || 0} listings`);
    
    return transformListings(data || []);
  });
};

/**
 * Get a single listing by ID
 */
export const getListingById = async (listingId: string): Promise<Listing | null> => {
  console.log(`🔍 Fetching listing ${listingId}...`);
  
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ Listing not found');
        return null;
      }
      throw new Error(`Failed to fetch listing: ${error.message}`);
    }
    
    console.log('✅ Listing fetched successfully');
    
    const transformed = transformListings([data]);
    return transformed[0];
  });
};

/**
 * Get listings for a specific user
 */
export const getUserListings = async (userId: string): Promise<Listing[]> => {
  console.log(`🔍 Fetching listings for user ${userId}...`);
  
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching user listings:', error);
      throw new Error(`Failed to fetch user listings: ${error.message}`);
    }
    
    console.log(`✅ Successfully fetched ${data?.length || 0} user listings`);
    
    return transformListings(data || []);
  });
};

/**
 * Create a new listing
 */
export const createListing = async (listingData: {
  user_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  location: string;
  phone: string;
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
        phone: listingData.phone,
        images: listingData.images,
        is_boosted: listingData.is_boosted || false,
        status: 'active',
        views: 0,
        contact_clicks: 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating listing:', error);
      throw new Error(`Failed to create listing: ${error.message}`);
    }
    
    console.log('✅ Successfully created listing:', data.id);
    
    // Increment user listing count
    await incrementUserListingCount(listingData.user_id);
    
    return data;
  });
};

/**
 * Update listing stats (views, contact clicks)
 */
export const updateListingStats = async (
  listingId: string, 
  stats: { views?: number; contact_clicks?: number }
) => {
  console.log(`📊 Updating stats for listing ${listingId}...`);
  
  return retryOperation(async () => {
    const updateData: any = {};
    if (stats.views !== undefined) updateData.views = stats.views;
    if (stats.contact_clicks !== undefined) updateData.contact_clicks = stats.contact_clicks;
    
    const { error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', listingId);
    
    if (error) {
      console.error('❌ Error updating listing stats:', error);
      throw new Error(`Failed to update listing stats: ${error.message}`);
    }
    
    console.log('✅ Successfully updated listing stats');
  });
};

/**
 * Increment view count for a listing
 */
export const incrementListingViews = async (listingId: string) => {
  console.log(`👁️ Incrementing views for listing ${listingId}...`);
  
  try {
    const { error } = await supabase.rpc('increment_listing_views', {
      listing_id: listingId
    });
    
    if (error) {
      // Fallback: manual increment if RPC doesn't exist
      console.warn('⚠️ RPC function not found, using fallback method');
      const { data } = await supabase
        .from('listings')
        .select('views')
        .eq('id', listingId)
        .single();
      
      if (data) {
        await supabase
          .from('listings')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', listingId);
      }
    }
    
    console.log('✅ Views incremented');
  } catch (error) {
    console.error('❌ Error incrementing views:', error);
    // Don't throw - this is not critical
  }
};

/**
 * Increment contact clicks for a listing
 */
export const incrementContactClicks = async (listingId: string) => {
  console.log(`📞 Incrementing contact clicks for listing ${listingId}...`);
  
  try {
    const { error } = await supabase.rpc('increment_contact_clicks', {
      listing_id: listingId
    });
    
    if (error) {
      // Fallback: manual increment
      console.warn('⚠️ RPC function not found, using fallback method');
      const { data } = await supabase
        .from('listings')
        .select('contact_clicks')
        .eq('id', listingId)
        .single();
      
      if (data) {
        await supabase
          .from('listings')
          .update({ contact_clicks: (data.contact_clicks || 0) + 1 })
          .eq('id', listingId);
      }
    }
    
    console.log('✅ Contact clicks incremented');
  } catch (error) {
    console.error('❌ Error incrementing contact clicks:', error);
    // Don't throw - this is not critical
  }
};

/**
 * Update listing details
 */
export const updateListing = async (
  listingId: string,
  updates: Partial<{
    title: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    location: string;
    phone: string;
    images: string[];
    status: string;
  }>
) => {
  console.log(`📝 Updating listing ${listingId}...`);
  
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listingId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating listing:', error);
      throw new Error(`Failed to update listing: ${error.message}`);
    }
    
    console.log('✅ Listing updated successfully');
    return data;
  });
};

/**
 * Delete a listing
 */
export const deleteListing = async (listingId: string) => {
  console.log(`🗑️ Deleting listing ${listingId}...`);
  
  return retryOperation(async () => {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);
    
    if (error) {
      console.error('❌ Error deleting listing:', error);
      throw new Error(`Failed to delete listing: ${error.message}`);
    }
    
    console.log('✅ Successfully deleted listing');
  });
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  console.log(`🔍 Fetching user profile ${userId}...`);
  
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching user profile:', error);
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
    
    console.log('✅ Successfully fetched user profile');
    return data;
  });
};

/**
 * Create or update user profile
 */
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
    
    if (error) {
      console.error('❌ Error upserting user profile:', error);
      throw new Error(`Failed to upsert user profile: ${error.message}`);
    }
    
    console.log('✅ Successfully upserted user profile');
    return data;
  });
};

/**
 * Increment user listing count
 */
const incrementUserListingCount = async (userId: string) => {
  try {
    const { error } = await supabase.rpc('increment_user_listing_count', { 
      user_id: userId 
    });
    
    if (error) {
      // Fallback: manual increment
      console.warn('⚠️ RPC function not found, using fallback method');
      const { data } = await supabase
        .from('users')
        .select('listing_count')
        .eq('id', userId)
        .single();
      
      if (data) {
        await supabase
          .from('users')
          .update({ listing_count: (data.listing_count || 0) + 1 })
          .eq('id', userId);
      }
    }
    
    console.log('✅ User listing count incremented');
  } catch (error) {
    console.error('❌ Error incrementing listing count:', error);
    // Don't throw - user profile can be updated later
  }
};

/**
 * Transform database rows to Listing objects
 */
const transformListings = (data: any[]): Listing[] => {
  return data.map(listing => ({
    id: listing.id,
    userId: listing.user_id,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    currency: listing.currency as 'LEK' | 'EUR',
    category: listing.category as Category,
    location: listing.location,
    phone: listing.phone,
    images: listing.images || [],
    createdAt: listing.created_at,
    type: listing.is_boosted ? ListingType.FEATURED : ListingType.STANDARD,
    views: listing.views || 0,
    contactClicks: listing.contact_clicks || 0,
    status: listing.status as 'active' | 'pending' | 'sold'
  }));
};
