import React from 'react';
import {
    DollarSign,
    UserCheck,
    Package,
    ShoppingCart,
    Calendar,
    TrendingUp,
    Activity
} from 'lucide-react';

interface DailySalesSummaryProps {
    stats: {
        totalRevenue: number;
        totalFollowUpSales: number;
        totalInventorySales: number;
        totalUnitsFromInventory: number;
        activeDays: number;
        averageDailyRevenue: number;
        averageSaleAmount: number;
    };
    formatCurrency: (amount: number) => string;
}

export const DailySalesSummary: React.FC<DailySalesSummaryProps> = ({ stats, formatCurrency }) => {
    const kpis = [
        { label: 'Period Revenue', value: formatCurrency(stats.totalRevenue), icon: <DollarSign className="h-5 w-5" />, color: 'text-brand-600', bgColor: 'bg-brand-50', isPrimary: true },
        { label: 'Agent Closures', value: stats.totalFollowUpSales, icon: <UserCheck className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { label: 'Retail Orders', value: stats.totalInventorySales, icon: <Package className="h-5 w-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { label: 'Units Liquidated', value: stats.totalUnitsFromInventory, icon: <ShoppingCart className="h-5 w-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { label: 'Operational Days', value: stats.activeDays, icon: <Calendar className="h-5 w-5" />, color: 'text-teal-600', bgColor: 'bg-teal-50' },
        { label: 'Daily Average', value: formatCurrency(stats.averageDailyRevenue), icon: <TrendingUp className="h-5 w-5" />, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
        { label: 'Ticket Alpha', value: formatCurrency(stats.averageSaleAmount), icon: <Activity className="h-5 w-5" />, color: 'text-rose-600', bgColor: 'bg-rose-50' }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi, i) => (
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
    );
};
