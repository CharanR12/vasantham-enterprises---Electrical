import React, { useState } from 'react';
import { Product } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

type SaleEntryFormProps = {
  product: Product;
  onClose: () => void;
};

const SaleEntryForm: React.FC<SaleEntryFormProps> = ({ product, onClose }) => {
  const { addSaleEntry, loading, error } = useInventory();
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    saleDate: format(new Date(), 'yyyy-MM-dd'),
    customerName: '',
    billNumber: '',
    quantitySold: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.saleDate) newErrors.saleDate = 'Sale date is required';
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (formData.quantitySold <= 0) newErrors.quantitySold = 'Quantity must be greater than 0';
    if (formData.quantitySold > product.quantityAvailable) {
      newErrors.quantitySold = `Only ${product.quantityAvailable} units available`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setFormLoading(true);
    setFormError(null);
    
    try {
      const success = await addSaleEntry({
        productId: product.id,
        saleDate: formData.saleDate,
        customerName: formData.customerName.trim(),
        billNumber: formData.billNumber.trim() || undefined,
        quantitySold: formData.quantitySold
      });
      
      if (success) {
        onClose();
      } else {
        setFormError('Failed to add sale entry. Please try again.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'quantitySold' ? parseInt(value) || 0 : value 
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Add Sale Entry</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">{product.productName}</h3>
            <p className="text-sm text-gray-600">{product.brand.name} - {product.modelNumber}</p>
            <p className="text-sm text-gray-600">Available: {product.quantityAvailable} units</p>
          </div>

          {(error || formError) && (
            <ErrorMessage 
              message={formError || error || ''} 
              onDismiss={() => setFormError(null)}
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Date</label>
              <input
                type="date"
                name="saleDate"
                value={formData.saleDate}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.saleDate ? 'border-red-500' : 'border-gray-300'}`}
                disabled={formLoading}
              />
              {errors.saleDate && <p className="text-red-500 text-xs mt-1">{errors.saleDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.customerName ? 'border-red-500' : 'border-gray-300'}`}
                disabled={formLoading}
                placeholder="Enter customer name"
              />
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number (Optional)</label>
              <input
                type="text"
                name="billNumber"
                value={formData.billNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={formLoading}
                placeholder="Enter bill number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Sold</label>
              <input
                type="number"
                name="quantitySold"
                value={formData.quantitySold}
                onChange={handleChange}
                min="1"
                max={product.quantityAvailable}
                className={`w-full p-2 border rounded-md ${errors.quantitySold ? 'border-red-500' : 'border-gray-300'}`}
                disabled={formLoading}
              />
              {errors.quantitySold && <p className="text-red-500 text-xs mt-1">{errors.quantitySold}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center transition-colors"
                disabled={formLoading}
              >
                {formLoading && <LoadingSpinner size="sm" className="mr-2" />}
                Add Sale Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SaleEntryForm;