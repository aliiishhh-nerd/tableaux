import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './hooks/useApp';
import AppShell from './components/AppShell';
import PWAInstallPrompt from './components/PWAInstallPrompt';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
        <PWAInstallPrompt />
      </AppProvider>
    </BrowserRouter>
  );
}