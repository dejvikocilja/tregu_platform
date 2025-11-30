import React, { useEffect, useState } from 'react';
import { User, Listing, ListingType } from '../types';
import { getUserListings, deleteListing as deleteListingFromDB, updateListing } from '../services/database';
import { getListingStats } from '../services/storage';
import { Edit2, Trash2, BarChart2, Loader2, AlertCircle, Zap, Check } from 'lucide-react';
import StatsChart from '../components/StatsChart';
import { SectionHeader, Card, Button, Badge } from '../components/DesignSystem';
import EditListing from './EditListing';

interface DashboardProps {
  currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [boostingId, setBoostingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostListingId, setBoostListingId] = useState<string | null>(null);

  useEffect(() => {
    loadUserListings();
  }, [currentUser.id]);

  const loadUserListings = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('📊 Loading user listings from Supabase...');
      const listings = await getUserListings(currentUser.id);
      console.log(`✅ Loaded ${listings.length} listings for user`);
      setMyListings(listings);
    } catch (err: any) {
      console.error('❌ Failed to load listings:', err);
      setError(err.message || 'Failed to load your listings. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if(!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeletingId(id);
    setError('');
    
    try {
      console.log(`🗑️ Deleting listing ${id}...`);
      await deleteListingFromDB(id);
      console.log('✅ Listing deleted successfully');
      setMyListings(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      console.error('❌ Failed to delete listing:', err);
      setError(err.message || 'Failed to delete listing. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBoostClick = (listingId: string) => {
    setBoostListingId(listingId);
    setShowBoostModal(true);
  };

  const handleBoostConfirm = async () => {
    if (!boostListingId) return;
    
    setBoostingId(boostListingId);
    setShowBoostModal(false);
    setError('');
    
    try {
      console.log(`⚡ Boosting listing ${boostListingId}...`);
      await updateListing(boostListingId, { is_boosted: true } as any);
      console.log('✅ Listing boosted successfully');
      
      // Update local state
      setMyListings(prev => prev.map(l => 
        l.id === boostListingId 
          ? { ...l, type: ListingType.FEATURED }
          : l
      ));
      
      alert('✅ Listing boosted successfully! It will now appear as featured.');
    } catch (err: any) {
      console.error('❌ Failed to boost listing:', err);
      setError(err.message || 'Failed to boost listing. Please try again.');
    } finally {
      setBoostingId(null);
      setBoostListingId(null);
    }
  };

  const handleEditSuccess = () => {
    setEditingId(null);
    loadUserListings();
  };

  if (editingId) {
    return (
      <EditListing 
        listingId={editingId}
        currentUser={currentUser}
        onSuccess={handleEditSuccess}
        onCancel={() => setEditingId(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto py-20 px-6 md:px-12">
        <SectionHeader title="Control Panel" subtitle={`User: ${currentUser.name}`} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-white" size={40} />
            <p className="font-mono text-secondary uppercase text-sm">Loading Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Boost Modal */}
      {showBoostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-8">
            <h3 className="text-2xl font-light uppercase mb-4">Boost Listing</h3>
            <p className="text-sm text-secondary mb-6">
              Boosting your listing will feature it at the top of search results and give it 3x more visibility. This costs 500 LEK.
            </p>
            <div className="flex gap-4">
              <Button onClick={handleBoostConfirm} className="flex-1">
                <Zap size={16} className="mr-2" /> Boost for 500 LEK
              </Button>
              <Button variant="outline" onClick={() => setShowBoostModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto py-20 px-6 md:px-12">
        <SectionHeader title="Control Panel" subtitle={`User: ${currentUser.name}`} />

        {error && (
          <div className="mb-8 border border-red-500/50 bg-red-500/10 text-red-200 p-4 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" /> 
              {error}
            </div>
            <button onClick={() => setError('')} className="text-red-200 hover:text-white">✕</button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Total Listings</div>
            <div className="text-4xl font-light">{myListings.length}</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Active Listings</div>
            <div className="text-4xl font-light">{myListings.filter(l => l.status === 'active').length}</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Total Views</div>
            <div className="text-4xl font-light">{myListings.reduce((sum, l) => sum + l.views, 0)}</div>
          </Card>
        </div>

        {/* Listings */}
        {myListings.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border">
            <div className="mb-4">
              <div className="w-20 h-20 mx-auto mb-4 border border-border flex items-center justify-center text-4xl text-secondary">📦</div>
              <p className="font-mono text-secondary uppercase mb-2 text-sm">No Active Listings</p>
              <p className="text-sm text-secondary/70 max-w-md mx-auto">
                You haven't created any listings yet. Use the "Create Listing" button in the navigation menu to post your first ad.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {myListings.map(listing => {
              const stats = getListingStats(listing.id);
              const isDeleting = deletingId === listing.id;
              const isBoosting = boostingId === listing.id;
              const isFeatured = listing.type === ListingType.FEATURED;
              
              return (
                <Card key={listing.id} className="p-0 overflow-hidden">
                  <div className="flex flex-col md:flex-row border-b border-border">
                    {/* Image Snippet */}
                    <div className="w-full md:w-48 h-48 bg-surfaceHighlight flex-shrink-0">
                      {listing.images[0] ? (
                        <img 
                          src={listing.images[0]} 
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition" 
                          alt={listing.title}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-secondary font-mono text-xs">NO IMAGE</div>
                      )}
                    </div>
                    
                    {/* Main Info */}
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-light uppercase">{listing.title}</h3>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge active={listing.status === 'active'}>{listing.status}</Badge>
                            {isFeatured && <Badge active>Featured</Badge>}
                            <Badge>{listing.category}</Badge>
                          </div>
                          <div className="mt-4 text-xl font-light">
                            {listing.price.toLocaleString('sq-AL')} {listing.currency}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="px-4 py-2 text-[10px]"
                            onClick={() => setEditingId(listing.id)}
                          >
                            <Edit2 size={14} className="mr-1" /> Edit
                          </Button>
                          
                          {!isFeatured && (
                            <Button 
                              variant="outline" 
                              className="px-4 py-2 text-[10px] border-accent text-accent hover:bg-accent/10"
                              onClick={() => handleBoostClick(listing.id)}
                              disabled={isBoosting}
                            >
                              {isBoosting ? (
                                <Loader2 size={14} className="animate-spin mr-1" />
                              ) : (
                                <Zap size={14} className="mr-1" />
                              )}
                              Boost
                            </Button>
                          )}
                          
                          <button 
                            onClick={() => handleDelete(listing.id, listing.title)}
                            disabled={isDeleting}
                            className="p-3 border border-border hover:bg-red-900/20 hover:border-red-500 hover:text-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-8 font-mono text-xs text-secondary flex-wrap">
                        <span>ID: {listing.id.substring(0,8)}</span>
                        <span>Views: {listing.views}</span>
                        <span>Clicks: {listing.contactClicks}</span>
                        <span>Created: {new Date(listing.createdAt).toLocaleDateString('sq-AL')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Analytics Dropdown */}
                  <div className="p-6 bg-surfaceHighlight/5">
                    <div className="flex items-center mb-4 gap-2">
                      <BarChart2 size={14} className="text-secondary" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-secondary">
                        Analytics Stream (7D) - Mock Data
                      </span>
                    </div>
                    <div className="h-40">
                      <StatsChart stats={stats} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
