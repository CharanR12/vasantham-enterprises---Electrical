import React, { useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import { Invoice } from '../types/inventory';
import InvoiceModal from '../components/invoices/InvoiceModal';
import InvoiceDetailModal from '../components/invoices/InvoiceDetailModal';
import InvoiceCard from '../components/invoices/InvoiceCard';
import { useUserRole } from '../hooks/useUserRole';

const InvoicesPage: React.FC = () => {
    const navigate = useNavigate();
    const { invoices, isLoading, error, deleteInvoice } = useInvoices();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [duplicatingProducts, setDuplicatingProducts] = useState<any[] | null>(null);
    const { currentRole } = useUserRole();

    const filteredInvoices = (invoices || []).filter((invoice: Invoice) => {
        const displayId = invoice.invoiceNumber.replace(/^INV-/, 'QTN-');
        const term = searchTerm.toLowerCase();
        return (
            displayId.toLowerCase().includes(term) ||
            invoice.invoiceNumber.toLowerCase().includes(term) ||
            (invoice.customerName && invoice.customerName.toLowerCase().includes(term)) ||
            (invoice.companyName && invoice.companyName.toLowerCase().includes(term))
        );
    });

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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quotations</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Manage Transactions</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/inventory?selectMode=true')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all text-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Create New Quotation
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
                    placeholder="Search quotations by number, customer, or company..."
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
                        <InvoiceCard
                            key={invoice.id}
                            invoice={invoice}
                            currentRole={currentRole as 'admin' | 'user'}
                            onClick={setViewingInvoice}
                            onEdit={handleEdit}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="premium-card py-20 text-center border-dashed">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <FileText className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No quotations found</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto mb-6">
                        {searchTerm ? 'Try adjusting your search terms.' : 'Create your first quotation by selecting products from inventory.'}
                    </p>
                    <button
                        onClick={() => navigate('/inventory?selectMode=true')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all hover:-translate-y-0.5"
                    >
                        <Plus className="h-5 w-5" />
                        Create New Quotation
                    </button>
                </div>
            )}

            {/* View Invoice Details Modal */}
            <InvoiceDetailModal
                invoice={viewingInvoice}
                onClose={() => setViewingInvoice(null)}
            />

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
