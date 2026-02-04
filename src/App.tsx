import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CustomerProvider } from './context/CustomerContext';
import { InventoryProvider } from './context/InventoryContext';
import ProtectedRoute from './components/ProtectedRoute';
import ExportProvider from './components/ExportProvider';
import TodayFollowUpsPage from './pages/TodayFollowUpsPage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <ProtectedRoute>
      <CustomerProvider>
        <InventoryProvider>
          <ExportProvider>
            <Routes>
              <Route path="/" element={<TodayFollowUpsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              {/* Legacy routes for backward compatibility */}
              <Route path="/admin" element={<SettingsPage />} />
              <Route path="/inventory/settings" element={<SettingsPage />} />
            </Routes>
          </ExportProvider>
        </InventoryProvider>
      </CustomerProvider>
    </ProtectedRoute>
  );
}

export default App;