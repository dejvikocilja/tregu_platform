import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing, User, Category } from '../types';
import { CATEGORIES, ALBANIAN_CITIES } from '../constants';
import { getListingById, updateListing } from '../services/database';
import { uploadImage, validateImageFile } from '../services/imageUpload';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { Button, Select, Card, SectionHeader } from '../components/DesignSystem';

interface EditListingProps {
  listingId: string;
  currentUser: User;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditListing: React.FC<EditListingProps> = ({ listingId, currentUser, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    price: '',
    currency: 'EUR',
    location: '',
    phone: '',
    description: '',
    images: [] as string[],
    imageFiles: [] as File[],
    existingImages: [] as string[],
  });

  useEffect(() => {
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    try {
      const listing = await getListingById(listingId);
      if (!listing) {
        setError('Listing not found');
        return;
      }
      
      setFormData({
        title: listing.title,
        category: listing.category,
        price: listing.price.toString(),
        currency: listing.currency,
        location: listing.location,
        phone: listing.phone,
        description: listing.description,
        images: [],
        imageFiles: [],
        existingImages: listing.images,
      });
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load listing');
      setIsLoading(false);
    }
  };

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

  const handleRemoveNewImage = (idx: number) => {
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
  };

  const handleRemoveExistingImage = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      let uploadedImageUrls: string[] = [...formData.existingImages];
      
      if (formData.imageFiles.length > 0) {
        setSuccess('📤 Uploading new images...');
        for (const file of formData.imageFiles) {
          const url = await uploadImage(file);
          uploadedImageUrls.push(url);
        }
      }
      
      setSuccess('📝 Updating listing...');
      
      await updateListing(listingId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        currency: formData.currency,
        category: formData.category,
        location: formData.location,
        phone: formData.phone.trim(),
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ['https://picsum.photos/600/400'],
      });

      formData.images.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      
      setSuccess('✅ Listing updated successfully!');
      setTimeout(() => onSuccess(), 1500);
      
    } catch (err: any) {
      console.error('❌ Failed:', err);
      setError(err.message || 'Failed to update listing.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-white" size={40} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <SectionHeader title="Edit Listing" subtitle="Update your listing details" />

      <form onSubmit={handleSubmit} className="space-y-12">
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
              <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Title *</label>
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
              <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Category *</label>
              <Select name="category" value={formData.category} onChange={handleChange} disabled={isProcessing}>
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-surface">{c}</option>)}
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Price *</label>
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
                <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Currency *</label>
                <Select name="currency" value={formData.currency} onChange={handleChange} disabled={isProcessing}>
                  <option value="LEK" className="bg-surface">LEK</option>
                  <option value="EUR" className="bg-surface">EUR</option>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Location *</label>
              <Select name="location" value={formData.location} onChange={handleChange} required disabled={isProcessing}>
                <option value="" className="bg-surface">Select City</option>
                {ALBANIAN_CITIES.map(city => (
                  <option key={city} value={city} className="bg-surface">{city}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Phone Number *</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+355 69 123 4567" 
                required 
                disabled={isProcessing}
                className="w-full bg-surface border-b border-border px-0 py-4 text-white placeholder-secondary focus:outline-none focus:border-white transition-colors duration-300 font-mono text-sm"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Description *</label>
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
          <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-4">Images</label>
          
          {/* Existing Images */}
          {formData.existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-mono text-secondary mb-2">EXISTING IMAGES</p>
              <div className="flex items-center gap-4 flex-wrap">
                {formData.existingImages.map((img, idx) => (
                  <div key={idx} className="w-32 h-32 border border-border overflow-hidden relative group">
                    <img src={img} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition" alt={`existing ${idx + 1}`} />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isProcessing}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          <div className="flex items-center gap-4 flex-wrap">
            <label className={`cursor-pointer w-32 h-32 border border-dashed border-border hover:border-white flex flex-col items-center justify-center text-secondary hover:text-white transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span className="text-2xl font-thin">+</span>
              <span className="text-[10px] font-mono uppercase mt-2">Add New</span>
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
                <img src={img} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition" alt={`new ${idx + 1}`} />
                <button
                  type="button"
                  onClick={() => handleRemoveNewImage(idx)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isProcessing}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-12 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Updating...
              </>
            ) : (
              'Update Listing'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditListing;
