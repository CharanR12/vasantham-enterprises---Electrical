import React, { useState } from 'react';
import { Plus, Share2, Edit2, Save, X, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../LoadingSpinner';

interface ReferralSourceManagementProps {
    referralSources: { id: string; name: string }[];
    loading: boolean;
    actionLoading: string | null;
    newReferralSourceName: string;
    setNewReferralSourceName: (name: string) => void;
    editingReferralSourceId: string | null;
    editReferralSourceName: string;
    setEditReferralSourceName: (name: string) => void;
    handleAddReferralSource: () => void;
    handleEditReferralSource: (id: string, name: string) => void;
    handleSaveReferralSource: (id: string) => void;
    handleRemoveReferralSource: (id: string) => void;
    handleCancel: () => void;
}

export const ReferralSourceManagement: React.FC<ReferralSourceManagementProps> = ({
    referralSources,
    loading,
    actionLoading,
    newReferralSourceName,
    setNewReferralSourceName,
    editingReferralSourceId,
    editReferralSourceName,
    setEditReferralSourceName,
    handleAddReferralSource,
    handleEditReferralSource,
    handleSaveReferralSource,
    handleRemoveReferralSource,
    handleCancel
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredSources = referralSources.filter(source =>
        source.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Referral Sources</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Manage channels and sources for customer inquiries.</p>
            </div>

            {/* Add New Referral Source */}
            <Card className="mb-10 bg-slate-50/50 border-slate-100/50 shadow-none rounded-3xl overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Add New Source</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Input
                            id="new-source"
                            type="text"
                            value={newReferralSourceName}
                            onChange={(e) => setNewReferralSourceName(e.target.value)}
                            placeholder="Enter referral source name (e.g., Facebook Ads)"
                            className="h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 flex-1"
                            disabled={actionLoading === 'add-referral-source'}
                        />
                        <Button
                            onClick={handleAddReferralSource}
                            className="h-12 px-8 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-brand-500/20 active:scale-95 shrink-0"
                            disabled={actionLoading === 'add-referral-source' || !newReferralSourceName.trim()}
                        >
                            {actionLoading === 'add-referral-source' ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                            ) : (
                                <Plus className="h-5 w-5 mr-2" />
                            )}
                            <span>Add Source</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Referral Sources List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Fetching records...</p>
                </div>
            ) : referralSources.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                    <Share2 className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No referral sources defined.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Search */}
                    {referralSources.length > 3 && (
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search referral sources..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 pl-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500"
                            />
                        </div>
                    )}

                    {filteredSources.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                            <Search className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium text-sm">No sources match "{searchTerm}"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredSources.map((source) => (
                                <div key={source.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-brand-200 transition-all duration-300 group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 mr-4">
                                            {editingReferralSourceId === source.id ? (
                                                <Input
                                                    type="text"
                                                    value={editReferralSourceName}
                                                    onChange={(e) => setEditReferralSourceName(e.target.value)}
                                                    className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 w-full"
                                                    disabled={actionLoading === source.id}
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4 border border-indigo-100 transition-colors group-hover:bg-brand-50 group-hover:border-brand-100">
                                                        <Share2 className="h-4 w-4 text-brand-600" />
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-800 tracking-tight">{source.name}</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {editingReferralSourceId === source.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSaveReferralSource(source.id)}
                                                        className="text-emerald-600 hover:bg-emerald-50 p-2.5 rounded-xl transition-all duration-200"
                                                        title="Save"
                                                        disabled={actionLoading === source.id || !editReferralSourceName.trim()}
                                                    >
                                                        {actionLoading === source.id ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-all duration-200"
                                                        title="Cancel"
                                                        disabled={actionLoading === source.id}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEditReferralSource(source.id, source.name)}
                                                        className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 p-2.5 rounded-xl transition-all duration-200"
                                                        title="Edit source"
                                                        disabled={actionLoading !== null}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveReferralSource(source.id)}
                                                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-all duration-200"
                                                        title="Remove"
                                                        disabled={actionLoading !== null}
                                                    >
                                                        {actionLoading === source.id ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
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
