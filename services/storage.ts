/**
 * storage.ts - Pure Supabase implementation
 * This file now delegates all operations to database.ts
 * Keeping it for backwards compatibility with existing imports
 */

import { 
  getListings as getSupabaseListings,
  getUserListings as getSupabaseUserListings,
  createListing as createSupabaseListing,
  deleteListing as deleteSupabaseListing,
  updateListingStats
} from './database';
import { Listing, User, ListingStats } from '../types';

// Re-export database functions
export const getListings = getSupabaseListings;
export const getUserListings = getSupabaseUserListings;
export const saveListing = createSupabaseListing;
export const deleteListing = deleteSupabaseListing;

/**
 * @deprecated Use database.ts functions directly
 * Keeping for backwards compatibility
 */
export const updateListing = async (listing: Listing) => {
  console.warn('⚠️ updateListing from storage.ts is deprecated. Use database.ts instead.');
  await updateListingStats(listing.id, {
    views: listing.views,
    contact_clicks: listing.contactClicks
  });
};

/**
 * Generate mock stats for dashboard
 * TODO: Implement real analytics in Supabase
 */
export const getListingStats = (listingId: string): ListingStats => {
  const days = 7;
  const history = [];
  
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - i));
    history.push({
      date: d.toLocaleDateString('sq-AL', { weekday: 'short' }),
      views: Math.floor(Math.random() * 50) + 5
    });
  }
  
  return {
    listingId,
    viewsHistory: history,
    avgCategoryPosition: Math.floor(Math.random() * 10) + 1,
    impressionCount: Math.floor(Math.random() * 5000) + 500
  };
};

// Remove all localStorage-based functions
// These are no longer needed with pure Supabase

/**
 * @deprecated No longer using localStorage
 */
export const getUsers = (): User[] => {
  console.warn('⚠️ getUsers from localStorage is deprecated. Use database.ts getUserProfile instead.');
  return [];
};

/**
 * @deprecated No longer using localStorage
 */
export const saveUser = (user: User) => {
  console.warn('⚠️ saveUser to localStorage is deprecated. Use database.ts upsertUserProfile instead.');
};

/**
 * @deprecated No longer using localStorage for auth
 */
export const getCurrentUser = (): User | null => {
  console.warn('⚠️ getCurrentUser from localStorage is deprecated. Use auth.ts getCurrentSession instead.');
  return null;
};

/**
 * @deprecated No longer using localStorage for auth
 */
export const loginUserMock = (email: string): User | null => {
  console.warn('⚠️ loginUserMock is deprecated. Use auth.ts signInWithEmail instead.');
  return null;
};

/**
 * @deprecated No longer using localStorage for auth
 */
export const logoutUserMock = () => {
  console.warn('⚠️ logoutUserMock is deprecated. Use auth.ts signOut instead.');
};
