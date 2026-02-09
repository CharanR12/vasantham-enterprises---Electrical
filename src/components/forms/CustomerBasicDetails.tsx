import React from 'react';
import { ReferralSource, SalesPerson } from '../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

interface CustomerBasicDetailsProps {
    formData: any;
    errors: Record<string, string>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    handleSalesPersonChange: (id: string) => void;
    salesPersons: SalesPerson[];
    referralSources: { id: string; name: string }[];
    disabled?: boolean;
}

export const CustomerBasicDetails: React.FC<CustomerBasicDetailsProps> = ({
    formData,
    errors,
    handleChange,
    setFormData,
    handleSalesPersonChange,
    salesPersons,
    referralSources,
    disabled
}) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2.5">
                <Label htmlFor="name" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Name</Label>
                <Input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Johnathan Doe"
                    className={`h-12 bg-slate-50 border-slate-200/60 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-slate-700 font-medium ${errors.name ? 'border-red-500 bg-red-50/30' : ''}`}
                    disabled={disabled}
                />
                {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                    <Label htmlFor="mobile" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Mobile</Label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-sm font-bold text-slate-400">+91</span>
                        </div>
                        <Input
                            id="mobile"
                            type="text"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            className={`h-12 pl-12 bg-slate-50 border-slate-200/60 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-slate-700 font-medium ${errors.mobile ? 'border-red-500 bg-red-50/30' : ''}`}
                            maxLength={10}
                            placeholder="00000 00000"
                            disabled={disabled}
                        />
                    </div>
                    {errors.mobile && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.mobile}</p>}
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="location" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Location</Label>
                    <Input
                        id="location"
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Chennai, TN"
                        className={`h-12 bg-slate-50 border-slate-200/60 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-slate-700 font-medium ${errors.location ? 'border-red-500 bg-red-50/30' : ''}`}
                        disabled={disabled}
                    />
                    {errors.location && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.location}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Referral Source</Label>
                    <Select
                        value={formData.referralSource}
                        onValueChange={(value) => setFormData((prev: any) => ({ ...prev, referralSource: value as ReferralSource }))}
                        disabled={disabled}
                    >
                        <SelectTrigger className="h-12 bg-slate-50 border-slate-200/60 rounded-xl focus:ring-brand-500/20 focus:border-brand-500 text-slate-700 font-medium">
                            <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 shadow-xl overflow-hidden">
                            {referralSources.map((source) => (
                                <SelectItem key={source.id} value={source.name} className="py-3 focus:bg-brand-50">
                                    {source.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2.5">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Sales Person</Label>
                    <Select
                        value={formData.salesPerson.id}
                        onValueChange={handleSalesPersonChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className={`h-12 bg-slate-50 border-slate-200/60 rounded-xl focus:ring-brand-500/20 focus:border-brand-500 text-slate-700 font-medium ${errors.salesPerson ? 'border-red-500 bg-red-50/30' : ''}`}>
                            <SelectValue placeholder="Executive" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 shadow-xl overflow-hidden">
                            {salesPersons.map((person) => (
                                <SelectItem key={person.id} value={person.id} className="py-3 focus:bg-brand-50">
                                    {person.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.salesPerson && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.salesPerson}</p>}
                </div>
            </div>
        </div>
    );
};
