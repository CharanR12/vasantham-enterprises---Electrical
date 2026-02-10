import React from 'react';
import { Plus, Edit2, Trash2, Check, X, Tag } from 'lucide-react';
import { DiscountType } from '../../types/inventory';
import LoadingSpinner from '../LoadingSpinner';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

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
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Discount Types</h2>
                    <p className="text-sm text-slate-500">Manage sales discount presets (e.g., Wholesale, Retail)</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Input
                        placeholder="New Discount Type Name"
                        value={newDiscountTypeName}
                        onChange={(e) => setNewDiscountTypeName(e.target.value)}
                        className="h-10 bg-white"
                    />
                    <Button
                        onClick={handleAddDiscountType}
                        disabled={!!actionLoading || !newDiscountTypeName.trim()}
                        className="bg-brand-600 text-white hover:bg-brand-700 h-10 px-4"
                    >
                        {actionLoading ? <LoadingSpinner size="sm" /> : <Plus className="h-4 w-4" />}
                        <span className="ml-2 hidden sm:inline">Add</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                    ))
                ) : discountTypes.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No discount types defined yet.</p>
                    </div>
                ) : (
                    discountTypes.map((dt) => (
                        <div
                            key={dt.id}
                            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center"
                        >
                            {editingDiscountTypeId === dt.id ? (
                                <div className="flex-1 flex items-center gap-2">
                                    <Input
                                        value={editDiscountTypeName}
                                        onChange={(e) => setEditDiscountTypeName(e.target.value)}
                                        className="h-9 text-sm"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveDiscountType}
                                        disabled={!!actionLoading}
                                        className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={!!actionLoading}
                                        className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                                            <Tag className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-slate-700">{dt.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditDiscountType(dt.id, dt.name)}
                                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveDiscountType(dt.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
