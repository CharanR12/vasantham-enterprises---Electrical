import React from 'react';
import { Product, SaleEntry } from '../../types/inventory';
import { Package, TrendingUp, AlertTriangle, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { parseISO, isThisMonth, isToday } from 'date-fns';

type InventoryKPICardsProps = {
  products: Product[];
  salesEntries: SaleEntry[];
};

const InventoryKPICards: React.FC<InventoryKPICardsProps> = ({ products, salesEntries }) => {
  // Calculate KPIs
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.quantityAvailable, 0);
  const lowStockProducts = products.filter(product => product.quantityAvailable <= 5).length;
  const outOfStockProducts = products.filter(product => product.quantityAvailable === 0).length;
  
  const todaySales = salesEntries.filter(entry => isToday(parseISO(entry.saleDate))).length;
  const thisMonthSales = salesEntries.filter(entry => isThisMonth(parseISO(entry.saleDate))).length;

  const kpis = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: <Package className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Stock',
      value: totalStock,
      icon: <BarChart3 className="h-4 w-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Low Stock',
      value: lowStockProducts,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Out of Stock',
      value: outOfStockProducts,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: "Today's Sales",
      value: todaySales,
      icon: <Calendar className="h-4 w-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'This Month',
      value: thisMonthSales,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className={`${kpi.bgColor} rounded-lg p-3 border border-opacity-20`}
        >
          <div className="flex items-center justify-between">
            <div className={`${kpi.color} ${kpi.bgColor} p-1.5 rounded-md`}>
              {kpi.icon}
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${kpi.color}`}>
                {kpi.value}
              </div>
            </div>
          </div>
          <div className="mt-1">
            <p className="text-xs font-medium text-gray-600 truncate">
              {kpi.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryKPICards;