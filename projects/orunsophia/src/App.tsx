import React, { useState, useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import ChatInterface from './components/ChatInterface';
import Storage from './pages/Storage';
import Profile from './pages/Profile';
import AccessCode from './pages/AccessCode';
import GenerateCode from './pages/GenerateCode';
import NotFound from './pages/NotFound';
import { Toaster } from './components/ui/toaster';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const accessCode = localStorage.getItem('accessCode');
    if (accessCode) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessCode');
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      <RouterProvider
        router={createBrowserRouter([
          {
            path: '/',
            element: <Index />,
          },
          {
            path: '/chat',
            element: <ChatInterface />,
          },
          {
            path: '/storage',
            element: <Storage />,
          },
          {
            path: '/profile',
            element: <Profile />,
          },
          {
            path: '/access-code',
            element: <AccessCode onSuccess={handleLoginSuccess} />,
          },
          {
            path: '/generate-code',
            element: <GenerateCode />,
          },
          {
            path: '*',
            element: <NotFound />,
          },
        ])}
      />
      <Toaster />
    </div>
  );
}

export default App;
