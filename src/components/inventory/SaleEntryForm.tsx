import React, { useState } from 'react';
import { Product } from '../../types/inventory';
import { useAddSaleEntryMutation } from '../../hooks/queries/useInventoryQueries';
import { X } from 'lucide-react';

type SaleEntryFormProps = {
    product: Product;
    onClose: () => void;
};

const SaleEntryForm: React.FC<SaleEntryFormProps> = ({ product, onClose }) => {
    const addSaleEntryMutation = useAddSaleEntryMutation();
    const [formData, setFormData] = useState({
        saleDate: new Date().toISOString().split('T')[0],
        customerName: '',
        billNumber: '',
        quantitySold: 1
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.quantitySold <= 0) {
            alert('Quantity must be greater than 0');
            return;
        }

        if (formData.quantitySold > product.quantityAvailable) {
            alert(`Only ${product.quantityAvailable} units available`);
            return;
        }

        try {
            await addSaleEntryMutation.mutateAsync({
                productId: product.id,
                saleDate: formData.saleDate,
                customerName: formData.customerName,
                billNumber: formData.billNumber || undefined,
                quantitySold: formData.quantitySold
            });
            onClose();
        } catch (error: any) {
            console.error('Error adding sale entry:', error);
            alert(error.message || 'An error occurred');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                        Add Sale: {product.productName}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sale Date</label>
                        <input
                            type="date"
                            required
                            value={formData.saleDate}
                            onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <input
                            type="text"
                            required
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Enter customer name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number (Optional)</label>
                        <input
                            type="text"
                            value={formData.billNumber}
                            onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Enter bill number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity Sold (Available: {product.quantityAvailable})
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            max={product.quantityAvailable}
                            value={formData.quantitySold}
                            onChange={(e) => setFormData({ ...formData, quantitySold: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addSaleEntryMutation.isPending}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {addSaleEntryMutation.isPending ? 'Adding...' : 'Add Sale'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaleEntryForm;
