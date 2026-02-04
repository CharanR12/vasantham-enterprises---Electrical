import React, { useState } from 'react';
import { Product, SaleEntry } from '../../types/inventory';
import { Package, Calendar, Hash, TrendingDown, Plus, Eye, Edit } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ProductForm from './ProductForm';
import SaleEntryForm from './SaleEntryForm';
import SalesLogModal from './SalesLogModal';

type ProductCardProps = {
  product: Product;
  salesEntries: SaleEntry[];
};

const ProductCard: React.FC<ProductCardProps> = ({ product, salesEntries }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showSalesLog, setShowSalesLog] = useState(false);

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const totalSold = salesEntries.reduce((sum, entry) => sum + entry.quantitySold, 0);
  const recentSales = salesEntries.slice(0, 3);

  const getStockStatus = () => {
    if (product.quantityAvailable === 0) {
      return { color: 'text-red-600 bg-red-50', label: 'Out of Stock' };
    } else if (product.quantityAvailable <= 5) {
      return { color: 'text-orange-600 bg-orange-50', label: 'Low Stock' };
    }
    return { color: 'text-green-600 bg-green-50', label: 'In Stock' };
  };

  const stockStatus = getStockStatus();

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{product.productName}</h3>
            <p className="text-sm text-gray-500">{product.brand.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEditForm(true)}
              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-full transition-colors"
              title="Edit product"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <Hash className="h-4 w-4 mr-2" />
            <span className="text-sm">Model: {product.modelNumber}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Package className="h-4 w-4 mr-2" />
              <span className="text-sm">Qty: {product.quantityAvailable}</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stockStatus.color}`}>
              {stockStatus.label}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">Arrived: {formatDate(product.arrivalDate)}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <TrendingDown className="h-4 w-4 mr-2" />
            <span className="text-sm">Total Sold: {totalSold}</span>
          </div>

          {recentSales.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Sales</h4>
              <div className="space-y-1">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="text-xs text-gray-600 flex justify-between">
                    <span>{sale.customerName}</span>
                    <span>{sale.quantitySold} units</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
          <button
            onClick={() => setShowSalesLog(true)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Sales Log ({salesEntries.length})
          </button>
          
          <button
            onClick={() => setShowSaleForm(true)}
            className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
            disabled={product.quantityAvailable === 0}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Sale
          </button>
        </div>
      </div>

      {showEditForm && (
        <ProductForm 
          product={product} 
          onClose={() => setShowEditForm(false)} 
        />
      )}

      {showSaleForm && (
        <SaleEntryForm
          product={product}
          onClose={() => setShowSaleForm(false)}
        />
      )}

      {showSalesLog && (
        <SalesLogModal
          product={product}
          salesEntries={salesEntries}
          onClose={() => setShowSalesLog(false)}
        />
      )}
    </>
  );
};

export default ProductCard;