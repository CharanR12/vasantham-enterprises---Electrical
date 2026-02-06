import React from 'react';
import { Search } from 'lucide-react';

export default () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50/30 border-2 border-dashed border-slate-200 rounded-2xl m-4">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Search className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg">No Results Found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                We couldn't find any data matching your current filters. Try adjusting your search or filters.
            </p>
        </div>
    );
};
