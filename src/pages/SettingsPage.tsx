import React, { useState } from 'react';
import { Package, Users, Share2, Tag } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import { useSettings } from '../hooks/useSettings';
import { BrandManagement } from '../components/settings/BrandManagement';
import { SalesForceManagement } from '../components/settings/SalesForceManagement';
import { ReferralSourceManagement } from '../components/settings/ReferralSourceManagement';
import { DiscountTypeManagement } from '../components/settings/DiscountTypeManagement';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales' | 'referral' | 'discounts'>('inventory');

  const {
    brands,
    salesPersons,
    referralSources,
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

    // Category states/handlers
    categories,
    expandedBrandId,
    newCategoryName,
    setNewCategoryName,
    handleToggleBrandExpand,
    handleAddCategory,
    handleRemoveCategory,

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

    // Referral source states/handlers
    editingReferralSourceId,
    editReferralSourceName,
    setEditReferralSourceName,
    newReferralSourceName,
    setNewReferralSourceName,
    handleEditReferralSource,
    handleSaveReferralSource,
    handleAddReferralSource,
    handleRemoveReferralSource,

    // Discount type states/handlers
    discountTypes,
    editingDiscountTypeId,
    editDiscountTypeName,
    setEditDiscountTypeName,
    newDiscountTypeName,
    setNewDiscountTypeName,
    handleEditDiscountType,
    handleSaveDiscountType,
    handleAddDiscountType,
    handleRemoveDiscountType,

    handleCancel
  } = useSettings();

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Manage your assets</p>
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
            <button
              onClick={() => setActiveTab('referral')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'referral'
                ? 'bg-white text-brand-600 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
            >
              <Share2 className={`h-4 w-4 ${activeTab === 'referral' ? 'text-brand-500' : ''}`} />
              <span className="uppercase tracking-widest">Referral Sources</span>
            </button>
            <button
              onClick={() => setActiveTab('discounts')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'discounts'
                ? 'bg-white text-brand-600 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
            >
              <Tag className={`h-4 w-4 ${activeTab === 'discounts' ? 'text-brand-500' : ''}`} />
              <span className="uppercase tracking-widest">Discount Types</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-10">
          {(error || actionError) && (
            <ErrorMessage
              message={actionError || (error as Error)?.message || ''}
              onDismiss={() => setActionError(null)}
              className="mb-8 rounded-2xl border-red-100 shadow-sm"
            />
          )}

          {activeTab === 'inventory' ? (
            <BrandManagement
              brands={brands}
              categories={categories}
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

              expandedBrandId={expandedBrandId}
              newCategoryName={newCategoryName}
              setNewCategoryName={setNewCategoryName}
              handleToggleBrandExpand={handleToggleBrandExpand}
              handleAddCategory={handleAddCategory}
              handleRemoveCategory={handleRemoveCategory}

              handleCancel={handleCancel}
            />
          ) : activeTab === 'sales' ? (
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
          ) : activeTab === 'referral' ? (
            <ReferralSourceManagement
              referralSources={referralSources}
              loading={loading}
              actionLoading={actionLoading}
              newReferralSourceName={newReferralSourceName}
              setNewReferralSourceName={setNewReferralSourceName}
              editingReferralSourceId={editingReferralSourceId}
              editReferralSourceName={editReferralSourceName}
              setEditReferralSourceName={setEditReferralSourceName}
              handleAddReferralSource={handleAddReferralSource}
              handleEditReferralSource={handleEditReferralSource}
              handleSaveReferralSource={handleSaveReferralSource}
              handleRemoveReferralSource={handleRemoveReferralSource}
              handleCancel={handleCancel}
            />
          ) : (
            <DiscountTypeManagement
              discountTypes={discountTypes}
              loading={loading}
              actionLoading={actionLoading}
              newDiscountTypeName={newDiscountTypeName}
              setNewDiscountTypeName={setNewDiscountTypeName}
              editingDiscountTypeId={editingDiscountTypeId}
              editDiscountTypeName={editDiscountTypeName}
              setEditDiscountTypeName={setEditDiscountTypeName}
              handleAddDiscountType={handleAddDiscountType}
              handleEditDiscountType={handleEditDiscountType}
              handleSaveDiscountType={handleSaveDiscountType}
              handleRemoveDiscountType={handleRemoveDiscountType}
              handleCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;