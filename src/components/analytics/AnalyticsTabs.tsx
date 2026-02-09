import React from 'react';
import { BarChart3, Calendar } from 'lucide-react';

interface AnalyticsTabsProps {
    activeTab: 'follow-up' | 'inventory';
    onTabChange: (tab: 'follow-up' | 'inventory') => void;
    disabled?: boolean;
}

export const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({
    activeTab,
    onTabChange,
    disabled
}) => {
    return (
        <div className="bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 inline-flex w-full sm:w-auto">
            <button
                onClick={() => onTabChange('follow-up')}
                disabled={disabled}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2.5 py-2.5 px-6 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'follow-up'
                    ? 'bg-white text-brand-600 shadow-md border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
            >
                <BarChart3 className={`h-4 w-4 ${activeTab === 'follow-up' ? 'text-brand-500' : ''}`} />
                <span className="uppercase tracking-widest">Sales Follow-up Analytics</span>
            </button>
            <button
                onClick={() => onTabChange('inventory')}
                disabled={disabled}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2.5 py-2.5 px-6 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'inventory'
                    ? 'bg-white text-brand-600 shadow-md border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
            >
                <Calendar className={`h-4 w-4 ${activeTab === 'inventory' ? 'text-brand-500' : ''}`} />
                <span className="uppercase tracking-widest">Inventory Sales Analytics</span>
            </button>
        </div>
    );
};
