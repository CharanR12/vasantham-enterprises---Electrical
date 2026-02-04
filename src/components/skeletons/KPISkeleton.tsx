import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const KPISkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className={`premium-card p-3 animate-pulse ${i === 6 ? 'border-brand-100 ring-2 ring-brand-50' : ''}`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-6 w-6 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-12 rounded-md" />
                        <Skeleton className="h-2 w-16 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    );
};
