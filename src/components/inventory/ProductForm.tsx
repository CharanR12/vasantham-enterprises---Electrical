import React from 'react';
import { Product } from '../../types/inventory';
import { Plus, Trash2 } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProductForm } from '../../hooks/useProductForm';

type ProductFormProps = {
  product?: Product;
  onClose: () => void;
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const {
    brands,
    formData,
    setFormData,
    errors,
    formLoading,
    deleteLoading,
    formError,
    setFormError,
    serverError,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showNewBrandInput,
    setShowNewBrandInput,
    newBrandName,
    setNewBrandName,
    handleSubmit,
    handleDelete,
    handleAddBrand,
    handleChange
  } = useProductForm(product, onClose);

  const [step, setStep] = React.useState(1);

  const handleNext = () => {
    // Basic validation for Step 1
    if (step === 1) {
      if (!formData.productName || !formData.modelNumber || !formData.brandId) {
        // Let the browser validation handle it or show error
        // For now, we just proceed if basic fields are seemingly there, 
        // but real validation happens on submit.
        // Better to just change step.
      }
      setStep(2);
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-md max-h-[92vh] p-0 overflow-hidden rounded-2xl flex flex-col transition-all duration-300">
          <div className="flex justify-between items-center p-4 border-b shrink-0">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                {product ? 'Edit' : 'Add'} Product
                <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Step {step} of 2
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              {product && (
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-9 w-9 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                  disabled={formLoading || deleteLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {(serverError || formError) && (
              <ErrorMessage
                message={formError || serverError || ''}
                onDismiss={() => setFormError(null)}
                className="mb-4"
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* STATUS BAR */}
              <div className="flex gap-1 mb-4">
                <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-brand-600' : 'bg-slate-100'}`} />
                <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-brand-600' : 'bg-slate-100'}`} />
              </div>

              {/* STEP 1: PRODUCT INFO */}
              <div className={step === 1 ? 'space-y-4 animate-in fade-in slide-in-from-left-4 duration-300' : 'hidden'}>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Brand</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.brandId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, brandId: value }))}
                      disabled={formLoading || deleteLoading}
                    >
                      <SelectTrigger className={`flex-1 h-11 bg-white border-slate-200 rounded-xl focus:ring-brand-500/20 focus:border-brand-500 ${errors.brandId ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewBrandInput(!showNewBrandInput)}
                      className="h-11 w-11 p-0 rounded-xl hover:bg-slate-50 shrink-0"
                      disabled={formLoading || deleteLoading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.brandId && <p className="text-red-500 text-xs font-medium ml-1">{errors.brandId}</p>}

                  {showNewBrandInput && (
                    <div className="mt-2 flex gap-2 animate-in slide-in-from-top-2 duration-200">
                      <Input
                        type="text"
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        placeholder="New brand name"
                        className="flex-1 h-10 bg-slate-50 border-slate-200 rounded-xl"
                        disabled={formLoading}
                      />
                      <Button
                        type="button"
                        onClick={handleAddBrand}
                        className="h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm"
                        disabled={formLoading || !newBrandName.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productName" className="text-sm font-medium text-slate-700">Product Name</Label>
                  <Input
                    id="productName"
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className={`h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 ${errors.productName ? 'border-red-500' : ''}`}
                    disabled={formLoading || deleteLoading}
                  />
                  {errors.productName && <p className="text-red-500 text-xs font-medium ml-1">{errors.productName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelNumber" className="text-sm font-medium text-slate-700">Model Number</Label>
                  <Input
                    id="modelNumber"
                    type="text"
                    name="modelNumber"
                    value={formData.modelNumber}
                    onChange={handleChange}
                    className={`h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 ${errors.modelNumber ? 'border-red-500' : ''}`}
                    disabled={formLoading || deleteLoading}
                  />
                  {errors.modelNumber && <p className="text-red-500 text-xs font-medium ml-1">{errors.modelNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantityAvailable" className="text-sm font-medium text-slate-700">Quantity Available</Label>
                  <Input
                    id="quantityAvailable"
                    type="number"
                    name="quantityAvailable"
                    value={formData.quantityAvailable}
                    onChange={handleChange}
                    min="0"
                    className={`h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 ${errors.quantityAvailable ? 'border-red-500' : ''}`}
                    disabled={formLoading || deleteLoading}
                  />
                  {errors.quantityAvailable && <p className="text-red-500 text-xs font-medium ml-1">{errors.quantityAvailable}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrivalDate" className="text-sm font-medium text-slate-700">Arrival Date</Label>
                  <Input
                    id="arrivalDate"
                    type="date"
                    name="arrivalDate"
                    value={formData.arrivalDate}
                    onChange={handleChange}
                    className={`h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 ${errors.arrivalDate ? 'border-red-500' : ''}`}
                    disabled={formLoading || deleteLoading}
                  />
                  {errors.arrivalDate && <p className="text-red-500 text-xs font-medium ml-1">{errors.arrivalDate}</p>}
                </div>
              </div>


              {/* STEP 2: PRICING INFO */}
              <div className={step === 2 ? 'space-y-4 animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>

                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 mb-4">
                  <Label htmlFor="updatedAt" className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5 block">
                    Pricing Last Updated
                  </Label>
                  <Input
                    id="updatedAt"
                    type="datetime-local"
                    name="updatedAt"
                    value={formData.updatedAt ? new Date(formData.updatedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
                    onChange={(e) => handleChange({ target: { name: 'updatedAt', value: new Date(e.target.value).toISOString() } } as any)}
                    className="h-10 bg-white border-amber-200 text-amber-900 focus-visible:ring-amber-500/20 focus-visible:border-amber-500"
                    disabled={formLoading || deleteLoading}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchase Details</h3>
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




                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sales Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">MRP</Label>
                      <Input
                        value={formData.mrp}
                        disabled
                        className="h-11 bg-slate-50 border-slate-200 rounded-xl text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="saleDiscountPercent" className="text-sm font-medium text-slate-700">Sales Discount %</Label>
                      <Input
                        id="saleDiscountPercent"
                        type="number"
                        name="saleDiscountPercent"
                        value={formData.saleDiscountPercent}
                        onChange={handleChange}
                        className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20"
                        disabled={formLoading || deleteLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                        if (salePrice > 0 && purchasePrice > 0) {
                          return (
                            <div className={`text-xs font-semibold px-2 py-1 rounded-lg inline-block ${profit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                              Profit: ₹{profit.toFixed(2)} ({profitMargin}%)
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

            </form>
          </div>

          <div className="flex-shrink-0 border-t bg-slate-50 p-4 rounded-b-xl flex justify-between gap-3">
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
                className="h-10 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-md"
                disabled={formLoading || deleteLoading}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="h-10 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-md"
                disabled={formLoading || deleteLoading}
              >
                {formLoading && <LoadingSpinner size="sm" className="mr-2" />}
                {product ? 'Save Changes' : 'Add Product'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showDeleteConfirm && (
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
      )}
    </>
  );
};

export default ProductForm;