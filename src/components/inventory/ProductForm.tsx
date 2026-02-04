import React, { useState } from 'react';
import { Product } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
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

type ProductFormProps = {
  product?: Product;
  onClose: () => void;
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const { brands, addProduct, updateProduct, deleteProduct, addBrand, error } = useInventory();
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNewBrandInput, setShowNewBrandInput] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  const initialState = {
    brandId: '',
    productName: '',
    modelNumber: '',
    quantityAvailable: 0,
    arrivalDate: format(new Date(), 'yyyy-MM-dd')
  };

  const [formData, setFormData] = useState(product ? {
    brandId: product.brandId,
    productName: product.productName,
    modelNumber: product.modelNumber,
    quantityAvailable: product.quantityAvailable,
    arrivalDate: product.arrivalDate
  } : initialState);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.brandId) newErrors.brandId = 'Brand is required';
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.modelNumber.trim()) newErrors.modelNumber = 'Model number is required';
    if (formData.quantityAvailable < 0) newErrors.quantityAvailable = 'Quantity cannot be negative';
    if (!formData.arrivalDate) newErrors.arrivalDate = 'Arrival date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormLoading(true);
    setFormError(null);

    try {
      let success = false;
      if (product) {
        success = await updateProduct({
          ...product,
          ...formData
        });
      } else {
        success = await addProduct(formData);
      }

      if (success) {
        onClose();
      } else {
        setFormError('Failed to save product. Please try again.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    setDeleteLoading(true);
    setFormError(null);

    try {
      const success = await deleteProduct(product.id);
      if (success) {
        onClose();
      } else {
        setFormError('Failed to delete product. Please try again.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred while deleting.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;

    setFormLoading(true);
    try {
      const success = await addBrand(newBrandName.trim());
      if (success) {
        setNewBrandName('');
        setShowNewBrandInput(false);
      }
    } catch (err) {
      setFormError('Failed to add brand. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantityAvailable' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md max-h-[92vh] p-0 overflow-hidden rounded-2xl">
          <div className="flex justify-between items-center p-4 border-b">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {product ? 'Edit' : 'Add'} Product
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

          <div className="flex-1 overflow-y-auto p-4">
            {(error || formError) && (
              <ErrorMessage
                message={formError || error || ''}
                onDismiss={() => setFormError(null)}
                className="mb-4"
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBrandName(e.target.value)}
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
            </form>
          </div>

          <div className="flex-shrink-0 border-t bg-slate-50 p-4 rounded-b-xl flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-10 px-6 rounded-xl font-medium"
              disabled={formLoading || deleteLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="h-10 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-md"
              disabled={formLoading || deleteLoading}
            >
              {formLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {product ? 'Save Changes' : 'Add Product'}
            </Button>
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