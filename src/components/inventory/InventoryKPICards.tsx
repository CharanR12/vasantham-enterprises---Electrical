import React from 'react';
import { Product, SaleEntry } from '../../types/inventory';
import { Package, TrendingUp, AlertTriangle, Calendar, BarChart3 } from 'lucide-react';
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
      icon: <Package className="h-3.5 w-3.5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50/50',
      borderColor: 'border-indigo-100',
    },
    {
      label: 'Total Stock',
      value: totalStock,
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      color: 'text-brand-600',
      bgColor: 'bg-brand-50/50',
      borderColor: 'border-brand-100',
    },
    {
      label: 'Low Stock',
      value: lowStockProducts,
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50/50',
      borderColor: 'border-amber-100',
    },
    {
      label: 'Out of Stock',
      value: outOfStockProducts,
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50/50',
      borderColor: 'border-rose-100',
    },
    {
      label: "Today's Sales",
      value: todaySales,
      icon: <Calendar className="h-3.5 w-3.5" />,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50/50',
      borderColor: 'border-violet-100',
    },
    {
      label: 'This Month',
      value: thisMonthSales,
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50/50',
      borderColor: 'border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className="premium-card p-3 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`${kpi.color} ${kpi.bgColor} p-1.5 rounded-lg border ${kpi.borderColor} transition-transform duration-300 group-hover:scale-110`}>
              {kpi.icon}
            </div>
          </div>
          <div>
            <div className="text-base font-black text-slate-900 tracking-tight truncate">
              {kpi.value}
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
              {kpi.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryKPICards;