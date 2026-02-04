import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const CustomerSkeleton: React.FC = () => {
    return (
        <div className="premium-card p-6 space-y-6">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4 rounded-lg" />
                    <Skeleton className="h-3 w-1/4 rounded-md" />
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                            <div className="flex items-center space-x-3 w-full">
                                <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
                                <Skeleton className="h-4 w-1/2 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-3 w-1/3 rounded-md" />
                    <Skeleton className="h-4 w-1/4 rounded-lg" />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-6 space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-6 w-6 rounded-lg" />
                            <Skeleton className="h-3 w-20 rounded-md" />
                        </div>
                        <Skeleton className="h-4 w-16 rounded-lg" />
                    </div>
                    <Skeleton className="h-4 w-1/4 rounded-md" />
                    <Skeleton className="h-8 w-full rounded-xl" />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                    <div className="space-y-1">
                        <Skeleton className="h-2 w-20 rounded-md" />
                        <Skeleton className="h-3 w-28 rounded-md" />
                    </div>
                    <Skeleton className="h-8 w-32 rounded-xl" />
                </div>
            </div>
        </div>
    );
};
