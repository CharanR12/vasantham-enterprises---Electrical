import React from 'react';
import { Plus, Package, Edit2, Save, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../LoadingSpinner';

interface BrandManagementProps {
    brands: { id: string; name: string }[];
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
    handleCancel: () => void;
}

export const BrandManagement: React.FC<BrandManagementProps> = ({
    brands,
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
    handleCancel
}) => {
    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Brands</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Manage product manufacturers and categorization labels.</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {brands.map((brand) => (
                        <div key={brand.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-brand-200 transition-all duration-300 group">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 mr-4">
                                    {editingBrandId === brand.id ? (
                                        <Input
                                            type="text"
                                            value={editBrandName}
                                            onChange={(e) => setEditBrandName(e.target.value)}
                                            className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 w-full"
                                            disabled={actionLoading === brand.id}
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mr-4 border border-slate-100 transition-colors group-hover:bg-brand-50 group-hover:border-brand-100">
                                                <span className="text-brand-600 font-black text-xs uppercase">{brand.name.substring(0, 2)}</span>
                                            </div>
                                            <div className="text-sm font-bold text-slate-800 tracking-tight">{brand.name}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
