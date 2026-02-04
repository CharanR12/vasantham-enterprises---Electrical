import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useCustomers } from '../context/CustomerContext';
import { SalesPerson } from '../types';
import { Edit2, Save, X, ArrowLeft, Plus, Trash2, Package, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales'>('inventory');

  const {
    brands,
    products,
    salesEntries,
    loading: inventoryLoading,
    error: inventoryError,
    addBrand,
    updateBrand,
    deleteBrand
  } = useInventory();

  const {
    salesPersons,
    salesPersonsLoading,
    salesPersonsError,
    addSalesPerson,
    updateSalesPerson,
    removeSalesPerson
  } = useCustomers();

  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editBrandName, setEditBrandName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  const [editingSalesPersonId, setEditingSalesPersonId] = useState<string | null>(null);
  const [editSalesPersonName, setEditSalesPersonName] = useState('');
  const [newSalesPersonName, setNewSalesPersonName] = useState('');

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Update global inventory data for export
  useEffect(() => {
    // The 'any' type for window is acceptable here as we are extending the global Window object.
    (window as any).inventoryData = {
      products,
      brands,
      salesEntries
    };
  }, [products, brands, salesEntries]);

  // Brand handlers
  const handleEditBrand = (id: string, name: string) => {
    setEditingBrandId(id);
    setEditBrandName(name);
    setActionError(null);
  };

  const handleSaveBrand = async (id: string) => {
    if (!editBrandName.trim()) {
      setActionError('Brand name cannot be empty');
      return;
    }

    setActionLoading(id);
    setActionError(null);

    try {
      const success = await updateBrand(id, editBrandName.trim());
      if (success) {
        setEditingBrandId(null);
        setEditBrandName('');
      } else {
        setActionError('Failed to update brand');
      }
    } catch (err: any) { // Added 'any' type for catch error
      console.error('An unexpected error occurred while updating brand:', err);
      setActionError(err.message || 'An unexpected error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      setActionError('Brand name cannot be empty');
      return;
    }

    setActionLoading('add-brand');
    setActionError(null);

    try {
      const success = await addBrand(newBrandName.trim());
      if (success) {
        setNewBrandName('');
      } else {
        setActionError('Failed to add brand');
      }
    } catch (err: any) { // Added 'any' type for catch error
      console.error('An unexpected error occurred while adding brand:', err);
      setActionError(err.message || 'An unexpected error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveBrand = async (id: string) => {
    if (!confirm('Are you sure you want to remove this brand? This may affect associated products.')) return;

    setActionLoading(id);
    setActionError(null);

    try {
      const success = await deleteBrand(id);
      if (!success) {
        setActionError('Failed to remove brand. It may have associated products.');
      }
    } catch (err: any) { // Added 'any' type for catch error
      console.error('An unexpected error occurred while removing brand:', err);
      setActionError(err.message || 'An unexpected error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  // Sales person handlers
  const handleEditSalesPerson = (id: string, name: string) => {
    setEditingSalesPersonId(id);
    setEditSalesPersonName(name);
    setActionError(null);
  };

  const handleSaveSalesPerson = async (id: string) => {
    if (!editSalesPersonName.trim()) {
      setActionError('Sales person name cannot be empty');
      return;
    }

    setActionLoading(id);
    setActionError(null);

    try {
      const success = await updateSalesPerson(id, editSalesPersonName.trim());
      if (success) {
        setEditingSalesPersonId(null);
        setEditSalesPersonName('');
      } else {
        setActionError('Failed to update sales person');
      }
    } catch (err: any) {
      console.error('An unexpected error occurred while updating sales person:', err);
      setActionError(err.message || 'An unexpected error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddSalesPerson = async () => {
    if (!newSalesPersonName.trim()) {
      setActionError('Sales person name cannot be empty');
      return;
    }

    setActionLoading('add-sales-person');
    setActionError(null);

    try {
      const success = await addSalesPerson(newSalesPersonName.trim());
      if (success) {
        setNewSalesPersonName('');
      } else {
        setActionError('Failed to add sales person');
      }
    } catch (err: any) { // Added 'any' type for catch error
      console.error('An unexpected error occurred while adding sales person:', err);
      setActionError(err.message || 'An unexpected error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveSalesPerson = async (id: string) => {
    if (!confirm('Are you sure you want to remove this sales person? This may affect associated customers.')) return;

    setActionLoading(id);
    setActionError(null);

    try {
      const success = await removeSalesPerson(id);
      if (!success) {
        setActionError('Failed to remove sales person. They may have associated customers.');
      }
    } catch (err) {
      setActionError('An unexpected error occurred while removing sales person');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = () => {
    setEditingBrandId(null);
    setEditBrandName('');
    setEditingSalesPersonId(null);
    setEditSalesPersonName('');
    setActionError(null);
  };

  const loading = inventoryLoading || salesPersonsLoading;
  const error = inventoryError || salesPersonsError;

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 hover:text-brand-600 font-bold transition-all duration-300 group"
        >
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 mr-3 group-hover:scale-110 transition-transform">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="text-sm tracking-tight uppercase tracking-widest">Back to Dashboard</span>
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        {/* Tab Navigation */}
        <div className="bg-slate-50/50 border-b border-slate-200/60 p-1">
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'inventory'
                ? 'bg-white text-brand-600 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
            >
              <Package className={`h-4 w-4 ${activeTab === 'inventory' ? 'text-brand-500' : ''}`} />
              <span className="uppercase tracking-widest">Inventory Assets</span>
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'sales'
                ? 'bg-white text-brand-600 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
            >
              <Users className={`h-4 w-4 ${activeTab === 'sales' ? 'text-brand-500' : ''}`} />
              <span className="uppercase tracking-widest">Sales Team</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-10">
          {(error || actionError) && (
            <ErrorMessage
              message={actionError || error || ''}
              onDismiss={() => setActionError(null)}
              className="mb-8 rounded-2xl border-red-100 shadow-sm"
            />
          )}

          {activeTab === 'inventory' && (
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBrandName(e.target.value)}
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
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditBrandName(e.target.value)}
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
          )}

          {activeTab === 'sales' && (
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSalesPersonName(e.target.value)}
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
              {salesPersons.length === 0 ? (
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
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditSalesPersonName(e.target.value)}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;