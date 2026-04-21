export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  name: string;
  createdAt: string;
  dob?: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  score: number;
  totalQuestions: number;
  timestamp: string; 
  startTime?: string;
  endTime?: string;
  attentionScore: number;
  attentionHistory?: number[];
  status: 'completed' | 'ongoing';
  answers: { questionId: number; answer: string; correct: boolean }[];
}

const USERS_KEY = 'app_users';
const RESULTS_KEY = 'app_results';

export const storage = {
  getUsers: (): User[] => {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  addUser: (user: User): void => {
    const users = storage.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  removeUser: (userId: string): void => {
    const users = storage.getUsers();
    const newUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
  },

  getUserByUsername: (username: string): User | undefined => {
    const users = storage.getUsers();
    return users.find((u) => u.username === username);
  },

  getResults: (): QuizResult[] => {
    if (typeof window === 'undefined') return [];
    const results = localStorage.getItem(RESULTS_KEY);
    return results ? JSON.parse(results) : [];
  },

  saveResult: (result: QuizResult): void => {
    const results = storage.getResults();
    // Check if result already exists (update it)
    const existingIndex = results.findIndex((r) => r.userId === result.userId && r.status === 'ongoing');

    if (existingIndex >= 0) {
      results[existingIndex] = result;
    } else {
      results.push(result);
    }
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  },

  removeResult: (resultId: string): void => {
    const results = storage.getResults();
    const newResults = results.filter(r => r.id !== resultId);
    localStorage.setItem(RESULTS_KEY, JSON.stringify(newResults));
  },

  // Helper to initialize some default users if none exist
  init: () => {
    if (typeof window === 'undefined') return;
    const users = storage.getUsers();
    if (users.length === 0) {
      storage.addUser({
        id: 'admin-1',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'System Admin',
        createdAt: new Date().toISOString()
      });
    }
  }
};
