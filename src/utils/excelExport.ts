import * as XLSX from 'xlsx';
import { Customer, SalesPerson } from '../types';
import { Product, Brand, SaleEntry } from '../types/inventory';
import { format, parseISO } from 'date-fns';

export const exportToExcel = (
  customers: Customer[],
  salesPersons: SalesPerson[],
  products: Product[],
  brands: Brand[],
  salesEntries: SaleEntry[]
) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // 1. Customers Sheet
  const customersData = customers.map(customer => {
    const totalSalesAmount = customer.followUps
      .filter(f => f.status === 'Sales completed' && f.salesAmount)
      .reduce((sum, f) => sum + (f.salesAmount || 0), 0);

    return {
      'Customer ID': customer.id,
      'Name': customer.name,
      'Mobile': customer.mobile,
      'Location': customer.location,
      'Referral Source': customer.referralSource,
      'Sales Person': customer.salesPerson.name,
      'Last Contacted Date': customer.lastContactedDate || '',
      'Remarks': customer.remarks,
      'Created Date': customer.createdAt,
      'Follow-ups Count': customer.followUps.length,
      'Latest Follow-up Status': customer.followUps.length > 0 ? 
        customer.followUps.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())[0].status : 
        'No follow-ups',
      'Total Sales Amount': totalSalesAmount > 0 ? totalSalesAmount : 0,
      'Total Sales Amount (Formatted)': totalSalesAmount > 0 ? formatCurrency(totalSalesAmount) : '₹0'
    };
  });

  const customersSheet = XLSX.utils.json_to_sheet(customersData);
  XLSX.utils.book_append_sheet(workbook, customersSheet, 'Customers');

  // 2. Follow-ups Sheet with Sales Amount
  const followUpsData: any[] = [];
  customers.forEach(customer => {
    customer.followUps.forEach(followUp => {
      followUpsData.push({
        'Follow-up ID': followUp.id,
        'Customer ID': customer.id,
        'Customer Name': customer.name,
        'Customer Mobile': customer.mobile,
        'Sales Person': customer.salesPerson.name,
        'Follow-up Date': followUp.date,
        'Status': followUp.status,
        'Sales Amount': followUp.salesAmount || 0,
        'Sales Amount (Formatted)': followUp.salesAmount ? formatCurrency(followUp.salesAmount) : '₹0',
        'Remarks': followUp.remarks,
        'Customer Created Date': customer.createdAt
      });
    });
  });

  const followUpsSheet = XLSX.utils.json_to_sheet(followUpsData);
  XLSX.utils.book_append_sheet(workbook, followUpsSheet, 'Follow-ups');

  // 3. Sales Persons Sheet with Revenue
  const salesPersonsData = salesPersons.map(person => {
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
      'Sales Person ID': person.id,
      'Name': person.name,
      'Total Customers': personCustomers.length,
      'Completed Sales': completedSales.length,
      'Rejected Sales': rejectedSales.length,
      'Conversion Rate (%)': conversionRate.toFixed(2),
      'Pending Customers': personCustomers.length - completedSales.length - rejectedSales.length,
      'Total Revenue': revenue,
      'Total Revenue (Formatted)': formatCurrency(revenue),
      'Average Deal Size': averageDealSize,
      'Average Deal Size (Formatted)': formatCurrency(averageDealSize)
    };
  });

  const salesPersonsSheet = XLSX.utils.json_to_sheet(salesPersonsData);
  XLSX.utils.book_append_sheet(workbook, salesPersonsSheet, 'Sales Persons');

  // 4. Products Sheet
  const productsData = products.map(product => {
    const productSales = salesEntries.filter(entry => entry.productId === product.id);
    const totalSold = productSales.reduce((sum, entry) => sum + entry.quantitySold, 0);
    const stockStatus = product.quantityAvailable === 0 ? 'Out of Stock' : 
                       product.quantityAvailable <= 5 ? 'Low Stock' : 'In Stock';

    return {
      'Product ID': product.id,
      'Brand': product.brand.name,
      'Product Name': product.productName,
      'Model Number': product.modelNumber,
      'Quantity Available': product.quantityAvailable,
      'Total Sold': totalSold,
      'Stock Status': stockStatus,
      'Arrival Date': product.arrivalDate,
      'Created Date': product.createdAt,
      'Sales Transactions': productSales.length
    };
  });

  const productsSheet = XLSX.utils.json_to_sheet(productsData);
  XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');

  // 5. Brands Sheet
  const brandsData = brands.map(brand => {
    const brandProducts = products.filter(p => p.brandId === brand.id);
    const brandSales = salesEntries.filter(entry => 
      brandProducts.some(product => product.id === entry.productId)
    );
    const totalSold = brandSales.reduce((sum, entry) => sum + entry.quantitySold, 0);
    const totalStock = brandProducts.reduce((sum, product) => sum + product.quantityAvailable, 0);

    return {
      'Brand ID': brand.id,
      'Brand Name': brand.name,
      'Total Products': brandProducts.length,
      'Total Stock': totalStock,
      'Total Sold': totalSold,
      'Sales Transactions': brandSales.length,
      'Created Date': brand.createdAt
    };
  });

  const brandsSheet = XLSX.utils.json_to_sheet(brandsData);
  XLSX.utils.book_append_sheet(workbook, brandsSheet, 'Brands');

  // 6. Sales Entries Sheet
  const salesEntriesData = salesEntries.map(entry => {
    const product = products.find(p => p.id === entry.productId);
    return {
      'Sale ID': entry.id,
      'Product ID': entry.productId,
      'Product Name': product?.productName || 'Unknown',
      'Brand': product?.brand.name || 'Unknown',
      'Model Number': product?.modelNumber || 'Unknown',
      'Sale Date': entry.saleDate,
      'Customer Name': entry.customerName,
      'Bill Number': entry.billNumber || '',
      'Quantity Sold': entry.quantitySold,
      'Created Date': entry.createdAt
    };
  });

  const salesEntriesSheet = XLSX.utils.json_to_sheet(salesEntriesData);
  XLSX.utils.book_append_sheet(workbook, salesEntriesSheet, 'Sales Entries');

  // 7. Revenue Summary Sheet
  const totalRevenue = customers.reduce((total, customer) => {
    return total + customer.followUps
      .filter(followUp => followUp.status === 'Sales completed' && followUp.salesAmount)
      .reduce((sum, followUp) => sum + (followUp.salesAmount || 0), 0);
  }, 0);

  const completedSalesWithAmount = customers.reduce((total, customer) => {
    return total + customer.followUps.filter(followUp => 
      followUp.status === 'Sales completed' && followUp.salesAmount && followUp.salesAmount > 0
    ).length;
  }, 0);

  const averageDealSize = completedSalesWithAmount > 0 ? totalRevenue / completedSalesWithAmount : 0;

  const revenueSummaryData = [
    {
      'Metric': 'Total Revenue',
      'Value': totalRevenue,
      'Formatted Value': formatCurrency(totalRevenue),
      'Description': 'Total revenue from all completed sales'
    },
    {
      'Metric': 'Average Deal Size',
      'Value': averageDealSize,
      'Formatted Value': formatCurrency(averageDealSize),
      'Description': 'Average revenue per completed sale'
    },
    {
      'Metric': 'Completed Sales Count',
      'Value': completedSalesWithAmount,
      'Formatted Value': completedSalesWithAmount.toString(),
      'Description': 'Number of completed sales with amount'
    },
    {
      'Metric': 'Revenue per Customer',
      'Value': customers.length > 0 ? totalRevenue / customers.length : 0,
      'Formatted Value': customers.length > 0 ? formatCurrency(totalRevenue / customers.length) : '₹0',
      'Description': 'Average revenue per customer'
    }
  ];

  const revenueSummarySheet = XLSX.utils.json_to_sheet(revenueSummaryData);
  XLSX.utils.book_append_sheet(workbook, revenueSummarySheet, 'Revenue Summary');

  // 8. Summary Sheet (Updated with Revenue)
  const summaryData = [
    {
      'Metric': 'Total Customers',
      'Value': customers.length,
      'Description': 'Total number of customers in the system'
    },
    {
      'Metric': 'Total Sales Persons',
      'Value': salesPersons.length,
      'Description': 'Total number of sales persons'
    },
    {
      'Metric': 'Completed Sales',
      'Value': customers.filter(c => c.followUps.some(f => f.status === 'Sales completed')).length,
      'Description': 'Number of customers with completed sales'
    },
    {
      'Metric': 'Total Revenue',
      'Value': `${formatCurrency(totalRevenue)}`,
      'Description': 'Total revenue from all completed sales'
    },
    {
      'Metric': 'Average Deal Size',
      'Value': `${formatCurrency(averageDealSize)}`,
      'Description': 'Average revenue per completed sale'
    },
    {
      'Metric': 'Rejected Sales',
      'Value': customers.filter(c => c.followUps.some(f => f.status === 'Sales rejected')).length,
      'Description': 'Number of customers with rejected sales'
    },
    {
      'Metric': 'Total Products',
      'Value': products.length,
      'Description': 'Total number of products in inventory'
    },
    {
      'Metric': 'Total Brands',
      'Value': brands.length,
      'Description': 'Total number of brands'
    },
    {
      'Metric': 'Total Stock Units',
      'Value': products.reduce((sum, p) => sum + p.quantityAvailable, 0),
      'Description': 'Total quantity of all products in stock'
    },
    {
      'Metric': 'Total Units Sold',
      'Value': salesEntries.reduce((sum, e) => sum + e.quantitySold, 0),
      'Description': 'Total quantity of all products sold'
    },
    {
      'Metric': 'Low Stock Products',
      'Value': products.filter(p => p.quantityAvailable > 0 && p.quantityAvailable <= 5).length,
      'Description': 'Products with 1-5 units in stock'
    },
    {
      'Metric': 'Out of Stock Products',
      'Value': products.filter(p => p.quantityAvailable === 0).length,
      'Description': 'Products with zero stock'
    },
    {
      'Metric': 'Total Sales Transactions',
      'Value': salesEntries.length,
      'Description': 'Total number of sales transactions'
    },
    {
      'Metric': 'Total Follow-ups',
      'Value': customers.reduce((sum, c) => sum + c.followUps.length, 0),
      'Description': 'Total number of follow-up records'
    }
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Generate filename with current date
  const currentDate = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const filename = `Vasantham_Enterprises_Export_${currentDate}.xlsx`;

  // Write the file
  XLSX.writeFile(workbook, filename);
};