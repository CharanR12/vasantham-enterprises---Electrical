import React, { useState } from 'react';
import { format } from 'date-fns';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { AnalyticsHeader } from '../components/analytics/AnalyticsHeader';
import { AnalyticsTabs } from '../components/analytics/AnalyticsTabs';
import { AnalyticsKPIs } from '../components/analytics/AnalyticsKPIs';
import { TrendCharts } from '../components/analytics/TrendCharts';
import { TeamPerformance } from '../components/analytics/TeamPerformance';
import { InventoryInsights } from '../components/analytics/InventoryInsights';
import { DailySalesFilters } from '../components/analytics/DailySalesFilters';
import { DailySalesSummary } from '../components/analytics/DailySalesSummary';
import { DailySalesList } from '../components/analytics/DailySalesList';
import { AnalyticsSkeleton } from '../components/skeletons/AnalyticsSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import { exportDailySalesToExcel } from '../utils/analyticsExport';

import { useBrandsQuery } from '../hooks/queries/useInventoryQueries';

const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [activeTab, setActiveTab] = useState<'follow-up' | 'inventory'>('follow-up');

  // Daily Sales specific states
  const [dailySalesStartDate, setDailySalesStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return format(date, 'yyyy-MM-dd');
  });
  const [dailySalesEndDate, setDailySalesEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [selectedSalesPerson, setSelectedSalesPerson] = useState('');

  // Inventory specific filter states
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [inventorySelectedBrand, setInventorySelectedBrand] = useState('');

  // Fetch brands for the filter
  const { data: brands = [] } = useBrandsQuery();

  // salesTypeFilter is now derived from activeTab for data fetching purposes
  // But we still pass it to hooks. 
  const salesTypeFilter = activeTab === 'follow-up' ? 'follow-up' : 'inventory';

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
    salesTypeFilter,
    inventorySearchTerm,
    inventorySelectedBrand
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

  // Reset filters when tab changes
  React.useEffect(() => {
    setSelectedSalesPerson('');
    setInventorySearchTerm('');
    setInventorySelectedBrand('');
  }, [activeTab]);

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {error && (
        <ErrorMessage message={error instanceof Error ? error.message : 'An error occurred'} className="mb-6 rounded-2xl shadow-sm border-red-100" />
      )}

      {/* Header handles export and period selection */}
      <AnalyticsHeader
        activeTab={activeTab as any}
        // Casting activeTab because Header might still expect 'overview'/'daily-sales' if typed strictly
        // We might need to update Header types too, but for UI checking let's see.
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
          {/* SHARED FILTERS (context aware) */}
          <DailySalesFilters
            startDate={dailySalesStartDate}
            endDate={dailySalesEndDate}
            selectedSalesPerson={selectedSalesPerson}
            salesTypeFilter={salesTypeFilter}
            salesPersons={salesPersons}
            onStartDateChange={setDailySalesStartDate}
            onEndDateChange={setDailySalesEndDate}
            onSalesPersonChange={setSelectedSalesPerson}
            onTypeFilterChange={() => { }} // Disabled/Fixed by tab
            loading={loading}
            // Logic to hide/show fields
            hideSalesPerson={activeTab === 'inventory'}
            hideRevenueChannel={true}
            // Inventory Filters
            showInventoryFilters={activeTab === 'inventory'}
            searchTerm={inventorySearchTerm}
            onSearchChange={setInventorySearchTerm}
            selectedBrand={inventorySelectedBrand}
            onBrandChange={setInventorySelectedBrand}
            brands={brands}
          />

          {activeTab === 'follow-up' && (
            <div className="space-y-8 animate-fadeIn">
              {/* 1. KPIs */}
              <AnalyticsKPIs
                salesMetrics={salesMetrics}
                // Hide inventory metrics in this tab
                inventoryMetrics={undefined as any}
                formatCurrency={formatCurrency}
              />

              {/* 2. Charts & Team Performance */}
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

              {/* 3. Detailed List */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Follow-up Sales Log</h3>
                <DailySalesSummary
                  stats={dailySalesSummaryStats}
                  formatCurrency={formatCurrency}
                />
                <DailySalesList
                  data={dailySalesData}
                  formatCurrency={formatCurrency}
                />
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-8 animate-fadeIn">
              {/* 1. KPIs */}
              <InventoryInsights
                topProducts={topProducts}
                inventoryMetrics={inventoryMetrics}
                brandPerformance={brandPerformance}
              />

              {/* 2. Trends (Inventory Volume) */}
              <TrendCharts
                timeBasedAnalytics={timeBasedAnalytics} // This now returns Inventory data
                formatCurrency={formatCurrency}
              />

              {/* 3. Detailed List */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Inventory Sales Log</h3>
                <DailySalesSummary
                  stats={dailySalesSummaryStats}
                  formatCurrency={formatCurrency}
                />
                <DailySalesList
                  data={dailySalesData}
                  formatCurrency={formatCurrency}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;