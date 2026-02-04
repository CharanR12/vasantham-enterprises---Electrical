import React from 'react';
import { Calendar, UserCheck, Package, Users } from 'lucide-react';
import { DaySalesData, FollowUpSale, InventorySale } from '../../hooks/useAnalyticsData';

interface DailySalesListProps {
    data: DaySalesData[];
    formatCurrency: (amount: number) => string;
}

export const DailySalesList: React.FC<DailySalesListProps> = ({ data, formatCurrency }) => {
    if (data.length === 0) {
        return (
            <div className="premium-card py-20 text-center border-dashed">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                    <Calendar className="h-10 w-10 text-slate-200" />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No transaction data identified</p>
                <p className="text-slate-400 text-xs mt-2">Try adjusting your filters or date range</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {data.map((day) => (
                <div key={day.date} className="premium-card overflow-hidden group/day">
                    <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 group-hover/day:scale-110 transition-transform duration-500">
                                <Calendar className="h-5 w-5 text-brand-500" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-900 tracking-tight">{day.fullDate}</h4>
                                <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-slate-100">{day.followUpSalesCount} agent closures</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-slate-100">{day.inventorySalesCount} retail orders</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-left lg:text-right">
                            <div className="text-2xl font-black text-emerald-600 tracking-tight">
                                {formatCurrency(day.totalAmount)}
                            </div>
                            {day.followUpSalesCount > 0 && (
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Unit Avg: {formatCurrency(day.totalAmount / day.followUpSalesCount)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Follow-up Sales */}
                        {day.followUpSales.length > 0 && (
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="h-1 w-6 bg-brand-500 rounded-full"></div>
                                    <h5 className="text-[10px] font-black text-brand-600 uppercase tracking-widest flex items-center">
                                        <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                                        Client Execution
                                    </h5>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {day.followUpSales.map((sale: FollowUpSale, index: number) => (
                                        <div key={index} className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-brand-200 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/5 group/sale">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <div className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">{sale.customerName}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center">
                                                        {sale.mobile}
                                                    </div>
                                                </div>
                                                <div className="font-black text-emerald-600 text-sm whitespace-nowrap bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                                    {formatCurrency(sale.amount)}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest pt-3 border-t border-slate-50">
                                                <span className="flex items-center text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    {sale.salesPerson}
                                                </span>
                                                <span className="text-slate-400 truncate max-w-[100px]">{sale.location}</span>
                                            </div>
                                            {sale.remarks && (
                                                <div className="text-[10px] italic text-slate-400 mt-3 p-2 bg-slate-50 rounded-lg group-hover/sale:bg-white transition-colors border border-transparent group-hover/sale:border-slate-100 line-clamp-2">
                                                    "{sale.remarks}"
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Inventory Sales */}
                        {day.inventorySales.length > 0 && (
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="h-1 w-6 bg-purple-500 rounded-full"></div>
                                    <h5 className="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center">
                                        <Package className="h-3.5 w-3.5 mr-1.5" />
                                        Retail Performance
                                    </h5>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {day.inventorySales.map((sale: InventorySale, index: number) => (
                                        <div key={index} className="bg-slate-50/30 rounded-2xl p-4 border border-slate-100 hover:border-purple-200 transition-all duration-300 hover:bg-white group/retail">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <div className="font-black text-slate-900 text-xs truncate group-hover/retail:text-purple-600 transition-colors uppercase tracking-tight">{sale.productName}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{sale.brandName} • {sale.modelNumber}</div>
                                                </div>
                                                <div className="font-black text-purple-600 text-xs bg-purple-50 px-2 py-1 rounded transition-colors group-hover/retail:bg-purple-100">
                                                    {sale.quantitySold} units
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest pt-3 border-t border-slate-100">
                                                <span className="text-slate-900 truncate max-w-[120px]">{sale.customerName}</span>
                                                {sale.billNumber && (
                                                    <span className="text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-100 font-mono">
                                                        #{sale.billNumber}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-3 bg-white/50 p-2 rounded-lg border border-slate-50 italic">
                                                {sale.remarks}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
