import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useInventory } from '../context/InventoryContext';
import { useCustomers } from '../context/CustomerContext';
import { Edit2, Save, X, ArrowLeft, Plus, Trash2, Package, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

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
    } catch (err) {
      setActionError('An unexpected error occurred while updating brand');
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
    } catch (err) {
      setActionError('An unexpected error occurred while adding brand');
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
    } catch (err) {
      setActionError('An unexpected error occurred while removing brand');
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
    } catch (err) {
      setActionError('An unexpected error occurred while updating sales person');
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
    } catch (err) {
      setActionError('An unexpected error occurred while adding sales person');
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
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-colors ${
                  activeTab === 'inventory'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Inventory</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-colors ${
                  activeTab === 'sales'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Sales</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {(error || actionError) && (
              <ErrorMessage 
                message={actionError || error || ''} 
                onDismiss={() => setActionError(null)}
                className="mb-4 sm:mb-6"
              />
            )}

            {activeTab === 'inventory' && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Brand Management</h2>
                
                {/* Add New Brand */}
                <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm sm:text-base font-medium mb-3 text-gray-800">Add New Brand</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder="Enter brand name"
                      className="flex-1 p-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={actionLoading === 'add-brand'}
                    />
                    <button
                      onClick={handleAddBrand}
                      className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
                      disabled={actionLoading === 'add-brand' || !newBrandName.trim()}
                    >
                      {actionLoading === 'add-brand' ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      <span className="hidden sm:inline">Add Brand</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>

                {/* Brands List */}
                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : brands.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No brands found. Add one above to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {brands.map((brand) => (
                      <div key={brand.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-3">
                            {editingBrandId === brand.id ? (
                              <input
                                type="text"
                                value={editBrandName}
                                onChange={(e) => setEditBrandName(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={actionLoading === brand.id}
                                autoFocus
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {editingBrandId === brand.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveBrand(brand.id)}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50 p-2 rounded hover:bg-green-50 transition-colors"
                                  disabled={actionLoading === brand.id || !editBrandName.trim()}
                                >
                                  {actionLoading === brand.id ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <Save className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={handleCancel}
                                  className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                                  disabled={actionLoading === brand.id}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditBrand(brand.id, brand.name)}
                                  className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors"
                                  disabled={actionLoading !== null}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveBrand(brand.id)}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50 p-2 rounded hover:bg-red-50 transition-colors"
                                  disabled={actionLoading !== null}
                                >
                                  {actionLoading === brand.id ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
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
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Sales Person Management</h2>
                
                {/* Add New Sales Person */}
                <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm sm:text-base font-medium mb-3 text-gray-800">Add New Sales Person</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newSalesPersonName}
                      onChange={(e) => setNewSalesPersonName(e.target.value)}
                      placeholder="Enter sales person name"
                      className="flex-1 p-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={actionLoading === 'add-sales-person'}
                    />
                    <button
                      onClick={handleAddSalesPerson}
                      className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
                      disabled={actionLoading === 'add-sales-person' || !newSalesPersonName.trim()}
                    >
                      {actionLoading === 'add-sales-person' ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      <span className="hidden sm:inline">Add Sales Person</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>

                {/* Sales Persons List */}
                {salesPersons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No sales persons found. Add one above to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {salesPersons.map((person) => (
                      <div key={person.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-3">
                            {editingSalesPersonId === person.id ? (
                              <input
                                type="text"
                                value={editSalesPersonName}
                                onChange={(e) => setEditSalesPersonName(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={actionLoading === person.id}
                                autoFocus
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">{person.name}</div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {editingSalesPersonId === person.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveSalesPerson(person.id)}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50 p-2 rounded hover:bg-green-50 transition-colors"
                                  disabled={actionLoading === person.id || !editSalesPersonName.trim()}
                                >
                                  {actionLoading === person.id ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <Save className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={handleCancel}
                                  className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                                  disabled={actionLoading === person.id}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditSalesPerson(person.id, person.name)}
                                  className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors"
                                  disabled={actionLoading !== null}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveSalesPerson(person.id)}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50 p-2 rounded hover:bg-red-50 transition-colors"
                                  disabled={actionLoading !== null}
                                >
                                  {actionLoading === person.id ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
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
    </Layout>
  );
};

export default SettingsPage;