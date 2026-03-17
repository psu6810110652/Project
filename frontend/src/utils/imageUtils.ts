/**
 * Utility to optimize images using Supabase Image Transformation
 * This helps reduce Egress usage and improves loading speed.
 */

// Supabase project ID from .env (extracted from URL)
const SUPABASE_PROJECT_ID = 'angtncgvvwwdqescopxq';
const SUPABASE_STORAGE_URL_PATTERN = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/`;
const SUPABASE_RENDER_URL_PATTERN = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/render/image/public/`;

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100
  format?: 'webp' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Transforms a Supabase storage URL into a transformed/optimized URL.
 * If the URL is not from Supabase, it returns the original URL.
 */
export const optimizeImage = (url: string | undefined, options: ImageTransformOptions = {}): string => {
  if (!url) return '';
  
  // If it's a placeholder or data URL, return as is
  if (url.includes('placehold.co') || url.includes('/api/placeholder') || url.startsWith('data:')) {
    return url;
  }

  // Check if it's a Supabase storage URL
  if (url.includes(SUPABASE_STORAGE_URL_PATTERN)) {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
      resize = 'cover'
    } = options;

    // Convert 'object/public' to 'render/image/public'
    let transformedUrl = url.replace(SUPABASE_STORAGE_URL_PATTERN, SUPABASE_RENDER_URL_PATTERN);

    // Add query parameters
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', quality.toString());
    params.append('format', format);
    params.append('resize', resize);

    return `${transformedUrl}?${params.toString()}`;
  }

  // For local development or non-supabase URLs
  if (url.startsWith('/uploads') || url.startsWith('/images') || url.startsWith('/api')) {
    const API_BASE_URL = 'http://localhost:3000';
    return `${API_BASE_URL}${url}`;
  }

  return url;
};
