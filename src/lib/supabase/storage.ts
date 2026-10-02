import { supabase, isSupabaseConfigured } from './client';

const PROFILE_AVATAR_BUCKET = 'profile-avatars';
const MAX_PROFILE_AVATAR_SIZE = 5 * 1024 * 1024;
const PROFILE_AVATAR_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function uploadProfileAvatar(file: File): Promise<{ path?: string; error?: string }> {
  if (!PROFILE_AVATAR_TYPES[file.type]) {
    return { error: 'Choose a JPG, PNG, WEBP, or GIF image.' };
  }
  if (file.size > MAX_PROFILE_AVATAR_SIZE) {
    return { error: 'The image must be 5 MB or smaller.' };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { error: 'Your secure setup session has expired. Request a new setup link.' };

    const path = `${user.id}/${crypto.randomUUID()}.${PROFILE_AVATAR_TYPES[file.type]}`;
    const { error } = await supabase.storage
      .from(PROFILE_AVATAR_BUCKET)
      .upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: false });

    if (error) return { error: error.message };
    return { path };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Profile picture upload failed.' };
  }
}

export async function removeProfileAvatar(path: string): Promise<void> {
  await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([path]);
}

export async function getProfileAvatarUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const { data, error } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .createSignedUrl(path, 60 * 60);
  return error ? null : data.signedUrl;
}

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
