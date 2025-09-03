import apiClient from './apiClient';
import { 
  LostItem, 
  FoundItem, 
  Category, 
  Tag, 
  Claim, 
  LostItemForm, 
  FoundItemForm,
  PaginatedResponse,
  SearchFilters 
} from '@/types/LostFound';

class ItemsService {
  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    return apiClient.get<{ categories: Category[] }>('/items/categories');
  }

  async createCategory(data: Omit<Category, 'id'>): Promise<{ category: Category; message: string }> {
    return apiClient.post<{ category: Category; message: string }>('/items/categories', data);
  }

  // Tags
  async getTags(): Promise<{ tags: Tag[] }> {
    return apiClient.get<{ tags: Tag[] }>('/items/tags');
  }

  // Lost Items
  async createLostItem(data: LostItemForm, images?: File[]): Promise<{ item: LostItem; message: string }> {
    if (images && images.length > 0) {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, value.join(','));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add images
      images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      return apiClient.postFormData<{ item: LostItem; message: string }>('/items/lost', formData);
    } else {
      return apiClient.post<{ item: LostItem; message: string }>('/items/lost', data);
    }
  }

  async getLostItems(filters?: SearchFilters): Promise<PaginatedResponse<LostItem>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = `/items/lost${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<PaginatedResponse<LostItem>>(url);
  }

  async getLostItem(id: number): Promise<{ item: LostItem }> {
    return apiClient.get<{ item: LostItem }>(`/items/lost/${id}`);
  }

  async updateLostItemStatus(id: number, status: string): Promise<{ item: LostItem; message: string }> {
    return apiClient.put<{ item: LostItem; message: string }>(`/items/lost/${id}/status`, { status });
  }

  // Found Items
  async createFoundItem(data: FoundItemForm, images?: File[]): Promise<{ item: FoundItem; message: string }> {
    if (images && images.length > 0) {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, value.join(','));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add images
      images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      return apiClient.postFormData<{ item: FoundItem; message: string }>('/items/found', formData);
    } else {
      return apiClient.post<{ item: FoundItem; message: string }>('/items/found', data);
    }
  }

  async getFoundItems(filters?: SearchFilters): Promise<PaginatedResponse<FoundItem>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = `/items/found${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<PaginatedResponse<FoundItem>>(url);
  }

  async getFoundItem(id: number): Promise<{ item: FoundItem }> {
    return apiClient.get<{ item: FoundItem }>(`/items/found/${id}`);
  }

  // Suggestions
  async getSuggestions(itemId: number, type: 'lost' | 'found'): Promise<{ suggestions: (LostItem | FoundItem)[] }> {
    return apiClient.get<{ suggestions: (LostItem | FoundItem)[] }>(`/items/suggestions/${itemId}?type=${type}`);
  }

  // Claims
  async createClaim(data: { lost_item_id?: number; found_item_id?: number; message?: string }): Promise<{ claim: Claim; message: string }> {
    return apiClient.post<{ claim: Claim; message: string }>('/items/claim', data);
  }

  // My Items
  async getMyItems(): Promise<{ lost_items: LostItem[]; found_items: FoundItem[] }> {
    return apiClient.get<{ lost_items: LostItem[]; found_items: FoundItem[] }>('/items/my-items');
  }

  // Geolocation utilities
  getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  // Image utilities
  validateImages(files: FileList | null): { valid: File[]; errors: string[] } {
    const valid: File[] = [];
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!files) return { valid, errors };

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.`);
      } else if (file.size > maxSize) {
        errors.push(`${file.name}: File too large. Maximum size is 5MB.`);
      } else {
        valid.push(file);
      }
    });

    return { valid, errors };
  }
}

export const itemsService = new ItemsService();
export default itemsService;