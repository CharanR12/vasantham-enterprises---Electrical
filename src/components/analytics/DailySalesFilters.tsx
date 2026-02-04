import React from 'react';
import { Calendar, Users, Activity } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

interface DailySalesFiltersProps {
    startDate: string;
    endDate: string;
    selectedSalesPerson: string;
    salesTypeFilter: 'all' | 'follow-up' | 'inventory';
    salesPersons: { id: string; name: string }[];
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onSalesPersonChange: (value: string) => void;
    onTypeFilterChange: (value: 'all' | 'follow-up' | 'inventory') => void;
    loading?: boolean;
}

export const DailySalesFilters: React.FC<DailySalesFiltersProps> = ({
    startDate,
    endDate,
    selectedSalesPerson,
    salesTypeFilter,
    salesPersons,
    onStartDateChange,
    onEndDateChange,
    onSalesPersonChange,
    onTypeFilterChange,
    loading
}) => {
    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 shadow-sm mb-8 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                    <Label htmlFor="start-date" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period Start</Label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                            <Calendar className="h-4 w-4 text-brand-500" />
                        </div>
                        <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="h-11 pl-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 w-full"
                            disabled={loading}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end-date" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period End</Label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                            <Calendar className="h-4 w-4 text-brand-500" />
                        </div>
                        <Input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            className="h-11 pl-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 w-full"
                            disabled={loading}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Agent</Label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                            <Users className="h-4 w-4 text-brand-500" />
                        </div>
                        <Select
                            value={selectedSalesPerson || "all"}
                            onValueChange={(value) => onSalesPersonChange(value === "all" ? "" : value)}
                            disabled={loading}
                        >
                            <SelectTrigger className="h-11 pl-10 bg-white border-slate-200 rounded-xl focus:ring-brand-500/20 focus:border-brand-500 w-full">
                                <SelectValue placeholder="Global Coverage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Global Coverage</SelectItem>
                                {salesPersons.map((person) => (
                                    <SelectItem key={person.id} value={person.id}>
                                        {person.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Revenue Channel</Label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                            <Activity className="h-4 w-4 text-brand-500" />
                        </div>
                        <Select
                            value={salesTypeFilter}
                            onValueChange={(value) => onTypeFilterChange(value as 'all' | 'follow-up' | 'inventory')}
                            disabled={loading}
                        >
                            <SelectTrigger className="h-11 pl-10 bg-white border-slate-200 rounded-xl focus:ring-brand-500/20 focus:border-brand-500 w-full">
                                <SelectValue placeholder="Unified Revenue" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Unified Revenue</SelectItem>
                                <SelectItem value="follow-up">Follow-up Sales</SelectItem>
                                <SelectItem value="inventory">Shop Floor Sales</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
};
