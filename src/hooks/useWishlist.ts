import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api.service';
import { API_CONFIG } from '../config/api.config';
import { useAuth } from '../context/AuthContext';

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.WISHLIST.GET);
      const items: Array<{ productId: string }> = res.data?.data || [];
      setWishlistIds(items.map((i) => i.productId));
    } catch (err) {
      console.error('Wishlist fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(
    async (productId: string, productType = 'shopping') => {
      if (!isAuthenticated) return;
      
      setWishlistIds((prev) => {
        const isInWishlist = prev.includes(productId);
        const updated = isInWishlist ? prev.filter((id) => id !== productId) : [...prev, productId];
        
        // Make API call
        (async () => {
          try {
            if (isInWishlist) {
              await apiClient.delete(API_CONFIG.ENDPOINTS.WISHLIST.REMOVE(productId));
            } else {
              await apiClient.post(API_CONFIG.ENDPOINTS.WISHLIST.ADD, { productId, productType });
            }
          } catch (err) {
            console.error('Wishlist toggle error:', err);
            // Revert on error
            setWishlistIds((prev) =>
              isInWishlist ? [...prev, productId] : prev.filter((id) => id !== productId)
            );
          }
        })();
        
        return updated;
      });
    },
    [isAuthenticated]
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  return { wishlistIds, loading, toggleWishlist, isWishlisted, refetch: fetchWishlist };
}
