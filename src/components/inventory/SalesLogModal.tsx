import React from 'react';
import { Product, SaleEntry } from '../../types/inventory';
import { X, Calendar, User, FileText, Package } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type SalesLogModalProps = {
  product: Product;
  salesEntries: SaleEntry[];
  onClose: () => void;
};

const SalesLogModal: React.FC<SalesLogModalProps> = ({ product, salesEntries, onClose }) => {
  const formatDate = (dateString: string): string => {
    return format(parseISO(dateString), 'dd/MM/yyyy');
  };

  const sortedEntries = [...salesEntries].sort(
    (a, b) => parseISO(b.saleDate).getTime() - parseISO(a.saleDate).getTime()
  );

  const totalSold = salesEntries.reduce((sum, entry) => sum + entry.quantitySold, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Sales Log</h2>
            <p className="text-sm text-gray-600">{product.productName} - {product.brand.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{product.quantityAvailable}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{totalSold}</div>
              <div className="text-sm text-gray-600">Total Sold</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{salesEntries.length}</div>
              <div className="text-sm text-gray-600">Transactions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{product.quantityAvailable + totalSold}</div>
              <div className="text-sm text-gray-600">Total Stock</div>
            </div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-12rem)]">
          {sortedEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No sales recorded for this product yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sale Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bill Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity Sold
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(entry.saleDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.billNumber || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entry.quantitySold} units
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {sortedEntries.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">{formatDate(entry.saleDate)}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{entry.quantitySold} units</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span className="text-sm">{entry.customerName}</span>
                      </div>
                      
                      {entry.billNumber && (
                        <div className="flex items-center text-gray-600">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="text-sm">Bill: {entry.billNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesLogModal;