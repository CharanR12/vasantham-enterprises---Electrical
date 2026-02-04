import React from 'react';
import { Users } from 'lucide-react';

interface TeamPerformanceProps {
    salesPersonPerformance: {
        name: string;
        revenue: number;
        completedSales: number;
        totalCustomers: number;
        conversionRate: number;
        averageDealSize: number;
    }[];
    formatCurrency: (amount: number) => string;
}

export const TeamPerformance: React.FC<TeamPerformanceProps> = ({
    salesPersonPerformance,
    formatCurrency
}) => {
    return (
        <div className="premium-card p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                    <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                        <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    Team Performance
                </h3>
                <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    Global Rank
                </div>
            </div>

            <div className="space-y-4">
                {salesPersonPerformance.slice(0, 5).map((person, index) => (
                    <div key={index} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 transition-all duration-300 hover:bg-white hover:shadow-md hover:border-brand-200 group/person">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm border ${index === 0 ? 'bg-amber-100 border-amber-200 text-amber-700 ring-4 ring-amber-500/10' :
                                    index === 1 ? 'bg-slate-200 border-slate-300 text-slate-700' :
                                        index === 2 ? 'bg-orange-100 border-orange-200 text-orange-700' :
                                            'bg-white border-slate-100 text-slate-500'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 text-sm group-hover/person:text-brand-600 transition-colors">{person.name}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue Driver</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-black text-slate-900 tracking-tight">{formatCurrency(person.revenue)}</div>
                                <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 mt-1 inline-block">{person.completedSales} units</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-center">
                                <div className="text-xs font-black text-slate-900">{person.totalCustomers}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Reach</div>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-center">
                                <div className="text-xs font-black text-brand-600">{person.conversionRate.toFixed(1)}%</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Impact</div>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-center">
                                <div className="text-xs font-black text-emerald-600 truncate">{formatCurrency(person.averageDealSize)}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ticket</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
