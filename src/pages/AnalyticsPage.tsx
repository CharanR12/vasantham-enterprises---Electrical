import React, { useState } from 'react';
import { format } from 'date-fns';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { AnalyticsHeader } from '../components/analytics/AnalyticsHeader';
import { AnalyticsTabs } from '../components/analytics/AnalyticsTabs';
import { AnalyticsKPIs } from '../components/analytics/AnalyticsKPIs';
import { TrendCharts } from '../components/analytics/TrendCharts';
import { TeamPerformance } from '../components/analytics/TeamPerformance';
import { InventoryInsights } from '../components/analytics/InventoryInsights';
import { StrategicInsights } from '../components/analytics/StrategicInsights';
import { DailySalesFilters } from '../components/analytics/DailySalesFilters';
import { DailySalesSummary } from '../components/analytics/DailySalesSummary';
import { DailySalesList } from '../components/analytics/DailySalesList';
import { AnalyticsSkeleton } from '../components/skeletons/AnalyticsSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import { exportDailySalesToExcel } from '../utils/analyticsExport';

const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'daily-sales'>('overview');

  // Daily Sales specific states
  const [dailySalesStartDate, setDailySalesStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return format(date, 'yyyy-MM-dd');
  });
  const [dailySalesEndDate, setDailySalesEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [selectedSalesPerson, setSelectedSalesPerson] = useState('');
  const [salesTypeFilter, setSalesTypeFilter] = useState<'all' | 'follow-up' | 'inventory'>('all');

  const {
    loading,
    error,
    salesMetrics,
    salesPersonPerformance,
    inventoryMetrics,
    timeBasedAnalytics,
    topProducts,
    brandPerformance,
    dailySalesData,
    dailySalesSummaryStats,
    salesPersons
  } = useAnalyticsData(
    selectedPeriod,
    dailySalesStartDate,
    dailySalesEndDate,
    selectedSalesPerson,
    salesTypeFilter
  );

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = () => {
    exportDailySalesToExcel(
      dailySalesData,
      dailySalesSummaryStats,
      dailySalesStartDate,
      dailySalesEndDate,
      formatCurrency
    );
  };

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {error && (
        <ErrorMessage message={error} className="mb-6 rounded-2xl shadow-sm border-red-100" />
      )}

      <AnalyticsHeader
        activeTab={activeTab}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        onExport={handleExport}
        loading={loading}
      />

      <AnalyticsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        disabled={loading}
      />

      {loading ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {activeTab === 'overview' && (
            <>
              <AnalyticsKPIs
                salesMetrics={salesMetrics}
                inventoryMetrics={inventoryMetrics}
                formatCurrency={formatCurrency}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendCharts
                  timeBasedAnalytics={timeBasedAnalytics}
                  formatCurrency={formatCurrency}
                />
                <TeamPerformance
                  salesPersonPerformance={salesPersonPerformance}
                  formatCurrency={formatCurrency}
                />
              </div>

              <InventoryInsights
                topProducts={topProducts}
                inventoryMetrics={inventoryMetrics}
                brandPerformance={brandPerformance}
              />

              <StrategicInsights
                salesMetrics={salesMetrics}
                inventoryMetrics={inventoryMetrics}
                formatCurrency={formatCurrency}
              />
            </>
          )}

          {activeTab === 'daily-sales' && (
            <>
              <DailySalesFilters
                startDate={dailySalesStartDate}
                endDate={dailySalesEndDate}
                selectedSalesPerson={selectedSalesPerson}
                salesTypeFilter={salesTypeFilter}
                salesPersons={salesPersons}
                onStartDateChange={setDailySalesStartDate}
                onEndDateChange={setDailySalesEndDate}
                onSalesPersonChange={setSelectedSalesPerson}
                onTypeFilterChange={setSalesTypeFilter}
                loading={loading}
              />

              <DailySalesSummary
                stats={dailySalesSummaryStats}
                formatCurrency={formatCurrency}
              />

              <DailySalesList
                data={dailySalesData}
                formatCurrency={formatCurrency}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;