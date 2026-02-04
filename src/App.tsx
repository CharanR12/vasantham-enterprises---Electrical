import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerProvider } from './context/CustomerContext';
import { InventoryProvider } from './context/InventoryContext';
import ProtectedRoute from './components/ProtectedRoute';
import ExportProvider from './components/ExportProvider';
import Layout from './components/Layout';
import TodayFollowUpsPage from './pages/TodayFollowUpsPage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SignInPage from './pages/SignInPage';

function App() {
  return (
    <Routes>
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <CustomerProvider>
              <InventoryProvider>
                <ExportProvider>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<TodayFollowUpsPage />} />
                      <Route path="/inventory" element={<InventoryPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      {/* Legacy routes for backward compatibility */}
                      <Route path="/admin" element={<SettingsPage />} />
                      <Route path="/inventory/settings" element={<SettingsPage />} />
                      {/* Catch-all for protected routes */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ExportProvider>
              </InventoryProvider>
            </CustomerProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;