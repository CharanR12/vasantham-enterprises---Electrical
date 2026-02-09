import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Product, InvoiceItem, Invoice } from '../../types/inventory';
import { useInvoices } from '../../hooks/useInvoices';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { X, Trash2, Save, Download, AlertCircle } from 'lucide-react';

interface InvoiceModalProps {
    selectedProducts?: Product[];
    invoice?: Invoice;
    onClose: () => void;
    onSave: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ selectedProducts = [], invoice, onClose, onSave }) => {
    const { createInvoice, updateInvoice, getNextInvoiceNumber, isCreating, isUpdating, createError, updateError } = useInvoices();
    const isEditMode = !!invoice;
    const isLoading = isCreating || isUpdating;
    const error = createError || updateError;

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [status, setStatus] = useState<Invoice['status']>('Unpaid');
    const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'invoiceId' | 'createdAt'>[]>([]);

    // Error state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize
    useEffect(() => {
        if (isEditMode && invoice) {
            setInvoiceNumber(invoice.invoiceNumber);
            setCustomerName(invoice.customerName || '');
            setCompanyName(invoice.companyName || '');
            setStatus(invoice.status || 'Unpaid');
            // Map existing items
            setItems(invoice.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                modelNumber: item.modelNumber,
                brandName: item.brandName,
                mrp: item.mrp,
                salePrice: item.salePrice,
                discount: item.discount || 0,
                quantity: item.quantity,
                lineTotal: item.lineTotal,
                sortOrder: item.sortOrder,
                // Pass through snapshots
                purchaseRate: item.purchaseRate,
                purchaseDiscountPercent: item.purchaseDiscountPercent,
                purchaseDiscountedPrice: item.purchaseDiscountedPrice,
                saleDiscountPercent: item.saleDiscountPercent,
                saleDiscountAmount: item.saleDiscountAmount
            })));
        } else if (selectedProducts.length > 0) {
            // Creation Mode
            const initialItems = selectedProducts.map((product, index) => ({
                productId: product.id,
                productName: product.productName,
                modelNumber: product.modelNumber,
                brandName: product.brand.name,
                mrp: product.mrp || 0,
                salePrice: product.salePrice || 0,
                // Default discount from product snapshot or 0
                discount: (product as any).discount || 0, // Passed from InventoryPage selection
                quantity: 1,
                lineTotal: (product.salePrice || 0) - ((product as any).discount || 0),
                sortOrder: index,
                // Snapshots
                purchaseRate: (product as any).purchaseRate || 0,
                purchaseDiscountPercent: (product as any).purchaseDiscountPercent || 0,
                purchaseDiscountedPrice: (product as any).purchaseDiscountedPrice || 0,
                saleDiscountPercent: (product as any).saleDiscountPercent || 0,
                saleDiscountAmount: (product as any).saleDiscountAmount || 0
            }));
            setItems(initialItems);

            const fetchInvoiceNumber = async () => {
                const nextNum = await getNextInvoiceNumber();
                setInvoiceNumber(nextNum);
            };
            fetchInvoiceNumber();
        }
    }, [isEditMode, invoice, selectedProducts]);

    // Update line totals
    const updateItem = (index: number, field: keyof typeof items[0], value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        // Recalculate line total if price, qty, or discount changed
        if (field === 'salePrice' || field === 'quantity' || field === 'discount') {
            const price = field === 'salePrice' ? value : item.salePrice;
            const qty = field === 'quantity' ? value : item.quantity;
            const disc = field === 'discount' ? value : (item.discount || 0);
            item.lineTotal = (price * qty) - disc;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.lineTotal, 0);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!customerName.trim() && !companyName.trim()) {
            newErrors.customer = 'Either Customer Name or Company Name is required';
        }

        if (items.length === 0) {
            newErrors.items = 'At least one item is required';
        }

        items.forEach((item, index) => {
            if (item.quantity <= 0) {
                newErrors[`qty_${index}`] = 'Qty > 0';
            }
            if (item.salePrice < 0) {
                newErrors[`price_${index}`] = 'No neg price';
            }
            if (item.discount < 0) {
                newErrors[`disc_${index}`] = 'No neg disc';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const invoiceData = {
                invoiceNumber,
                customerName: customerName.trim() || undefined,
                companyName: companyName.trim() || undefined,
                totalAmount: calculateTotal(),
                status,
                items: items
            };

            if (isEditMode && invoice) {
                await updateInvoice({ id: invoice.id, invoice: invoiceData });
            } else {
                await createInvoice(invoiceData);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to save invoice:', error);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-[95vw] lg:max-w-5xl max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-xl sm:rounded-2xl">
                {/* Header */}
                <div className="bg-white border-b border-slate-100 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 bg-white sticky top-0 z-10 gap-4 sm:gap-0">
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                                <span className="text-lg sm:text-xl font-bold">{isEditMode ? 'Edit Quotation' : 'New Quotation'}</span>
                                {isEditMode && invoice && (
                                    <button
                                        onClick={() => generateInvoicePDF(invoice)}
                                        className="p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                                        title="Export PDF"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span className="hidden sm:inline">PDF</span>
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="sm:hidden p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Status:</span>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as any)}
                                        className={`text-sm font-bold px-2 sm:px-3 py-1.5 rounded-lg border outline-none ${status === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' :
                                            status === 'Unpaid' ? 'bg-red-100 text-red-700 border-red-200' :
                                                status === 'Partial' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                    'bg-blue-100 text-blue-700 border-blue-200'
                                            }`}
                                    >
                                        <option value="Unpaid">Unpaid</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Partial">Partial</option>
                                        <option value="Shared">Shared</option>
                                    </select>
                                </div>
                                <div className="text-right flex-1 sm:flex-none">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Total Amount</p>
                                    <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-none">₹{calculateTotal().toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="hidden sm:block p-2 -mr-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {/* Customer Details Form */}
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
                </div>
                {errors.customer && (
                    <div className="px-4 sm:px-6 pb-4">
                        <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 animate-pulse">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.customer}
                        </p>
                    </div>
                )}

                {/* Items Table */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead>
                                <tr>
                                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 pl-2">Product</th>
                                    <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 w-20">Rate</th>
                                    <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 w-24">MRP</th>
                                    <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 w-24">Sale Price</th>
                                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 w-20">Qty</th>
                                    <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 w-24">Disc</th>
                                    <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 w-28">Total</th>
                                    <th className="w-10 pb-3"></th>
                                </tr>
                            </thead>
                            <tbody className="space-y-2">
                                {items.map((item, index) => (
                                    <tr key={`${item.productId}-${index}`} className="group bg-white hover:bg-slate-50 border border-slate-100 rounded-xl shadow-sm transition-all">
                                        <td className="p-3 first:rounded-l-xl">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm truncate max-w-[200px]">{item.productName}</p>
                                                <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{item.brandName} • {item.modelNumber}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                                        Pur: ₹{item.purchaseRate}
                                                    </span>
                                                    <span className="text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-600 font-medium">
                                                        Net Pur: ₹{item.purchaseDiscountedPrice}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-right">
                                            <span className="text-sm font-medium text-slate-400 line-through decoration-slate-300">
                                                {item.purchaseRate}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <input
                                                type="number"
                                                value={item.mrp === 0 ? '' : item.mrp}
                                                onChange={(e) => updateItem(index, 'mrp', parseFloat(e.target.value) || 0)}
                                                className="w-20 p-1.5 text-sm text-right bg-slate-50 border border-transparent hover:border-slate-200 focus:border-brand-500 focus:bg-white rounded-lg outline-none transition-all font-medium text-slate-600"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="p-3 text-right">
                                            <input
                                                type="number"
                                                value={item.salePrice === 0 ? '' : item.salePrice}
                                                onChange={(e) => updateItem(index, 'salePrice', parseFloat(e.target.value) || 0)}
                                                className={`w-20 p-1.5 text-sm text-right bg-brand-50/50 border border-transparent hover:border-brand-200 focus:border-brand-500 focus:bg-white rounded-lg outline-none transition-all font-bold text-slate-900 ${errors[`price_${index}`] ? 'border-red-300 bg-red-50' : ''}`}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <input
                                                type="number"
                                                value={item.quantity === 0 ? '' : item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                className={`w-14 p-1.5 text-sm text-center bg-slate-50 border border-transparent hover:border-slate-200 focus:border-brand-500 focus:bg-white rounded-lg outline-none transition-all font-bold text-slate-900 ${errors[`qty_${index}`] ? 'border-red-300 bg-red-50' : ''}`}
                                                placeholder="1"
                                            />
                                        </td>
                                        <td className="p-3 text-right">
                                            <input
                                                type="number"
                                                value={item.discount === 0 ? '' : item.discount}
                                                onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                                className={`w-20 p-1.5 text-sm text-right bg-green-50/50 border border-transparent hover:border-green-200 focus:border-green-500 focus:bg-white rounded-lg outline-none transition-all font-bold text-slate-900 ${errors[`disc_${index}`] ? 'border-red-300 bg-red-50' : ''}`}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="p-3 text-right">
                                            <p className="font-bold text-slate-900">₹{item.lineTotal.toLocaleString()}</p>
                                        </td>
                                        <td className="p-3 text-center last:rounded-r-xl">
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100 opacity-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 shrink-0">
                    <div className="w-full sm:w-auto">
                        {error && (
                            <p className="text-xs font-bold text-red-500 flex items-center gap-1.5 justify-center sm:justify-start">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Failed to save invoice
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isEditMode ? 'Update Invoice' : 'Save Invoice'}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InvoiceModal;
