import React from 'react';
import { Plus, Users, Edit2, Save, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../LoadingSpinner';

interface SalesForceManagementProps {
    salesPersons: { id: string; name: string }[];
    loading: boolean;
    actionLoading: string | null;
    newSalesPersonName: string;
    setNewSalesPersonName: (name: string) => void;
    editingSalesPersonId: string | null;
    editSalesPersonName: string;
    setEditSalesPersonName: (name: string) => void;
    handleAddSalesPerson: () => void;
    handleEditSalesPerson: (id: string, name: string) => void;
    handleSaveSalesPerson: (id: string) => void;
    handleRemoveSalesPerson: (id: string) => void;
    handleCancel: () => void;
}

export const SalesForceManagement: React.FC<SalesForceManagementProps> = ({
    salesPersons,
    loading,
    actionLoading,
    newSalesPersonName,
    setNewSalesPersonName,
    editingSalesPersonId,
    editSalesPersonName,
    setEditSalesPersonName,
    handleAddSalesPerson,
    handleEditSalesPerson,
    handleSaveSalesPerson,
    handleRemoveSalesPerson,
    handleCancel
}) => {
    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sales Force</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Configure team members and manage representative profiles.</p>
            </div>

            {/* Add New Sales Person */}
            <Card className="mb-10 bg-slate-50/50 border-slate-100/50 shadow-none rounded-3xl overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Onboard Representative</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Input
                            id="new-rep"
                            type="text"
                            value={newSalesPersonName}
                            onChange={(e) => setNewSalesPersonName(e.target.value)}
                            placeholder="Enter full name of representative"
                            className="h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 flex-1"
                            disabled={actionLoading === 'add-sales-person'}
                        />
                        <Button
                            onClick={handleAddSalesPerson}
                            className="h-12 px-8 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-brand-500/20 active:scale-95 shrink-0"
                            disabled={actionLoading === 'add-sales-person' || !newSalesPersonName.trim()}
                        >
                            {actionLoading === 'add-sales-person' ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                            ) : (
                                <Plus className="h-5 w-5 mr-2" />
                            )}
                            <span>Add Member</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Sales Persons List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Fetching records...</p>
                </div>
            ) : salesPersons.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                    <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No sales representatives currently active.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {salesPersons.map((person) => (
                        <div key={person.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-brand-200 transition-all duration-300 group">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 mr-4">
                                    {editingSalesPersonId === person.id ? (
                                        <Input
                                            type="text"
                                            value={editSalesPersonName}
                                            onChange={(e) => setEditSalesPersonName(e.target.value)}
                                            className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 w-full"
                                            disabled={actionLoading === person.id}
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4 border border-indigo-100 transition-colors group-hover:bg-brand-50 group-hover:border-brand-100">
                                                <Users className="h-4 w-4 text-brand-600" />
                                            </div>
                                            <div className="text-sm font-bold text-slate-800 tracking-tight">{person.name}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {editingSalesPersonId === person.id ? (
                                        <>
                                            <button
                                                onClick={() => handleSaveSalesPerson(person.id)}
                                                className="text-emerald-600 hover:bg-emerald-50 p-2.5 rounded-xl transition-all duration-200"
                                                title="Save"
                                                disabled={actionLoading === person.id || !editSalesPersonName.trim()}
                                            >
                                                {actionLoading === person.id ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-all duration-200"
                                                title="Cancel"
                                                disabled={actionLoading === person.id}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEditSalesPerson(person.id, person.name)}
                                                className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 p-2.5 rounded-xl transition-all duration-200"
                                                title="Edit profile"
                                                disabled={actionLoading !== null}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveSalesPerson(person.id)}
                                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-all duration-200"
                                                title="Remove"
                                                disabled={actionLoading !== null}
                                            >
                                                {actionLoading === person.id ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
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
