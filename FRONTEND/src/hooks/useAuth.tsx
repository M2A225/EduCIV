import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import { setAccessToken, setOnTokenRefreshed } from '../services/api';
import type { User, UserRole } from '../types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  schoolIds: number[];
  currentSchoolId: number | null;
  activeRole: UserRole | null;
  availableRoles: UserRole[];
  login: (accessToken: string, userData?: Record<string, unknown>) => void;
  logout: () => void;
  setCurrentSchoolId: (schoolId: number) => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const SCHOOL_KEY = 'currentSchoolId';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [schoolIds, setSchoolIds] = useState<number[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [currentSchoolId, setCurrentSchoolIdState] = useState<number | null>(
    Number(localStorage.getItem(SCHOOL_KEY)) || null
  );
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    setOnTokenRefreshed((newToken, userData) => {
      applyToken(newToken, userData);
    });
    const restore = async () => {
      try {
        const res = await authService.refresh();
        const newToken = res.data.data.accessToken;
        const userData = res.data.data.user;
        applyToken(newToken, userData);
      } catch {
        setToken(null);
        setAccessToken(null);
      } finally {
        setInitialising(false);
      }
    };
    restore();
    return () => { setOnTokenRefreshed(null); };
  }, []);

  const applyToken = (newToken: string, userData?: Record<string, unknown>) => {
    setAccessToken(newToken);
    setToken(newToken);
    if (userData) {
      setUser({
        id: userData.id as number,
        name: (userData.name as string) || '',
        email: (userData.email as string) || '',
        phone: (userData.phone as string) || '',
        role: userData.role as UserRole,
        school_id: userData.primary_school_id as number,
      });
      const ids = (userData.school_ids as number[]) || [];
      setSchoolIds(ids);
      setActiveRole(userData.role as UserRole);
      setAvailableRoles((userData.roles as UserRole[]) || [userData.role as UserRole]);
      const stored = Number(localStorage.getItem(SCHOOL_KEY));
      if (stored && ids.includes(stored)) {
        setCurrentSchoolIdState(stored);
      } else {
        const fallback = (userData.primary_school_id as number) || ids[0] || null;
        setCurrentSchoolIdState(fallback);
        if (fallback) localStorage.setItem(SCHOOL_KEY, String(fallback));
      }
    }
  };

  const login = (accessToken: string, userData?: Record<string, unknown>) => {
    applyToken(accessToken, userData);
  };

  const logout = () => {
    authService.logout().catch(() => {});
    localStorage.removeItem(SCHOOL_KEY);
    setAccessToken(null);
    setToken(null);
    setUser(null);
    setSchoolIds([]);
    setCurrentSchoolIdState(null);
    setActiveRole(null);
    setAvailableRoles([]);
  };

  const setCurrentSchoolId = useCallback((schoolId: number) => {
    localStorage.setItem(SCHOOL_KEY, String(schoolId));
    setCurrentSchoolIdState(schoolId);
  }, []);

  const switchRole = useCallback(async (role: UserRole) => {
    const res = await authService.switchRole(role);
    const newToken = res.data.data.accessToken;
    const userData = res.data.data.user;
    applyToken(newToken, userData);
  }, []);

  return (
    <AuthContext.Provider value={{
      token, user, schoolIds, currentSchoolId,
      activeRole, availableRoles,
      login, logout, setCurrentSchoolId, switchRole
    }}>
      {!initialising && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
