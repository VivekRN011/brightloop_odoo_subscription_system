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

/** Default approved demo identities for development and hackathon verification */
export const DEMO_USERS: Record<string, User & { passwordHint: string }> = {
  admin: {
    id: 'usr-admin-01',
    name: 'Alex Morgan',
    email: 'alex.morgan@brightloop.io',
    role: 'ADMIN',
    passwordHint: 'Admin@2026!',
  },
  staff: {
    id: 'usr-staff-01',
    name: 'Ivin Raj',
    email: 'staff.member@brightloop.io',
    role: 'STAFF',
    passwordHint: 'Staff@2026!',
  },
  customer: {
    id: 'cust-apex-01',
    name: 'Vikram Mehta',
    email: 'billing@apexlogistics.in',
    role: 'CUSTOMER',
    companyName: 'Apex Logistics India',
    passwordHint: 'Customer@2026!',
  },
};

export const authService = {
  /**
   * Attempts authentication via the backend API.
   * Falls back gracefully to verified development accounts when backend is still being provisioned.
   */
  async login(credentials: LoginFormData): Promise<AuthSessionResponse> {
    try {
      const response = await api.post<AuthSessionResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.data && response.data.user) {
        this.saveSession(response.data.user);
        return response.data;
      }
    } catch {
      // Backend not yet running auth endpoints or offline: check demo accounts
    }

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

    // Check if user was registered locally in this browser session
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
   * Registers a new customer account.
   * Mandated by PRD.md Section 4: Public registration ALWAYS creates accounts with role CUSTOMER.
   */
  async register(data: RegisterFormData): Promise<AuthSessionResponse> {
    const emailLower = data.email.trim().toLowerCase();

    // Check email uniqueness across demo and registered accounts
    const allUsers = [...Object.values(DEMO_USERS), ...this.getStoredRegisteredUsers()];
    const exists = allUsers.some((u) => u.email.toLowerCase() === emailLower);
    if (exists) {
      throw new Error('This email address is already registered. Please sign in instead.');
    }

    try {
      const response = await api.post<AuthSessionResponse>('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        role: 'CUSTOMER', // Explicitly enforced
      });

      if (response.data && response.data.user) {
        this.saveSession(response.data.user);
        return response.data;
      }
    } catch {
      // Backend offline fallback
    }

    const newCustomer: User = {
      id: `cust-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'CUSTOMER' as UserRole, // Public registration strictly assigns CUSTOMER role
      companyName: data.companyName,
    };

    // Store in local storage to support immediate login
    this.saveRegisteredUser(newCustomer);
    this.saveSession(newCustomer);

    return {
      success: true,
      user: newCustomer,
      token: `mock-jwt-token-customer-${Date.now()}`,
      message: 'Account created successfully',
    };
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
      // Invalid JSON or storage unavailable
    }
    return null;
  },

  clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
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

