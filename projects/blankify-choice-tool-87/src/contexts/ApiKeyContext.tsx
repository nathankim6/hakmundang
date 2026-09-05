
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ApiKeyContextType {
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
  isApiConnected: boolean;
  setIsApiConnected: (isConnected: boolean) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');
  const [isApiConnected, setIsApiConnected] = useState<boolean>(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setOpenaiApiKey(savedApiKey);
      setIsApiConnected(true);
    }
  }, []);

  // Save API key to localStorage whenever it changes
  useEffect(() => {
    if (openaiApiKey) {
      localStorage.setItem('openai_api_key', openaiApiKey);
    }
  }, [openaiApiKey]);

  return (
    <ApiKeyContext.Provider
      value={{
        openaiApiKey,
        setOpenaiApiKey,
        isApiConnected,
        setIsApiConnected,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
