export enum Category {
  AUTOMJETE = 'Automjete',
  BANESA = 'Banesa',
  ELEKTRONIKA = 'Elektronika',
  SHERBIME = 'Shërbime',
  PUNE = 'Punë',
  PAJISJE_SHTEPIE = 'Pajisje Shtëpie',
  TE_TJERA = 'Të tjera',
}

export enum ListingType {
  STANDARD = 'Standard',
  FEATURED = 'I Theksuar', // Monetized
}

export interface User {
  id: string;
  email: string;
  name: string;
  joinedDate: string;
  listingCount: number;
  isVerified: boolean;
  role: 'user' | 'admin';
}

export interface Listing {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  currency: 'LEK' | 'EUR';
  category: Category;
  location: string;
  images: string[];
  createdAt: string;
  type: ListingType;
  views: number;
  contactClicks: number;
  status: 'active' | 'pending' | 'sold';
}

export interface ListingStats {
  listingId: string;
  viewsHistory: { date: string; views: number }[];
  avgCategoryPosition: number;
  impressionCount: number;
}

export type PageView = 'HOME' | 'LOGIN' | 'REGISTER' | 'CREATE_LISTING' | 'DASHBOARD' | 'LISTING_DETAIL' | 'ADMIN';