import { supabase, isSupabaseConfigured } from './client';

/**
 * Uploads a product image to Supabase Storage (bucket: 'product-images').
 * Uses the authenticated user's session (Manager only via RLS).
 * Never exposes service-role credentials.
 * Falls back to local data URL if Supabase is not configured.
 */
export async function uploadProductImage(
  file: File,
  sku: string
): Promise<{ url?: string; error?: string }> {
  if (!isSupabaseConfigured) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ url: reader.result as string });
      };
      reader.onerror = () => {
        resolve({ error: 'Failed to read local image file.' });
      };
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanSku = sku.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${cleanSku}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { url: data.publicUrl };
  } catch (err: any) {
    return { error: err.message || 'Image upload failed.' };
  }
}
