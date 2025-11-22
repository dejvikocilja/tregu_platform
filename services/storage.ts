import { Listing, User, ListingStats } from '../types';
import { MOCK_LISTINGS, MOCK_USERS } from '../constants';

const KEYS = {
  USERS: 'tregu_users',
  LISTINGS: 'tregu_listings',
  CURRENT_USER: 'tregu_current_user',
};

// Initialize
if (!localStorage.getItem(KEYS.LISTINGS)) {
  localStorage.setItem(KEYS.LISTINGS, JSON.stringify(MOCK_LISTINGS));
}
if (!localStorage.getItem(KEYS.USERS)) {
  localStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
}

export const getListings = (): Listing[] => {
  const data = localStorage.getItem(KEYS.LISTINGS);
  return data ? JSON.parse(data) : [];
};

export const getUsers = (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
};

export const saveListing = (listing: Listing) => {
  const listings = getListings();
  listings.unshift(listing); // Add to top
  localStorage.setItem(KEYS.LISTINGS, JSON.stringify(listings));
};

export const updateListing = (listing: Listing) => {
    const listings = getListings();
    const index = listings.findIndex(l => l.id === listing.id);
    if (index !== -1) {
        listings[index] = listing;
        localStorage.setItem(KEYS.LISTINGS, JSON.stringify(listings));
    }
}

export const deleteListing = (id: string) => {
    const listings = getListings().filter(l => l.id !== id);
    localStorage.setItem(KEYS.LISTINGS, JSON.stringify(listings));
}

export const saveUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const loginUserMock = (email: string): User | null => {
  const users = getUsers();
  const user = users.find((u) => u.email === email);
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }
  return null;
};

export const logoutUserMock = () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
};

// Generate random stats for the dashboard
export const getListingStats = (listingId: string): ListingStats => {
    // In a real app, this comes from DB aggregation
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
}