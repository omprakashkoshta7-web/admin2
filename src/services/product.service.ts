import apiClient from './api.service';
import { API_CONFIG } from '../config/api.config';
import axios from 'axios';

// ============================================================================
// TYPESCRIPT INTERFACES - Matching Backend Models Exactly
// ============================================================================

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  starting_from?: number | null;
  section?: string;
  flowType: 'printing' | 'gifting' | 'shopping';
  sortOrder?: number;
  isActive: boolean;
  subcategories?: Subcategory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
  flowType: 'printing' | 'gifting' | 'shopping';
  sortOrder?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  _id: string;
  product: string;
  size?: string;
  size_label?: string;
  paper_type?: string;
  cover_color?: string;
  cover_color_name?: string;
  stock: number;
  additional_price: number;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  category: Category | string;
  subcategory?: Subcategory | string;
  flowType: 'printing' | 'gifting' | 'shopping';
  brand?: string;
  description?: string;
  highlights?: string[];
  mrp: number;
  sale_price?: number;
  discount_pct?: number;
  bulk_price?: number;
  min_bulk_qty?: number;
  badge?: string | null;
  businessPrintType?: string;
  designMode?: 'premium' | 'normal' | 'both' | '';
  requiresDesign?: boolean;
  requiresUpload?: boolean;
  variants?: ProductVariant[];
  images?: string[];
  thumbnail?: string;
  specs?: {
    paper_weight?: string;
    page_count?: string;
    cover_material?: string;
    binding?: string;
    extras?: string;
    features?: string[];
  };
  giftOptions?: {
    materials?: string[];
    sizes?: string[];
    colors?: string[];
    canvas?: {
      width: number;
      height: number;
      unit: string;
    };
    supportsPhotoUpload?: boolean;
    supportsNameCustomization?: boolean;
    supportsTextCustomization?: boolean;
    maxPhotos?: number;
    maxNameLength?: number;
    maxTextLength?: number;
    allowPremiumTemplates?: boolean;
    allowBlankDesign?: boolean;
    designInstructions?: string;
  };
  free_shipping?: boolean;
  in_stock?: boolean;
  stock?: number;
  is_active?: boolean;
  isActive?: boolean;
  is_featured?: boolean;
  isFeatured?: boolean;
  is_deal_of_day?: boolean;
  deal_expires_at?: string | null;
  sortOrder?: number;
  created_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ProductsResponse {
  products: Product[];
  meta: PaginationMeta;
}

export interface ProductListQuery {
  flowType?: 'printing' | 'gifting' | 'shopping';
  category?: string;
  subcategory?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CategoryQuery {
  flowType?: 'printing' | 'gifting' | 'shopping';
  showAll?: boolean;
}

// ============================================================================
// API RESPONSE WRAPPER
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============================================================================
// GENERAL PRODUCT SERVICE - 6 APIs (3 Products + 3 Categories)
// ============================================================================

class ProductService {
  // ========================================
  // PRODUCTS APIs (3)
  // ========================================

  /**
   * 1. GET ALL PRODUCTS (with filters)
   * Supports filtering by flowType, category, subcategory, search
   */
  async getProducts(query: ProductListQuery = {}): Promise<ApiResponse<ProductsResponse>> {
    try {
      console.log('🚀 [Product Service] Fetching products with query:', query);
      const response = await apiClient.get<ApiResponse<ProductsResponse>>(
        API_CONFIG.ENDPOINTS.PRODUCTS.GENERAL.LIST,
        { params: query }
      );
      console.log('✅ [Product Service] Products fetched:', response.data);
      
      // Cache products list
      const cacheKey = `products_${JSON.stringify(query)}`;
      localStorage.setItem(cacheKey, JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [Product Service] Failed to fetch products:', error);
      
      // Fallback to localStorage
      const cacheKey = `products_${JSON.stringify(query)}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        console.log('⚠️ [Product Service] Using cached products');
        return JSON.parse(cachedData);
      }
      
      // Return empty list as fallback with better error message
      const errorMessage = error.response?.status === 500 
        ? 'Server error - please ensure shopping categories are created first'
        : error.message || 'Failed to fetch products';
        
      return {
        success: false,
        data: {
          products: [],
          meta: { total: 0, page: 1, limit: 12, pages: 0 }
        },
        message: errorMessage
      };
    }
  }

  /**
   * 2. GET PRODUCT BY ID
   * Returns product with variants
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      // Validate ObjectId format
      if (!this.isValidObjectId(id)) {
        console.error('❌ [Product Service] Invalid ObjectId format:', id);
        throw new Error(`Invalid product ID format: ${id}. Expected 24-character MongoDB ObjectId.`);
      }

      console.log('🚀 [Product Service] Fetching product by ID:', id);
      const response = await apiClient.get<ApiResponse<Product>>(
        API_CONFIG.ENDPOINTS.PRODUCTS.GENERAL.BY_ID(id)
      );
      console.log('✅ [Product Service] Product fetched:', response.data);
      
      // Cache product
      localStorage.setItem(`product_${id}`, JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [Product Service] Failed to fetch product by ID:', error);
      
      // Fallback to localStorage
      const cachedData = localStorage.getItem(`product_${id}`);
      if (cachedData) {
        console.log('⚠️ [Product Service] Using cached product');
        return JSON.parse(cachedData);
      }
      
      throw error;
    }
  }

  /**
   * 3. GET PRODUCT BY SLUG
   * Returns product with variants
   */
  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    try {
      console.log('🚀 [Product Service] Fetching product by slug:', slug);
      const response = await apiClient.get<ApiResponse<Product>>(
        API_CONFIG.ENDPOINTS.PRODUCTS.GENERAL.BY_SLUG(slug)
      );
      console.log('✅ [Product Service] Product fetched:', response.data);
      
      // Cache product
      localStorage.setItem(`product_slug_${slug}`, JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [Product Service] Failed to fetch product by slug:', error);
      
      // Fallback to localStorage
      const cachedData = localStorage.getItem(`product_slug_${slug}`);
      if (cachedData) {
        console.log('⚠️ [Product Service] Using cached product');
        return JSON.parse(cachedData);
      }
      
      throw error;
    }
  }

  // ========================================
  // CATEGORIES APIs (3)
  // ========================================

  /**
   * 4. GET ALL CATEGORIES (with subcategories nested)
   * Supports filtering by flowType
   */
  async getCategories(query: CategoryQuery = {}): Promise<ApiResponse<Category[]>> {
    try {
      console.log('🚀 [Product Service] Fetching categories with query:', query);
      const response = await apiClient.get<ApiResponse<Category[]>>(
        API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORIES.LIST,
        { params: query }
      );
      console.log('✅ [Product Service] Categories fetched:', response.data);
      
      // Cache categories
      const cacheKey = `categories_${query.flowType || 'all'}`;
      localStorage.setItem(cacheKey, JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [Product Service] Failed to fetch categories:', error);
      
      // Fallback to localStorage
      const cacheKey = `categories_${query.flowType || 'all'}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        console.log('⚠️ [Product Service] Using cached categories');
        return JSON.parse(cachedData);
      }
      
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch categories'
      };
    }
  }

  /**
   * 5. GET CATEGORY BY SLUG (with subcategories)
   */
  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    try {
      console.log('🚀 [Product Service] Fetching category by slug:', slug);
      const response = await apiClient.get<ApiResponse<Category>>(
        API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORIES.BY_SLUG(slug)
      );
      console.log('✅ [Product Service] Category fetched:', response.data);
      
      // Cache category
      localStorage.setItem(`category_${slug}`, JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [Product Service] Failed to fetch category by slug:', error);
      
      // Fallback to localStorage
      const cachedData = localStorage.getItem(`category_${slug}`);
      if (cachedData) {
        console.log('⚠️ [Product Service] Using cached category');
        return JSON.parse(cachedData);
      }
      
      throw error;
    }
  }

  /**
   * 6. GET SUBCATEGORIES BY CATEGORY ID
   */
  async getSubcategories(categoryId: string): Promise<ApiResponse<Subcategory[]>> {
    try {
      console.log('🚀 [Product Service] Fetching subcategories for category:', categoryId);
      const response = await apiClient.get<ApiResponse<Subcategory[]>>(
        API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORIES.SUBCATEGORIES(categoryId)
      );
      console.log('✅ [Product Service] Subcategories fetched:', response.data);
      
      // Cache subcategories
      localStorage.setItem(`subcategories_${categoryId}`, JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [Product Service] Failed to fetch subcategories:', error);
      
      // Fallback to localStorage
      const cachedData = localStorage.getItem(`subcategories_${categoryId}`);
      if (cachedData) {
        console.log('⚠️ [Product Service] Using cached subcategories');
        return JSON.parse(cachedData);
      }
      
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch subcategories'
      };
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Get products by flow type
   */
  async getProductsByFlowType(
    flowType: 'printing' | 'gifting' | 'shopping',
    query: Omit<ProductListQuery, 'flowType'> = {}
  ): Promise<ApiResponse<ProductsResponse>> {
    return this.getProducts({ ...query, flowType });
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string,
    query: Omit<ProductListQuery, 'category'> = {}
  ): Promise<ApiResponse<ProductsResponse>> {
    return this.getProducts({ ...query, category: categoryId });
  }

  /**
   * Search products
   */
  async searchProducts(
    searchQuery: string,
    query: Omit<ProductListQuery, 'search'> = {}
  ): Promise<ApiResponse<ProductsResponse>> {
    return this.getProducts({ ...query, search: searchQuery });
  }

  /**
   * Get printing categories
   */
  async getPrintingCategories(): Promise<ApiResponse<Category[]>> {
    return this.getCategories({ flowType: 'printing' });
  }

  /**
   * Get gifting categories
   */
  async getGiftingCategories(): Promise<ApiResponse<Category[]>> {
    return this.getCategories({ flowType: 'gifting' });
  }

  /**
   * Get shopping categories
   */
  async getShoppingCategories(): Promise<ApiResponse<Category[]>> {
    return this.getCategories({ flowType: 'shopping' });
  }

  /**
   * Check if product is in stock
   */
  isProductInStock(product: Product): boolean {
    if (product.variants && product.variants.length > 0) {
      return product.variants.some(v => v.stock > 0);
    }
    return product.in_stock !== false && (product.stock ?? 0) > 0;
  }

  /**
   * Get effective price (sale price or MRP)
   */
  getEffectivePrice(product: Product): number {
    return product.sale_price ?? product.mrp;
  }

  /**
   * Calculate discount percentage
   */
  calculateDiscount(product: Product): number {
    if (product.discount_pct) return product.discount_pct;
    if (product.sale_price && product.mrp > product.sale_price) {
      return Math.round(((product.mrp - product.sale_price) / product.mrp) * 100);
    }
    return 0;
  }

  /**
   * Validate MongoDB ObjectId format
   */
  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * Get gifting products by ID
   */
  async getGiftingProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      // Validate ObjectId format
      if (!this.isValidObjectId(id)) {
        console.error('❌ [Product Service] Invalid ObjectId format:', id);
        throw new Error(`Invalid product ID format: ${id}. Expected 24-character MongoDB ObjectId.`);
      }

      console.log('🚀 [Product Service] Fetching gifting product by ID:', id);
      const response = await apiClient.get<ApiResponse<Product>>(
        API_CONFIG.ENDPOINTS.PRODUCTS.GIFTING.PRODUCT_BY_ID(id)
      );
      console.log('✅ [Product Service] Gifting product fetched:', response.data);
      
      // Cache product
      localStorage.setItem(`gifting_product_${id}`, JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [Product Service] Failed to fetch gifting product by ID:', error);
      
      // Fallback to localStorage
      const cachedData = localStorage.getItem(`gifting_product_${id}`);
      if (cachedData) {
        console.log('⚠️ [Product Service] Using cached gifting product');
        return JSON.parse(cachedData);
      }
      
      // Fallback to general product endpoint if ObjectId is valid
      if (this.isValidObjectId(id)) {
        console.log('⚠️ [Product Service] Falling back to general product endpoint');
        return this.getProductById(id);
      }
      
      throw error;
    }
  }

  /**
   * Get shopping products by ID
   */
  async getShoppingProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      // Validate ObjectId format
      if (!this.isValidObjectId(id)) {
        console.error('❌ [Product Service] Invalid ObjectId format:', id);
        throw new Error(`Invalid product ID format: ${id}. Expected 24-character MongoDB ObjectId.`);
      }

      console.log('🚀 [Product Service] Fetching shopping product by ID:', id);
      const response = await apiClient.get<ApiResponse<Product>>(
        API_CONFIG.ENDPOINTS.PRODUCTS.SHOPPING.PRODUCT_BY_ID(id)
      );
      console.log('✅ [Product Service] Shopping product fetched:', response.data);
      
      // Cache product
      localStorage.setItem(`shopping_product_${id}`, JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [Product Service] Failed to fetch shopping product by ID:', error);
      
      // Fallback to localStorage
      const cachedData = localStorage.getItem(`shopping_product_${id}`);
      if (cachedData) {
        console.log('⚠️ [Product Service] Using cached shopping product');
        return JSON.parse(cachedData);
      }
      
      // Fallback to general product endpoint if ObjectId is valid
      if (this.isValidObjectId(id)) {
        console.log('⚠️ [Product Service] Falling back to general product endpoint');
        return this.getProductById(id);
      }
      
      throw error;
    }
  }

  /**
   * Get gifting products (backward compatibility method)
   */
  async getGiftingProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<ApiResponse<ProductsResponse>> {
    console.log('⚠️ [Product Service] Using deprecated getGiftingProducts method. Use getProductsByFlowType("gifting") instead.');
    return this.getProductsByFlowType('gifting', params);
  }

  /**
   * Get shopping products (backward compatibility method)
   */
  async getShoppingProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<ApiResponse<ProductsResponse>> {
    console.log('⚠️ [Product Service] Using deprecated getShoppingProducts method. Use getProductsByFlowType("shopping") instead.');
    return this.getProductsByFlowType('shopping', params);
  }

  /**
   * Get nearby vendor stores for pickup locations
   */
  async getNearbyVendorStores(params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    limit?: number;
    pincode?: string;
  }): Promise<any> {
    try {
      console.log('🚀 [Product Service] Fetching nearby vendor stores with params:', params);
      
      // Direct call to vendor service since gateway doesn't have VENDOR_SERVICE_URL configured
      const vendorServiceUrl = 'https://vendor-202671058278.asia-south1.run.app';
      const response = await axios.get(
        `${vendorServiceUrl}/api/vendor/stores/nearby`,
        { params }
      );
      
      console.log('✅ [Product Service] Nearby vendor stores fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [Product Service] Failed to fetch nearby vendor stores:', error);
      return {
        success: false,
        data: { stores: [] },
        message: error.message || 'Failed to fetch nearby vendor stores'
      };
    }
  }
}

// Export singleton instance
const productService = new ProductService();
export default productService;
