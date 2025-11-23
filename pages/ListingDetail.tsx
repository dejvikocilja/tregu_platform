import React, { useState, useEffect } from 'react';
import { Listing, User } from '../types';
import { getListings, getUsers, updateListing } from '../services/storage';
import { Card, Button, Badge, SectionHeader } from '../components/DesignSystem';
import { 
  MapPin, 
  Calendar, 
  Eye, 
  Phone, 
  Mail, 
  Share2, 
  Heart,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  User as UserIcon,
  Shield
} from 'lucide-react';

interface ListingDetailProps {
  listingId: string;
  onBack: () => void;
  currentUser: User | null;
}

const ListingDetail: React.FC<ListingDetailProps> = ({ listingId, onBack, currentUser }) => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);

  useEffect(() => {
    // Load listing
    const listings = getListings();
    const found = listings.find(l => l.id === listingId);
    if (found) {
      setListing(found);
      
      // Increment views
      const updated = { ...found, views: found.views + 1 };
      updateListing(updated);
      
      // Load seller info
      const users = getUsers();
      const sellerInfo = users.find(u => u.id === found.userId);
      setSeller(sellerInfo || null);
      
      // Load related listings (same category, different listing)
      const related = listings
        .filter(l => l.category === found.category && l.id !== found.id && l.status === 'active')
        .slice(0, 3);
      setRelatedListings(related);
    }
  }, [listingId]);

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-secondary uppercase text-sm">SIGNAL LOST</p>
          <Button onClick={onBack} variant="outline" className="mt-4">Return</Button>
        </div>
      </div>
    );
  }

  const handleContactClick = () => {
    setShowContact(true);
    const updated = { ...listing, contactClicks: listing.contactClicks + 1 };
    updateListing(updated);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-secondary hover:text-white mb-12 transition-colors"
        >
          <ChevronLeft size={16} /> Return to Index
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN - Images & Gallery */}
          <div className="lg:col-span-7">
            
            {/* Main Image Viewer */}
            <div className="relative aspect-[4/3] bg-surfaceHighlight mb-4 overflow-hidden group">
              {listing.images.length > 0 ? (
                <>
                  <img 
                    src={listing.images[currentImageIndex]} 
                    alt={listing.title}
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  
                  {/* Image Navigation */}
                  {listing.images.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="text-white" />
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="text-white" />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 text-xs font-mono text-white border border-white/20">
                        {currentImageIndex + 1} / {listing.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-secondary font-mono text-sm">NO VISUAL DATA</span>
                </div>
              )}
              
              {/* Featured Badge */}
              {listing.type === 'I Theksuar' && (
                <div className="absolute top-4 left-4">
                  <Badge active>Featured</Badge>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? 'border-white' : 'border-border hover:border-white/50'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description Section */}
            <Card className="p-8 mt-8">
              <h3 className="text-xl font-light uppercase tracking-tight mb-4 border-b border-border pb-4">
                Technical Specifications
              </h3>
              <p className="text-sm leading-relaxed text-secondary whitespace-pre-wrap">
                {listing.description}
              </p>
            </Card>

            {/* Metadata */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-border p-4">
                <div className="flex items-center gap-2 text-secondary text-xs font-mono uppercase mb-2">
                  <Eye size={12} /> Views
                </div>
                <div className="text-2xl font-light">{listing.views}</div>
              </div>
              <div className="border border-border p-4">
                <div className="flex items-center gap-2 text-secondary text-xs font-mono uppercase mb-2">
                  <Phone size={12} /> Contacts
                </div>
                <div className="text-2xl font-light">{listing.contactClicks}</div>
              </div>
              <div className="border border-border p-4">
                <div className="flex items-center gap-2 text-secondary text-xs font-mono uppercase mb-2">
                  <Calendar size={12} /> Listed
                </div>
                <div className="text-xs font-mono">
                  {new Date(listing.createdAt).toLocaleDateString('sq-AL')}
                </div>
              </div>
              <div className="border border-border p-4">
                <div className="flex items-center gap-2 text-secondary text-xs font-mono uppercase mb-2">
                  <MapPin size={12} /> Location
                </div>
                <div className="text-xs font-mono">
                  {listing.location}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Purchase Info & Actions */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32 space-y-6">
              
              {/* Title & Price Card */}
              <Card className="p-8">
                <div className="mb-6">
                  <Badge>{listing.category}</Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-light uppercase tracking-tight leading-tight mb-6">
                  {listing.title}
                </h1>

                <div className="border-t border-border pt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-light tracking-tighter">
                      {listing.price.toLocaleString('sq-AL')}
                    </span>
                    <span className="text-2xl text-secondary font-mono">
                      {listing.currency}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Seller Info Card */}
              {seller && (
                <Card className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-surfaceHighlight border border-border flex items-center justify-center">
                      <UserIcon size={24} className="text-secondary" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium">{seller.name}</h3>
                        {seller.isVerified && (
                          <Shield size={16} className="text-accent" />
                        )}
                      </div>
                      <p className="text-xs font-mono text-secondary uppercase">
                        Member since {new Date(seller.joinedDate).getFullYear()}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-secondary mb-4">
                    <span className="uppercase">Active Listings:</span> {seller.listingCount}
                  </div>

                  {!showContact ? (
                    <Button 
                      onClick={handleContactClick}
                      className="w-full"
                    >
                      <Phone size={16} className="mr-2" /> Reveal Contact
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-surfaceHighlight border border-accent p-4">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase text-secondary mb-2">
                          <Mail size={12} /> Email
                        </div>
                        <a 
                          href={`mailto:${seller.email}`}
                          className="text-sm underline hover:text-accent transition-colors"
                        >
                          {seller.email}
                        </a>
                      </div>
                      <div className="bg-surfaceHighlight border border-accent p-4">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase text-secondary mb-2">
                          <Phone size={12} /> Phone (Demo)
                        </div>
                        <a 
                          href="tel:+355691234567"
                          className="text-sm underline hover:text-accent transition-colors"
                        >
                          +355 69 123 4567
                        </a>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={() => setIsFavorited(!isFavorited)}
                  variant={isFavorited ? "primary" : "outline"}
                  className="flex-1"
                >
                  <Heart size={16} className={`mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Saved' : 'Save'}
                </Button>
                <Button 
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1"
                >
                  <Share2 size={16} className="mr-2" /> Share
                </Button>
              </div>

              {/* Report */}
              <button className="w-full flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest text-secondary hover:text-red-500 py-3 border border-border hover:border-red-500/50 transition-colors">
                <AlertTriangle size={12} /> Report Listing
              </button>
            </div>
          </div>
        </div>

        {/* Related Listings Section */}
        {relatedListings.length > 0 && (
          <div className="mt-24">
            <SectionHeader 
              title="Related Signals" 
              subtitle={`More from ${listing.category}`} 
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedListings.map(related => (
                <Card 
                  key={related.id}
                  className="p-0 cursor-pointer group overflow-hidden"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-surfaceHighlight">
                    <img 
                      src={related.images[0]} 
                      alt={related.title}
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-mono text-secondary mb-2">{related.category}</div>
                    <h4 className="text-lg font-medium uppercase mb-2 line-clamp-2 group-hover:underline">
                      {related.title}
                    </h4>
                    <div className="text-xl font-light">
                      {related.price.toLocaleString('sq-AL')} {related.currency}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDetail;
