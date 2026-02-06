import React from 'react';
import { Download, Calendar, Filter } from 'lucide-react';

interface AnalyticsHeaderProps {
    activeTab: 'overview' | 'daily-sales';
    selectedPeriod: 'week' | 'month' | 'all';
    onPeriodChange: (period: 'week' | 'month' | 'all') => void;
    onExport: () => void;
    loading?: boolean;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
    activeTab,
    selectedPeriod,
    onPeriodChange,
    onExport,
    loading
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics</h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Performance & Operations</p>
            </div>

            <div className="flex items-center space-x-3">
                {activeTab === 'daily-sales' && (
                    <button
                        onClick={onExport}
                        className="group flex items-center px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95"
                        disabled={loading}
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
                            onChange={(e) => onPeriodChange(e.target.value as 'week' | 'month' | 'all')}
                            className="premium-input pl-10 pr-10 appearance-none bg-white cursor-pointer min-w-[160px]"
                            disabled={loading}
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
    );
};
