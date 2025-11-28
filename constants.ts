import { Category } from './types';

/**
 * Available listing categories
 */
export const CATEGORIES = Object.values(Category);

/**
 * Disposable email domains to block during registration
 * Helps prevent spam and fake accounts
 */
export const DISPOSABLE_DOMAINS = [
  'tempmail.com',
  'throwawaymail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'maildrop.cc'
];

/**
 * Albanian cities for location suggestions
 */
export const ALBANIAN_CITIES = [
  'Tiranë',
  'Durrës',
  'Vlorë',
  'Shkodër',
  'Elbasan',
  'Fier',
  'Korçë',
  'Berat',
  'Lushnjë',
  'Kavajë',
  'Pogradec',
  'Laç',
  'Kukës',
  'Lezhë',
  'Sarandë',
  'Gjirokastër'
];

/**
 * Currency symbols for display
 */
export const CURRENCY_SYMBOLS = {
  LEK: 'L',
  EUR: '€'
} as const;

/**
 * Listing status options
 */
export const LISTING_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SOLD: 'sold',
  EXPIRED: 'expired'
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
} as const;
