import { useMemo } from 'react';
import { useCustomersQuery, useSalesPersonsQuery } from './queries/useCustomerQueries';
import { useProductsQuery, useSalesEntriesQuery } from './queries/useInventoryQueries';
import { useUserRole } from './useUserRole';
import {
    parseISO,
    format,
    isThisMonth,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    subDays,
    isWithinInterval,
    startOfDay,
    endOfDay
} from 'date-fns';

// ... interface definitions ...

export interface FollowUpSale {
    type: 'follow-up';
    customerName: string;
    mobile: string;
    amount: number;
    salesPerson: string;
    remarks: string;
    location: string;
}

export interface InventorySale {
    type: 'inventory';
    customerName: string;
    productName: string;
    brandName: string;
    modelNumber: string;
    quantitySold: number;
    billNumber?: string;
    remarks: string;
}

export interface DaySalesData {
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

export const useAnalyticsData = (
    selectedPeriod: 'week' | 'month' | 'all',
    dailySalesStartDate: string,
    dailySalesEndDate: string,
    selectedSalesPerson: string,
    salesTypeFilter: 'all' | 'follow-up' | 'inventory',
    // New optional filters for inventory
    inventorySearchTerm: string = '',
    inventorySelectedBrand: string = ''
) => {
    const { data: customers = [], isLoading: salesLoading, error: salesError } = useCustomersQuery();
    const { data: salesPersons = [], isLoading: sPLoading } = useSalesPersonsQuery();
    const { data: products = [], isLoading: inventoryLoading, error: inventoryError } = useProductsQuery();
    const { data: salesEntries = [], isLoading: seLoading, error: seError } = useSalesEntriesQuery();
    const { currentRole } = useUserRole();

    const loading = salesLoading || sPLoading || inventoryLoading || seLoading;
    const error = salesError || inventoryError || seError;

    // Filter customers based on User Role (Hide "Ramesh" for non-admins)
    const visibleCustomers = useMemo(() => {
        if (currentRole === 'admin') {
            return customers;
        }
        return customers.filter(c => c.salesPerson?.name?.toLowerCase() !== 'ramesh');
    }, [customers, currentRole]);

    // Filter sales persons list based on User Role (Hide "Ramesh" for non-admins)
    const visibleSalesPersons = useMemo(() => {
        if (currentRole === 'admin') {
            return salesPersons;
        }
        return salesPersons.filter(sp => sp.name?.toLowerCase() !== 'ramesh');
    }, [salesPersons, currentRole]);

    // Filter Products based on search/brand (used for inventory metrics)
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = !inventorySearchTerm ||
                product.productName.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
                product.modelNumber.toLowerCase().includes(inventorySearchTerm.toLowerCase());
            const matchesBrand = !inventorySelectedBrand || product.brandId === inventorySelectedBrand;
            return matchesSearch && matchesBrand;
        });
    }, [products, inventorySearchTerm, inventorySelectedBrand]);

    // Enhanced Sales Analytics with Revenue
    const salesMetrics = useMemo(() => {
        const completedSales = visibleCustomers.filter(customer =>
            customer.followUps.some(followUp => followUp.status === 'Sales completed')
        );

        const rejectedSales = visibleCustomers.filter(customer =>
            customer.followUps.some(followUp => followUp.status === 'Sales rejected')
        );

        const pendingSales = visibleCustomers.filter(customer =>
            customer.followUps.every(followUp =>
                followUp.status !== 'Sales completed' && followUp.status !== 'Sales rejected'
            )
        );

        const todayFollowUps = visibleCustomers.filter(customer =>
            customer.followUps.some(followUp => followUp.date === format(new Date(), 'yyyy-MM-dd'))
        );

        const totalRevenue = visibleCustomers.reduce((total, customer) => {
            return total + customer.followUps
                .filter(followUp => followUp.status === 'Sales completed' && followUp.salesAmount)
                .reduce((sum, followUp) => sum + (followUp.salesAmount || 0), 0);
        }, 0);

        const completedSalesWithAmount = visibleCustomers.reduce((total, customer) => {
            return total + customer.followUps.filter(followUp =>
                followUp.status === 'Sales completed' && followUp.salesAmount && followUp.salesAmount > 0
            ).length;
        }, 0);

        const averageDealSize = completedSalesWithAmount > 0 ? totalRevenue / completedSalesWithAmount : 0;
        const conversionRate = visibleCustomers.length > 0 ? (completedSales.length / visibleCustomers.length * 100) : 0;
        const rejectionRate = visibleCustomers.length > 0 ? (rejectedSales.length / visibleCustomers.length * 100) : 0;

        return {
            totalCustomers: visibleCustomers.length,
            completedSales: completedSales.length,
            rejectedSales: rejectedSales.length,
            pendingSales: pendingSales.length,
            todayFollowUps: todayFollowUps.length,
            totalRevenue,
            averageDealSize,
            conversionRate: conversionRate.toFixed(1),
            rejectionRate: rejectionRate.toFixed(1)
        };
    }, [visibleCustomers]);

    // Enhanced Sales Person Performance with Revenue
    const salesPersonPerformance = useMemo(() => {
        return visibleSalesPersons.map(person => {
            const personCustomers = visibleCustomers.filter(c => c.salesPerson.id === person.id);
            const completedSales = personCustomers.filter(customer =>
                customer.followUps.some(followUp => followUp.status === 'Sales completed')
            );
            const rejectedSales = personCustomers.filter(customer =>
                customer.followUps.some(followUp => followUp.status === 'Sales rejected')
            );

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
    }, [visibleSalesPersons, visibleCustomers]);

    // Enhanced Inventory Analytics
    const inventoryMetrics = useMemo(() => {
        // Use filteredProducts here to reflect search/brand
        const totalProducts = filteredProducts.length;
        const totalStock = filteredProducts.reduce((sum, product) => sum + product.quantityAvailable, 0);

        // Filter sales entries to match filtered products
        const filteredSalesEntries = salesEntries.filter(entry =>
            filteredProducts.some(p => p.id === entry.productId)
        );

        const totalSold = filteredSalesEntries.reduce((sum, entry) => sum + entry.quantitySold, 0);
        const lowStockProducts = filteredProducts.filter(product => product.quantityAvailable <= 5 && product.quantityAvailable > 0).length;
        const outOfStockProducts = filteredProducts.filter(product => product.quantityAvailable === 0).length;
        const inStockProducts = filteredProducts.filter(product => product.quantityAvailable > 5).length;

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
    }, [products, filteredProducts, salesEntries]);

    // Enhanced Time-based Analytics with Revenue Trends
    const timeBasedAnalytics = useMemo(() => {
        const now = new Date();
        const startDate = selectedPeriod === 'week' ? subDays(now, 7) :
            selectedPeriod === 'month' ? startOfMonth(now) : new Date(2024, 0, 1);
        const endDate = selectedPeriod === 'month' ? endOfMonth(now) : now;

        const filteredSales = salesEntries.filter(entry => {
            const saleDate = parseISO(entry.saleDate);
            // Matches date range AND belongs to a product in the filtered list (search/brand)
            const matchesProduct = filteredProducts.some(p => p.id === entry.productId);
            return saleDate >= startDate && saleDate <= endDate && matchesProduct;
        });

        const filteredCustomers = visibleCustomers.filter(customer => {
            const createdDate = parseISO(customer.createdAt);
            // Customer filtering by Search/Brand is NOT applicable, so we leave as is or decide?
            // User requested Inventory Page filters. It's likely they only apply to Inventory Tab.
            // If we are in "Combined" or "Follow-up" mode, these inventory filters should probably be ignored for customers.
            // But since this hook is generic, we just proceed.
            return createdDate >= startDate && createdDate <= endDate;
        });

        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const dailyDataRaw = days.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');

            // Inventory Sales Logic
            const dayInventorySales = filteredSales.filter(entry => entry.saleDate === dayStr);
            const inventoryCount = dayInventorySales.reduce((sum, entry) => sum + entry.quantitySold, 0);

            // Follow-up Sales (Revenue) Logic
            const followUpRevenue = visibleCustomers.reduce((total, customer) => {
                // If sales person filter is applied, only count their customers
                if (selectedSalesPerson && customer.salesPerson.id !== selectedSalesPerson) return total;

                return total + customer.followUps
                    .filter(followUp => followUp.date === dayStr && followUp.status === 'Sales completed' && followUp.salesAmount)
                    .reduce((sum, followUp) => sum + (followUp.salesAmount || 0), 0);
            }, 0);

            // Follow-up Sales Count (Count of completed sales)
            const followUpCount = visibleCustomers.reduce((total, customer) => {
                if (selectedSalesPerson && customer.salesPerson.id !== selectedSalesPerson) return total;

                return total + customer.followUps
                    .filter(followUp => followUp.date === dayStr && followUp.status === 'Sales completed')
                    .length;
            }, 0);

            // Determine what "sales" and "revenue" mean based on filter
            let salesValue = 0;
            let revenueValue = 0;

            if (salesTypeFilter === 'inventory') {
                salesValue = inventoryCount; // "Sales" in inventory context usually means Quantity Sold
                revenueValue = 0; // We don't track revenue for inventory yet, or it's implicitly volume
            } else if (salesTypeFilter === 'follow-up') {
                salesValue = followUpCount;
                revenueValue = followUpRevenue;
            } else {
                // Combined (if ever used)
                salesValue = inventoryCount + followUpCount;
                revenueValue = followUpRevenue;
            }

            return {
                date: format(day, 'MMM dd'),
                fullDate: dayStr,
                sales: salesValue,
                revenue: revenueValue,
                customers: filteredCustomers.filter(c => c.createdAt === dayStr).length
            };
        });

        const recentData = dailyDataRaw.slice(-7);
        const previousData = dailyDataRaw.slice(-14, -7);

        const recentAvg = recentData.reduce((sum, day) => sum + day.sales, 0) / Math.max(1, recentData.length);
        const previousAvg = previousData.reduce((sum, day) => sum + day.sales, 0) / Math.max(1, previousData.length);
        const growthTrend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg * 100) : 0;

        const totalSalesVolume = dailyDataRaw.reduce((sum, day) => sum + day.sales, 0);
        const totalRevenueValue = dailyDataRaw.reduce((sum, day) => sum + day.revenue, 0);

        return {
            totalSales: totalSalesVolume,
            totalCustomers: filteredCustomers.length,
            totalRevenue: totalRevenueValue,
            dailyData: recentData,
            growthTrend: growthTrend.toFixed(1),
            averageDailySales: recentAvg.toFixed(1)
        };
    }, [selectedPeriod, salesEntries, visibleCustomers, selectedSalesPerson, salesTypeFilter, filteredProducts]);

    // Enhanced Top Products with More Metrics
    const topProducts = useMemo(() => {
        return products.map(product => {
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
    }, [products, salesEntries]);

    // Brand Performance Analysis
    const brandPerformance = useMemo(() => {
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
    }, [products, salesEntries]);

    // Daily Sales Data Processing
    const dailySalesData = useMemo(() => {
        const salesMap = new Map<string, DaySalesData>();

        visibleCustomers.forEach(customer => {
            if (selectedSalesPerson && customer.salesPerson.id !== selectedSalesPerson) return;

            customer.followUps.forEach(followUp => {
                if (followUp.status === 'Sales completed' && followUp.salesAmount) {
                    const followUpDate = parseISO(followUp.date);
                    const startDateObj = parseISO(dailySalesStartDate);
                    const endDateObj = parseISO(dailySalesEndDate);

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

                        const dayData = salesMap.get(dateKey)!;
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

        salesEntries.forEach(saleEntry => {
            // Inventory sales are not linked to sales persons, so we exclude them when filtering by a specific person
            if (selectedSalesPerson) return;

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

                const dayData = salesMap.get(dateKey)!;
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

        const result = Array.from(salesMap.values())
            .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

        if (salesTypeFilter !== 'all') {
            return result.filter(day => {
                if (salesTypeFilter === 'follow-up') return day.followUpSalesCount > 0;
                if (salesTypeFilter === 'inventory') return day.inventorySalesCount > 0;
                return true;
            });
        }

        return result;
    }, [visibleCustomers, salesEntries, products, dailySalesStartDate, dailySalesEndDate, selectedSalesPerson, salesTypeFilter]);

    // Daily Sales Summary Stats
    const dailySalesSummaryStats = useMemo(() => {
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

    return {
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
        salesPersons: visibleSalesPersons // To be used in filters
    };
};
