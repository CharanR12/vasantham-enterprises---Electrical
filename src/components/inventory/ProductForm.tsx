import React, { useState } from 'react';
import { Product, Brand } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

type ProductFormProps = {
  product?: Product;
  onClose: () => void;
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const { brands, addProduct, updateProduct, deleteProduct, addBrand, loading, error } = useInventory();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'quantityAvailable' ? parseInt(value) || 0 : value 
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[92vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
            <h2 className="text-lg font-semibold">{product ? 'Edit' : 'Add'} Product</h2>
            <div className="flex items-center space-x-2">
              {product && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete product"
                  disabled={formLoading || deleteLoading}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <div className="flex gap-2">
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleChange}
                    className={`flex-1 p-2 border rounded-md ${errors.brandId ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={formLoading || deleteLoading}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewBrandInput(!showNewBrandInput)}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                    disabled={formLoading || deleteLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {errors.brandId && <p className="text-red-500 text-xs mt-1">{errors.brandId}</p>}
                
                {showNewBrandInput && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder="New brand name"
                      className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                      disabled={formLoading}
                    />
                    <button
                      type="button"
                      onClick={handleAddBrand}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      disabled={formLoading || !newBrandName.trim()}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.productName ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={formLoading || deleteLoading}
                />
                {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
                <input
                  type="text"
                  name="modelNumber"
                  value={formData.modelNumber}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.modelNumber ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={formLoading || deleteLoading}
                />
                {errors.modelNumber && <p className="text-red-500 text-xs mt-1">{errors.modelNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available</label>
                <input
                  type="number"
                  name="quantityAvailable"
                  value={formData.quantityAvailable}
                  onChange={handleChange}
                  min="0"
                  className={`w-full p-2 border rounded-md ${errors.quantityAvailable ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={formLoading || deleteLoading}
                />
                {errors.quantityAvailable && <p className="text-red-500 text-xs mt-1">{errors.quantityAvailable}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
                <input
                  type="date"
                  name="arrivalDate"
                  value={formData.arrivalDate}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.arrivalDate ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={formLoading || deleteLoading}
                />
                {errors.arrivalDate && <p className="text-red-500 text-xs mt-1">{errors.arrivalDate}</p>}
              </div>
            </form>
          </div>

          <div className="flex-shrink-0 border-t bg-white p-4 rounded-b-lg">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={formLoading || deleteLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                disabled={formLoading || deleteLoading}
              >
                {formLoading && <LoadingSpinner size="sm" className="mr-2" />}
                {product ? 'Update' : 'Add'} Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{product?.productName}"? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center transition-colors"
                disabled={deleteLoading}
              >
                {deleteLoading && <LoadingSpinner size="sm" className="mr-2" />}
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductForm;