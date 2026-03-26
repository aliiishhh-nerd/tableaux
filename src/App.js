import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './hooks/useApp';
import AppShell from './components/AppShell';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
