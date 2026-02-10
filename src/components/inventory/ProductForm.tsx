import React, { useState } from 'react';
import { Product } from '../../types/inventory';
import { useProductForm } from '../../hooks/useProductForm';
import { useUserRole } from '../../hooks/useUserRole';
import { X, Trash2, ChevronRight, Check, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import LoadingSpinner from '../LoadingSpinner';

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const {
    brands,
    categories,
    formData,
    formLoading,
    deleteLoading,
    formError,
    setFormError,
    errors,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showNewBrandInput,
    setShowNewBrandInput,
    newBrandName,
    setNewBrandName,
    handleSubmit,
    handleDelete,
    handleAddBrand,
    handleChange,
    discountTypes,
    handleDiscountChange,
    handleRemoveDiscount,
    handleDiscountPriceChange
  } = useProductForm(product, onClose);

  const { currentRole, user } = useUserRole();
  const [step, setStep] = useState(1);

  const isOwner = product?.createdBy === user?.id;
  const canViewPurchaseInfo = currentRole === 'admin' || isOwner || !product;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation for Step 1 could go here if needed, 
    // but currently main validation is in useProductForm's handleSubmit
    if (!formData.productName || !formData.brandId || !formData.modelNumber) {
      setFormError('Please fill in all required fields in Step 1');
      return;
    }
    setFormError(null);
    setStep(2);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-2xl shadow-2xl border-0">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-slate-900">
                {product ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* Progress Stepper */}
            <div className="flex items-center mt-6 px-2">
              <div className={`flex items-center gap-2 ${step === 1 ? 'text-brand-600 font-bold' : 'text-brand-600 font-medium'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-brand-600 text-white' : 'bg-brand-100 text-brand-600'}`}>1</div>
                <span>Basic Info</span>
              </div>
              <div className="h-px bg-slate-200 flex-1 mx-4"></div>
              <div className={`flex items-center gap-2 ${step === 2 ? 'text-brand-600 font-bold' : 'text-slate-400 font-medium'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>2</div>
                <span>Pricing & Sales</span>
              </div>
            </div>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            <form onSubmit={step === 1 ? handleNext : handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                  {formError}
                </div>
              )}

              {/* STEP 1: BASIC INFO */}
              <div className={step === 1 ? 'space-y-6 animate-in fade-in slide-in-from-left-4 duration-300' : 'hidden'}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="brandId" className="text-sm font-medium text-slate-700">Brand <span className="text-red-500">*</span></Label>
                    <div className="flex gap-2">
                      <select
                        id="brandId"
                        name="brandId"
                        value={formData.brandId}
                        onChange={(e) => handleChange(e as any)}
                        className="flex-1 h-11 bg-white border border-slate-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        disabled={formLoading || deleteLoading}
                      >
                        <option value="">Select Brand</option>
                        {brands.map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        onClick={() => setShowNewBrandInput(!showNewBrandInput)}
                        variant="outline"
                        className="h-11 px-3 border-slate-200 text-brand-600 hover:bg-brand-50 hover:border-brand-200"
                      >
                        +
                      </Button>
                    </div>
                    {errors.brandId && <p className="text-xs text-red-500 font-medium mt-1">{errors.brandId}</p>}

                    {showNewBrandInput && (
                      <div className="mt-2 flex gap-2 animate-in fade-in slide-in-from-top-2">
                        <Input
                          placeholder="New Brand Name"
                          value={newBrandName}
                          onChange={(e) => setNewBrandName(e.target.value)}
                          className="h-10 bg-white"
                        />
                        <Button
                          type="button"
                          onClick={handleAddBrand}
                          disabled={formLoading}
                          size="sm"
                          className="bg-brand-600 text-white hover:bg-brand-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId" className="text-sm font-medium text-slate-700">Category</Label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => handleChange(e as any)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all disabled:opacity-50 disabled:bg-slate-50"
                      disabled={formLoading || deleteLoading || !formData.brandId}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modelNumber" className="text-sm font-medium text-slate-700">Model Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="modelNumber"
                      name="modelNumber"
                      value={formData.modelNumber}
                      onChange={handleChange}
                      className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20"
                      placeholder="e.g. V-1234"
                      disabled={formLoading || deleteLoading}
                    />
                    {errors.modelNumber && <p className="text-xs text-red-500 font-medium mt-1">{errors.modelNumber}</p>}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="productName" className="text-sm font-medium text-slate-700">Product Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="productName"
                      name="productName"
                      value={formData.productName}
                      onChange={handleChange}
                      className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 font-medium"
                      placeholder="Enter full product name"
                      disabled={formLoading || deleteLoading}
                    />
                    {errors.productName && <p className="text-xs text-red-500 font-medium mt-1">{errors.productName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantityAvailable" className="text-sm font-medium text-slate-700">Initial Quantity</Label>
                    <Input
                      id="quantityAvailable"
                      type="number"
                      name="quantityAvailable"
                      value={formData.quantityAvailable}
                      onChange={handleChange}
                      className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20"
                      placeholder="0"
                      min="0"
                      disabled={formLoading || deleteLoading}
                    />
                    {errors.quantityAvailable && <p className="text-xs text-red-500 font-medium mt-1">{errors.quantityAvailable}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arrivalDate" className="text-sm font-medium text-slate-700">Arrival Date</Label>
                    <Input
                      id="arrivalDate"
                      type="date"
                      name="arrivalDate"
                      value={formData.arrivalDate}
                      onChange={handleChange}
                      className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20"
                      disabled={formLoading || deleteLoading}
                    />
                    {errors.arrivalDate && <p className="text-xs text-red-500 font-medium mt-1">{errors.arrivalDate}</p>}
                  </div>
                </div>

                {product && (
                  <div className="pt-6 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-0 font-medium"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Product
                    </Button>
                  </div>
                )}
              </div>

              {/* STEP 2: PRICING INFO */}
              <div className={step === 2 ? 'space-y-6 animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchase Details</h3>

                  {canViewPurchaseInfo ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mrp" className="text-sm font-medium text-slate-700">MRP</Label>
                        <Input
                          id="mrp"
                          type="number"
                          name="mrp"
                          value={formData.mrp}
                          onChange={handleChange}
                          className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20"
                          disabled={formLoading || deleteLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="purchaseDiscountPercent" className="text-sm font-medium text-slate-700">Purchase Discount %</Label>
                        <Input
                          id="purchaseDiscountPercent"
                          type="number"
                          name="purchaseDiscountPercent"
                          value={formData.purchaseDiscountPercent}
                          onChange={handleChange}
                          className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20"
                          disabled={formLoading || deleteLoading}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="purchaseDiscountedPrice" className="text-sm font-medium text-slate-700">Purchase Rate (Net)</Label>
                        <Input
                          id="purchaseDiscountedPrice"
                          type="number"
                          name="purchaseDiscountedPrice"
                          value={formData.purchaseDiscountedPrice}
                          onChange={handleChange}
                          className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 font-bold text-slate-900"
                          disabled={formLoading || deleteLoading}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <p className="text-sm text-slate-500 font-medium">
                        Purchase details are restricted.
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Only administrators or the creator of this product can view these details.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sales Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">MRP</Label>
                      <Input
                        value={formData.mrp}
                        disabled
                        className="h-11 bg-slate-50 border-slate-200 rounded-xl text-slate-500 font-medium"
                      />
                    </div>
                    {/* Default Discount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="saleDiscountPercent" className="text-sm font-medium text-slate-700">Default Discount %</Label>
                      <Input
                        id="saleDiscountPercent"
                        type="number"
                        name="saleDiscountPercent"
                        value={formData.saleDiscountPercent}
                        onChange={handleChange}
                        className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20"
                        placeholder="0%"
                        min="0"
                        max="100"
                        step="0.1"
                        disabled={formLoading || deleteLoading}
                      />
                    </div>

                    {/* Sales Rate (Net) - MOVED HERE */}
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="salePrice" className="text-sm font-medium text-slate-700">Sales Rate (Net)</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleChange}
                        className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 font-bold text-emerald-600"
                        disabled={formLoading || deleteLoading}
                      />
                      {/* Profit Tag */}
                      {(() => {
                        const salePrice = Number(formData.salePrice) || 0;
                        const purchasePrice = Number(formData.purchaseDiscountedPrice) || 0;
                        const profit = salePrice - purchasePrice;
                        const profitMargin = salePrice > 0 ? ((profit / salePrice) * 100).toFixed(1) : 0;

                        if (salePrice > 0 && purchasePrice > 0 && canViewPurchaseInfo) {
                          return (
                            <div className={`mt-2 text-xs font-semibold px-2 py-1 rounded-lg inline-block ${profit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                              {profit >= 0 ? '+' : ''}₹{profit.toFixed(2)} ({profitMargin}%) Margin
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {discountTypes.length > 0 && (
                      <div className="space-y-3 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-slate-700">Additional Sales Discounts</Label>
                          {/* Only show Add button if there are unused discount types */}
                          {discountTypes.filter(dt => !(formData.salesDiscounts && dt.id in formData.salesDiscounts)).length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const unused = discountTypes.find(dt => !(formData.salesDiscounts && dt.id in formData.salesDiscounts));
                                if (unused) handleDiscountChange(unused.id, '0');
                              }}
                              disabled={formLoading || deleteLoading}
                              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Discount
                            </button>
                          )}
                        </div>
                        {/* Render rows for each selected discount */}
                        {formData.salesDiscounts && Object.keys(formData.salesDiscounts).length > 0 ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                              <div className="col-span-4">Type</div>
                              <div className="col-span-3">Discount %</div>
                              <div className="col-span-4">Sales Price</div>
                              <div className="col-span-1"></div>
                            </div>
                            {Object.entries(formData.salesDiscounts).map(([dtId, pct]) => {
                              const usedIds = Object.keys(formData.salesDiscounts || {});
                              const availableTypes = discountTypes.filter(dt => dt.id === dtId || !usedIds.includes(dt.id));

                              const mrp = Number(formData.mrp) || 0;
                              const currentPrice = mrp > 0 ? (mrp * (1 - pct / 100)).toFixed(2) : '';

                              return (
                                <div key={dtId} className="grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-4">
                                    <select
                                      value={dtId}
                                      onChange={(e) => {
                                        const newId = e.target.value;
                                        if (newId !== dtId) {
                                          handleRemoveDiscount(dtId);
                                          handleDiscountChange(newId, String(pct));
                                        }
                                      }}
                                      disabled={formLoading || deleteLoading}
                                      className="w-full h-10 px-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium"
                                    >
                                      {availableTypes.map(dt => (
                                        <option key={dt.id} value={dt.id}>{dt.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-span-3">
                                    <Input
                                      type="number"
                                      value={pct}
                                      onChange={(e) => handleDiscountChange(dtId, e.target.value)}
                                      className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 text-center"
                                      placeholder="0%"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      disabled={formLoading || deleteLoading}
                                    />
                                  </div>
                                  <div className="col-span-4">
                                    <Input
                                      type="number"
                                      value={currentPrice}
                                      onChange={(e) => handleDiscountPriceChange(dtId, e.target.value)}
                                      className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 font-bold text-slate-700"
                                      placeholder="Price"
                                      min="0"
                                      disabled={formLoading || deleteLoading || !mrp}
                                    />
                                  </div>
                                  <div className="col-span-1 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveDiscount(dtId)}
                                      disabled={formLoading || deleteLoading}
                                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No discounts added. Click "Add Discount" to get started.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="flex-shrink-0 border-t bg-slate-50 p-4 rounded-b-xl flex justify-between gap-3 sticky bottom-0 z-10">
            <Button
              variant="outline"
              onClick={step === 1 ? onClose : () => setStep(1)}
              className="h-10 px-6 rounded-xl font-medium"
              disabled={formLoading || deleteLoading}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            {step === 1 ? (
              <Button
                onClick={handleNext}
                className="h-10 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-md inline-flex items-center"
                disabled={formLoading || deleteLoading}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={(e) => handleSubmit(e)}
                className="h-10 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-md min-w-[140px]"
                disabled={formLoading || deleteLoading}
              >
                {formLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                {product ? 'Save Changes' : 'Add Product'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(false)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 mb-2">Delete Product?</DialogTitle>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete "{product?.productName}"? This cannot be undone.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleDelete}
                className="h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold"
                disabled={deleteLoading}
              >
                {deleteLoading && <LoadingSpinner size="sm" className="mr-2" />}
                Delete
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="h-11 text-slate-500 hover:text-slate-700"
                disabled={deleteLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductForm;