const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    let url = `${this.baseUrl}${endpoint}`;
    
    // Add query params
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const config: RequestInit = {
      ...fetchOptions,
      credentials: 'include', // Important for HTTP-only cookies
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Something went wrong');
    }

    return data;
  }

  // Auth endpoints
  async register(email: string, password: string, name?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(data: { name?: string; avatar?: string }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request(`/auth/reset-password/${token}`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  }

  // Puzzle endpoints
  async getTodaysPuzzle() {
    return this.request('/puzzle/today');
  }

  async checkGrid(puzzleId: string, grid: string[][]) {
    return this.request('/puzzle/check', {
      method: 'POST',
      body: JSON.stringify({ puzzleId, grid }),
    });
  }

  async saveProgress(puzzleId: string, grid: string[][]) {
    return this.request('/puzzle/save', {
      method: 'POST',
      body: JSON.stringify({ puzzleId, grid }),
    });
  }

  async getHint(puzzleId: string) {
    return this.request('/puzzle/hint', {
      method: 'POST',
      body: JSON.stringify({ puzzleId }),
    });
  }

  async getYesterdayResult() {
    return this.request('/puzzle/yesterday');
  }

  async reportProblem(data: {
    puzzleId: string;
    userGrid: string[][];
    reportType?: string;
    description?: string;
  }) {
    return this.request('/puzzle/report', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getHistory(page: number = 1, limit: number = 10) {
    return this.request('/puzzle/history', {
      params: { page: String(page), limit: String(limit) },
    });
  }

  // User endpoints
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async getUserStreak() {
    return this.request('/user/streak');
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminPuzzles(page: number = 1, limit: number = 20) {
    return this.request('/admin/puzzles', {
      params: { page: String(page), limit: String(limit) },
    });
  }

  async getAdminPuzzle(id: string) {
    return this.request(`/admin/puzzle/${id}`);
  }

  async createPuzzle(data: {
    puzzleDate: string;
    gridSize: number;
    words: { word: string; startRow: number; startCol: number; direction: string }[];
    visibleCells?: { row: number; col: number }[];
    hintCells?: { row: number; col: number }[];
    dailyMessage?: string;
  }) {
    return this.request('/admin/puzzle', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePuzzle(id: string, data: Record<string, unknown>) {
    return this.request(`/admin/puzzle/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePuzzle(id: string) {
    return this.request(`/admin/puzzle/${id}`, {
      method: 'DELETE',
    });
  }

  async getReports(status: string = 'pending', page: number = 1) {
    return this.request('/admin/reports', {
      params: { status, page: String(page) },
    });
  }

  async resolveReport(id: string, status: string, adminNotes?: string) {
    return this.request(`/admin/report/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  async getUsers(page: number = 1, limit: number = 20) {
    return this.request('/admin/users', {
      params: { page: String(page), limit: String(limit) },
    });
  }
}

export const api = new ApiClient(API_URL);
export default api;
