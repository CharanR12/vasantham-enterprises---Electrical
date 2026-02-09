import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Check, Search } from 'lucide-react';
import { useProductsQuery, useBrandsQuery, useCategoriesQuery } from '../hooks/queries/useInventoryQueries';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import { Input } from '@/components/ui/input';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const BulkEditPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: products = [], isLoading: productsLoading } = useProductsQuery();
    const { data: brands = [], isLoading: brandsLoading } = useBrandsQuery();
    const { data: categories = [], isLoading: categoriesLoading } = useCategoriesQuery();

    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [newDiscountStr, setNewDiscountStr] = useState<string>('');
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
    const [isUpdating, setIsUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const brandOptions = brands.map(b => ({ value: b.id, label: b.name }));

    const categoryOptions = useMemo(() => {
        if (selectedBrands.length > 0) {
            return categories
                .filter(c => selectedBrands.includes(c.brandId))
                .map(c => ({ value: c.id, label: c.name }));
        }
        return categories.map(c => ({ value: c.id, label: c.name }));
    }, [categories, selectedBrands]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brandId);
            const matchesCategory = selectedCategories.length === 0 || (product.categoryId && selectedCategories.includes(product.categoryId));
            const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.modelNumber.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesBrand && matchesCategory && matchesSearch;
        });
    }, [products, selectedBrands, selectedCategories, searchTerm]);

    // Handle "Select All" based on CURRENTLY filtered products
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(filteredProducts.map(p => p.id));
            setSelectedProductIds(allIds);
        } else {
            setSelectedProductIds(new Set());
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        const next = new Set(selectedProductIds);
        if (checked) next.add(id);
        else next.delete(id);
        setSelectedProductIds(next);
    };

    const newDiscount = parseFloat(newDiscountStr);
    const isValidDiscount = !isNaN(newDiscount) && newDiscount >= 0 && newDiscount <= 100;

    const handleUpdate = async () => {
        if (!isValidDiscount) {
            toast.error('Please enter a valid discount percentage (0-100)');
            return;
        }

        if (selectedProductIds.size === 0) {
            toast.error('Please select at least one product to update');
            return;
        }

        if (!window.confirm(`Are you sure you want to update ${selectedProductIds.size} products with a ${newDiscount}% discount?`)) {
            return;
        }

        setIsUpdating(true);
        try {
            const updates = Array.from(selectedProductIds).map(id => {
                const product = products.find(p => p.id === id);
                if (!product) return null;

                const purchaseDiscountedPrice = product.mrp - (product.mrp * newDiscount / 100);

                return supabase
                    .from('products')
                    .update({
                        purchase_discount_percent: newDiscount,
                        purchase_discounted_price: purchaseDiscountedPrice
                    })
                    .eq('id', id);
            }).filter(Boolean);

            await Promise.all(updates);

            // Invalidate queries to refresh data
            await queryClient.invalidateQueries({ queryKey: ['products'] });

            toast.success(`Successfully updated ${selectedProductIds.size} products`);
            navigate('/inventory');
        } catch (error) {
            console.error('Error updating products:', error);
            toast.error('Failed to update products');
        } finally {
            setIsUpdating(false);
        }
    };

    const isAllSelected = filteredProducts.length > 0 && selectedProductIds.size === filteredProducts.length;

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 animate-fadeIn">
                <button
                    onClick={() => navigate('/inventory')}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 text-slate-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Edit Inventory</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Update Purchase Discounts</p>
                </div>
            </div>

            {/* Controls & Filters */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 shadow-sm transition-all duration-300 animate-fadeIn">
                <div className="flex flex-col gap-4">

                    {/* Filters Row */}
                    <div className="flex flex-wrap gap-3 items-start">
                        <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500"
                            />
                        </div>

                        <MultiSelectCombobox
                            options={brandOptions}
                            selectedValues={selectedBrands}
                            onChange={setSelectedBrands}
                            placeholder="Filter Brands"
                            searchPlaceholder="Search brands..."
                            className="w-full sm:w-64"
                        />

                        <MultiSelectCombobox
                            options={categoryOptions}
                            selectedValues={selectedCategories}
                            onChange={setSelectedCategories}
                            placeholder="Filter Categories"
                            searchPlaceholder="Search categories..."
                            className="w-full sm:w-64"
                            disabled={categories.length === 0}
                        />
                    </div>

                    <div className="h-px bg-slate-200/60 my-2" />

                    {/* Update Action Row */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 justify-between bg-brand-50/50 p-4 rounded-xl border border-brand-100/50">
                        <div className="w-full sm:w-auto flex-1">
                            <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                                New Purchase Discount (%)
                            </label>
                            <div className="flex gap-4 items-center">
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                    value={newDiscountStr}
                                    onChange={(e) => setNewDiscountStr(e.target.value)}
                                    className="h-11 w-32 bg-white border-brand-200 focus-visible:ring-brand-500/20 focus-visible:border-brand-500 font-bold text-lg text-brand-900"
                                />
                                <div className="text-xs text-brand-600 font-medium max-w-md">
                                    <p>Enter a new discount percentage to apply to selected products.</p>
                                    <p className="opacity-80">This will recalculate the Purchase Price based on MRP.</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleUpdate}
                            disabled={!isValidDiscount || selectedProductIds.size === 0 || isUpdating}
                            className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none min-w-[160px] justify-center"
                        >
                            {isUpdating ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check className="h-5 w-5" />
                                    <span>Update {selectedProductIds.size > 0 ? `(${selectedProductIds.size})` : ''}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn [animation-delay:100ms]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                                    />
                                </th>
                                <th className="px-4 py-4 font-bold text-slate-700">Brand & Category</th>
                                <th className="px-4 py-4 font-bold text-slate-700">Product Info</th>
                                <th className="px-4 py-4 font-bold text-slate-700 text-right">MRP</th>
                                <th className="px-4 py-4 font-bold text-slate-700 text-right">Current Disc.</th>
                                <th className="px-4 py-4 font-bold text-slate-700 text-right">Current Price</th>
                                <th className="px-4 py-4 font-bold text-brand-700 bg-brand-50/50 text-right border-l border-brand-100">New Disc.</th>
                                <th className="px-4 py-4 font-bold text-brand-700 bg-brand-50/50 text-right">New Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {productsLoading ? (
                                <tr><td colSpan={8} className="p-8 text-center text-slate-500">Loading products...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={8} className="p-8 text-center text-slate-500">No products found matching filters.</td></tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const isSelected = selectedProductIds.has(product.id);
                                    const newPrice = isValidDiscount
                                        ? product.mrp - (product.mrp * newDiscount / 100)
                                        : null;

                                    return (
                                        <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-brand-50/10' : ''}`}>
                                            <td className="px-4 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                                                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-slate-900">{product.brand.name}</div>
                                                <div className="text-xs text-slate-500">{categories.find(c => c.id === product.categoryId)?.name || '-'}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-slate-900">{product.productName}</div>
                                                <div className="text-xs text-slate-500">{product.modelNumber}</div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-medium text-slate-700">
                                                ₹{product.mrp.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-right text-slate-600">
                                                {product.purchaseDiscountPercent}%
                                            </td>
                                            <td className="px-4 py-4 text-right text-slate-600">
                                                ₹{product.purchaseDiscountedPrice.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-right font-bold text-brand-600 bg-brand-50/30 border-l border-brand-100/50">
                                                {isValidDiscount ? `${newDiscount}%` : '-'}
                                            </td>
                                            <td className="px-4 py-4 text-right font-bold text-brand-600 bg-brand-50/30">
                                                {newPrice !== null ? `₹${newPrice.toFixed(2)}` : '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sticky Bottom Bar Summary if needed, or just rely on top button */}
        </div>
    );
};

export default BulkEditPage;
