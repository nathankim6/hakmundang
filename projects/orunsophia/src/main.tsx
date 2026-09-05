
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure we're using the React 18 createRoot API correctly
const container = document.getElementById('root');

// TypeScript requires this check
if (!container) {
  throw new Error('Root element not found in the document');
}

const root = createRoot(container);
root.render(<App />);
