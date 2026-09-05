import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AccessCode {
  code: string;
  created_at: string;
  last_used_at: string | null;
  use_count: number;
  allowed_workbooks: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  accessCode: string | null;
  allowedWorkbooks: string[];
  login: (code: string) => Promise<boolean>;
  logout: () => void;
  addCode: (code: string, allowedWorkbooks: string[]) => Promise<boolean>;
  updateCodeWorkbooks: (code: string, allowedWorkbooks: string[]) => Promise<boolean>;
  removeCode: (code: string) => Promise<boolean>;
  getIssuedCodes: () => AccessCode[];
  refreshCodes: () => Promise<void>;
  canAccessWorkbook: (workbookId: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_CODE = '101100';
const AUTH_STORAGE_KEY = 'orun-syntax-auth';

// All available workbook IDs
export const ALL_WORKBOOK_IDS = [
  'syntax10000-vol1',
  'syntax10000-vol2', 
  'syntax10000-vol3',
  'syntax2320',
  'weekly-g10',
  'weekly-g11'
] as const;

export type WorkbookId = typeof ALL_WORKBOOK_IDS[number];

export const WORKBOOK_LABELS: Record<WorkbookId, string> = {
  'syntax10000-vol1': 'Syntax 10000 Vol.1',
  'syntax10000-vol2': 'Syntax 10000 Vol.2',
  'syntax10000-vol3': 'Syntax 10000 Vol.3',
  'syntax2320': 'ORUN WEEKLY',
  'weekly-g10': 'ORUN WEEKLY 고1',
  'weekly-g11': 'ORUN WEEKLY 고2',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Use sessionStorage instead of localStorage for session-only persistence
  const [accessCode, setAccessCode] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [allowedWorkbooks, setAllowedWorkbooks] = useState<string[]>([]);
  const [issuedCodes, setIssuedCodes] = useState<AccessCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidated, setIsValidated] = useState(false);

  const isAdmin = accessCode === ADMIN_CODE;
  const isAuthenticated = isValidated && accessCode !== null;

  // Check if user can access a specific workbook
  const canAccessWorkbook = useCallback((workbookId: string) => {
    if (isAdmin) return true;
    return allowedWorkbooks.includes(workbookId);
  }, [isAdmin, allowedWorkbooks]);

  // Fetch codes from database
  const refreshCodes = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-codes', {
        body: { action: 'list' }
      });

      if (error) {
        console.error('Error fetching codes:', error);
        return;
      }

      if (data?.codes) {
        setIssuedCodes(data.codes);
      }
    } catch (err) {
      console.error('Error refreshing codes:', err);
    }
  }, []);

  // Validate stored code on mount
  useEffect(() => {
    const validateStoredCode = async () => {
      setIsLoading(true);
      
      if (!accessCode) {
        setIsLoading(false);
        setIsValidated(false);
        return;
      }

      // Admin code is always valid with all workbooks
      if (accessCode === ADMIN_CODE) {
        setIsValidated(true);
        setAllowedWorkbooks([...ALL_WORKBOOK_IDS]);
        setIsLoading(false);
        await refreshCodes();
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('manage-codes', {
          body: { action: 'validate', code: accessCode }
        });

        if (error || !data?.valid) {
          // Invalid code, clear it
          setAccessCode(null);
          setIsValidated(false);
          setAllowedWorkbooks([]);
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
        } else {
          setIsValidated(true);
          setAllowedWorkbooks(data.allowedWorkbooks || []);
        }
      } catch (err) {
        console.error('Error validating code:', err);
        setIsValidated(false);
      }
      
      setIsLoading(false);
    };

    validateStoredCode();
  }, [accessCode, refreshCodes]);

  const login = async (code: string): Promise<boolean> => {
    // Admin code check
    if (code === ADMIN_CODE) {
      setAccessCode(code);
      setIsValidated(true);
      setAllowedWorkbooks([...ALL_WORKBOOK_IDS]);
      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, code);
      } catch (e) {
        console.error('Failed to save auth to sessionStorage:', e);
      }
      await refreshCodes();
      return true;
    }

    try {
      const { data, error } = await supabase.functions.invoke('manage-codes', {
        body: { action: 'validate', code }
      });

      if (error || !data?.valid) {
        return false;
      }

      setAccessCode(code);
      setIsValidated(true);
      setAllowedWorkbooks(data.allowedWorkbooks || []);
      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, code);
      } catch (e) {
        console.error('Failed to save auth to sessionStorage:', e);
      }
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    setAccessCode(null);
    setIsValidated(false);
    setAllowedWorkbooks([]);
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove auth from sessionStorage:', e);
    }
  };

  const addCode = async (code: string, workbooks: string[]): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-codes', {
        body: { action: 'add', code, adminCode: accessCode, allowedWorkbooks: workbooks }
      });

      if (error || data?.error) {
        console.error('Error adding code:', error || data?.error);
        return false;
      }

      await refreshCodes();
      return true;
    } catch (err) {
      console.error('Error adding code:', err);
      return false;
    }
  };

  const updateCodeWorkbooks = async (code: string, workbooks: string[]): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-codes', {
        body: { action: 'updateWorkbooks', code, adminCode: accessCode, allowedWorkbooks: workbooks }
      });

      if (error || data?.error) {
        console.error('Error updating code workbooks:', error || data?.error);
        return false;
      }

      await refreshCodes();
      return true;
    } catch (err) {
      console.error('Error updating code workbooks:', err);
      return false;
    }
  };

  const removeCode = async (code: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-codes', {
        body: { action: 'remove', code, adminCode: accessCode }
      });

      if (error || data?.error) {
        console.error('Error removing code:', error || data?.error);
        return false;
      }

      await refreshCodes();
      return true;
    } catch (err) {
      console.error('Error removing code:', err);
      return false;
    }
  };

  const getIssuedCodes = () => issuedCodes;

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAdmin, 
      accessCode,
      allowedWorkbooks,
      login, 
      logout,
      addCode,
      updateCodeWorkbooks,
      removeCode,
      getIssuedCodes,
      refreshCodes,
      canAccessWorkbook,
      isLoading
    }}>
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
