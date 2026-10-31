import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, DEMO_USERS } from '@/features/auth/services/auth.service';
import type { LoginFormData, RegisterFormData } from '@/features/auth/schemas/auth.schemas';

export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (credentials: LoginFormData) => Promise<User>;
  register: (data: RegisterFormData) => Promise<User>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with persisted session if available, defaulting to Admin demo user for convenience
  const [user, setUser] = useState<User | null>(() => {
    const saved = authService.getSession();
    return saved || DEMO_USERS.admin;
  });

  useEffect(() => {
    if (user) {
      authService.saveSession(user);
    } else {
      authService.clearSession();
    }
  }, [user]);

  const login = async (credentials: LoginFormData): Promise<User> => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response.user;
  };

  const register = async (data: RegisterFormData): Promise<User> => {
    const response = await authService.register(data);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    authService.clearSession();
    setUser(null);
  };

  const switchDemoRole = (role: UserRole) => {
    const key = role.toLowerCase() as keyof typeof DEMO_USERS;
    const demo = DEMO_USERS[key];
    if (demo) {
      setUser(demo);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
