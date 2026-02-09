import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ExportProvider from './components/ExportProvider';
import Layout from './components/Layout';
import TodayFollowUpsPage from './pages/TodayFollowUpsPage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InvoicesPage from './pages/InvoicesPage';
import FilesPage from './pages/FilesPage';
import SignInPage from './pages/SignInPage';
import BulkEditPage from './pages/BulkEditPage';

function App() {
  return (
    <Routes>
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <ExportProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<TodayFollowUpsPage />} />
                  <Route path="/inventory/bulk-edit" element={<BulkEditPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/files" element={<FilesPage />} />
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
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;