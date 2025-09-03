// User types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  profile_picture?: string;
  bio?: string;
  location?: string;
  reputation_score: number;
  is_verified: boolean;
  created_at: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

// Tag types
export interface Tag {
  id: number;
  name: string;
}

// Base item interface
interface BaseItem {
  id: number;
  title: string;
  description: string;
  user_id: number;
  category: Category;
  latitude?: number;
  longitude?: number;
  images: string[];
  status: string;
  created_at: string;
  updated_at: string;
  tags: Tag[];
  user?: User;
  distance?: number;
}

// Lost item types
export interface LostItem extends BaseItem {
  location_lost?: string;
  date_lost?: string;
  reward_amount?: number;
  contact_info?: string;
  qr_code_url?: string;
}

// Found item types
export interface FoundItem extends BaseItem {
  location_found?: string;
  date_found?: string;
  contact_info?: string;
}

// Claim types
export interface Claim {
  id: number;
  lost_item_id?: number;
  found_item_id?: number;
  claimant_id: number;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  claimant?: User;
}

// Collaboration types
export interface CollaborationPost {
  id: number;
  title: string;
  description: string;
  author_id: number;
  type?: string;
  skills_required: string[];
  skills_offered: string[];
  location?: string;
  is_remote: boolean;
  status: 'open' | 'in-progress' | 'completed' | 'closed';
  created_at: string;
  updated_at: string;
  author?: User;
}

// Message types
export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  is_read: boolean;
  message_type: 'text' | 'image' | 'system';
  created_at: string;
  sender?: User;
}

// Notification types
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'claim' | 'message' | 'match' | 'collaboration';
  is_read: boolean;
  data: any;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    total: number;
  };
}

// Form types
export interface LostItemForm {
  title: string;
  description: string;
  category_id: number;
  location_lost?: string;
  latitude?: number;
  longitude?: number;
  date_lost?: string;
  reward_amount?: number;
  contact_info?: string;
  tags?: string[];
}

export interface FoundItemForm {
  title: string;
  description: string;
  category_id: number;
  location_found?: string;
  latitude?: number;
  longitude?: number;
  date_found?: string;
  contact_info?: string;
  tags?: string[];
}

export interface AuthForm {
  username?: string;
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  location?: string;
}

// Search/Filter types
export interface SearchFilters {
  search?: string;
  category_id?: number;
  location?: string;
  radius?: number;
  page?: number;
  per_page?: number;
}