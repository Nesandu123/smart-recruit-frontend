const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(includeAuth: boolean = true, contentType: string = 'application/json'): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': contentType,
    };

    if (includeAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private extractErrorMessage(detail: any): string {
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      // Pydantic validation errors
      return detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
    }
    if (typeof detail === 'object') {
      return detail.msg || JSON.stringify(detail);
    }
    return 'Request failed';
  }

  async post<T>(endpoint: string, data: any, includeAuth: boolean = true, contentType?: string): Promise<ApiResponse<T>> {
    try {
      const headers = this.getHeaders(includeAuth, contentType || 'application/json');
      const body = contentType === 'application/x-www-form-urlencoded' ? data : JSON.stringify(data);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body,
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: this.extractErrorMessage(result.detail) };
      }

      return { data: result };
    } catch (error: any) {
      return { error: error.message || 'Network error' };
    }
  }

  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(includeAuth),
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: this.extractErrorMessage(result.detail) };
      }

      return { data: result };
    } catch (error: any) {
      return { error: error.message || 'Network error' };
    }
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: this.extractErrorMessage(result.detail) };
      }

      return { data: result };
    } catch (error: any) {
      return { error: error.message || 'Network error' };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(true),
      });

      if (response.status === 204) {
        return { data: {} as T };
      }

      const result = await response.json();

      if (!response.ok) {
        return { error: this.extractErrorMessage(result.detail) };
      }

      return { data: result };
    } catch (error: any) {
      return { error: error.message || 'Network error' };
    }
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  signup: (data: { email: string; username: string; password: string; full_name?: string }) =>
    api.post('/api/auth/signup', data, false),
  
  login: (data: { username: string; password: string }) => {
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    return api.post('/api/auth/login', formData.toString(), false, 'application/x-www-form-urlencoded');
  },
  
  getMe: () => api.get('/api/auth/me'),
};

// Tests API
export const testsApi = {
  create: (repo_url: string) => api.post('/api/tests/', { repo_url }),
  getAll: () => api.get('/api/tests/'),
  getById: (id: number) => api.get(`/api/tests/${id}`),
  getQuestions: (id: number) => api.get(`/api/tests/${id}/questions`),
  start: (id: number) => api.post(`/api/tests/${id}/start`, {}),
  submitAnswer: (id: number, data: { question_id: number; answer_text: string; is_skipped: boolean }) =>
    api.post(`/api/tests/${id}/answers`, data),
  complete: (id: number) => api.post(`/api/tests/${id}/complete`, {}),
};

// Admin API
export const adminApi = {
  getQuestions: (pattern?: string, difficulty?: string) => {
    let url = '/api/admin/questions';
    const params = new URLSearchParams();
    if (pattern) params.append('pattern', pattern);
    if (difficulty) params.append('difficulty', difficulty);
    const query = params.toString();
    return api.get(url + (query ? `?${query}` : ''));
  },
  createQuestion: (data: any) => api.post('/api/admin/questions', data),
  updateQuestion: (id: number, data: any) => api.put(`/api/admin/questions/${id}`, data),
  deleteQuestion: (id: number) => api.delete(`/api/admin/questions/${id}`),
  getPatterns: () => api.get('/api/admin/patterns'),
};
