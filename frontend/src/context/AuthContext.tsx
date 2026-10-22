import React, { createContext, useContext, useState, useEffect } from "react";
import { api, authApi, type UserProfile } from "../api/client";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loading: boolean;
  login: (username: string, password: string, role?: 'student' | 'lecturer' | 'admin', university_code?: string) => Promise<void>;
  loginAsStudent: (data: { university_code: string; admission_number: string; password: string }) => Promise<void>;
  loginAsLecturer: (data: { username: string; password: string }) => Promise<void>;
  loginAsAdmin: (data: { username: string; password: string }) => Promise<void>;
  setSession: (data: { access: string; refresh: string; user: UserProfile }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("EduLabs_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("EduLabs_access_token");
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem("EduLabs_user", JSON.stringify(profile));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const handleAuthSuccess = (res: { access: string; refresh: string; user: UserProfile }) => {
    localStorage.setItem("EduLabs_access_token", res.access);
    localStorage.setItem("EduLabs_refresh_token", res.refresh);
    localStorage.setItem("EduLabs_user", JSON.stringify(res.user));
    setUser(res.user);
  };

  const login = async (
    username: string,
    password: string,
    role: 'student' | 'lecturer' | 'admin' = 'student',
    university_code: string = 'RU'
  ) => {
    if (role === 'lecturer') {
      const res = await api.lecturerLogin({ username, password });
      handleAuthSuccess(res);
    } else if (role === 'admin') {
      const res = await api.adminLogin({ username, password });
      handleAuthSuccess(res);
    } else {
      const res = await api.studentLogin({ university_code, admission_number: username, password });
      handleAuthSuccess(res);
    }
  };

  const loginAsStudent = async (data: { university_code: string; admission_number: string; password: string }) => {
    const res = await api.studentLogin(data);
    handleAuthSuccess(res);
  };

  const loginAsLecturer = async (data: { username: string; password: string }) => {
    const res = await api.lecturerLogin(data);
    handleAuthSuccess(res);
  };

  const loginAsAdmin = async (data: { username: string; password: string }) => {
    const res = await api.adminLogin(data);
    handleAuthSuccess(res);
  };

  const logout = () => {
    localStorage.removeItem("EduLabs_access_token");
    localStorage.removeItem("EduLabs_refresh_token");
    localStorage.removeItem("EduLabs_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loading: isLoading,
        login,
        loginAsStudent,
        loginAsLecturer,
        loginAsAdmin,
        setSession: handleAuthSuccess,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
