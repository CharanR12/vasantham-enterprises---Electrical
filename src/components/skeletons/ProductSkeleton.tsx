import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const ProductSkeleton: React.FC = () => {
    return (
        <div className="premium-card p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-1/2 rounded-lg" />
                    <Skeleton className="h-3 w-1/4 rounded-md" />
                </div>
            </div>

            <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-xl" />

                <div className="grid grid-cols-2 gap-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex flex-col bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 space-y-2">
                            <Skeleton className="h-2 w-12 rounded-md" />
                            <Skeleton className="h-6 w-8 rounded-md" />
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2 w-full">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-3 w-32 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-16 rounded-lg" />
                </div>

                <div className="bg-slate-50/30 rounded-xl p-3 border border-dashed border-slate-200 mt-4 space-y-2">
                    <Skeleton className="h-2 w-20 rounded-md" />
                    {[1, 2].map((i) => (
                        <div key={i} className="flex justify-between items-center bg-white/50 p-1.5 rounded-lg border border-white">
                            <Skeleton className="h-3 w-20 rounded-md" />
                            <Skeleton className="h-4 w-6 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mt-6">
                <Skeleton className="col-span-2 h-9 rounded-xl" />
                <Skeleton className="col-span-3 h-9 rounded-xl" />
            </div>
        </div>
    );
};
