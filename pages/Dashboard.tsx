import React, { useEffect, useState } from 'react';
import { User, Listing } from '../types';
import { getUserListings, deleteListing as deleteListingFromDB } from '../services/database';
import { getListingStats } from '../services/storage';
import { Edit2, Trash2, BarChart2, Loader2, AlertCircle } from 'lucide-react';
import StatsChart from '../components/StatsChart';
import { SectionHeader, Card, Button, Badge } from '../components/DesignSystem';

interface DashboardProps {
  currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
          
          // Update local state
          setMyListings(prev => prev.filter(l => l.id !== id));
      } catch (err: any) {
          console.error('❌ Failed to delete listing:', err);
          setError(err.message || 'Failed to delete listing. Please try again.');
      } finally {
          setDeletingId(null);
      }
  };

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
    <div className="max-w-[1600px] mx-auto py-20 px-6 md:px-12">
      <SectionHeader title="Control Panel" subtitle={`User: ${currentUser.name}`} />

      {error && (
          <div className="mb-8 border border-red-500/50 bg-red-500/10 text-red-200 p-4 text-xs font-mono flex items-center justify-between">
              <div className="flex items-center">
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" /> 
                  {error}
              </div>
              <button 
                  onClick={() => setError('')}
                  className="text-red-200 hover:text-white"
              >
                  ✕
              </button>
          </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
              <div className="text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">
                  Total Listings
              </div>
              <div className="text-4xl font-light">{myListings.length}</div>
          </Card>
          
          <Card className="p-6">
              <div className="text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">
                  Active Listings
              </div>
              <div className="text-4xl font-light">
                  {myListings.filter(l => l.status === 'active').length}
              </div>
          </Card>
          
          <Card className="p-6">
              <div className="text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">
                  Total Views
              </div>
              <div className="text-4xl font-light">
                  {myListings.reduce((sum, l) => sum + l.views, 0)}
              </div>
          </Card>
      </div>

      {/* Listings */}
      {myListings.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border">
              <p className="font-mono text-secondary uppercase mb-4">No Active Signals</p>
              <p className="text-sm text-secondary mb-6">You haven't created any listings yet.</p>
              <Button onClick={() => window.location.href = '#create'}>
                  Create Your First Listing
              </Button>
          </div>
      ) : (
          <div className="grid grid-cols-1 gap-8">
              {myListings.map(listing => {
                  const stats = getListingStats(listing.id);
                  const isDeleting = deletingId === listing.id;
                  
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
                                     <div className="w-full h-full flex items-center justify-center text-secondary font-mono text-xs">
                                         NO IMAGE
                                     </div>
                                 )}
                             </div>
                             
                             {/* Main Info */}
                             <div className="p-6 flex-grow flex flex-col justify-between">
                                 <div className="flex justify-between items-start">
                                     <div>
                                         <h3 className="text-2xl font-light uppercase">{listing.title}</h3>
                                         <div className="flex gap-2 mt-2 flex-wrap">
                                             <Badge active={listing.status === 'active'}>{listing.status}</Badge>
                                             {listing.type === 'I Theksuar' && <Badge active>Featured</Badge>}
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
                                            onClick={() => alert('Edit functionality coming in Phase 1, Task 1.3')}
                                        >
                                            <Edit2 size={14} className="mr-1" /> Edit
                                        </Button>
                                        <button 
                                            onClick={() => handleDelete(listing.id, listing.title)}
                                            disabled={isDeleting}
                                            className="p-3 border border-border hover:bg-red-900/20 hover:border-red-500 hover:text-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isDeleting ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
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
  );
};

export default Dashboard;
