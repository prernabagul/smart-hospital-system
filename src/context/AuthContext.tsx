import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  token?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  patient: User | null;
  isAuthenticated: boolean;
  login: (userDataOrEmail: User | string, name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = (userDataOrEmail: User | string, name?: string) => {
    let userData: User;

    if (typeof userDataOrEmail === 'string') {
      userData = {
        email: userDataOrEmail,
        name: name || userDataOrEmail.split('@')[0],
      };
    } else {
      userData = userDataOrEmail;
    }

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patient: user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;