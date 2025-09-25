import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, LoginRequest, SignupRequest, AuthResponse } from "@shared/api";
import { api, ApiError } from "@/lib/api";
import { handleError, AppError } from "@/lib/error-handler";
import { setUserId } from "@/lib/error-logger";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      api.setToken(savedToken);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const data = await api.login(credentials);
      
      setUser(data.user);
      setToken(data.token);
      api.setToken(data.token);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      // Set user ID for error logging
      setUserId(data.user.id);
      
      return { success: true };
    } catch (error) {
      const errorMessage = handleError(error, { 
        showToast: false, // Don't show toast here, let the component handle it
        logError: true 
      });
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (data: SignupRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const authData = await api.signup(data);
      
      setUser(authData.user);
      setToken(authData.token);
      api.setToken(authData.token);
      localStorage.setItem('auth_token', authData.token);
      localStorage.setItem('auth_user', JSON.stringify(authData.user));
      
      // Set user ID for error logging
      setUserId(authData.user.id);
      
      return { success: true };
    } catch (error) {
      const errorMessage = handleError(error, { 
        showToast: false, // Don't show toast here, let the component handle it
        logError: true 
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    api.setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Clear user ID from error logging
    setUserId('');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

