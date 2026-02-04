import React from 'react';
import { Product, SaleEntry } from '../../types/inventory';
import { Calendar, User, FileText, Package } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden rounded-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Sales Log</DialogTitle>
            <p className="text-sm text-gray-600">{product.productName} - {product.brand.name}</p>
          </DialogHeader>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-600">{product.quantityAvailable}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{totalSold}</div>
              <div className="text-sm text-gray-600">Total Sold</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-600">{salesEntries.length}</div>
              <div className="text-sm text-gray-600">Transactions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{product.quantityAvailable + totalSold}</div>
              <div className="text-sm text-gray-600">Total Stock</div>
            </div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-16rem)]">
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

        <div className="p-4 border-t bg-slate-50/50 flex justify-center">
          <Button
            onClick={onClose}
            className="h-10 px-8 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalesLogModal;