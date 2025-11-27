import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Button, Select, Badge } from './DesignSystem';
import { Category, ListingType } from '../types';
import { CATEGORIES } from '../constants';

export interface FilterOptions {
  category: string;
  minPrice: string;
  maxPrice: string;
  currency: 'ALL' | 'LEK' | 'EUR';
  location: string;
  listingType: 'ALL' | ListingType.STANDARD | ListingType.FEATURED;
  sortBy: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'popular';
}

interface AdvancedFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ 
  isOpen, 
  onClose, 
  onApply, 
  currentFilters 
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  useEffect(() => {
    const changed = JSON.stringify(filters) !== JSON.stringify(currentFilters);
    setHasChanges(changed);
  }, [filters, currentFilters]);

  const handleChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      category: 'Të gjitha',
      minPrice: '',
      maxPrice: '',
      currency: 'ALL',
      location: '',
      listingType: 'ALL',
      sortBy: 'newest'
    };
    setFilters(defaultFilters);
    onApply(defaultFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category !== 'Të gjitha') count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.currency !== 'ALL') count++;
    if (filters.location) count++;
    if (filters.listingType !== 'ALL') count++;
    if (filters.sortBy !== 'newest') count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - HIGHEST Z-INDEX */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Filter Panel - EVEN HIGHER */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-surface border-l border-border z-[9999] overflow-y-auto transform transition-transform duration-500 ease-out">
        
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={20} className="text-white" />
            <h2 className="text-2xl font-light uppercase tracking-tight">Advanced Filter</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surfaceHighlight transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Active Filters Count */}
        {getActiveFilterCount() > 0 && (
          <div className="px-6 py-4 bg-accent/10 border-b border-accent/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-accent">
                {getActiveFilterCount()} Active Filter{getActiveFilterCount() > 1 ? 's' : ''}
              </span>
              <button 
                onClick={handleReset}
                className="text-xs font-mono uppercase text-secondary hover:text-white flex items-center gap-2"
              >
                <Trash2 size={12} /> Clear All
              </button>
            </div>
          </div>
        )}

        {/* Filter Options */}
        <div className="p-6 space-y-8">
          
          {/* Category */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-3">
              Category / Department
            </label>
            <Select 
              value={filters.category} 
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="Të gjitha">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-3">
              Price Range
            </label>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <input 
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleChange('minPrice', e.target.value)}
                className="w-full bg-surface border-b border-border px-0 py-3 text-white placeholder-secondary focus:outline-none focus:border-white transition-colors font-mono text-sm"
              />
              <input 
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
                className="w-full bg-surface border-b border-border px-0 py-3 text-white placeholder-secondary focus:outline-none focus:border-white transition-colors font-mono text-sm"
              />
            </div>
            <Select 
              value={filters.currency}
              onChange={(e) => handleChange('currency', e.target.value as any)}
            >
              <option value="ALL">All Currencies</option>
              <option value="LEK">LEK</option>
              <option value="EUR">EUR</option>
            </Select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-3">
              Location
            </label>
            <input 
              type="text"
              placeholder="City, Region..."
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full bg-surface border-b border-border px-0 py-3 text-white placeholder-secondary focus:outline-none focus:border-white transition-colors font-mono text-sm"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {['Tiranë', 'Durrës', 'Vlorë', 'Shkodër', 'Elbasan'].map(city => (
                <button
                  key={city}
                  onClick={() => handleChange('location', city)}
                  className={`px-3 py-1 text-[10px] font-mono uppercase tracking-widest border transition-colors ${
                    filters.location === city 
                      ? 'bg-white text-black border-white' 
                      : 'bg-transparent text-secondary border-secondary hover:text-white hover:border-white'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-3">
              Listing Type
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio"
                  name="listingType"
                  value="ALL"
                  checked={filters.listingType === 'ALL'}
                  onChange={(e) => handleChange('listingType', e.target.value)}
                  className="w-4 h-4 accent-white"
                />
                <span className="text-sm group-hover:text-white transition-colors">All Listings</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio"
                  name="listingType"
                  value={ListingType.STANDARD}
                  checked={filters.listingType === ListingType.STANDARD}
                  onChange={(e) => handleChange('listingType', e.target.value)}
                  className="w-4 h-4 accent-white"
                />
                <span className="text-sm group-hover:text-white transition-colors">Standard Only</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio"
                  name="listingType"
                  value={ListingType.FEATURED}
                  checked={filters.listingType === ListingType.FEATURED}
                  onChange={(e) => handleChange('listingType', e.target.value)}
                  className="w-4 h-4 accent-white"
                />
                <span className="text-sm group-hover:text-white transition-colors flex items-center gap-2">
                  Featured Only
                  <Badge active>Premium</Badge>
                </span>
              </label>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-3">
              Sort By
            </label>
            <Select 
              value={filters.sortBy}
              onChange={(e) => handleChange('sortBy', e.target.value as any)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </Select>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-surface border-t border-border p-6 space-y-3">
          <Button 
            onClick={handleApply}
            className="w-full"
            disabled={!hasChanges}
          >
            Apply Filters
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdvancedFilter;
