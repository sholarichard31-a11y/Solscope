import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';

function AppRoutes() {
  const { isConnected } = useWallet();

  return (
    <Routes>
      <Route path="/" element={isConnected ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/dashboard" element={isConnected ? <DashboardPage /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <WalletProvider>
        <AppRoutes />
      </WalletProvider>
    </BrowserRouter>
  );
}
