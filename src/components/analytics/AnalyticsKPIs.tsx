import React from 'react';
import {
    Users,
    TrendingUp,
    DollarSign,
    Target,
    Package,
    ShoppingCart,
    Calendar,
    Activity
} from 'lucide-react';

interface AnalyticsKPIsProps {
    salesMetrics: {
        totalCustomers: number;
        completedSales: number;
        totalRevenue: number;
        conversionRate: string;
        todayFollowUps: number;
        averageDealSize: number;
    };
    inventoryMetrics?: { // Made optional
        totalProducts: number;
        totalSold: number;
    };
    formatCurrency: (amount: number) => string;
}

export const AnalyticsKPIs: React.FC<AnalyticsKPIsProps> = ({
    salesMetrics,
    inventoryMetrics,
    formatCurrency
}) => {
    const kpis = [
        { label: 'Total Customers', value: salesMetrics.totalCustomers, icon: <Users className="h-5 w-5" />, color: 'text-brand-600', bgColor: 'bg-brand-50' },
        { label: 'Sales Completed', value: salesMetrics.completedSales, icon: <TrendingUp className="h-5 w-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
        { label: 'Total Revenue', value: formatCurrency(salesMetrics.totalRevenue), icon: <DollarSign className="h-5 w-5" />, color: 'text-slate-900', bgColor: 'bg-slate-100', isPrimary: true },
        { label: 'Conversion Rate', value: `${salesMetrics.conversionRate}%`, icon: <Target className="h-5 w-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        // Conditional rendering for Inventory KPIs
        ...(inventoryMetrics ? [
            { label: 'Total products', value: inventoryMetrics.totalProducts, icon: <Package className="h-5 w-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
            { label: 'Units Sold', value: inventoryMetrics.totalSold, icon: <ShoppingCart className="h-5 w-5" />, color: 'text-indigo-600', bgColor: 'bg-indigo-50' }
        ] : []),
        { label: "Today's Actions", value: salesMetrics.todayFollowUps, icon: <Calendar className="h-5 w-5" />, color: 'text-rose-600', bgColor: 'bg-rose-50' },
        { label: 'Avg Deal Size', value: formatCurrency(salesMetrics.averageDealSize), icon: <Activity className="h-5 w-5" />, color: 'text-teal-600', bgColor: 'bg-teal-50' }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpis.map((kpi, i) => (
                <div key={i} className={`premium-card p-2.5 group transition-all duration-300 ${kpi.isPrimary ? 'ring-2 ring-brand-500/10 border-brand-200' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className={`${kpi.color} ${kpi.bgColor} p-1.5 rounded-lg border border-current/10 transition-transform duration-300 group-hover:scale-110`}>
                            {kpi.icon}
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-black text-slate-900 tracking-tight truncate">
                            {kpi.value}
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 transition-colors group-hover:text-slate-500 truncate">
                            {kpi.label}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
