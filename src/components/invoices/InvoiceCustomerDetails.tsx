import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InvoiceCustomerDetailsProps {
    customerName: string;
    setCustomerName: (value: string) => void;
    companyName: string;
    setCompanyName: (value: string) => void;
    errors: Record<string, string>;
    setErrors: (errors: Record<string, string>) => void;
}

const InvoiceCustomerDetails: React.FC<InvoiceCustomerDetailsProps> = ({
    customerName,
    setCustomerName,
    companyName,
    setCompanyName,
    errors,
    setErrors,
}) => {
    return (
        <div className="bg-white border-b border-slate-100 shrink-0">
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Customer Name <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={customerName}
                        onChange={(e) => {
                            setCustomerName(e.target.value);
                            if (errors.customer) setErrors({ ...errors, customer: '' });
                        }}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium text-sm sm:text-base h-24 resize-none"
                        placeholder="Enter customer name\nAddress\nPhone Number"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Company Name
                    </label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => {
                            setCompanyName(e.target.value);
                            if (errors.customer) setErrors({ ...errors, customer: '' });
                        }}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium text-sm sm:text-base"
                        placeholder="Enter company name (optional)"
                    />
                </div>
            </div>
            {errors.customer && (
                <div className="px-4 sm:px-6 pb-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 animate-pulse">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.customer}
                    </p>
                </div>
            )}
        </div>
    );
};

export default InvoiceCustomerDetails;
