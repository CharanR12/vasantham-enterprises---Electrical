import React from 'react';
import { IndianRupee } from 'lucide-react';
import { Product } from '../../types/inventory';
import { useUserRole } from '../../hooks/useUserRole';
import { useDiscountTypesQuery } from '../../hooks/queries/useInventoryQueries';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface PriceDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product;
    onAddPricing: () => void;
}

const PriceDetailsDialog: React.FC<PriceDetailsDialogProps> = ({
    open,
    onOpenChange,
    product,
    onAddPricing,
}) => {
    const { currentRole, user } = useUserRole();
    const { data: discountTypes = [] } = useDiscountTypesQuery();

    const formatPrice = (value: number): string => {
        return value > 0 ? `₹${value.toLocaleString()}` : '-';
    };

    const hasPriceData = product.mrp > 0 || product.purchaseDiscountedPrice > 0 || product.salePrice > 0;
    const canViewPurchaseInfo = currentRole === 'admin' || (user?.id && product.createdBy === user.id);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm rounded-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold flex items-center">
                        <IndianRupee className="h-5 w-5 mr-2 text-emerald-600" />
                        Price Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    <div className="text-center mb-4">
                        <h3 className="font-bold text-slate-900">{product.productName}</h3>
                        <p className="text-sm text-slate-500">{product.brand.name}</p>
                    </div>

                    {hasPriceData ? (
                        <div className="space-y-3">
                            {/* 1. MRP Section */}
                            <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center">
                                <span className="text-slate-600 text-sm font-medium">MRP</span>
                                <span className="font-bold text-slate-900">{formatPrice(product.mrp)}</span>
                            </div>

                            {/* 2. Purchase Info Section */}
                            {canViewPurchaseInfo && (
                                <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
                                    <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest border-b border-blue-200 pb-2">Purchase Info</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 text-sm">Rate</span>
                                        <span className="font-bold text-slate-900">{formatPrice(product.mrp)}</span>
                                    </div>
                                    {product.purchaseDiscountPercent > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600 text-sm">Discount ({product.purchaseDiscountPercent}%)</span>
                                            <span className="font-bold text-emerald-600">
                                                -{formatPrice((product.mrp * product.purchaseDiscountPercent) / 100)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2 border-t border-blue-200/50">
                                        <span className="text-blue-700 text-sm font-bold">Net Purchase</span>
                                        <span className="font-bold text-lg text-blue-700">{formatPrice(product.purchaseDiscountedPrice)}</span>
                                    </div>
                                </div>
                            )}

                            {/* 3. Sales Info Section */}
                            <div className="bg-emerald-50 rounded-xl p-4 space-y-3 border border-emerald-100">
                                <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-200 pb-2">Sales Info</h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 text-sm">Rate</span>
                                    <span className="font-bold text-slate-900">{formatPrice(product.mrp)}</span>
                                </div>
                                {product.saleDiscountPercent > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 text-sm">Discount ({product.saleDiscountPercent}%)</span>
                                        <span className="font-bold text-emerald-600">
                                            -{formatPrice((product.mrp * product.saleDiscountPercent) / 100)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-emerald-200/50">
                                    <span className="text-emerald-700 text-sm font-bold">Net Sale</span>
                                    <span className="font-bold text-lg text-emerald-700">{formatPrice(product.salePrice)}</span>
                                </div>
                            </div>

                            {/* 4. Additional Discounts Section */}
                            {((product.saleDiscountAmount || 0) > 0 || (product.salesDiscounts && Object.keys(product.salesDiscounts).length > 0)) && (
                                <div className="bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-100">
                                    <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest border-b border-amber-200 pb-2">Additional Discounts</h4>

                                    {(product.saleDiscountAmount || 0) > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-amber-700 text-sm">Flat Discount</span>
                                            <span className="font-bold text-amber-700">-{formatPrice(product.saleDiscountAmount || 0)}</span>
                                        </div>
                                    )}

                                    {product.salesDiscounts && Object.entries(product.salesDiscounts).map(([typeId, percent]) => {
                                        const discountName = discountTypes.find(dt => dt.id === typeId)?.name || 'Extra';
                                        return (
                                            <div key={typeId} className="flex justify-between items-center">
                                                <span className="text-amber-700 text-sm">{discountName} ({percent}%)</span>
                                                <span className="font-bold text-amber-700">
                                                    -{formatPrice((product.salePrice * percent) / 100)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <IndianRupee className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm">No pricing details available.</p>
                            <button
                                onClick={onAddPricing}
                                className="mt-3 text-brand-600 font-bold text-sm hover:underline"
                            >
                                Add pricing info
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PriceDetailsDialog;
