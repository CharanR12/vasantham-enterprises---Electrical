import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../context/CustomerContext';
import { InventoryProvider, useInventory } from '../context/InventoryContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  ArrowLeft,
  Download,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Activity,
  UserCheck,
  ShoppingCart,
  PieChart,
  Target
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { parseISO, format, isThisMonth, startOfMonth, endOfMonth, eachDayOfInterval, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
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
  interface FollowUpSale {
    type: 'follow-up';
    customerName: string;
    mobile: string;
    amount: number;
    salesPerson: string;
    remarks: string;
    location: string;
  }

  interface InventorySale {
    type: 'inventory';
    customerName: string;
    productName: string;
    brandName: string;
    modelNumber: string;
    quantitySold: number;
    billNumber?: string;
    remarks: string;
  }

  interface DaySalesData {
    date: string;
    displayDate: string;
    fullDate: string;
    totalAmount: number;
    followUpSalesCount: number;
    inventorySalesCount: number;
    followUpSales: FollowUpSale[];
    inventorySales: InventorySale[];
    salesPersons: Set<string>;
  }

  const dailySalesData = React.useMemo(() => {
    const salesMap = new Map<string, DaySalesData>();

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
            if (dayData) {
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
        if (dayData) {
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
    const followUpData: Record<string, string | number>[] = [];
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
    const inventoryData: Record<string, string | number>[] = [];
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
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const salesMetrics = getSalesMetrics();
  const salesPersonPerformance = getSalesPersonPerformance();
  const inventoryMetrics = getInventoryMetrics();
  const timeBasedAnalytics = getTimeBasedAnalytics();
  const topProducts = getTopProducts();
  const brandPerformance = getBrandPerformance();

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {error && (
        <ErrorMessage message={error} className="mb-6 rounded-2xl shadow-sm border-red-100" />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-500 hover:text-brand-600 font-bold transition-all duration-300 group"
          >
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 mr-3 group-hover:scale-110 transition-transform">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="text-sm tracking-tight uppercase tracking-widest hidden sm:inline">Back</span>
          </button>
          <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Hub</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Performance & Operations Analytics</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {activeTab === 'daily-sales' && (
            <button
              onClick={exportDailySalesToExcel}
              className="group flex items-center px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Download className="h-4 w-4 mr-2 group-hover:-translate-y-1 transition-transform" />
              <span>Export Report</span>
            </button>
          )}
          {activeTab === 'overview' && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-brand-500" />
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'all')}
                className="premium-input pl-10 pr-10 appearance-none bg-white cursor-pointer min-w-[160px]"
              >
                <option value="week">Past 7 Days</option>
                <option value="month">Current Month</option>
                <option value="all">Historical Data</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 inline-flex">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2.5 py-2.5 px-6 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'overview'
            ? 'bg-white text-brand-600 shadow-md border border-slate-200/50'
            : 'text-slate-500 hover:text-slate-900'
            }`}
        >
          <BarChart3 className={`h-4 w-4 ${activeTab === 'overview' ? 'text-brand-500' : ''}`} />
          <span className="uppercase tracking-widest">Global Insights</span>
        </button>
        <button
          onClick={() => setActiveTab('daily-sales')}
          className={`flex items-center space-x-2.5 py-2.5 px-6 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'daily-sales'
            ? 'bg-white text-brand-600 shadow-md border border-slate-200/50'
            : 'text-slate-500 hover:text-slate-900'
            }`}
        >
          <Calendar className={`h-4 w-4 ${activeTab === 'daily-sales' ? 'text-brand-500' : ''}`} />
          <span className="uppercase tracking-widest">Transaction Log</span>
        </button>
      </div>

      {/* Overview Analytics Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Enhanced Overview KPIs with Revenue */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {[
              { label: 'Total Customers', value: salesMetrics.totalCustomers, icon: <Users className="h-5 w-5" />, color: 'text-brand-600', bgColor: 'bg-brand-50' },
              { label: 'Sales Completed', value: salesMetrics.completedSales, icon: <TrendingUp className="h-5 w-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
              { label: 'Total Revenue', value: formatCurrency(salesMetrics.totalRevenue), icon: <DollarSign className="h-5 w-5" />, color: 'text-slate-900', bgColor: 'bg-slate-100', isPrimary: true },
              { label: 'Conversion Rate', value: `${salesMetrics.conversionRate}%`, icon: <Target className="h-5 w-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
              { label: 'Total products', value: inventoryMetrics.totalProducts, icon: <Package className="h-5 w-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
              { label: 'Units Sold', value: inventoryMetrics.totalSold, icon: <ShoppingCart className="h-5 w-5" />, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
              { label: "Today's Actions", value: salesMetrics.todayFollowUps, icon: <Calendar className="h-5 w-5" />, color: 'text-rose-600', bgColor: 'bg-rose-50' },
              { label: 'Avg Deal Size', value: formatCurrency(salesMetrics.averageDealSize), icon: <Activity className="h-5 w-5" />, color: 'text-teal-600', bgColor: 'bg-teal-50' }
            ].map((kpi, i) => (
              <div key={i} className={`premium-card p-5 group transition-all duration-300 ${kpi.isPrimary ? 'ring-4 ring-brand-500/5 border-brand-200' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`${kpi.color} ${kpi.bgColor} p-2.5 rounded-xl border border-current/10 transition-transform duration-300 group-hover:scale-110`}>
                    {kpi.icon}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight truncate">
                    {kpi.value}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 transition-colors group-hover:text-slate-500">
                    {kpi.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Chart with Revenue */}
            <div className="premium-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                  <div className="bg-brand-50 p-2 rounded-lg mr-3">
                    <TrendingUp className="h-5 w-5 text-brand-600" />
                  </div>
                  Volume & Revenue Trends
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-brand-400"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sales</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {timeBasedAnalytics.dailyData.map((day, index) => {
                  const maxSales = Math.max(...timeBasedAnalytics.dailyData.map(d => d.sales), 1);
                  const salesWidth = (day.sales / maxSales) * 100;
                  const maxRevenue = Math.max(...timeBasedAnalytics.dailyData.map(d => d.revenue), 1);
                  const revenueWidth = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

                  return (
                    <div key={index} className="group/item">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-tight">{day.date}</span>
                        <div className="flex items-center space-x-4 text-[11px] font-black">
                          <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">{day.sales} sales</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{formatCurrency(day.revenue)}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="relative h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500 group-hover/item:opacity-80"
                            style={{ width: `${salesWidth}%` }}
                          ></div>
                        </div>
                        <div className="relative h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700 group-hover/item:opacity-80"
                            style={{ width: `${revenueWidth}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span>Current Period Revenue</span>
                  <span className="text-slate-900 font-black text-lg tracking-tight">{formatCurrency(timeBasedAnalytics.totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Sales Person Performance with Revenue */}
            <div className="premium-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                  <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  Team Performance
                </h3>
                <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                  Global Rank
                </div>
              </div>

              <div className="space-y-4">
                {salesPersonPerformance.slice(0, 5).map((person, index) => (
                  <div key={index} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 transition-all duration-300 hover:bg-white hover:shadow-md hover:border-brand-200 group/person">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm border ${index === 0 ? 'bg-amber-100 border-amber-200 text-amber-700 ring-4 ring-amber-500/10' :
                          index === 1 ? 'bg-slate-200 border-slate-300 text-slate-700' :
                            index === 2 ? 'bg-orange-100 border-orange-200 text-orange-700' :
                              'bg-white border-slate-100 text-slate-500'
                          }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm group-hover/person:text-brand-600 transition-colors">{person.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue Driver</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900 tracking-tight">{formatCurrency(person.revenue)}</div>
                        <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 mt-1 inline-block">{person.completedSales} units</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-center">
                        <div className="text-xs font-black text-slate-900">{person.totalCustomers}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Reach</div>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-center">
                        <div className="text-xs font-black text-brand-600">{person.conversionRate.toFixed(1)}%</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Impact</div>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-center">
                        <div className="text-xs font-black text-emerald-600 truncate">{formatCurrency(person.averageDealSize)}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ticket</div>
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
            <div className="premium-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                  <div className="bg-purple-50 p-2 rounded-lg mr-3">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  Market Leaders
                </h3>
              </div>

              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.slice(0, 5).map((product, index) => (
                    <div key={index} className="group/product p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-white hover:shadow-md hover:border-purple-200 transition-all duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="font-bold text-slate-900 text-sm truncate group-hover/product:text-purple-600 transition-colors uppercase tracking-tight">{product.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{product.brand}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-purple-600 text-lg leading-none">{product.totalSold}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Units Sold</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100/50">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${product.stockStatus === 'Out of Stock' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          product.stockStatus === 'Low Stock' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                          {product.stockStatus}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{product.currentStock} in inventory</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Package className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No activity recorded</p>
                </div>
              )}
            </div>

            {/* Enhanced Inventory Status */}
            <div className="premium-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                  <div className="bg-orange-50 p-2 rounded-lg mr-3">
                    <PieChart className="h-5 w-5 text-orange-600" />
                  </div>
                  Stock Composition
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Healthy Stock', value: inventoryMetrics.inStockProducts, color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-100' },
                  { label: 'Critical Supply', value: inventoryMetrics.lowStockProducts, color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-100' },
                  { label: 'Depleted Stock', value: inventoryMetrics.outOfStockProducts, color: 'bg-rose-500', bgColor: 'bg-rose-50', textColor: 'text-rose-700', borderColor: 'border-rose-100' }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 ${item.bgColor} rounded-2xl border ${item.borderColor} group/item transition-all duration-300 hover:scale-[1.02]`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${item.color} rounded-full ring-4 ring-white shadow-sm`}></div>
                      <span className={`${item.textColor} font-black text-xs uppercase tracking-widest`}>{item.label}</span>
                    </div>
                    <span className={`${item.textColor} font-black text-lg tracking-tight`}>{item.value}</span>
                  </div>
                ))}

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <div className="text-xl font-black text-slate-900 tracking-tight">{inventoryMetrics.totalStock}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Units</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <div className="text-xl font-black text-purple-600 tracking-tight">{inventoryMetrics.stockTurnover}%</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Velocity</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Performance */}
            <div className="premium-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                  <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                  </div>
                  Brand Portfolio
                </h3>
              </div>

              {brandPerformance.length > 0 ? (
                <div className="space-y-4">
                  {brandPerformance.map((brand, index) => (
                    <div key={index} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-white transition-all duration-300 group/brand">
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-black text-slate-900 text-sm group-hover/brand:text-brand-600 transition-colors uppercase tracking-tight">{brand.name}</div>
                        <div className="text-right">
                          <div className="font-black text-indigo-600 text-base">{brand.totalSold}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Units</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SKUs</span>
                          <span className="text-xs font-black text-slate-900">{brand.totalProducts}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Held</span>
                          <span className="text-xs font-black text-emerald-600">{brand.totalStock}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <BarChart3 className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Awaiting data</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary Insights with Revenue */}
          <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-2xl shadow-brand-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all duration-500 group-hover:bg-white/10"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-400/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>

            <h3 className="text-2xl font-black mb-10 relative z-10 flex items-center uppercase tracking-tight">
              <Activity className="h-6 w-6 mr-3 text-brand-300" />
              Strategic Intelligence
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-emerald-300" />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest text-brand-100">Revenue Alpha</span>
                </div>
                <p className="text-sm text-brand-50 leading-relaxed font-medium">
                  Direct revenue generation stands at <span className="font-black text-white">{formatCurrency(salesMetrics.totalRevenue)}</span> with an average ticket size of <span className="font-black text-white">{formatCurrency(salesMetrics.averageDealSize)}</span>.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-300" />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest text-brand-100">Conversion Velocity</span>
                </div>
                <p className="text-sm text-brand-50 leading-relaxed font-medium">
                  Current conversion efficiency is <span className="font-black text-white">{salesMetrics.conversionRate}%</span>, securing <span className="font-black text-white">{salesMetrics.completedSales}</span> successful closures.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-orange-300" />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest text-brand-100">Supply Health</span>
                </div>
                <p className="text-sm text-brand-50 leading-relaxed font-medium">
                  Portfolio maintains a <span className="font-black text-white">{inventoryMetrics.stockTurnover}%</span> turnover rate. <span className="font-black text-white">{inventoryMetrics.lowStockProducts + inventoryMetrics.outOfStockProducts}</span> items require replenishment.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Daily Sales Tab */}
      {activeTab === 'daily-sales' && (
        <>
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 shadow-sm mb-8 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period Start</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <Calendar className="h-4 w-4 text-brand-500" />
                  </div>
                  <Input
                    id="start-date"
                    type="date"
                    value={dailySalesStartDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDailySalesStartDate(e.target.value)}
                    className="h-11 pl-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period End</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <Calendar className="h-4 w-4 text-brand-500" />
                  </div>
                  <Input
                    id="end-date"
                    type="date"
                    value={dailySalesEndDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDailySalesEndDate(e.target.value)}
                    className="h-11 pl-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Agent</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <Users className="h-4 w-4 text-brand-500" />
                  </div>
                  <Select
                    value={selectedSalesPerson || "all"}
                    onValueChange={(value) => setSelectedSalesPerson(value === "all" ? "" : value)}
                  >
                    <SelectTrigger className="h-11 pl-10 bg-white border-slate-200 rounded-xl focus:ring-brand-500/20 focus:border-brand-500 w-full">
                      <SelectValue placeholder="Global Coverage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Global Coverage</SelectItem>
                      {salesPersons.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Revenue Channel</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <Activity className="h-4 w-4 text-brand-500" />
                  </div>
                  <Select
                    value={salesTypeFilter}
                    onValueChange={(value) => setSalesTypeFilter(value as 'all' | 'follow-up' | 'inventory')}
                  >
                    <SelectTrigger className="h-11 pl-10 bg-white border-slate-200 rounded-xl focus:ring-brand-500/20 focus:border-brand-500 w-full">
                      <SelectValue placeholder="Unified Revenue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Unified Revenue</SelectItem>
                      <SelectItem value="follow-up">Follow-up Sales</SelectItem>
                      <SelectItem value="inventory">Shop Floor Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Sales Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Period Revenue', value: formatCurrency(dailySalesSummaryStats.totalRevenue), icon: <DollarSign className="h-5 w-5" />, color: 'text-brand-600', bgColor: 'bg-brand-50', isPrimary: true },
              { label: 'Agent Closures', value: dailySalesSummaryStats.totalFollowUpSales, icon: <UserCheck className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
              { label: 'Retail Orders', value: dailySalesSummaryStats.totalInventorySales, icon: <Package className="h-5 w-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
              { label: 'Units Liquidated', value: dailySalesSummaryStats.totalUnitsFromInventory, icon: <ShoppingCart className="h-5 w-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
              { label: 'Operational Days', value: dailySalesSummaryStats.activeDays, icon: <Calendar className="h-5 w-5" />, color: 'text-teal-600', bgColor: 'bg-teal-50' },
              { label: 'Daily Average', value: formatCurrency(dailySalesSummaryStats.averageDailyRevenue), icon: <TrendingUp className="h-5 w-5" />, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
              { label: 'Ticket Alpha', value: formatCurrency(dailySalesSummaryStats.averageSaleAmount), icon: <Activity className="h-5 w-5" />, color: 'text-rose-600', bgColor: 'bg-rose-50' }
            ].map((kpi, i) => (
              <div key={i} className={`premium-card p-5 group transition-all duration-300 ${kpi.isPrimary ? 'ring-4 ring-brand-500/5 border-brand-200 lg:col-span-2' : ''} ${i === 6 ? 'lg:col-span-1' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`${kpi.color} ${kpi.bgColor} p-2.5 rounded-xl border border-current/10 transition-transform duration-300 group-hover:scale-110`}>
                    {kpi.icon}
                  </div>
                </div>
                <div>
                  <div className={`${kpi.isPrimary ? 'text-3xl' : 'text-xl'} font-black text-slate-900 tracking-tight truncate`}>
                    {kpi.value}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 transition-colors group-hover:text-slate-500">
                    {kpi.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Sales List */}
          <div className="animate-fadeIn [animation-delay:200ms]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Chronological Ledger</h3>
              <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border border-slate-200 uppercase">
                {dailySalesData.length} records active
              </div>
            </div>

            {dailySalesData.length === 0 ? (
              <div className="premium-card py-20 text-center border-dashed">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                  <Calendar className="h-10 w-10 text-slate-200" />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No transaction data identified</p>
                <p className="text-slate-400 text-xs mt-2">Try adjusting your filters or date range</p>
              </div>
            ) : (
              <div className="space-y-6">
                {dailySalesData.map((day: DaySalesData) => (
                  <div key={day.date} className="premium-card overflow-hidden group/day">
                    <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 group-hover/day:scale-110 transition-transform duration-500">
                          <Calendar className="h-5 w-5 text-brand-500" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900 tracking-tight">{day.fullDate}</h4>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-slate-100">{day.followUpSalesCount} agent closures</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-slate-100">{day.inventorySalesCount} retail orders</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left lg:text-right">
                        <div className="text-2xl font-black text-emerald-600 tracking-tight">
                          {formatCurrency(day.totalAmount)}
                        </div>
                        {day.followUpSalesCount > 0 && (
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Unit Avg: {formatCurrency(day.totalAmount / day.followUpSalesCount)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-8 space-y-8">
                      {/* Follow-up Sales */}
                      {day.followUpSales.length > 0 && (
                        <div>
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="h-1 w-6 bg-brand-500 rounded-full"></div>
                            <h5 className="text-[10px] font-black text-brand-600 uppercase tracking-widest flex items-center">
                              <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                              Client Execution
                            </h5>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {day.followUpSales.map((sale: FollowUpSale, index: number) => (
                              <div key={index} className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-brand-200 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/5 group/sale">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="min-w-0 flex-1 pr-2">
                                    <div className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">{sale.customerName}</div>
                                    <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center">
                                      {sale.mobile}
                                    </div>
                                  </div>
                                  <div className="font-black text-emerald-600 text-sm whitespace-nowrap bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                    {formatCurrency(sale.amount)}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest pt-3 border-t border-slate-50">
                                  <span className="flex items-center text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                                    <Users className="h-3 w-3 mr-1" />
                                    {sale.salesPerson}
                                  </span>
                                  <span className="text-slate-400 truncate max-w-[100px]">{sale.location}</span>
                                </div>
                                {sale.remarks && (
                                  <div className="text-[10px] italic text-slate-400 mt-3 p-2 bg-slate-50 rounded-lg group-hover/sale:bg-white transition-colors border border-transparent group-hover/sale:border-slate-100 line-clamp-2">
                                    "{sale.remarks}"
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
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="h-1 w-6 bg-purple-500 rounded-full"></div>
                            <h5 className="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center">
                              <Package className="h-3.5 w-3.5 mr-1.5" />
                              Retail Performance
                            </h5>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {day.inventorySales.map((sale: InventorySale, index: number) => (
                              <div key={index} className="bg-slate-50/30 rounded-2xl p-4 border border-slate-100 hover:border-purple-200 transition-all duration-300 hover:bg-white group/retail">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="min-w-0 flex-1 pr-2">
                                    <div className="font-black text-slate-900 text-xs truncate group-hover/retail:text-purple-600 transition-colors uppercase tracking-tight">{sale.productName}</div>
                                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{sale.brandName} • {sale.modelNumber}</div>
                                  </div>
                                  <div className="font-black text-purple-600 text-xs bg-purple-50 px-2 py-1 rounded transition-colors group-hover/retail:bg-purple-100">
                                    {sale.quantitySold} units
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest pt-3 border-t border-slate-100">
                                  <span className="text-slate-900 truncate max-w-[120px]">{sale.customerName}</span>
                                  {sale.billNumber && (
                                    <span className="text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-100 font-mono">
                                      #{sale.billNumber}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-3 bg-white/50 p-2 rounded-lg border border-slate-50 italic">
                                  {sale.remarks}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
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