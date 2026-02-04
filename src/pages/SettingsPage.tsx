import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Users } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import { useSettings } from '../hooks/useSettings';
import { BrandManagement } from '../components/settings/BrandManagement';
import { SalesForceManagement } from '../components/settings/SalesForceManagement';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales'>('inventory');

  const {
    brands,
    salesPersons,
    loading,
    error,
    actionLoading,
    actionError,
    setActionError,

    // Brand states/handlers
    editingBrandId,
    editBrandName,
    setEditBrandName,
    newBrandName,
    setNewBrandName,
    handleEditBrand,
    handleSaveBrand,
    handleAddBrand,
    handleRemoveBrand,

    // Sales person states/handlers
    editingSalesPersonId,
    editSalesPersonName,
    setEditSalesPersonName,
    newSalesPersonName,
    setNewSalesPersonName,
    handleEditSalesPerson,
    handleSaveSalesPerson,
    handleAddSalesPerson,
    handleRemoveSalesPerson,

    handleCancel
  } = useSettings();

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

          {activeTab === 'inventory' ? (
            <BrandManagement
              brands={brands}
              loading={loading}
              actionLoading={actionLoading}
              newBrandName={newBrandName}
              setNewBrandName={setNewBrandName}
              editingBrandId={editingBrandId}
              editBrandName={editBrandName}
              setEditBrandName={setEditBrandName}
              handleAddBrand={handleAddBrand}
              handleEditBrand={handleEditBrand}
              handleSaveBrand={handleSaveBrand}
              handleRemoveBrand={handleRemoveBrand}
              handleCancel={handleCancel}
            />
          ) : (
            <SalesForceManagement
              salesPersons={salesPersons}
              loading={loading}
              actionLoading={actionLoading}
              newSalesPersonName={newSalesPersonName}
              setNewSalesPersonName={setNewSalesPersonName}
              editingSalesPersonId={editingSalesPersonId}
              editSalesPersonName={editSalesPersonName}
              setEditSalesPersonName={setEditSalesPersonName}
              handleAddSalesPerson={handleAddSalesPerson}
              handleEditSalesPerson={handleEditSalesPerson}
              handleSaveSalesPerson={handleSaveSalesPerson}
              handleRemoveSalesPerson={handleRemoveSalesPerson}
              handleCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;