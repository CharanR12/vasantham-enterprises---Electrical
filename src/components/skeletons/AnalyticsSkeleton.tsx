import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const AnalyticsSkeleton: React.FC = () => {
    return (
        <div className="space-y-8 pb-12 animate-pulse">
            {/* Overview KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className={`premium-card p-5 space-y-4 ${i === 3 ? 'ring-4 ring-brand-50' : ''}`}>
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-16 rounded-md" />
                            <Skeleton className="h-3 w-20 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div key={i} className="premium-card p-6 sm:p-8 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <Skeleton className="h-6 w-48 rounded-md" />
                            </div>
                            <Skeleton className="h-6 w-24 rounded-lg" />
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((j) => (
                                <div key={j} className="space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3 w-12 rounded-md" />
                                        <Skeleton className="h-4 w-20 rounded-md" />
                                    </div>
                                    <Skeleton className="h-2 w-full rounded-full" />
                                    <Skeleton className="h-1.5 w-3/4 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="premium-card p-6 sm:p-8 space-y-6">
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-9 w-9 rounded-lg" />
                            <Skeleton className="h-6 w-32 rounded-md" />
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((j) => (
                                <div key={j} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 space-y-3">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-24 rounded-md" />
                                        <Skeleton className="h-6 w-8 rounded-md" />
                                    </div>
                                    <Skeleton className="h-2 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Strategic Intelligence Summary */}
            <div className="bg-slate-100 rounded-3xl p-8 sm:p-10 space-y-10">
                <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-64 rounded-md" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/50 rounded-2xl p-6 border border-slate-200">
                            <div className="flex items-center space-x-3 mb-4">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <Skeleton className="h-3 w-24 rounded-md" />
                            </div>
                            <Skeleton className="h-16 w-full rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
