import apiClient from './apiClient';
import { User, AuthForm } from '@/types/LostFound';

export interface AuthResponse {
  access_token: string;
  user: User;
  message: string;
}

export interface GoogleAuthRequest {
  google_token: string;
}

class AuthService {
  async register(data: AuthForm): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.access_token) {
      apiClient.setToken(response.access_token);
    }
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', { 
      email, 
      password 
    });
    if (response.access_token) {
      apiClient.setToken(response.access_token);
    }
    return response;
  }

  async googleAuth(googleToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/google', { 
      google_token: googleToken 
    });
    if (response.access_token) {
      apiClient.setToken(response.access_token);
    }
    return response;
  }

  async getProfile(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>('/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<{ user: User; message: string }> {
    return apiClient.put<{ user: User; message: string }>('/auth/profile', data);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  async getUser(userId: number): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>(`/auth/users/${userId}`);
  }

  logout() {
    apiClient.removeToken();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();
export default authService;