import { Category, Listing, ListingType, User } from './types';

export const CATEGORIES = Object.values(Category);

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    email: 'admin@tregu.al',
    name: 'Admin',
    joinedDate: '2023-01-01',
    listingCount: 0,
    isVerified: true,
    role: 'admin'
  },
  {
    id: 'u2',
    email: 'user@example.com',
    name: 'Arben D.',
    joinedDate: '2023-05-15',
    listingCount: 2,
    isVerified: true,
    role: 'user'
  }
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'l1',
    userId: 'u2',
    title: 'Shitet Golf 7 1.6 TDI',
    description: 'Shes Golf 7 në gjendje perfekte. Viti 2015, naftë, manual. 180,000 km origjinale. Mund të kontrollohet kudo.',
    price: 11500,
    currency: 'EUR',
    category: Category.AUTOMJETE,
    location: 'Tiranë',
    images: ['https://picsum.photos/600/400?random=1', 'https://picsum.photos/600/400?random=2'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    type: ListingType.FEATURED,
    views: 1240,
    contactClicks: 45,
    status: 'active'
  },
  {
    id: 'l2',
    userId: 'u2',
    title: 'Apartament 2+1 te Astiri',
    description: 'Jepet me qera apartament 2+1, i mobiluar totalisht. Kati 4 me ashensor. Preferohen familjare.',
    price: 400,
    currency: 'EUR',
    category: Category.BANESA,
    location: 'Tiranë, Astir',
    images: ['https://picsum.photos/600/400?random=3'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    type: ListingType.STANDARD,
    views: 850,
    contactClicks: 20,
    status: 'active'
  },
  {
    id: 'l3',
    userId: 'u3',
    title: 'Iphone 13 Pro Max',
    description: 'Shitet Iphone 13 Pro Max 128GB. Ngjyra Sierra Blue. Bateria 92%. I ardhur nga Amerika.',
    price: 750,
    currency: 'EUR',
    category: Category.ELEKTRONIKA,
    location: 'Durrës',
    images: ['https://picsum.photos/600/400?random=4'],
    createdAt: new Date().toISOString(),
    type: ListingType.STANDARD,
    views: 120,
    contactClicks: 5,
    status: 'active'
  },
    {
    id: 'l4',
    userId: 'u4',
    title: 'Kërkojmë Kamarier/e',
    description: 'Bar Kafe ne qender te Vlores kerkon kamarier/e me experience. Puna me turne. Paga e kenaqshme.',
    price: 50000,
    currency: 'LEK',
    category: Category.PUNE,
    location: 'Vlorë',
    images: ['https://picsum.photos/600/400?random=5'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    type: ListingType.STANDARD,
    views: 300,
    contactClicks: 12,
    status: 'active'
  }
];

export const DISPOSABLE_DOMAINS = ['tempmail.com', 'throwawaymail.com', '10minutemail.com'];