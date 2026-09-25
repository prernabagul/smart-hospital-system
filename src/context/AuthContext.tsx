import React, { createContext, useContext, useState } from 'react';

// 1. Defined Interface with optional medical fields
export interface User {
  id: string;
  patientId?: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  mobileNumber?: string;
  password?: string;
  role: string;

  // Optional Medical & Profile Fields
  bloodGroup?: string;
  allergies?: string[];
  dateOfBirth?: string;
  age?: number | string;
  gender?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
}

interface AuthContextType {
  user: User | null;
  register: (user: User) => { success: boolean; message: string };
  login: (email: string, password?: string) => { success: boolean; message: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('active_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const register = (newUser: User) => {
    const existingUsersRaw = localStorage.getItem('registered_users');
    const registeredUsers: User[] = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];

    const userExists = registeredUsers.some(
      u => u.email.toLowerCase() === newUser.email.toLowerCase()
    );
    
    if (userExists) {
      return { success: false, message: 'Account with this email already exists. Please sign in.' };
    }

    // Preserve fullName alias
    const completeUser: User = {
      ...newUser,
      fullName: newUser.fullName || newUser.name,
      patientId: newUser.patientId || newUser.id,
    };

    registeredUsers.push(completeUser);
    localStorage.setItem('registered_users', JSON.stringify(registeredUsers));

    setUser(completeUser);
    localStorage.setItem('active_user_session', JSON.stringify(completeUser));

    return { success: true, message: 'Registration successful!' };
  };

  const login = (email: string, password?: string) => {
    const existingUsersRaw = localStorage.getItem('registered_users');
    const registeredUsers: User[] = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];

    const foundUser = registeredUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      return { success: false, message: 'Invalid credentials or user not registered. Please register first.' };
    }

    setUser(foundUser);
    localStorage.setItem('active_user_session', JSON.stringify(foundUser));

    return { success: true, message: 'Login successful!' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('active_user_session');
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};