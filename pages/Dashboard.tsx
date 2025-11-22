import React, { useEffect, useState } from 'react';
import { User, Listing } from '../types';
import { getListings, deleteListing, getListingStats } from '../services/storage';
import { Edit2, Trash2, BarChart2 } from 'lucide-react';
import StatsChart from '../components/StatsChart';
import { SectionHeader, Card, Button, Badge } from '../components/DesignSystem';

interface DashboardProps {
  currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [myListings, setMyListings] = useState<Listing[]>([]);

  useEffect(() => {
    const all = getListings();
    setMyListings(all.filter(l => l.userId === currentUser.id));
  }, [currentUser.id]);

  const handleDelete = (id: string) => {
      if(window.confirm('Confirm deletion protocol?')) {
          deleteListing(id);
          setMyListings(prev => prev.filter(l => l.id !== id));
      }
  }

  return (
    <div className="max-w-[1600px] mx-auto py-20 px-6 md:px-12">
      <SectionHeader title="Control Panel" subtitle={`User: ${currentUser.name}`} />

      {myListings.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border">
              <p className="font-mono text-secondary uppercase">No active signals</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 gap-8">
              {myListings.map(listing => {
                  const stats = getListingStats(listing.id);
                  
                  return (
                    <Card key={listing.id} className="p-0 overflow-hidden">
                        <div className="flex flex-col md:flex-row border-b border-border">
                             {/* Image Snippet */}
                             <div className="w-full md:w-48 h-48 bg-surfaceHighlight flex-shrink-0">
                                 <img src={listing.images[0]} className="w-full h-full object-cover grayscale hover:grayscale-0 transition" />
                             </div>
                             
                             {/* Main Info */}
                             <div className="p-6 flex-grow flex flex-col justify-between">
                                 <div className="flex justify-between items-start">
                                     <div>
                                         <h3 className="text-2xl font-light uppercase">{listing.title}</h3>
                                         <div className="flex gap-2 mt-2">
                                             <Badge active={listing.status === 'active'}>{listing.status}</Badge>
                                             {listing.type === 'I Theksuar' && <Badge active>Featured</Badge>}
                                         </div>
                                     </div>
                                     <div className="flex gap-2">
                                        <Button variant="outline" className="px-4 py-2 text-[10px]">Edit</Button>
                                        <button onClick={() => handleDelete(listing.id)} className="p-3 border border-border hover:bg-red-900/20 hover:border-red-500 hover:text-red-500 transition">
                                            <Trash2 size={16} />
                                        </button>
                                     </div>
                                 </div>
                                 <div className="mt-4 flex gap-8 font-mono text-xs text-secondary">
                                     <span>ID: {listing.id.substring(0,8)}</span>
                                     <span>Views: {stats.impressionCount}</span>
                                     <span>Clicks: {listing.contactClicks}</span>
                                 </div>
                             </div>
                        </div>
                        
                        {/* Analytics Dropdown (Always visible for now) */}
                        <div className="p-6 bg-surfaceHighlight/5">
                             <div className="flex items-center mb-4 gap-2">
                                 <BarChart2 size={14} className="text-secondary" />
                                 <span className="text-[10px] font-mono uppercase tracking-widest text-secondary">Analytics Stream (7D)</span>
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