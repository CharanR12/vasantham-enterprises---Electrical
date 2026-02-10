import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Tag, Search } from 'lucide-react';
import { DiscountType } from '../../types/inventory';
import LoadingSpinner from '../LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DiscountTypeManagementProps {
    discountTypes: DiscountType[];
    loading: boolean;
    actionLoading: string | null;
    newDiscountTypeName: string;
    setNewDiscountTypeName: (value: string) => void;
    editingDiscountTypeId: string | null;
    editDiscountTypeName: string;
    setEditDiscountTypeName: (value: string) => void;
    handleAddDiscountType: () => void;
    handleEditDiscountType: (id: string, name: string) => void;
    handleSaveDiscountType: () => void;
    handleRemoveDiscountType: (id: string) => void;
    handleCancel: () => void;
}

export const DiscountTypeManagement: React.FC<DiscountTypeManagementProps> = ({
    discountTypes,
    loading,
    actionLoading,
    newDiscountTypeName,
    setNewDiscountTypeName,
    editingDiscountTypeId,
    editDiscountTypeName,
    setEditDiscountTypeName,
    handleAddDiscountType,
    handleEditDiscountType,
    handleSaveDiscountType,
    handleRemoveDiscountType,
    handleCancel
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredDiscountTypes = discountTypes.filter(dt =>
        dt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Discount Types</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Manage sales discount presets (e.g., Wholesale, Retail).</p>
            </div>

            {/* Add New Discount Type */}
            <Card className="mb-10 bg-slate-50/50 border-slate-100/50 shadow-none rounded-3xl overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Add New Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Input
                            type="text"
                            value={newDiscountTypeName}
                            onChange={(e) => setNewDiscountTypeName(e.target.value)}
                            placeholder="e.g. Seasonal Sale, Clearance"
                            className="h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 flex-1"
                            disabled={actionLoading === 'add-discount-type'}
                        />
                        <Button
                            onClick={handleAddDiscountType}
                            className="h-12 px-8 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-brand-500/20 active:scale-95 shrink-0"
                            disabled={actionLoading === 'add-discount-type' || !newDiscountTypeName.trim()}
                        >
                            {actionLoading === 'add-discount-type' ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                            ) : (
                                <Plus className="h-5 w-5 mr-2" />
                            )}
                            <span>Add Type</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Discount Types List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Fetching records...</p>
                </div>
            ) : discountTypes.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                    <Tag className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No discount types defined yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Search */}
                    {discountTypes.length > 3 && (
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search discount types..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 pl-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500"
                            />
                        </div>
                    )}

                    {filteredDiscountTypes.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                            <Search className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium text-sm">No discount types match "{searchTerm}"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredDiscountTypes.map((dt) => (
                                <div key={dt.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-brand-200 transition-all duration-300 group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 mr-4">
                                            {editingDiscountTypeId === dt.id ? (
                                                <Input
                                                    type="text"
                                                    value={editDiscountTypeName}
                                                    onChange={(e) => setEditDiscountTypeName(e.target.value)}
                                                    className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 w-full"
                                                    disabled={actionLoading === dt.id}
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mr-4 border border-emerald-100 transition-colors group-hover:bg-brand-50 group-hover:border-brand-100">
                                                        <Tag className="h-4 w-4 text-emerald-600 group-hover:text-brand-600" />
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-800 tracking-tight">{dt.name}</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {editingDiscountTypeId === dt.id ? (
                                                <>
                                                    <button
                                                        onClick={handleSaveDiscountType}
                                                        className="text-emerald-600 hover:bg-emerald-50 p-2.5 rounded-xl transition-all duration-200"
                                                        title="Save"
                                                        disabled={actionLoading === dt.id || !editDiscountTypeName.trim()}
                                                    >
                                                        {actionLoading === dt.id ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-all duration-200"
                                                        title="Cancel"
                                                        disabled={actionLoading === dt.id}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEditDiscountType(dt.id, dt.name)}
                                                        className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 p-2.5 rounded-xl transition-all duration-200"
                                                        title="Edit type"
                                                        disabled={actionLoading !== null}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveDiscountType(dt.id)}
                                                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-all duration-200"
                                                        title="Remove"
                                                        disabled={actionLoading !== null}
                                                    >
                                                        {actionLoading === dt.id ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
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
            )}
        </div>
    );
};
