import * as XLSX from 'xlsx';
import { DaySalesData } from '../hooks/useAnalyticsData';

export const exportDailySalesToExcel = (
    dailySalesData: DaySalesData[],
    summaryStats: any,
    startDate: string,
    endDate: string,
    formatCurrency: (amount: number) => string
) => {
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
            'Value': summaryStats.totalRevenue,
            'Formatted Value': formatCurrency(summaryStats.totalRevenue)
        },
        {
            'Metric': 'Total Follow-up Sales',
            'Value': summaryStats.totalFollowUpSales,
            'Formatted Value': summaryStats.totalFollowUpSales.toString()
        },
        {
            'Metric': 'Total Inventory Sales',
            'Value': summaryStats.totalInventorySales,
            'Formatted Value': summaryStats.totalInventorySales.toString()
        },
        {
            'Metric': 'Total Units Sold (Inventory)',
            'Value': summaryStats.totalUnitsFromInventory,
            'Formatted Value': summaryStats.totalUnitsFromInventory.toString()
        },
        {
            'Metric': 'Average Daily Revenue',
            'Value': summaryStats.averageDailyRevenue,
            'Formatted Value': formatCurrency(summaryStats.averageDailyRevenue)
        },
        {
            'Metric': 'Average Sale Amount',
            'Value': summaryStats.averageSaleAmount,
            'Formatted Value': formatCurrency(summaryStats.averageSaleAmount)
        },
        {
            'Metric': 'Active Sales Days',
            'Value': summaryStats.activeDays,
            'Formatted Value': summaryStats.activeDays.toString()
        }
    ];

    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');

    const filename = `Daily_Sales_Report_${startDate}_to_${endDate}.xlsx`;
    XLSX.writeFile(workbook, filename);
};
