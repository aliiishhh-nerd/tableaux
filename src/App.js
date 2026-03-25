import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './hooks/useApp';
import AuthPage from './pages/AuthPage';
import AppShell from './components/AppShell';
import './index.css';

function AppRoutes() {
  const { user } = useApp();
  if (!user) return <AuthPage />;
  return <AppShell />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/*" element={<AppRoutes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
