import React, { useState } from 'react';
import { Category, User, ListingType, Listing } from '../types';
import { CATEGORIES } from '../constants';
import { generateDescription, checkSpam } from '../services/geminiService';
import { saveListing, saveUser } from '../services/storage';
import { Loader2, AlertCircle, Check, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Input, Select, Card, SectionHeader, Badge } from '../components/DesignSystem';

interface CreateListingProps {
  currentUser: User;
  onSuccess: () => void;
  onUpdateUser: (u: User) => void;
}

const CreateListing: React.FC<CreateListingProps> = ({ currentUser, onSuccess, onUpdateUser }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    price: '',
    currency: 'EUR',
    location: '',
    description: '',
    images: [] as string[],
  });

  const [selectedPlan, setSelectedPlan] = useState<ListingType>(ListingType.STANDARD);
  const isFree = currentUser.listingCount === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.location) {
      setError('Input title and location required for AI generation.');
      return;
    }
    setIsLoadingAI(true);
    setError('');
    const desc = await generateDescription(formData.title, formData.category as Category, formData.location);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsLoadingAI(false);
  };

  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if(!formData.title || !formData.description || !formData.price) {
        setError('All fields are mandatory.');
        return;
    }

    const isSpam = await checkSpam(formData.description + " " + formData.title);
    if (isSpam) {
        setError("Content flagged as spam. Request denied.");
        return;
    }

    if (isFree) {
        finishCreation(ListingType.STANDARD);
    } else {
        setStep(2);
    }
  };

  const finishCreation = (type: ListingType) => {
      setIsProcessing(true);
      setTimeout(() => {
          const newListing: Listing = {
              id: uuidv4(),
              userId: currentUser.id,
              title: formData.title,
              description: formData.description,
              price: Number(formData.price),
              currency: formData.currency as 'LEK' | 'EUR',
              category: formData.category as Category,
              location: formData.location,
              images: formData.images.length > 0 ? formData.images : ['https://picsum.photos/600/400'],
              createdAt: new Date().toISOString(),
              type: type,
              views: 0,
              contactClicks: 0,
              status: 'active'
          };

          saveListing(newListing);
          const updatedUser = { ...currentUser, listingCount: currentUser.listingCount + 1 };
          saveUser(updatedUser); 
          onUpdateUser(updatedUser);
          setIsProcessing(false);
          onSuccess();
      }, 1500);
  };

  if (step === 2) {
      return (
          <div className="max-w-4xl mx-auto py-20 px-6">
              <SectionHeader title="Select Protocol" subtitle="Payment Required" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <Card 
                    onClick={() => setSelectedPlan(ListingType.STANDARD)}
                    className={`p-8 cursor-pointer ${selectedPlan === ListingType.STANDARD ? 'border-white bg-white/5' : 'border-border'}`}
                  >
                      <div className="flex justify-between items-start mb-6">
                          <h3 className="text-2xl font-light uppercase">Standard</h3>
                          <span className="font-mono text-xl">100 LEK</span>
                      </div>
                      <ul className="space-y-4 font-mono text-xs text-secondary">
                          <li className="flex items-center"><Check size={14} className="mr-2 text-white"/> 30 Days Visibility</li>
                          <li className="flex items-center"><Check size={14} className="mr-2 text-white"/> Basic Search Indexing</li>
                      </ul>
                  </Card>

                  <Card 
                    onClick={() => setSelectedPlan(ListingType.FEATURED)}
                    className={`p-8 cursor-pointer ${selectedPlan === ListingType.FEATURED ? 'border-accent bg-accent/10' : 'border-border'}`}
                  >
                      <div className="flex justify-between items-start mb-6">
                          <h3 className="text-2xl font-light uppercase text-accent">Featured</h3>
                          <span className="font-mono text-xl text-accent">500 LEK</span>
                      </div>
                       <ul className="space-y-4 font-mono text-xs text-secondary">
                          <li className="flex items-center"><Check size={14} className="mr-2 text-white"/> Priority Placement</li>
                          <li className="flex items-center"><Check size={14} className="mr-2 text-white"/> Highlighting</li>
                          <li className="flex items-center"><Check size={14} className="mr-2 text-white"/> 3x Traffic Boost</li>
                      </ul>
                  </Card>
              </div>

              <Button 
                onClick={() => finishCreation(selectedPlan)}
                disabled={isProcessing}
                className="w-full"
              >
                  {isProcessing ? <Loader2 className="animate-spin mr-2" /> : null}
                  AUTHORIZE PAYMENT
              </Button>
              <button onClick={() => setStep(1)} className="w-full mt-6 text-xs font-mono text-secondary hover:text-white uppercase tracking-widest">Abort</button>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <SectionHeader title="New Entry" subtitle={isFree ? "Fee Waived (First Entry)" : "Standard Protocol"} />

      <form onSubmit={handleSubmitStep1} className="space-y-12">
        {error && (
            <div className="border border-red-500/50 bg-red-500/10 text-red-200 p-4 text-xs font-mono flex items-center">
                <AlertCircle size={16} className="mr-2" /> {error}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
                <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Title</label>
                    <Input name="title" value={formData.title} onChange={handleChange} placeholder="EX: VEHICLE MODEL X" required />
                </div>
                <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Category</label>
                    <Select name="category" value={formData.category} onChange={handleChange}>
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-surface">{c}</option>)}
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Price</label>
                         <Input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" required />
                    </div>
                     <div>
                         <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Currency</label>
                         <Select name="currency" value={formData.currency} onChange={handleChange}>
                            <option value="LEK" className="bg-surface">LEK</option>
                            <option value="EUR" className="bg-surface">EUR</option>
                        </Select>
                    </div>
                </div>
            </div>
            
            <div className="space-y-8">
                 <div>
                     <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Location</label>
                     <Input name="location" value={formData.location} onChange={handleChange} placeholder="CITY, DISTRICT" required />
                </div>
                <div>
                     <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary">Description</label>
                        <button type="button" onClick={handleGenerateDescription} disabled={isLoadingAI} className="text-[10px] uppercase font-mono text-accent hover:text-white flex items-center">
                            {isLoadingAI ? <Loader2 size={10} className="animate-spin mr-1"/> : <Sparkles size={10} className="mr-1"/>} Auto-Gen
                        </button>
                     </div>
                    <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        className="w-full bg-surface border-b border-border px-0 py-2 text-white placeholder-secondary focus:outline-none focus:border-white transition-colors font-mono text-sm resize-none"
                        placeholder="ENTER DETAILS..."
                        required
                    />
                </div>
            </div>
        </div>

        <div>
             <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-4">Assets</label>
             <div className="flex items-center gap-4">
                 <label className="cursor-pointer w-32 h-32 border border-dashed border-border hover:border-white flex flex-col items-center justify-center text-secondary hover:text-white transition-colors">
                     <span className="text-2xl font-thin">+</span>
                     <span className="text-[10px] font-mono uppercase mt-2">Upload</span>
                     <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </label>
                 {formData.images.map((img, idx) => (
                     <div key={idx} className="w-32 h-32 border border-border overflow-hidden relative group">
                         <img src={img} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition" alt="preview" />
                     </div>
                 ))}
             </div>
        </div>

        <div className="pt-12 flex justify-end">
              <Button type="submit" disabled={isLoadingAI}>
                  Proceed
              </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateListing;