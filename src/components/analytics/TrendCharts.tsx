import React from 'react';
import { TrendingUp } from 'lucide-react';

interface TrendChartsProps {
    timeBasedAnalytics: {
        totalRevenue: number;
        dailyData: {
            date: string;
            sales: number;
            revenue: number;
        }[];
    };
    formatCurrency: (amount: number) => string;
}

export const TrendCharts: React.FC<TrendChartsProps> = ({
    timeBasedAnalytics,
    formatCurrency
}) => {
    return (
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
    );
};
