import { api } from '@/services/api';
import type { User, UserRole } from '@/context/AuthContext';
import type { LoginFormData, RegisterFormData } from '../schemas/auth.schemas';

export interface AuthSessionResponse {
  success: boolean;
  user: User;
  token?: string;
  message?: string;
}

const STORAGE_KEY = 'brightloop_auth_session';
const TOKEN_KEY = 'brightloop_auth_token';

/** Default approved demo identities for development and hackathon verification */
export const DEMO_USERS: Record<string, User & { passwordHint: string }> = {
  admin: {
    id: 'usr-admin-01',
    name: 'Alex Morgan',
    email: 'admin@brightloop.io',
    role: 'ADMIN',
    passwordHint: 'Brightloop@2026',
  },
  staff: {
    id: 'usr-staff-01',
    name: 'Staff Member',
    email: 'staff@brightloop.io',
    role: 'STAFF',
    passwordHint: 'Brightloop@2026',
  },
  customer: {
    id: 'cust-apex-01',
    name: 'Sarah Chen',
    email: 'sarah.chen@acme.inc',
    role: 'CUSTOMER',
    companyName: 'Acme Enterprises Inc.',
    passwordHint: 'Brightloop@2026',
  },
};

export const authService = {
  /**
   * Attempts authentication via the backend API.
   * Connects to /api/v1/auth/login and stores JWT session.
   */
  async login(credentials: LoginFormData): Promise<AuthSessionResponse> {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const resData = response.data;
      const payload = resData.data || resData;
      const rawUser = payload.user;
      const token = payload.token;

      if (rawUser) {
        const sessionUser: User = {
          id: rawUser.id,
          name:
            payload.customerProfile?.displayName ||
            rawUser.name ||
            rawUser.email.split('@')[0],
          email: rawUser.email,
          role: rawUser.role,
          companyName: payload.customerProfile?.companyName || rawUser.companyName,
        };

        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        }
        this.saveSession(sessionUser);

        return {
          success: true,
          user: sessionUser,
          token,
          message: resData.message || 'Login successful',
        };
      }
    } catch (err: any) {
      // If backend returned a clear validation/auth error response, surface it directly
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }

      // If backend network is unavailable, check mock fallback
      if (err.code !== 'ERR_NETWORK' && err.response) {
        throw new Error('Authentication failed. Please check your credentials.');
      }
    }

    // Fallback: check seeded demo accounts locally if backend was completely unreachable
    const emailLower = credentials.email.trim().toLowerCase();
    const matched = Object.values(DEMO_USERS).find(
      (u) => u.email.toLowerCase() === emailLower
    );

    if (matched) {
      const sessionUser: User = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role,
        companyName: matched.companyName,
      };
      this.saveSession(sessionUser);
      return {
        success: true,
        user: sessionUser,
        token: `mock-jwt-token-${matched.role.toLowerCase()}-${Date.now()}`,
      };
    }

    const registeredUsers = this.getStoredRegisteredUsers();
    const registeredMatch = registeredUsers.find((u) => u.email.toLowerCase() === emailLower);
    if (registeredMatch) {
      this.saveSession(registeredMatch);
      return {
        success: true,
        user: registeredMatch,
        token: `mock-jwt-token-customer-${Date.now()}`,
      };
    }

    throw new Error('Invalid email or password. Please verify your credentials.');
  },

  /**
   * Registers a new customer account via /api/v1/auth/register.
   */
  async register(data: RegisterFormData): Promise<AuthSessionResponse> {
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        displayName: data.name,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        role: 'CUSTOMER',
      });

      const resData = response.data;
      const payload = resData.data || resData;
      const rawUser = payload.user;
      const token = payload.token;

      if (rawUser) {
        const newCustomer: User = {
          id: rawUser.id,
          name:
            payload.customerProfile?.displayName ||
            data.name ||
            rawUser.email.split('@')[0],
          email: rawUser.email,
          role: rawUser.role,
          companyName: payload.customerProfile?.companyName || data.companyName,
        };

        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        }
        this.saveSession(newCustomer);

        return {
          success: true,
          user: newCustomer,
          token,
          message: resData.message || 'Account created successfully',
        };
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      if (err.code !== 'ERR_NETWORK' && err.response) {
        throw new Error('Registration failed. Please check the provided information.');
      }
    }

    // Fallback if backend offline
    const newCustomer: User = {
      id: `cust-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'CUSTOMER' as UserRole,
      companyName: data.companyName,
    };

    this.saveRegisteredUser(newCustomer);
    this.saveSession(newCustomer);

    return {
      success: true,
      user: newCustomer,
      token: `mock-jwt-token-customer-${Date.now()}`,
      message: 'Account created successfully',
    };
  },

  /**
   * Fetch current session profile from backend /auth/me
   */
  async fetchMe(): Promise<User | null> {
    try {
      const response = await api.get('/auth/me');
      const payload = response.data?.data || response.data;
      if (payload && payload.id) {
        const user: User = {
          id: payload.id,
          name: payload.customerProfile?.displayName || payload.email.split('@')[0],
          email: payload.email,
          role: payload.role,
          companyName: payload.customerProfile?.companyName,
        };
        this.saveSession(user);
        return user;
      }
    } catch {
      // Return local session if offline
    }
    return this.getSession();
  },

  saveSession(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Storage unavailable
    }
  },

  getSession(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch {
      // Invalid JSON
    }
    return null;
  },

  clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      api.post('/auth/logout').catch(() => {});
    } catch {
      // Storage unavailable
    }
  },

  getStoredRegisteredUsers(): User[] {
    try {
      const stored = localStorage.getItem('brightloop_registered_users');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    return [];
  },

  saveRegisteredUser(user: User): void {
    try {
      const existing = this.getStoredRegisteredUsers();
      existing.push(user);
      localStorage.setItem('brightloop_registered_users', JSON.stringify(existing));
    } catch {
      // Ignore
    }
  },
};
