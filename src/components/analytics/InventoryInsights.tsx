import React from 'react';
import { Package, PieChart, BarChart3 } from 'lucide-react';

interface InventoryInsightsProps {
    topProducts: {
        name: string;
        brand: string;
        totalSold: number;
        stockStatus: string;
        currentStock: number;
    }[];
    inventoryMetrics: {
        inStockProducts: number;
        lowStockProducts: number;
        outOfStockProducts: number;
        totalStock: number;
        stockTurnover: string;
    };
    brandPerformance: {
        name: string;
        totalSold: number;
        totalProducts: number;
        totalStock: number;
    }[];
}

export const InventoryInsights: React.FC<InventoryInsightsProps> = ({
    topProducts,
    inventoryMetrics,
    brandPerformance
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products */}
            <div className="premium-card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                        <div className="bg-purple-50 p-2 rounded-lg mr-3">
                            <Package className="h-5 w-5 text-purple-600" />
                        </div>
                        Market Leaders
                    </h3>
                </div>

                {topProducts.length > 0 ? (
                    <div className="space-y-4">
                        {topProducts.slice(0, 5).map((product, index) => (
                            <div key={index} className="group/product p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-white hover:shadow-md hover:border-purple-200 transition-all duration-300">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="font-bold text-slate-900 text-sm truncate group-hover/product:text-purple-600 transition-colors uppercase tracking-tight">{product.name}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{product.brand}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-purple-600 text-lg leading-none">{product.totalSold}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Units Sold</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100/50">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${product.stockStatus === 'Out of Stock' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                        product.stockStatus === 'Low Stock' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {product.stockStatus}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500">{product.currentStock} in inventory</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Package className="h-8 w-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No activity recorded</p>
                    </div>
                )}
            </div>

            {/* Stock Composition */}
            <div className="premium-card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                        <div className="bg-orange-50 p-2 rounded-lg mr-3">
                            <PieChart className="h-5 w-5 text-orange-600" />
                        </div>
                        Stock Composition
                    </h3>
                </div>

                <div className="space-y-4">
                    {[
                        { label: 'Healthy Stock', value: inventoryMetrics.inStockProducts, color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-100' },
                        { label: 'Critical Supply', value: inventoryMetrics.lowStockProducts, color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-100' },
                        { label: 'Depleted Stock', value: inventoryMetrics.outOfStockProducts, color: 'bg-rose-500', bgColor: 'bg-rose-50', textColor: 'text-rose-700', borderColor: 'border-rose-100' }
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center justify-between p-4 ${item.bgColor} rounded-2xl border ${item.borderColor} group/item transition-all duration-300 hover:scale-[1.02]`}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 ${item.color} rounded-full ring-4 ring-white shadow-sm`}></div>
                                <span className={`${item.textColor} font-black text-xs uppercase tracking-widest`}>{item.label}</span>
                            </div>
                            <span className={`${item.textColor} font-black text-lg tracking-tight`}>{item.value}</span>
                        </div>
                    ))}

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                <div className="text-xl font-black text-slate-900 tracking-tight">{inventoryMetrics.totalStock}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Units</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                <div className="text-xl font-black text-purple-600 tracking-tight">{inventoryMetrics.stockTurnover}%</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Velocity</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Brand Portfolio */}
            <div className="premium-card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                        <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                        </div>
                        Brand Portfolio
                    </h3>
                </div>

                {brandPerformance.length > 0 ? (
                    <div className="space-y-4">
                        {brandPerformance.map((brand, index) => (
                            <div key={index} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-white transition-all duration-300 group/brand">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="font-black text-slate-900 text-sm group-hover/brand:text-brand-600 transition-colors uppercase tracking-tight">{brand.name}</div>
                                    <div className="text-right">
                                        <div className="font-black text-indigo-600 text-base">{brand.totalSold}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Units</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SKUs</span>
                                        <span className="text-xs font-black text-slate-900">{brand.totalProducts}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Held</span>
                                        <span className="text-xs font-black text-emerald-600">{brand.totalStock}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <BarChart3 className="h-8 w-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Awaiting data</p>
                    </div>
                )}
            </div>
        </div>
    );
};
