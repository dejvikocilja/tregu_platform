import React, { useState } from 'react';
import { Category, User, ListingType } from '../types';
import { CATEGORIES, ALBANIAN_CITIES } from '../constants';
import { checkSpam } from '../services/geminiService';
import { createListing } from '../services/database';
import { uploadImage, validateImageFile } from '../services/imageUpload';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { Button, Select, Card, SectionHeader } from '../components/DesignSystem';

interface CreateListingProps {
  currentUser: User;
  onSuccess: () => void;
  onUpdateUser: (u: User) => void;
}

const CreateListing: React.FC<CreateListingProps> = ({ currentUser, onSuccess, onUpdateUser }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    price: '',
    currency: 'EUR',
    location: '',
    description: '',
    images: [] as string[],
    imageFiles: [] as File[],
  });

  const [selectedPlan, setSelectedPlan] = useState<ListingType>(ListingType.STANDARD);
  const isFree = currentUser.listingCount === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setError(validation.error || 'Invalid image');
          return;
        }
        
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, previewUrl],
          imageFiles: [...prev.imageFiles, file]
        }));
        setError('');
    }
  };

  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if(!formData.title.trim()) {
        setError('Title is required.');
        return;
    }
    
    if(!formData.description.trim()) {
        setError('Description is required.');
        return;
    }
    
    if(!formData.price || Number(formData.price) <= 0) {
        setError('Please enter a valid price.');
        return;
    }
    
    if(!formData.location.trim()) {
        setError('Location is required.');
        return;
    }

    try {
      const isSpam = await checkSpam(formData.description + " " + formData.title);
      if (isSpam) {
          setError("⚠️ Content flagged as inappropriate. Please review your listing.");
          return;
      }
    } catch (err) {
      console.warn('Spam check failed, proceeding anyway');
    }

    if (isFree) {
        finishCreation(ListingType.STANDARD);
    } else {
        setStep(2);
    }
  };

  const finishCreation = async (type: ListingType) => {
      setIsProcessing(true);
      setError('');
      setSuccess('');
      
      try {
          let uploadedImageUrls: string[] = [];
          
          if (formData.imageFiles.length > 0) {
            setSuccess('📤 Uploading images...');
            for (const file of formData.imageFiles) {
              const url = await uploadImage(file);
              uploadedImageUrls.push(url);
            }
          }
          
          setSuccess('📝 Creating listing...');
          
          const newListing = await createListing({
              user_id: currentUser.id,
              title: formData.title.trim(),
              description: formData.description.trim(),
              price: Number(formData.price),
              currency: formData.currency as 'LEK' | 'EUR',
              category: formData.category,
              location: formData.location.trim(),
              images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ['https://picsum.photos/600/400'],
              is_boosted: type === ListingType.FEATURED
          });

          const updatedUser = { 
            ...currentUser, 
            listingCount: currentUser.listingCount + 1 
          };
          onUpdateUser(updatedUser);
          
          formData.images.forEach(url => {
            if (url.startsWith('blob:')) URL.revokeObjectURL(url);
          });
          
          setSuccess('✅ Listing created successfully!');
          setTimeout(() => onSuccess(), 1500);
          
      } catch (err: any) {
          console.error('❌ Failed:', err);
          setError(err.message || 'Failed to create listing.');
          setIsProcessing(false);
      }
  };

  if (step === 2) {
      return (
          <div className="max-w-4xl mx-auto py-20 px-6">
              <SectionHeader title="Select Protocol" subtitle="Payment Required" />
              
              {error && (
                <div className="bg-red-900/20 text-red-400 p-4 text-xs font-mono border border-red-900/50 mb-8 flex items-center">
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <Card 
                    onClick={() => setSelectedPlan(ListingType.STANDARD)}
                    className={`p-8 cursor-pointer transition-all ${selectedPlan === ListingType.STANDARD ? 'border-white bg-white/5' : 'border-border hover:border-white/50'}`}
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
                    className={`p-8 cursor-pointer transition-all ${selectedPlan === ListingType.FEATURED ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'}`}
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
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Creating Listing...
                    </>
                  ) : (
                    'AUTHORIZE PAYMENT'
                  )}
              </Button>
              
              <button 
                onClick={() => setStep(1)} 
                className="w-full mt-6 text-xs font-mono text-secondary hover:text-white uppercase tracking-widest transition-colors"
                disabled={isProcessing}
              >
                ← Back to Edit
              </button>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <SectionHeader 
        title="New Entry" 
        subtitle={isFree ? "🎉 First Listing Free!" : "Standard Protocol"} 
      />

      <form onSubmit={handleSubmitStep1} className="space-y-12">
        {error && (
            <div className="border border-red-500/50 bg-red-500/10 text-red-200 p-4 text-xs font-mono flex items-center">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {error}
            </div>
        )}
        
        {success && (
            <div className="border border-green-500/50 bg-green-500/10 text-green-200 p-4 text-xs font-mono flex items-center">
                <Check size={16} className="mr-2 flex-shrink-0" /> {success}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
                <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">
                      Title *
                    </label>
                    <input 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      placeholder="EX: VEHICLE MODEL X" 
                      required 
                      disabled={isProcessing}
                      className="w-full bg-surface border-b border-border px-0 py-4 text-white placeholder-secondary focus:outline-none focus:border-white transition-colors duration-300 font-mono text-sm"
                    />
                </div>
                
                <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">
                      Category *
                    </label>
                    <Select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleChange}
                      disabled={isProcessing}
                    >
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-surface">{c}</option>)}
                    </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">
                           Price *
                         </label>
                         <input 
                           type="number" 
                           name="price" 
                           value={formData.price} 
                           onChange={handleChange} 
                           placeholder="0.00" 
                           min="0"
                           step="0.01"
                           required 
                           disabled={isProcessing}
                           className="w-full bg-surface border-b border-border px-0 py-4 text-white placeholder-secondary focus:outline-none focus:border-white transition-colors duration-300 font-mono text-sm"
                         />
                    </div>
                     <div>
                         <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">
                           Currency *
                         </label>
                         <Select 
                           name="currency" 
                           value={formData.currency} 
                           onChange={handleChange}
                           disabled={isProcessing}
                         >
                            <option value="LEK" className="bg-surface">LEK</option>
                            <option value="EUR" className="bg-surface">EUR</option>
                        </Select>
                    </div>
                </div>
            </div>
            
            <div className="space-y-8">
                <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">
                      Location *
                    </label>
                    <Select 
                      name="location" 
                      value={formData.location} 
                      onChange={handleChange}
                      required 
                      disabled={isProcessing}
                    >
                        <option value="" className="bg-surface">Select City</option>
                        {ALBANIAN_CITIES.map(city => (
                          <option key={city} value={city} className="bg-surface">{city}</option>
                        ))}
                    </Select>
                </div>
                
                <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">
                      Description *
                    </label>
                    <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        className="w-full bg-surface border-b border-border px-0 py-2 text-white placeholder-secondary focus:outline-none focus:border-white transition-colors font-mono text-sm resize-none disabled:opacity-50"
                        placeholder="ENTER DETAILS..."
                        required
                        disabled={isProcessing}
                    />
                </div>
            </div>
        </div>

        <div>
             <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-4">
               Images (Optional)
             </label>
             <div className="flex items-center gap-4 flex-wrap">
                 <label className={`cursor-pointer w-32 h-32 border border-dashed border-border hover:border-white flex flex-col items-center justify-center text-secondary hover:text-white transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                     <span className="text-2xl font-thin">+</span>
                     <span className="text-[10px] font-mono uppercase mt-2">Upload</span>
                     <input 
                       type="file" 
                       className="hidden" 
                       accept="image/*" 
                       onChange={handleImageUpload}
                       disabled={isProcessing}
                     />
                 </label>
                 {formData.images.map((img, idx) => (
                     <div key={idx} className="w-32 h-32 border border-border overflow-hidden relative group">
                         <img src={img} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition" alt={`preview ${idx + 1}`} />
                         <button
                           type="button"
                           onClick={() => {
                             const updatedImages = formData.images.filter((_, i) => i !== idx);
                             const updatedFiles = formData.imageFiles.filter((_, i) => i !== idx);
                             if (formData.images[idx].startsWith('blob:')) {
                               URL.revokeObjectURL(formData.images[idx]);
                             }
                             setFormData(prev => ({ 
                               ...prev, 
                               images: updatedImages,
                               imageFiles: updatedFiles
                             }));
                           }}
                           className="absolute top-2 right-2 bg-red-500 text-white p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                           disabled={isProcessing}
                         >
                           ✕
                         </button>
                     </div>
                 ))}
             </div>
             <p className="mt-2 text-[10px] font-mono text-secondary">
               Maximum 5 images, 5MB each. Supported: JPG, PNG, WebP
             </p>
        </div>

        <div className="pt-12 flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.history.back()}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isProcessing}
              >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Processing...
                    </>
                  ) : (
                    'Continue →'
                  )}
              </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateListing;
