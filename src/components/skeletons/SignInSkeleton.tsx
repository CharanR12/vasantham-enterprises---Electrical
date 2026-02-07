import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const SignInSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Email Field */}
            <div className="space-y-2">
                <Skeleton className="h-3 w-16 rounded-md" /> {/* Label */}
                <Skeleton className="h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl" /> {/* Input */}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <Skeleton className="h-3 w-20 rounded-md" /> {/* Label */}
                <Skeleton className="h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl" /> {/* Input */}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
                <Skeleton className="h-3 w-28 rounded-md" />
            </div>

            {/* Submit Button */}
            <Skeleton className="h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl" />

            {/* Footer - Sign Up Link */}
            <div className="flex items-center justify-center space-x-2 pt-2">
                <Skeleton className="h-3 w-28 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
            </div>
        </div>
    );
};
