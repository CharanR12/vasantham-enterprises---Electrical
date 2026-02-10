import React, { useState } from 'react';
import { Plus, Package, Edit2, Save, X, Trash2, ChevronDown, ChevronUp, Tag, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../LoadingSpinner';
import { Category } from '@/types/inventory';

interface BrandManagementProps {
    brands: { id: string; name: string }[];
    categories: Category[];
    loading: boolean;
    actionLoading: string | null;
    newBrandName: string;
    setNewBrandName: (name: string) => void;
    editingBrandId: string | null;
    editBrandName: string;
    setEditBrandName: (name: string) => void;
    handleAddBrand: () => void;
    handleEditBrand: (id: string, name: string) => void;
    handleSaveBrand: (id: string) => void;
    handleRemoveBrand: (id: string) => void;

    // Category props
    expandedBrandId: string | null;
    newCategoryName: string;
    setNewCategoryName: (name: string) => void;
    editingCategoryId: string | null;
    editCategoryName: string;
    setEditCategoryName: (name: string) => void;
    handleToggleBrandExpand: (brandId: string) => void;
    handleAddCategory: (brandId: string) => void;
    handleEditCategory: (id: string, name: string) => void;
    handleSaveCategory: (id: string) => void;
    handleRemoveCategory: (id: string) => void;

    handleCancel: () => void;
}

export const BrandManagement: React.FC<BrandManagementProps> = ({
    brands,
    categories,
    loading,
    actionLoading,
    newBrandName,
    setNewBrandName,
    editingBrandId,
    editBrandName,
    setEditBrandName,
    handleAddBrand,
    handleEditBrand,
    handleSaveBrand,
    handleRemoveBrand,

    expandedBrandId,
    newCategoryName,
    setNewCategoryName,
    editingCategoryId,
    editCategoryName,
    setEditCategoryName,
    handleToggleBrandExpand,
    handleAddCategory,
    handleEditCategory,
    handleSaveCategory,
    handleRemoveCategory,

    handleCancel
}) => {
    const [brandSearch, setBrandSearch] = useState('');
    const filteredBrands = brands.filter(b =>
        b.name.toLowerCase().includes(brandSearch.toLowerCase())
    );

    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Brands</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Manage product manufacturers and their categories.</p>
            </div>

            {/* Add New Brand */}
            <Card className="mb-10 bg-slate-50/50 border-slate-100/50 shadow-none rounded-3xl overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Register New Brand</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Input
                            id="new-brand"
                            type="text"
                            value={newBrandName}
                            onChange={(e) => setNewBrandName(e.target.value)}
                            placeholder="e.g. Havells, Polycab, Finolex"
                            className="h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 flex-1"
                            disabled={actionLoading === 'add-brand'}
                        />
                        <Button
                            onClick={handleAddBrand}
                            className="h-12 px-8 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-brand-500/20 active:scale-95 shrink-0"
                            disabled={actionLoading === 'add-brand' || !newBrandName.trim()}
                        >
                            {actionLoading === 'add-brand' ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                            ) : (
                                <Plus className="h-5 w-5 mr-2" />
                            )}
                            <span>Add Brand</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Brands List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Fetching records...</p>
                </div>
            ) : brands.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                    <Package className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No brand entries found in the system.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Brand Search */}
                    {brands.length > 3 && (
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search brands..."
                                value={brandSearch}
                                onChange={(e) => setBrandSearch(e.target.value)}
                                className="h-11 pl-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500"
                            />
                        </div>
                    )}

                    {filteredBrands.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                            <Search className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium text-sm">No brands match "{brandSearch}"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredBrands.map((brand) => {
                                const brandCategories = categories.filter(c => c.brandId === brand.id);
                                const isExpanded = expandedBrandId === brand.id;

                                return (
                                    <div key={brand.id} className={`bg-white rounded-2xl border transition-all duration-300 ${isExpanded ? 'border-brand-200 shadow-md ring-1 ring-brand-100' : 'border-slate-100 shadow-sm hover:border-brand-200'}`}>
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex-1 mr-4 flex items-center">
                                                <button
                                                    onClick={() => handleToggleBrandExpand(brand.id)}
                                                    className="mr-3 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                                                >
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </button>

                                                {editingBrandId === brand.id ? (
                                                    <Input
                                                        type="text"
                                                        value={editBrandName}
                                                        onChange={(e) => setEditBrandName(e.target.value)}
                                                        className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 w-full max-w-md"
                                                        disabled={actionLoading === brand.id}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div onClick={() => handleToggleBrandExpand(brand.id)} className="flex items-center cursor-pointer flex-1">
                                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mr-4 border border-slate-100 transition-colors group-hover:bg-brand-50 group-hover:border-brand-100">
                                                            <span className="text-brand-600 font-black text-xs uppercase">{brand.name.substring(0, 2)}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div className="text-sm font-bold text-slate-800 tracking-tight">{brand.name}</div>
                                                            <div className="text-xs text-slate-500 font-medium">{brandCategories.length} categories</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex space-x-1">
                                                {editingBrandId === brand.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveBrand(brand.id)}
                                                            className="text-emerald-600 hover:bg-emerald-50 p-2.5 rounded-xl transition-all duration-200"
                                                            title="Save changes"
                                                            disabled={actionLoading === brand.id || !editBrandName.trim()}
                                                        >
                                                            {actionLoading === brand.id ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
                                                        </button>
                                                        <button
                                                            onClick={handleCancel}
                                                            className="text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-all duration-200"
                                                            title="Discard"
                                                            disabled={actionLoading === brand.id}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditBrand(brand.id, brand.name)}
                                                            className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 p-2.5 rounded-xl transition-all duration-200"
                                                            title="Edit brand"
                                                            disabled={actionLoading !== null}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveBrand(brand.id)}
                                                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-all duration-200"
                                                            title="Delete"
                                                            disabled={actionLoading !== null}
                                                        >
                                                            {actionLoading === brand.id ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Categories Section */}
                                        {isExpanded && (
                                            <div className="px-4 pb-4 pl-[4.5rem]">
                                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50">
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                                                        <Tag className="h-3 w-3 mr-1.5" />
                                                        Categories
                                                    </div>

                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Input
                                                            placeholder="Add new category..."
                                                            value={newCategoryName}
                                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                                            className="h-9 text-sm bg-white border-slate-200 rounded-lg focus-visible:ring-brand-500/20 focus-visible:border-brand-500"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleAddCategory(brand.id);
                                                            }}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAddCategory(brand.id)}
                                                            disabled={!newCategoryName.trim() || actionLoading === 'add-category'}
                                                            className="h-9 px-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
                                                        >
                                                            {actionLoading === 'add-category' ? <LoadingSpinner size="sm" /> : <Plus className="h-4 w-4" />}
                                                        </Button>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {brandCategories.length === 0 ? (
                                                            <span className="text-xs text-slate-400 italic">No categories added yet.</span>
                                                        ) : (
                                                            brandCategories.map(cat => (
                                                                <div key={cat.id} className="group flex items-center bg-white border border-slate-200 rounded-lg hover:border-brand-300 hover:shadow-sm transition-all">
                                                                    {editingCategoryId === cat.id ? (
                                                                        <>
                                                                            <Input
                                                                                type="text"
                                                                                value={editCategoryName}
                                                                                onChange={(e) => setEditCategoryName(e.target.value)}
                                                                                className="h-8 text-sm bg-white border-0 rounded-lg focus-visible:ring-0 w-24 sm:w-32"
                                                                                autoFocus
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') handleSaveCategory(cat.id);
                                                                                    if (e.key === 'Escape') handleCancel();
                                                                                }}
                                                                            />
                                                                            <button
                                                                                onClick={() => handleSaveCategory(cat.id)}
                                                                                disabled={actionLoading === cat.id || !editCategoryName.trim()}
                                                                                className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-md transition-colors"
                                                                                title="Save"
                                                                            >
                                                                                {actionLoading === cat.id ? <LoadingSpinner size="sm" /> : <Save className="h-3 w-3" />}
                                                                            </button>
                                                                            <button
                                                                                onClick={handleCancel}
                                                                                className="text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-colors mr-1"
                                                                                title="Cancel"
                                                                            >
                                                                                <X className="h-3 w-3" />
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="text-sm font-medium text-slate-700 px-2.5 py-1.5">{cat.name}</span>
                                                                            <button
                                                                                onClick={() => handleEditCategory(cat.id, cat.name)}
                                                                                disabled={actionLoading !== null}
                                                                                className="text-slate-300 hover:text-brand-500 p-1 rounded-md hover:bg-brand-50 transition-colors opacity-0 group-hover:opacity-100"
                                                                                title="Edit category"
                                                                            >
                                                                                <Edit2 className="h-3 w-3" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleRemoveCategory(cat.id)}
                                                                                disabled={actionLoading !== null}
                                                                                className="text-slate-300 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 mr-1"
                                                                                title="Delete category"
                                                                            >
                                                                                <X className="h-3 w-3" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
