import React from 'react';
import { Trash2 } from 'lucide-react';
import { Product, DiscountType, InvoiceItem } from '../../types/inventory';
import { useUserRole } from '../../hooks/useUserRole';

// Define Interface locally or import if exported (assuming inline definition in parent previously)
interface InvoiceItemForm extends Omit<InvoiceItem, 'id' | 'invoiceId' | 'createdAt'> {
    mrp: number | '';
    salePrice: number | '';
    discount: number | '';
    quantity: number | '';
    purchaseRate: number | '';
    purchaseDiscountPercent: number | '';
    purchaseDiscountedPrice: number | '';
    saleDiscountPercent: number | '';
    saleDiscountAmount: number | '';
}

interface InvoiceItemsTableProps {
    items: InvoiceItemForm[];
    updateItem: (index: number, field: keyof InvoiceItemForm, value: string | number) => void;
    removeItem: (index: number) => void;
    errors: Record<string, string>;
    itemDiscountTypes: Record<number, string>;
    handleDiscountTypeChange: (index: number, discountTypeId: string) => void;
    discountTypes: DiscountType[];
    allProducts: Product[];
}

const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({
    items,
    updateItem,
    removeItem,
    errors,
    itemDiscountTypes,
    handleDiscountTypeChange,
    discountTypes,
    allProducts,
}) => {
    const { currentRole, user } = useUserRole();

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                        <tr>
                            <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 pl-2">Product</th>
                            <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 w-20">Rate</th>
                            <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 w-24">MRP</th>
                            <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 w-32">Discount Type</th>
                            <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 w-24">Sale Price</th>
                            <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 w-20">Qty</th>
                            <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 w-24">Disc</th>
                            <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 w-28">Total</th>
                            <th className="w-10 pb-3"></th>
                        </tr>
                    </thead>
                    <tbody className="space-y-2">
                        {items.map((item, index) => {
                            const product = allProducts.find(p => p.id === item.productId);
                            const canViewPurchaseInfo = currentRole === 'admin' || (user?.id && product?.createdBy === user.id);

                            return (
                                <tr key={`${item.productId}-${index}`} className="group bg-white hover:bg-slate-50 border border-slate-100 rounded-xl shadow-sm transition-all">
                                    <td className="p-3 first:rounded-l-xl">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm truncate max-w-[200px]">{item.productName}</p>
                                            <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{item.brandName} • {item.modelNumber}</p>

                                            {canViewPurchaseInfo && (
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                                        Pur: ₹{item.purchaseRate}
                                                    </span>
                                                    <span className="text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-600 font-medium">
                                                        Net Pur: ₹{item.purchaseDiscountedPrice}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">
                                        {canViewPurchaseInfo ? (
                                            <span className="text-sm font-medium text-slate-400 line-through decoration-slate-300">
                                                {item.purchaseRate}
                                            </span>
                                        ) : (
                                            <span className="text-sm font-medium text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        <input
                                            type="number"
                                            value={item.mrp}
                                            onChange={(e) => updateItem(index, 'mrp', e.target.value)}
                                            className="w-20 p-1.5 text-sm text-right bg-slate-50 border border-transparent hover:border-slate-200 focus:border-brand-500 focus:bg-white rounded-lg outline-none transition-all font-medium text-slate-600"
                                            placeholder="0"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <select
                                            value={itemDiscountTypes[index] || ''}
                                            onChange={(e) => handleDiscountTypeChange(index, e.target.value)}
                                            className="w-full p-1.5 text-xs bg-white border border-slate-200 hover:border-brand-300 focus:border-brand-500 rounded-lg outline-none transition-all font-medium text-slate-700"
                                        >
                                            <option value="">Manual</option>
                                            {discountTypes.map(dt => {
                                                const product = allProducts.find(p => p.id === item.productId);
                                                const pct = product?.salesDiscounts?.[dt.id];
                                                return (
                                                    <option key={dt.id} value={dt.id}>
                                                        {dt.name}{pct !== undefined ? ` (${pct}%)` : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </td>
                                    <td className="p-3 text-right">
                                        <input
                                            type="number"
                                            value={item.salePrice}
                                            onChange={(e) => updateItem(index, 'salePrice', e.target.value)}
                                            className={`w-20 p-1.5 text-sm text-right bg-brand-50/50 border border-transparent hover:border-brand-200 focus:border-brand-500 focus:bg-white rounded-lg outline-none transition-all font-bold text-slate-900 ${errors[`price_${index}`] ? 'border-red-300 bg-red-50' : ''}`}
                                            placeholder="0"
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            className={`w-14 p-1.5 text-sm text-center bg-slate-50 border border-transparent hover:border-slate-200 focus:border-brand-500 focus:bg-white rounded-lg outline-none transition-all font-bold text-slate-900 ${errors[`qty_${index}`] ? 'border-red-300 bg-red-50' : ''}`}
                                            placeholder="1"
                                        />
                                    </td>
                                    <td className="p-3 text-right">
                                        <input
                                            type="number"
                                            value={item.discount}
                                            onChange={(e) => updateItem(index, 'discount', e.target.value)}
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
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoiceItemsTable;
