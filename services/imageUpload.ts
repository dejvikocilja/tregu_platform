import { supabase } from './supabase';

/**
 * Upload image to Supabase Storage
 * Returns public URL of uploaded image
 */
export const uploadImage = async (file: File, listingId?: string): Promise<string> => {
  try {
    console.log('📤 Uploading image to Supabase Storage...');
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${listingId || 'temp'}_${timestamp}_${randomString}.${fileExt}`;
    const filePath = `listings/${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filePath);
    
    console.log('✅ Image uploaded successfully:', publicUrl);
    return publicUrl;
    
  } catch (error: any) {
    console.error('❌ Image upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple images
 */
export const uploadImages = async (files: File[], listingId?: string): Promise<string[]> => {
  console.log(`📤 Uploading ${files.length} images...`);
  
  const uploadPromises = files.map(file => uploadImage(file, listingId));
  
  try {
    const urls = await Promise.all(uploadPromises);
    console.log(`✅ All ${urls.length} images uploaded successfully`);
    return urls;
  } catch (error) {
    console.error('❌ Failed to upload some images:', error);
    throw error;
  }
};

/**
 * Delete image from Supabase Storage
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/listing-images\/(.+)/);
    
    if (!pathMatch) {
      console.warn('⚠️ Could not extract file path from URL:', imageUrl);
      return;
    }
    
    const filePath = pathMatch[1];
    
    console.log('🗑️ Deleting image:', filePath);
    
    const { error } = await supabase.storage
      .from('listing-images')
      .remove([filePath]);
    
    if (error) {
      console.error('❌ Error deleting image:', error);
      throw error;
    }
    
    console.log('✅ Image deleted successfully');
    
  } catch (error: any) {
    console.error('❌ Delete image error:', error);
    // Don't throw - deletion failure shouldn't block other operations
  }
};

/**
 * Delete multiple images
 */
export const deleteImages = async (imageUrls: string[]): Promise<void> => {
  console.log(`🗑️ Deleting ${imageUrls.length} images...`);
  
  const deletePromises = imageUrls.map(url => deleteImage(url));
  await Promise.all(deletePromises);
  
  console.log('✅ All images deleted');
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' 
    };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'File too large. Maximum size is 5MB.' 
    };
  }
  
  return { valid: true };
};
