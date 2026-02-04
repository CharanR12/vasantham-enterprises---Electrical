import React from 'react';
import { BarChart3, Calendar } from 'lucide-react';

interface AnalyticsTabsProps {
    activeTab: 'overview' | 'daily-sales';
    onTabChange: (tab: 'overview' | 'daily-sales') => void;
    disabled?: boolean;
}

export const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({
    activeTab,
    onTabChange,
    disabled
}) => {
    return (
        <div className="bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 inline-flex">
            <button
                onClick={() => onTabChange('overview')}
                disabled={disabled}
                className={`flex items-center space-x-2.5 py-2.5 px-6 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'overview'
                    ? 'bg-white text-brand-600 shadow-md border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
            >
                <BarChart3 className={`h-4 w-4 ${activeTab === 'overview' ? 'text-brand-500' : ''}`} />
                <span className="uppercase tracking-widest">Global Insights</span>
            </button>
            <button
                onClick={() => onTabChange('daily-sales')}
                disabled={disabled}
                className={`flex items-center space-x-2.5 py-2.5 px-6 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'daily-sales'
                    ? 'bg-white text-brand-600 shadow-md border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
            >
                <Calendar className={`h-4 w-4 ${activeTab === 'daily-sales' ? 'text-brand-500' : ''}`} />
                <span className="uppercase tracking-widest">Transaction Log</span>
            </button>
        </div>
    );
};
