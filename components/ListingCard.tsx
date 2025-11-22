import React from 'react';
import { Listing, ListingType } from '../types';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { Card, Badge } from './DesignSystem';

interface ListingCardProps {
  listing: Listing;
  onClick: (id: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
  const isFeatured = listing.type === ListingType.FEATURED;

  return (
    <div 
      onClick={() => onClick(listing.id)}
      className="group cursor-pointer w-full"
    >
      {/* Image Area - Strict Aspect Ratio */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surfaceHighlight mb-4">
        {listing.images.length > 0 ? (
          <img 
            src={listing.images[0]} 
            alt={listing.title} 
            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-out transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary font-mono text-xs">
            NO SIGNAL
          </div>
        )}
        
        {/* Overlay Info - Reveals on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
              <ArrowUpRight className="text-black" />
           </div>
        </div>

        {isFeatured && (
          <div className="absolute top-4 left-4">
            <Badge active>Featured</Badge>
          </div>
        )}
      </div>

      {/* Metadata - Minimalist */}
      <div className="flex flex-col gap-1 border-t border-border pt-3 group-hover:border-white transition-colors duration-500">
        <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] uppercase tracking-widest text-secondary">{listing.category}</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-secondary">{new Date(listing.createdAt).toLocaleDateString()}</span>
        </div>
        
        <h3 className="text-lg font-medium leading-snug uppercase tracking-tight line-clamp-2 group-hover:underline decoration-1 underline-offset-4">
          {listing.title}
        </h3>

        <div className="mt-2 flex justify-between items-end">
            <div className="text-xl font-light tracking-tighter">
               {listing.price.toLocaleString('sq-AL')} {listing.currency}
            </div>
            <div className="flex items-center text-secondary text-xs font-mono">
                <MapPin size={10} className="mr-1" /> {listing.location}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;