import React from 'react';
import { FileText, Calendar, MoreVertical, Edit, Copy, Trash2, Download, User, Building2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Invoice } from '../../types/inventory';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { generateInvoicePDF } from '../../utils/pdfGenerator'; // Adjust path if needed

interface InvoiceCardProps {
    invoice: Invoice;
    currentRole: 'admin' | 'user';
    onClick: (invoice: Invoice) => void;
    onEdit: (e: React.MouseEvent, invoice: Invoice) => void;
    onDuplicate: (e: React.MouseEvent, invoice: Invoice) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
    invoice,
    currentRole,
    onClick,
    onEdit,
    onDuplicate,
    onDelete,
}) => {
    const getStatusColor = (status: Invoice['status']) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Unpaid': return 'bg-red-50 text-red-700 border-red-100';
            case 'Partial': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'Shared': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    return (
        <div
            onClick={() => onClick(invoice)}
            className="premium-card p-6 group hover:-translate-y-1 transition-all duration-300 cursor-pointer relative"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-50 rounded-xl group-hover:bg-brand-100 transition-colors">
                        <FileText className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{invoice.invoiceNumber.replace(/^INV-/, 'QTN-')}</h3>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {format(parseISO(invoice.createdAt), 'dd MMM yyyy')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(invoice.status)}`}>
                        {invoice.status || 'Unpaid'}
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => onEdit(e, invoice)} className="cursor-pointer font-medium text-slate-600 focus:text-slate-900 focus:bg-slate-50">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => onDuplicate(e, invoice)} className="cursor-pointer font-medium text-slate-600 focus:text-slate-900 focus:bg-slate-50">
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                            </DropdownMenuItem>
                            {currentRole === 'admin' && (
                                <DropdownMenuItem onClick={(e: React.MouseEvent) => onDelete(e, invoice.id)} className="cursor-pointer font-medium text-red-600 focus:text-red-700 focus:bg-red-50">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => generateInvoicePDF(invoice)} className="cursor-pointer font-medium text-slate-600 focus:text-slate-900 focus:bg-slate-50">
                                <Download className="mr-2 h-4 w-4" />
                                Export PDF
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                {invoice.customerName && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold">{invoice.customerName}</span>
                    </div>
                )}
                {invoice.companyName && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{invoice.companyName}</span>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                <div className="text-xs font-semibold text-slate-400">
                    {invoice.items.length} {invoice.items.length === 1 ? 'item' : 'items'}
                </div>
                <div className="text-right">
                    <p className="text--[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                    <p className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                        ₹{invoice.totalAmount.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InvoiceCard;
