import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { login as apiLogin, register as apiRegister, logout as apiLogout } from "../lib/api";

// Auth context with default values
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Auth storage key
const AUTH_STORAGE_KEY = 'sqllove_auth_state';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      if (typeof window === 'undefined') return;
      
      try {
        const storedState = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          if (parsedState && parsedState.user) {
            setUser(parsedState.user);
          } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (err) {
        console.error("Error loading auth state:", err);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiLogin(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        // Save to localStorage
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: result.user }));
        return { success: true };
      } else {
        setError(result.message || "Login failed");
        return { success: false, message: result.message || "Login failed" };
      }
    } catch (error) {
      const message = error.message || "An error occurred during login";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiRegister(name, email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        // Save to localStorage
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: result.user }));
        return { success: true };
      } else {
        setError(result.message || "Registration failed");
        return { success: false, message: result.message || "Registration failed" };
      }
    } catch (error) {
      const message = error.message || "An error occurred during registration";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      setLoading(false);
      router.push("/login");
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}
