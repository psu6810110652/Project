import type { Product } from '../types';

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

  // Get full product details for favorites
  static async getFavoriteProducts(): Promise<Product[]> {
    const favoriteIds = this.getFavoriteIds();
    
    if (favoriteIds.length === 0) {
      return [];
    }

    try {
      const productPromises = favoriteIds.map(async (id: string) => {
        try {
          const response = await fetch(`/api/product/${id}`);
          if (response.ok) {
            return await response.json();
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
