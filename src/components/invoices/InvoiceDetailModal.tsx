import React from 'react';
import { format, parseISO } from 'date-fns';
import { User, Building2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Invoice, InvoiceItem } from '../../types/inventory';
import { useUserRole } from '../../hooks/useUserRole';

interface InvoiceDetailModalProps {
    invoice: Invoice | null;
    onClose: () => void;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, onClose }) => {
    const { currentRole } = useUserRole();

    if (!invoice) return null;

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
        <Dialog open={!!invoice} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Invoice Details</DialogTitle>
                    <DialogDescription>View detailed breakdown of invoice {invoice.invoiceNumber}</DialogDescription>
                </DialogHeader>
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 break-all">{invoice.invoiceNumber}</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            Created on {format(parseISO(invoice.createdAt), 'dd MMMM yyyy')}
                        </p>
                        <span className={`inline-flex mt-2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(invoice.status)}`}>
                            {invoice.status || 'Unpaid'}
                        </span>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Amount</p>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600">₹{invoice.totalAmount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 border-b border-slate-100">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Billed To</h3>
                        {invoice.customerName && (
                            <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-slate-400" />
                                <span className="font-bold text-slate-900 break-words">{invoice.customerName}</span>
                            </div>
                        )}
                        {invoice.companyName && (
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <span className="font-medium text-slate-600 break-words">{invoice.companyName}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Issued By</h3>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900 text-lg">Vasantham Electricals</span>
                        </div>
                        <p className="text-sm text-slate-500">Authorized Dealer</p>
                    </div>
                </div>

                <div className="p-4 sm:p-6 bg-slate-50/30">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Item Details</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr>
                                    <th className="text-left text-xs font-bold text-slate-500 pb-3 pl-2">Product</th>
                                    {currentRole === 'admin' && (
                                        <th className="text-right text-xs font-bold text-slate-500 pb-3">Purchase Info</th>
                                    )}
                                    <th className="text-right text-xs font-bold text-slate-500 pb-3">Sale Info</th>
                                    <th className="text-center text-xs font-bold text-slate-500 pb-3">Qty</th>
                                    <th className="text-right text-xs font-bold text-slate-500 pb-3 pr-2">Total</th>
                                </tr>
                            </thead>
                            <tbody className="space-y-2">
                                {invoice.items.map((item: InvoiceItem) => (
                                    <tr key={item.id} className="bg-white border border-slate-100 rounded-lg">
                                        <td className="p-3 first:rounded-l-lg">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{item.productName}</p>
                                                <p className="text-xs text-slate-500 font-medium">{item.brandName} • {item.modelNumber}</p>
                                                {/* MRP Display */}
                                                {currentRole === 'admin' && (
                                                    <p className="text-[10px] text-slate-400 mt-0.5">MRP: ₹{item.mrp?.toLocaleString()}</p>
                                                )}
                                            </div>
                                        </td>
                                        {currentRole === 'admin' && (
                                            <td className="p-3 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-medium text-slate-600">₹{item.purchaseDiscountedPrice?.toLocaleString() || item.purchaseRate?.toLocaleString() || 0}</span>
                                                    <span className="text-[10px] text-slate-400">
                                                        Base: ₹{item.purchaseRate?.toLocaleString() || 0}
                                                        {item.purchaseDiscountPercent ? ` (-${item.purchaseDiscountPercent}%)` : ''}
                                                    </span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="p-3 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-bold text-slate-900">₹{item.salePrice.toLocaleString()}</span>
                                                <span className="text-[10px] text-green-600">
                                                    {item.saleDiscountAmount > 0 ? `(-₹${item.saleDiscountAmount})` :
                                                        item.saleDiscountPercent > 0 ? `(-${item.saleDiscountPercent}%)` :
                                                            item.discount > 0 ? `(-₹${item.discount})` : 'No Disc'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center text-sm font-bold text-slate-900">
                                            {item.quantity}
                                        </td>
                                        <td className="p-3 text-right last:rounded-r-lg font-bold text-slate-900">
                                            ₹{item.lineTotal.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 sm:p-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors w-full sm:w-auto"
                    >
                        Close Details
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InvoiceDetailModal;
