import React, { createContext, useState, useContext, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: string | null;
  setAuth: (token: string | null, type: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize auth state from localStorage
const getInitialAuthState = () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  return {
    isAuthenticated: !!token,
    userType: userType
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuthState().isAuthenticated);
  const [userType, setUserType] = useState<string | null>(getInitialAuthState().userType);

  useEffect(() => {
    // Add event listener for storage changes
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');
      setIsAuthenticated(!!token);
      setUserType(storedUserType);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setAuth = (token: string | null, type: string | null) => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('userType', type || '');
      setIsAuthenticated(true);
      setUserType(type);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      setIsAuthenticated(false);
      setUserType(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 