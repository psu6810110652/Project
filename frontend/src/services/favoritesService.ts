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
  static async addToFavorites(productId: string): Promise<void> {
    if (!productId) return;
    
    try {
      await api.post(`/favorites/${productId}`);
      
      // Update localStorage as a cache/backup (optional but keeps existing event logic working)
      const favorites = this.getFavoriteIds();
      if (!favorites.includes(productId)) {
        favorites.push(productId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      }

      console.log(`Product ${productId} added to favorites via API`);
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('favoritesUpdated', {
        detail: { action: 'add', productId }
      }));
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  }

  // Remove product from favorites
  static async removeFromFavorites(productId: string): Promise<void> {
    if (!productId) return;
    
    try {
      await api.delete(`/favorites/${productId}`);
      
      const favorites = this.getFavoriteIds();
      const newFavorites = favorites.filter(id => id !== productId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newFavorites));
      
      console.log(`Product ${productId} removed from favorites via API`);
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('favoritesUpdated', {
        detail: { action: 'remove', productId }
      }));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  // Toggle favorite status
  static async toggleFavorite(productId: string): Promise<boolean> {
    const isFavorite = this.isFavorite(productId);
    
    if (isFavorite) {
      await this.removeFromFavorites(productId);
      return false;
    } else {
      await this.addToFavorites(productId);
      return true;
    }
  }

  // Check if product is in favorites (Still uses cache for instant UI feedback)
  static isFavorite(productId: string): boolean {
    return this.getFavoriteIds().includes(productId);
  }

  // Get full product details from backend
  static async getFavoriteProducts(): Promise<Product[]> {
    try {
      const response = await api.get('/favorites');
      const products = response.data || [];
      
      // Sync localStorage with latest data from server
      const currentIds = products.map((p: any) => p.id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentIds));
      
      return products.map((product: any) => ({
        ...product,
        // Ensure image is processed for the Product card
        image: product.thumbnailUrls && product.thumbnailUrls.length > 0 ? product.thumbnailUrls[0] : (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null)
      }));
    } catch (error: any) {
      console.error('Error fetching favorite products:', error);
      // Fallback to old method if not logged in or error
      if (error.response?.status === 401) {
        return [];
      }
      return [];
    }
  }

  // Clear all favorites (Would need a backend endpoint to clear all, but for now just clear local)
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
