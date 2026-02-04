import React from 'react';
import { Activity, DollarSign, TrendingUp, Package } from 'lucide-react';

interface StrategicInsightsProps {
    salesMetrics: {
        totalRevenue: number;
        averageDealSize: number;
        conversionRate: string;
        completedSales: number;
    };
    inventoryMetrics: {
        stockTurnover: string;
        lowStockProducts: number;
        outOfStockProducts: number;
    };
    formatCurrency: (amount: number) => string;
}

export const StrategicInsights: React.FC<StrategicInsightsProps> = ({
    salesMetrics,
    inventoryMetrics,
    formatCurrency
}) => {
    return (
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
    );
};
