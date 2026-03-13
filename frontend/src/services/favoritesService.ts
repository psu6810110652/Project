import type { Product } from '../types';
import api from './api';

export class FavoritesService {
  private static readonly STORAGE_KEY = 'favorites';

  // Get all favorite product IDs
  static getFavoriteIds(): string[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch (error) {
      console.error('Error reading favorites from localStorage:', error);
      return [];
    }
  }

  // Add product to favorites
  static addToFavorites(productId: string): void {
    if (!productId) return;
    
    const favorites = this.getFavoriteIds();
    if (!favorites.includes(productId)) {
      favorites.push(productId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      
      console.log(`Product ${productId} added to favorites`);
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('favoritesUpdated', {
        detail: { action: 'add', productId }
      }));
    }
  }

  // Remove product from favorites
  static removeFromFavorites(productId: string): void {
    if (!productId) return;
    
    const favorites = this.getFavoriteIds();
    const newFavorites = favorites.filter(id => id !== productId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newFavorites));
    
    console.log(`Product ${productId} removed from favorites`);
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('favoritesUpdated', {
      detail: { action: 'remove', productId }
    }));
  }

  // Toggle favorite status
  static toggleFavorite(productId: string): boolean {
    const favorites = this.getFavoriteIds();
    const isFavorite = favorites.includes(productId);
    
    if (isFavorite) {
      this.removeFromFavorites(productId);
      return false;
    } else {
      this.addToFavorites(productId);
      return true;
    }
  }

  // Check if product is in favorites
  static isFavorite(productId: string): boolean {
    return this.getFavoriteIds().includes(productId);
  }

  // Get full product details for favorites with review data processing
  static async getFavoriteProducts(): Promise<Product[]> {
    const favoriteIds = this.getFavoriteIds();
    
    if (favoriteIds.length === 0) {
      return [];
    }

    try {
      // ฟังก์ชันดึงข้อมูลรีวิวเพื่อคำนวณคะแนน (เหมือนใน Home.tsx)
      const fetchReviewsAndCalculateRating = async (productId: string) => {
        try {
          const reviewsResponse = await api.get(`/product/${productId}/reviews`);
          const reviewsData = reviewsResponse.data;
          
          if (reviewsData && reviewsData.length > 0) {
            const totalRating = reviewsData.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0);
            const avgRating = Math.round((totalRating / reviewsData.length) * 10) / 10;
            return {
              rating: avgRating,
              reviewCount: reviewsData.length
            };
          }
        } catch (error) {
          console.error(`Error fetching reviews for ${productId}:`, error);
        }
        // Return 0 when no reviews exist or API fails - don't use potentially incorrect product data
        return { rating: 0, reviewCount: 0 };
      };

      const productPromises = favoriteIds.map(async (id: string) => {
        try {
          const response = await api.get(`/product/${id}`);
          if (response.data) {
            const product = response.data;
            const ratingData = await fetchReviewsAndCalculateRating(id);
            
            // ใช้ logic เหมือน Home.tsx เพื่อให้ข้อมูลตรงกัน
            return {
              ...product,
              rating: ratingData.rating,
              reviewCount: ratingData.reviewCount
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching product ${id}:`, error);
          return null;
        }
      });

      const products = await Promise.all(productPromises);
      return products.filter(product => product !== null) as Product[];
    } catch (error) {
      console.error('Error fetching favorite products:', error);
      return [];
    }
  }

  // Clear all favorites
  static clearFavorites(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('favoritesUpdated', {
      detail: { action: 'clear' }
    }));
  }

  // Get favorite count
  static getFavoriteCount(): number {
    return this.getFavoriteIds().length;
  }
}
