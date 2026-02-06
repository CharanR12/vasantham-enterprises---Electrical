import React, { useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar, Building2, User, Search, MoreVertical, Edit, Copy, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ErrorMessage from '../components/ErrorMessage';
import { Invoice, InvoiceItem } from '../types/inventory';
import InvoiceModal from '../components/invoices/InvoiceModal';
import {
    Dialog,
    DialogContent,
} from '../components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const InvoicesPage: React.FC = () => {
    const navigate = useNavigate();
    const { invoices, isLoading, error, deleteInvoice } = useInvoices();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [duplicatingProducts, setDuplicatingProducts] = useState<any[] | null>(null);

    const filteredInvoices = (invoices || []).filter((invoice: Invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.customerName && invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (invoice.companyName && invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleEdit = (e: React.MouseEvent, invoice: Invoice) => {
        e.stopPropagation();
        setEditingInvoice(invoice);
    };

    const handleDuplicate = (e: React.MouseEvent, invoice: Invoice) => {
        e.stopPropagation();
        // Map invoice items to product-like structure for InvoiceModal
        const productsParams = invoice.items.map(item => ({
            id: item.productId,
            productName: item.productName,
            modelNumber: item.modelNumber,
            brand: { name: item.brandName },
            mrp: item.mrp,
            salePrice: item.salePrice,
            // Pass snapshot fields as current fields to preserve pricing
            discount: item.discount,
            purchaseRate: item.purchaseRate,
            purchaseDiscountPercent: item.purchaseDiscountPercent,
            purchaseDiscountedPrice: item.purchaseDiscountedPrice,
            saleDiscountPercent: item.saleDiscountPercent,
            saleDiscountAmount: item.saleDiscountAmount
        }));
        setDuplicatingProducts(productsParams);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            await deleteInvoice(id);
        }
    };

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
        <div className="space-y-8 pb-24 animate-fadeIn">
            {error && (
                <ErrorMessage
                    message={(error as any)?.message || 'Failed to load invoices'}
                    className="mb-6 rounded-2xl shadow-sm border-red-100"
                />
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Invoices</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Manage Transactions</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/inventory?selectMode=true')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all text-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Create New Invoice
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative group max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="premium-input pl-11 w-full"
                    placeholder="Search invoices by number, customer, or company..."
                />
            </div>


            {/* Invoices List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse h-40"></div>
                    ))}
                </div>
            ) : filteredInvoices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInvoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            onClick={() => setViewingInvoice(invoice)}
                            className="premium-card p-6 group hover:-translate-y-1 transition-all duration-300 cursor-pointer relative"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-brand-50 rounded-xl group-hover:bg-brand-100 transition-colors">
                                        <FileText className="h-5 w-5 text-brand-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{invoice.invoiceNumber}</h3>
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
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onClick={(e) => handleEdit(e, invoice)} className="cursor-pointer font-medium text-slate-600 focus:text-slate-900 focus:bg-slate-50">
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => handleDuplicate(e, invoice)} className="cursor-pointer font-medium text-slate-600 focus:text-slate-900 focus:bg-slate-50">
                                                <Copy className="mr-2 h-4 w-4" />
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => handleDelete(e, invoice.id)} className="cursor-pointer font-medium text-red-600 focus:text-red-700 focus:bg-red-50">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
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
                    ))}
                </div>
            ) : (
                <div className="premium-card py-20 text-center border-dashed">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <FileText className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No invoices found</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto mb-6">
                        {searchTerm ? 'Try adjusting your search terms.' : 'Create your first invoice by selecting products from inventory.'}
                    </p>
                    <button
                        onClick={() => navigate('/inventory?selectMode=true')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all hover:-translate-y-0.5"
                    >
                        <Plus className="h-5 w-5" />
                        Create New Invoice
                    </button>
                </div>
            )}

            {/* View Invoice Details Modal */}
            {viewingInvoice && (
                <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white/95 backdrop-blur-xl">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">{viewingInvoice.invoiceNumber}</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">
                                    Created on {format(parseISO(viewingInvoice.createdAt), 'dd MMMM yyyy')}
                                </p>
                                <span className={`inline-flex mt-2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(viewingInvoice.status)}`}>
                                    {viewingInvoice.status || 'Unpaid'}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Amount</p>
                                <p className="text-3xl font-black text-emerald-600">₹{viewingInvoice.totalAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-2 gap-8 border-b border-slate-100">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Billed To</h3>
                                {viewingInvoice.customerName && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="h-4 w-4 text-slate-400" />
                                        <span className="font-bold text-slate-900">{viewingInvoice.customerName}</span>
                                    </div>
                                )}
                                {viewingInvoice.companyName && (
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-slate-400" />
                                        <span className="font-medium text-slate-600">{viewingInvoice.companyName}</span>
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

                        <div className="p-6 bg-slate-50/30">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Item Details</h3>
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="text-left text-xs font-bold text-slate-500 pb-3 pl-2">Product</th>
                                        <th className="text-right text-xs font-bold text-slate-500 pb-3">Price</th>
                                        <th className="text-center text-xs font-bold text-slate-500 pb-3">Qty</th>
                                        <th className="text-right text-xs font-bold text-slate-500 pb-3">Discount</th>
                                        <th className="text-right text-xs font-bold text-slate-500 pb-3 pr-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="space-y-2">
                                    {viewingInvoice.items.map((item: InvoiceItem) => (
                                        <tr key={item.id} className="bg-white border border-slate-100 rounded-lg">
                                            <td className="p-3 first:rounded-l-lg">
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{item.productName}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{item.brandName} • {item.modelNumber}</p>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right text-sm font-medium text-slate-600">
                                                ₹{item.salePrice.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-center text-sm font-bold text-slate-900">
                                                {item.quantity}
                                            </td>
                                            <td className="p-3 text-right text-sm font-medium text-green-600">
                                                {item.discount > 0 ? `-₹${item.discount.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="p-3 text-right last:rounded-r-lg font-bold text-slate-900">
                                                ₹{item.lineTotal.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 flex justify-end">
                            <button
                                onClick={() => setViewingInvoice(null)}
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                            >
                                Close Details
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Edit Invoice Modal */}
            {editingInvoice && (
                <InvoiceModal
                    invoice={editingInvoice}
                    onClose={() => setEditingInvoice(null)}
                    onSave={() => setEditingInvoice(null)}
                />
            )}

            {/* Duplicate Invoice Modal */}
            {duplicatingProducts && (
                <InvoiceModal
                    selectedProducts={duplicatingProducts}
                    onClose={() => setDuplicatingProducts(null)}
                    onSave={() => setDuplicatingProducts(null)}
                />
            )}
        </div>
    );
};

export default InvoicesPage;
