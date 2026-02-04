import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCustomers } from '../context/CustomerContext';
import { InventoryProvider, useInventory } from '../context/InventoryContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock,
  ShoppingCart,
  AlertTriangle,
  Filter,
  Download,
  UserCheck
} from 'lucide-react';
import { parseISO, format, isThisMonth, isThisWeek, isToday, startOfMonth, endOfMonth, eachDayOfInterval, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import * as XLSX from 'xlsx';

const AnalyticsContent: React.FC = () => {
  const navigate = useNavigate();
  const { customers, salesPersons, loading: salesLoading, error: salesError } = useCustomers();
  const { products, salesEntries, loading: inventoryLoading, error: inventoryError } = useInventory();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'daily-sales'>('overview');
  
  // Daily Sales specific states
  const [dailySalesStartDate, setDailySalesStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to last 30 days
    return format(date, 'yyyy-MM-dd');
  });
  
  const [dailySalesEndDate, setDailySalesEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [selectedSalesPerson, setSelectedSalesPerson] = useState('');
  const [salesTypeFilter, setSalesTypeFilter] = useState<'all' | 'follow-up' | 'inventory'>('all');

  const loading = salesLoading || inventoryLoading;
  const error = salesError || inventoryError;

  // Enhanced Sales Analytics with Revenue
  const getSalesMetrics = () => {
    const completedSales = customers.filter(customer =>
      customer.followUps.some(followUp => followUp.status === 'Sales completed')
    );
    
    const rejectedSales = customers.filter(customer =>
      customer.followUps.some(followUp => followUp.status === 'Sales rejected')
    );

    const pendingSales = customers.filter(customer =>
      customer.followUps.every(followUp => 
        followUp.status !== 'Sales completed' && followUp.status !== 'Sales rejected'
      )
    );

    const todayFollowUps = customers.filter(customer =>
      customer.followUps.some(followUp => followUp.date === format(new Date(), 'yyyy-MM-dd'))
    );

    // Calculate total revenue from completed sales
    const totalRevenue = customers.reduce((total, customer) => {
      return total + customer.followUps
        .filter(followUp => followUp.status === 'Sales completed' && followUp.salesAmount)
        .reduce((sum, followUp) => sum + (followUp.salesAmount || 0), 0);
    }, 0);

    // Calculate average deal size
    const completedSalesWithAmount = customers.reduce((total, customer) => {
      return total + customer.followUps.filter(followUp => 
        followUp.status === 'Sales completed' && followUp.salesAmount && followUp.salesAmount > 0
      ).length;
    }, 0);

    const averageDealSize = completedSalesWithAmount > 0 ? totalRevenue / completedSalesWithAmount : 0;

    const conversionRate = customers.length > 0 ? (completedSales.length / customers.length * 100) : 0;
    const rejectionRate = customers.length > 0 ? (rejectedSales.length / customers.length * 100) : 0;

    return {
      totalCustomers: customers.length,
      completedSales: completedSales.length,
      rejectedSales: rejectedSales.length,
      pendingSales: pendingSales.length,
      todayFollowUps: todayFollowUps.length,
      totalRevenue,
      averageDealSize,
      conversionRate: conversionRate.toFixed(1),
      rejectionRate: rejectionRate.toFixed(1)
    };
  };

  // Enhanced Sales Person Performance with Revenue
  const getSalesPersonPerformance = () => {
    return salesPersons.map(person => {
      const personCustomers = customers.filter(c => c.salesPerson.id === person.id);
      const completedSales = personCustomers.filter(customer =>
        customer.followUps.some(followUp => followUp.status === 'Sales completed')
      );
      const rejectedSales = personCustomers.filter(customer =>
        customer.followUps.some(followUp => followUp.status === 'Sales rejected')
      );
      
      // Calculate revenue for this sales person
      const revenue = personCustomers.reduce((total, customer) => {
        return total + customer.followUps
          .filter(followUp => followUp.status === 'Sales completed' && followUp.salesAmount)
          .reduce((sum, followUp) => sum + (followUp.salesAmount || 0), 0);
      }, 0);
      
      const conversionRate = personCustomers.length > 0 ? (completedSales.length / personCustomers.length * 100) : 0;
      const averageDealSize = completedSales.length > 0 ? revenue / completedSales.length : 0;
      
      return {
        name: person.name,
        totalCustomers: personCustomers.length,
        completedSales: completedSales.length,
        rejectedSales: rejectedSales.length,
        revenue,
        averageDealSize,
        conversionRate,
        efficiency: personCustomers.length > 0 ? (completedSales.length / (completedSales.length + rejectedSales.length) * 100) || 0 : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);
  };

  // Enhanced Inventory Analytics
  const getInventoryMetrics = () => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.quantityAvailable, 0);
    const totalSold = salesEntries.reduce((sum, entry) => sum + entry.quantitySold, 0);
    const lowStockProducts = products.filter(product => product.quantityAvailable <= 5 && product.quantityAvailable > 0).length;
    const outOfStockProducts = products.filter(product => product.quantityAvailable === 0).length;
    const inStockProducts = products.filter(product => product.quantityAvailable > 5).length;

    // Calculate stock turnover
    const averageStock = totalStock + totalSold;
    const stockTurnover = averageStock > 0 ? (totalSold / averageStock * 100) : 0;

    return {
      totalProducts,
      totalStock,
      totalSold,
      lowStockProducts,
      outOfStockProducts,
      inStockProducts,
      stockTurnover: stockTurnover.toFixed(1),
      stockValue: totalStock
    };
  };

  // Enhanced Time-based Analytics with Revenue Trends
  const getTimeBasedAnalytics = () => {
    const now = new Date();
    const startDate = selectedPeriod === 'week' ? subDays(now, 7) :
                     selectedPeriod === 'month' ? startOfMonth(now) : new Date(2024, 0, 1);
    const endDate = selectedPeriod === 'month' ? endOfMonth(now) : now;

    const filteredSales = salesEntries.filter(entry => {
      const saleDate = parseISO(entry.saleDate);
      return saleDate >= startDate && saleDate <= endDate;
    });

    const filteredCustomers = customers.filter(customer => {
      const createdDate = parseISO(customer.createdAt);
      return createdDate >= startDate && createdDate <= endDate;
    });

    // Calculate revenue for the period
    const periodRevenue = customers.reduce((total, customer) => {
      return total + customer.followUps
        .filter(followUp => {
          const followUpDate = parseISO(followUp.date);
          return followUp.status === 'Sales completed' && 
                 followUp.salesAmount && 
                 followUpDate >= startDate && 
                 followUpDate <= endDate;
        })
        .reduce((sum, followUp) => sum + (followUp.salesAmount || 0), 0);
    }, 0);

    // Daily breakdown for trend analysis
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dailyData = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const daySales = filteredSales.filter(entry => entry.saleDate === dayStr);
      const dayCustomers = filteredCustomers.filter(customer => customer.createdAt === dayStr);
      const dayRevenue = customers.reduce((total, customer) => {
        return total + customer.followUps
          .filter(followUp => followUp.date === dayStr && followUp.status === 'Sales completed' && followUp.salesAmount)
          .reduce((sum, followUp) => sum + (followUp.salesAmount || 0), 0);
      }, 0);
      
      return {
        date: format(day, 'MMM dd'),
        fullDate: dayStr,
        sales: daySales.length,
        customers: dayCustomers.length,
        revenue: dayRevenue
      };
    });

    // Calculate growth trends
    const recentData = dailyData.slice(-7);
    const previousData = dailyData.slice(-14, -7);
    
    const recentAvg = recentData.reduce((sum, day) => sum + day.sales, 0) / recentData.length;
    const previousAvg = previousData.reduce((sum, day) => sum + day.sales, 0) / previousData.length;
    const growthTrend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg * 100) : 0;

    return {
      totalSales: filteredSales.length,
      totalCustomers: filteredCustomers.length,
      totalRevenue: periodRevenue,
      dailyData: recentData,
      growthTrend: growthTrend.toFixed(1),
      averageDailySales: recentAvg.toFixed(1)
    };
  };

  // Enhanced Top Products with More Metrics
  const getTopProducts = () => {
    const productSales = products.map(product => {
      const productSalesEntries = salesEntries.filter(entry => entry.productId === product.id);
      const totalSold = productSalesEntries.reduce((sum, entry) => sum + entry.quantitySold, 0);
      const recentSales = productSalesEntries.filter(entry => 
        isThisMonth(parseISO(entry.saleDate))
      ).reduce((sum, entry) => sum + entry.quantitySold, 0);
      
      return {
        id: product.id,
        name: product.productName,
        brand: product.brand.name,
        totalSold,
        recentSales,
        currentStock: product.quantityAvailable,
        stockStatus: product.quantityAvailable === 0 ? 'Out of Stock' : 
                    product.quantityAvailable <= 5 ? 'Low Stock' : 'In Stock',
        revenue: totalSold,
        velocity: totalSold / Math.max(1, (totalSold + product.quantityAvailable))
      };
    }).filter(p => p.totalSold > 0)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    return productSales;
  };

  // Brand Performance Analysis
  const getBrandPerformance = () => {
    const brandMap = new Map();
    
    products.forEach(product => {
      const brandId = product.brand.id;
      const brandName = product.brand.name;
      const productSales = salesEntries.filter(entry => entry.productId === product.id);
      const totalSold = productSales.reduce((sum, entry) => sum + entry.quantitySold, 0);
      
      if (brandMap.has(brandId)) {
        const existing = brandMap.get(brandId);
        brandMap.set(brandId, {
          ...existing,
          totalProducts: existing.totalProducts + 1,
          totalSold: existing.totalSold + totalSold,
          totalStock: existing.totalStock + product.quantityAvailable
        });
      } else {
        brandMap.set(brandId, {
          name: brandName,
          totalProducts: 1,
          totalSold,
          totalStock: product.quantityAvailable
        });
      }
    });

    return Array.from(brandMap.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);
  };

  // Daily Sales Data Processing
  const dailySalesData = React.useMemo(() => {
    const salesMap = new Map();
    
    // Process follow-up sales
    customers.forEach(customer => {
      // Filter by sales person if selected
      if (selectedSalesPerson && customer.salesPerson.id !== selectedSalesPerson) {
        return;
      }

      customer.followUps.forEach(followUp => {
        if (followUp.status === 'Sales completed' && followUp.salesAmount) {
          const followUpDate = parseISO(followUp.date);
          const startDateObj = parseISO(dailySalesStartDate);
          const endDateObj = parseISO(dailySalesEndDate);
          
          // Check if follow-up date is within selected range
          if (isWithinInterval(followUpDate, { 
            start: startOfDay(startDateObj), 
            end: endOfDay(endDateObj) 
          })) {
            const dateKey = format(followUpDate, 'yyyy-MM-dd');
            
            if (!salesMap.has(dateKey)) {
              salesMap.set(dateKey, {
                date: dateKey,
                displayDate: format(followUpDate, 'dd/MM/yyyy'),
                fullDate: format(followUpDate, 'EEEE, dd MMMM yyyy'),
                totalAmount: 0,
                followUpSalesCount: 0,
                inventorySalesCount: 0,
                followUpSales: [],
                inventorySales: [],
                salesPersons: new Set()
              });
            }
            
            const dayData = salesMap.get(dateKey);
            dayData.totalAmount += followUp.salesAmount;
            dayData.followUpSalesCount += 1;
            dayData.followUpSales.push({
              type: 'follow-up',
              customerName: customer.name,
              mobile: customer.mobile,
              amount: followUp.salesAmount,
              salesPerson: customer.salesPerson.name,
              remarks: followUp.remarks,
              location: customer.location
            });
            dayData.salesPersons.add(customer.salesPerson.name);
          }
        }
      });
    });

    // Process inventory sales
    salesEntries.forEach(saleEntry => {
      const saleDate = parseISO(saleEntry.saleDate);
      const startDateObj = parseISO(dailySalesStartDate);
      const endDateObj = parseISO(dailySalesEndDate);
      
      if (isWithinInterval(saleDate, { 
        start: startOfDay(startDateObj), 
        end: endOfDay(endDateObj) 
      })) {
        const dateKey = format(saleDate, 'yyyy-MM-dd');
        const product = products.find(p => p.id === saleEntry.productId);
        
        if (!salesMap.has(dateKey)) {
          salesMap.set(dateKey, {
            date: dateKey,
            displayDate: format(saleDate, 'dd/MM/yyyy'),
            fullDate: format(saleDate, 'EEEE, dd MMMM yyyy'),
            totalAmount: 0,
            followUpSalesCount: 0,
            inventorySalesCount: 0,
            followUpSales: [],
            inventorySales: [],
            salesPersons: new Set()
          });
        }
        
        const dayData = salesMap.get(dateKey);
        dayData.inventorySalesCount += 1;
        dayData.inventorySales.push({
          type: 'inventory',
          customerName: saleEntry.customerName,
          productName: product?.productName || 'Unknown Product',
          brandName: product?.brand.name || 'Unknown Brand',
          modelNumber: product?.modelNumber || '',
          quantitySold: saleEntry.quantitySold,
          billNumber: saleEntry.billNumber,
          remarks: `${saleEntry.quantitySold} units of ${product?.productName || 'product'}`
        });
      }
    });

    // Convert to array and sort by date (newest first)
    const result = Array.from(salesMap.values())
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

    // Apply sales type filter
    if (salesTypeFilter !== 'all') {
      return result.filter(day => {
        if (salesTypeFilter === 'follow-up') {
          return day.followUpSalesCount > 0;
        } else if (salesTypeFilter === 'inventory') {
          return day.inventorySalesCount > 0;
        }
        return true;
      });
    }

    return result;
  }, [customers, salesEntries, products, dailySalesStartDate, dailySalesEndDate, selectedSalesPerson, salesTypeFilter]);

  // Calculate daily sales summary statistics
  const dailySalesSummaryStats = React.useMemo(() => {
    const totalRevenue = dailySalesData.reduce((sum, day) => sum + day.totalAmount, 0);
    const totalFollowUpSales = dailySalesData.reduce((sum, day) => sum + day.followUpSalesCount, 0);
    const totalInventorySales = dailySalesData.reduce((sum, day) => sum + day.inventorySalesCount, 0);
    const totalSales = totalFollowUpSales + totalInventorySales;
    const averageDailyRevenue = dailySalesData.length > 0 ? totalRevenue / dailySalesData.length : 0;
    const averageSaleAmount = totalFollowUpSales > 0 ? totalRevenue / totalFollowUpSales : 0;
    const activeDays = dailySalesData.filter(day => day.followUpSalesCount > 0 || day.inventorySalesCount > 0).length;
    const totalUnitsFromInventory = dailySalesData.reduce((sum, day) => {
      return sum + day.inventorySales.reduce((daySum, sale) => daySum + (sale.quantitySold || 0), 0);
    }, 0);
    
    return {
      totalRevenue,
      totalFollowUpSales,
      totalInventorySales,
      totalSales,
      averageDailyRevenue,
      averageSaleAmount,
      activeDays,
      totalDays: dailySalesData.length,
      totalUnitsFromInventory
    };
  }, [dailySalesData]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportDailySalesToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Daily Summary Sheet
    const summaryData = dailySalesData.map(day => ({
      'Date': day.fullDate,
      'Follow-up Sales': day.followUpSalesCount,
      'Inventory Sales': day.inventorySalesCount,
      'Total Sales': day.followUpSalesCount + day.inventorySalesCount,
      'Revenue (Follow-up)': day.totalAmount,
      'Revenue (Follow-up) Formatted': formatCurrency(day.totalAmount),
      'Average Sale Amount': day.followUpSalesCount > 0 ? day.totalAmount / day.followUpSalesCount : 0,
      'Average Sale Amount Formatted': day.followUpSalesCount > 0 ? formatCurrency(day.totalAmount / day.followUpSalesCount) : '₹0',
      'Sales Persons': Array.from(day.salesPersons).join(', ')
    }));
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Daily Summary');
    
    // Follow-up Sales Sheet
    const followUpData: any[] = [];
    dailySalesData.forEach(day => {
      day.followUpSales.forEach(sale => {
        followUpData.push({
          'Date': day.fullDate,
          'Type': 'Follow-up Sale',
          'Customer Name': sale.customerName,
          'Mobile': sale.mobile,
          'Location': sale.location,
          'Sales Person': sale.salesPerson,
          'Sale Amount': sale.amount,
          'Sale Amount Formatted': formatCurrency(sale.amount),
          'Remarks': sale.remarks
        });
      });
    });
    
    const followUpSheet = XLSX.utils.json_to_sheet(followUpData);
    XLSX.utils.book_append_sheet(workbook, followUpSheet, 'Follow-up Sales');
    
    // Inventory Sales Sheet
    const inventoryData: any[] = [];
    dailySalesData.forEach(day => {
      day.inventorySales.forEach(sale => {
        inventoryData.push({
          'Date': day.fullDate,
          'Type': 'Inventory Sale',
          'Customer Name': sale.customerName,
          'Product Name': sale.productName,
          'Brand': sale.brandName,
          'Model Number': sale.modelNumber,
          'Quantity Sold': sale.quantitySold,
          'Bill Number': sale.billNumber || '',
          'Description': sale.remarks
        });
      });
    });
    
    const inventorySheet = XLSX.utils.json_to_sheet(inventoryData);
    XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventory Sales');
    
    // Statistics Sheet
    const statsData = [
      {
        'Metric': 'Total Revenue (Follow-up)',
        'Value': dailySalesSummaryStats.totalRevenue,
        'Formatted Value': formatCurrency(dailySalesSummaryStats.totalRevenue)
      },
      {
        'Metric': 'Total Follow-up Sales',
        'Value': dailySalesSummaryStats.totalFollowUpSales,
        'Formatted Value': dailySalesSummaryStats.totalFollowUpSales.toString()
      },
      {
        'Metric': 'Total Inventory Sales',
        'Value': dailySalesSummaryStats.totalInventorySales,
        'Formatted Value': dailySalesSummaryStats.totalInventorySales.toString()
      },
      {
        'Metric': 'Total Units Sold (Inventory)',
        'Value': dailySalesSummaryStats.totalUnitsFromInventory,
        'Formatted Value': dailySalesSummaryStats.totalUnitsFromInventory.toString()
      },
      {
        'Metric': 'Average Daily Revenue',
        'Value': dailySalesSummaryStats.averageDailyRevenue,
        'Formatted Value': formatCurrency(dailySalesSummaryStats.averageDailyRevenue)
      },
      {
        'Metric': 'Average Sale Amount',
        'Value': dailySalesSummaryStats.averageSaleAmount,
        'Formatted Value': formatCurrency(dailySalesSummaryStats.averageSaleAmount)
      },
      {
        'Metric': 'Active Sales Days',
        'Value': dailySalesSummaryStats.activeDays,
        'Formatted Value': dailySalesSummaryStats.activeDays.toString()
      }
    ];
    
    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
    
    // Generate filename
    const filename = `Daily_Sales_Report_${dailySalesStartDate}_to_${dailySalesEndDate}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const salesMetrics = getSalesMetrics();
  const salesPersonPerformance = getSalesPersonPerformance();
  const inventoryMetrics = getInventoryMetrics();
  const timeBasedAnalytics = getTimeBasedAnalytics();
  const topProducts = getTopProducts();
  const brandPerformance = getBrandPerformance();

  return (
    <Layout>
      <div className="space-y-6">
        {error && (
          <ErrorMessage message={error} className="mb-4" />
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {activeTab === 'daily-sales' && (
              <button
                onClick={exportDailySalesToExcel}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </button>
            )}
            {activeTab === 'overview' && (
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'all')}
                className="p-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Overview Analytics</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('daily-sales')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'daily-sales'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Daily Sales</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Overview Analytics Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Enhanced Overview KPIs with Revenue */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <Users className="h-6 w-6 text-blue-600" />
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{salesMetrics.totalCustomers}</div>
                <div className="text-xs text-blue-600">Total Customers</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{salesMetrics.completedSales}</div>
                <div className="text-xs text-green-600">Sales Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <div className="flex items-center justify-between">
              <DollarSign className="h-6 w-6 text-emerald-600" />
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-600">{formatCurrency(salesMetrics.totalRevenue)}</div>
                <div className="text-xs text-emerald-600">Total Revenue</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <Target className="h-6 w-6 text-purple-600" />
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">{salesMetrics.conversionRate}%</div>
                <div className="text-xs text-purple-600">Conversion Rate</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between">
              <Package className="h-6 w-6 text-orange-600" />
              <div className="text-right">
                <div className="text-lg font-bold text-orange-600">{inventoryMetrics.totalProducts}</div>
                <div className="text-xs text-orange-600">Total Products</div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
            <div className="flex items-center justify-between">
              <ShoppingCart className="h-6 w-6 text-indigo-600" />
              <div className="text-right">
                <div className="text-lg font-bold text-indigo-600">{inventoryMetrics.totalSold}</div>
                <div className="text-xs text-indigo-600">Units Sold</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center justify-between">
              <Calendar className="h-6 w-6 text-red-600" />
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">{salesMetrics.todayFollowUps}</div>
                <div className="text-xs text-red-600">Today's Follow-ups</div>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
            <div className="flex items-center justify-between">
              <Activity className="h-6 w-6 text-teal-600" />
              <div className="text-right">
                <div className="text-lg font-bold text-teal-600">{formatCurrency(salesMetrics.averageDealSize)}</div>
                <div className="text-xs text-teal-600">Avg Deal Size</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend Chart with Revenue */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Sales & Revenue Trend (Last 7 Days)
            </h3>
            <div className="space-y-4">
              {timeBasedAnalytics.dailyData.map((day, index) => {
                const maxSales = Math.max(...timeBasedAnalytics.dailyData.map(d => d.sales), 1);
                const salesWidth = (day.sales / maxSales) * 100;
                const maxRevenue = Math.max(...timeBasedAnalytics.dailyData.map(d => d.revenue), 1);
                const revenueWidth = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{day.date}</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-blue-600">{day.customers} customers</span>
                        <span className="text-green-600">{day.sales} sales</span>
                        <span className="text-emerald-600">{formatCurrency(day.revenue)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 text-xs text-gray-500">Sales</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${salesWidth}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 text-xs text-gray-500">Revenue</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${revenueWidth}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                Period Revenue: <span className="font-semibold text-gray-900">{formatCurrency(timeBasedAnalytics.totalRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Sales Person Performance with Revenue */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Sales Person Performance
            </h3>
            <div className="space-y-3">
              {salesPersonPerformance.slice(0, 5).map((person, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="font-medium text-gray-900">{person.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(person.revenue)}</div>
                      <div className="text-xs text-gray-600">{person.completedSales} sales</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-1 bg-blue-100 rounded">
                      <div className="font-semibold text-blue-600">{person.totalCustomers}</div>
                      <div className="text-blue-600">Customers</div>
                    </div>
                    <div className="text-center p-1 bg-purple-100 rounded">
                      <div className="font-semibold text-purple-600">{person.conversionRate.toFixed(1)}%</div>
                      <div className="text-purple-600">Conv. Rate</div>
                    </div>
                    <div className="text-center p-1 bg-emerald-100 rounded">
                      <div className="font-semibold text-emerald-600">{formatCurrency(person.averageDealSize)}</div>
                      <div className="text-emerald-600">Avg Deal</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Enhanced Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products with Enhanced Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-purple-600" />
              Top Selling Products
            </h3>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                        <div className="text-xs text-gray-600">{product.brand}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">{product.totalSold}</div>
                        <div className="text-xs text-gray-600">units sold</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        product.stockStatus === 'Out of Stock' ? 'bg-red-100 text-red-600' :
                        product.stockStatus === 'Low Stock' ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {product.stockStatus}
                      </span>
                      <span className="text-gray-600">{product.currentStock} in stock</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No sales data available yet</p>
              </div>
            )}
          </div>

          {/* Enhanced Inventory Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-orange-600" />
              Inventory Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 font-medium">In Stock</span>
                </div>
                <span className="text-green-600 font-bold">{inventoryMetrics.inStockProducts}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-orange-800 font-medium">Low Stock</span>
                </div>
                <span className="text-orange-600 font-bold">{inventoryMetrics.lowStockProducts}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-800 font-medium">Out of Stock</span>
                </div>
                <span className="text-red-600 font-bold">{inventoryMetrics.outOfStockProducts}</span>
              </div>
              <div className="border-t pt-3">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{inventoryMetrics.totalStock}</div>
                    <div className="text-xs text-blue-600">Total Units</div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-600">{inventoryMetrics.stockTurnover}%</div>
                    <div className="text-xs text-purple-600">Turnover</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
              Brand Performance
            </h3>
            {brandPerformance.length > 0 ? (
              <div className="space-y-3">
                {brandPerformance.map((brand, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-gray-900">{brand.name}</div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600">{brand.totalSold}</div>
                        <div className="text-xs text-gray-600">units sold</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-1 bg-blue-100 rounded">
                        <div className="font-semibold text-blue-600">{brand.totalProducts}</div>
                        <div className="text-blue-600">Products</div>
                      </div>
                      <div className="text-center p-1 bg-green-100 rounded">
                        <div className="font-semibold text-green-600">{brand.totalStock}</div>
                        <div className="text-green-600">In Stock</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No brand data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Insights with Revenue */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-gray-900">Revenue Performance</span>
              </div>
              <p className="text-sm text-gray-600">
                Total revenue of {formatCurrency(salesMetrics.totalRevenue)} with an average deal size of {formatCurrency(salesMetrics.averageDealSize)}.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Sales Performance</span>
              </div>
              <p className="text-sm text-gray-600">
                {salesMetrics.conversionRate}% conversion rate with {salesMetrics.completedSales} successful sales out of {salesMetrics.totalCustomers} total customers.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">Inventory Health</span>
              </div>
              <p className="text-sm text-gray-600">
                {inventoryMetrics.stockTurnover}% stock turnover with {inventoryMetrics.lowStockProducts + inventoryMetrics.outOfStockProducts} items needing attention.
              </p>
            </div>
          </div>
        </div>
          </>
        )}

        {/* Daily Sales Tab */}
        {activeTab === 'daily-sales' && (
          <>
            {/* Daily Sales Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dailySalesStartDate}
                    onChange={(e) => setDailySalesStartDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dailySalesEndDate}
                    onChange={(e) => setDailySalesEndDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Person</label>
                  <select
                    value={selectedSalesPerson}
                    onChange={(e) => setSelectedSalesPerson(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sales Persons</option>
                    {salesPersons.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Type</label>
                  <select
                    value={salesTypeFilter}
                    onChange={(e) => setSalesTypeFilter(e.target.value as 'all' | 'follow-up' | 'inventory')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Sales</option>
                    <option value="follow-up">Follow-up Sales Only</option>
                    <option value="inventory">Inventory Sales Only</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-1" />
                      {dailySalesData.length} days found
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Sales Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600">
                      {formatCurrency(dailySalesSummaryStats.totalRevenue)}
                    </div>
                    <div className="text-xs text-emerald-600">Revenue</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{dailySalesSummaryStats.totalFollowUpSales}</div>
                    <div className="text-xs text-blue-600">Follow-up Sales</div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <Package className="h-6 w-6 text-purple-600" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{dailySalesSummaryStats.totalInventorySales}</div>
                    <div className="text-xs text-purple-600">Inventory Sales</div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">{dailySalesSummaryStats.totalUnitsFromInventory}</div>
                    <div className="text-xs text-orange-600">Units Sold</div>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <div className="flex items-center justify-between">
                  <Calendar className="h-6 w-6 text-teal-600" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-teal-600">{dailySalesSummaryStats.activeDays}</div>
                    <div className="text-xs text-teal-600">Active Days</div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-6 w-6 text-indigo-600" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-600">
                      {formatCurrency(dailySalesSummaryStats.averageDailyRevenue)}
                    </div>
                    <div className="text-xs text-indigo-600">Avg Daily Revenue</div>
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                <div className="flex items-center justify-between">
                  <TrendingUp className="h-6 w-6 text-pink-600" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-pink-600">
                      {formatCurrency(dailySalesSummaryStats.averageSaleAmount)}
                    </div>
                    <div className="text-xs text-pink-600">Avg Sale Amount</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Sales List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Daily Sales Breakdown</h3>
              </div>
              
              {dailySalesData.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No sales found for the selected period and filters.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {dailySalesData.map((day) => (
                    <div key={day.date} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{day.fullDate}</h4>
                          <p className="text-sm text-gray-600">
                            {day.followUpSalesCount} follow-up sales • {day.inventorySalesCount} inventory sales
                            {day.salesPersons.size > 0 && ` • ${Array.from(day.salesPersons).join(', ')}`}
                          </p>
                        </div>
                        <div className="text-right mt-2 lg:mt-0">
                          <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(day.totalAmount)}
                          </div>
                          {day.followUpSalesCount > 0 && (
                            <div className="text-sm text-gray-600">
                              Avg: {formatCurrency(day.totalAmount / day.followUpSalesCount)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Follow-up Sales */}
                      {day.followUpSales.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                            <UserCheck className="h-4 w-4 mr-1" />
                            Follow-up Sales ({day.followUpSales.length})
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {day.followUpSales.map((sale, index) => (
                              <div key={index} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="font-medium text-gray-900">{sale.customerName}</div>
                                    <div className="text-sm text-gray-600">{sale.mobile}</div>
                                    <div className="text-xs text-gray-500">{sale.location}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-emerald-600">
                                      {formatCurrency(sale.amount)}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-600">
                                  Sales: {sale.salesPerson}
                                </div>
                                {sale.remarks && (
                                  <div className="text-xs text-gray-500 mt-1 truncate">
                                    {sale.remarks}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Inventory Sales */}
                      {day.inventorySales.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-purple-700 mb-2 flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            Inventory Sales ({day.inventorySales.length})
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {day.inventorySales.map((sale, index) => (
                              <div key={index} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="font-medium text-gray-900">{sale.customerName}</div>
                                    <div className="text-sm text-gray-600">{sale.productName}</div>
                                    <div className="text-xs text-gray-500">{sale.brandName} - {sale.modelNumber}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-purple-600">
                                      {sale.quantitySold} units
                                    </div>
                                  </div>
                                </div>
                                {sale.billNumber && (
                                  <div className="text-xs text-gray-600">
                                    Bill: {sale.billNumber}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                  {sale.remarks}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

const AnalyticsPage: React.FC = () => {
  return (
    <InventoryProvider>
      <AnalyticsContent />
    </InventoryProvider>
  );
};

export default AnalyticsPage;