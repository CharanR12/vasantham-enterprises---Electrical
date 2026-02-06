import React, { useState } from 'react';
import { Product, SaleEntry } from '../../types/inventory';
import { Package, Calendar, Hash, TrendingDown, Plus, Eye, Edit, IndianRupee } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ProductForm from './ProductForm';
import SaleEntryForm from './SaleEntryForm';
import SalesLogModal from './SalesLogModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ProductCardProps = {
  product: Product;
  salesEntries: SaleEntry[];
  isSelectMode?: boolean;
  isSelected?: boolean;
  selectionNumber?: number;
  onSelect?: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  salesEntries,
  isSelectMode = false,
  isSelected = false,
  selectionNumber,
  onSelect
}) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showSalesLog, setShowSalesLog] = useState(false);
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const formatPrice = (value: number): string => {
    return value > 0 ? `₹${value.toLocaleString()}` : '-';
  };

  const hasPriceData = product.mrp > 0 || product.purchaseDiscountedPrice > 0 || product.salePrice > 0;

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
      <div
        onClick={() => isSelectMode && onSelect?.()}
        className={`
            premium-card p-6 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden
            ${isSelectMode ? 'cursor-pointer hover:shadow-lg' : ''}
            ${isSelected ? 'ring-2 ring-brand-600 bg-brand-50/10' : ''}
        `}
      >
        {isSelectMode && (
          <div className={`
                absolute top-4 right-4 z-10 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300
                ${isSelected ? 'bg-brand-600 text-white scale-100' : 'bg-slate-100 text-slate-300 scale-90 border-2 border-slate-200'}
            `}>
            {isSelected ? (
              <span className="font-bold text-sm">{selectionNumber}</span>
            ) : (
              <div className="h-3 w-3 rounded-full bg-slate-300" />
            )}
          </div>
        )}

        <div className={`transition-opacity duration-300 ${isSelectMode && !isSelected ? 'opacity-60 grayscale-[0.5]' : ''}`}>
          <div className="flex justify-between items-start mb-5">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors duration-300">{product.productName}</h3>
              <p className="text-sm font-semibold text-slate-400 mt-0.5">{product.brand.name}</p>
            </div>
            {!isSelectMode && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowEditForm(true); }}
                  className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all duration-200"
                  title="Edit product"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center text-slate-600 bg-slate-100 p-2.5 rounded-xl border border-slate-100/50">
              <div className="bg-white p-1.5 rounded-lg shadow-sm mr-3">
                <Hash className="h-4 w-4 text-brand-500" />
              </div>
              <span className="text-sm font-medium">Model: <span className="text-slate-900 font-bold">{product.modelNumber}</span></span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col bg-slate-100 p-3 rounded-xl border border-slate-100/50">
                <div className="flex items-center text-slate-500 mb-1">
                  <Package className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Available</span>
                </div>
                <span className="text-lg font-bold text-slate-900">{product.quantityAvailable}</span>
              </div>
              <div className="flex flex-col bg-slate-100 p-3 rounded-xl border border-slate-100/50">
                <div className="flex items-center text-slate-500 mb-1">
                  <TrendingDown className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Sold Units</span>
                </div>
                <span className="text-lg font-bold text-slate-900">{totalSold}</span>
              </div>
            </div>

            {/* Price Details Button */}
            {!isSelectMode && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowPriceDetails(true); }}
                className="w-full flex items-center justify-center p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors duration-200"
              >
                <IndianRupee className="h-4 w-4 mr-2" />
                <span className="text-xs font-bold">View Price Details</span>
              </button>
            )}

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center text-slate-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-xs font-semibold">Arrived {formatDate(product.arrivalDate)}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${stockStatus.color.replace('text-', 'border-').replace('600', '200') + ' ' + stockStatus.color}`}>
                {stockStatus.label}
              </span>
            </div>

            {recentSales.length > 0 && !isSelectMode && (
              <div className="bg-slate-100 rounded-xl p-3 border border-dashed border-slate-200 mt-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="text-xs flex justify-between items-center bg-white/50 p-1.5 rounded-lg border border-white">
                      <span className="text-slate-700 font-medium truncate max-w-[100px]">{sale.customerName}</span>
                      <span className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{sale.quantitySold}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isSelectMode && (
            <div className="grid grid-cols-5 gap-2 mt-6">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSalesLog(true); }}
                className="col-span-2 flex items-center justify-center space-x-2 py-2.5 px-3 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                <Eye className="h-4 w-4" />
                <span>Logs ({salesEntries.length})</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); setShowSaleForm(true); }}
                className="col-span-3 flex items-center justify-center space-x-2 py-2.5 px-3 text-xs font-bold text-white bg-brand-600 rounded-xl shadow-lg shadow-brand-200 hover:bg-brand-700 hover:translate-y-[-1px] transition-all duration-300 active:translate-y-0 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                disabled={product.quantityAvailable === 0}
              >
                <Plus className="h-4 w-4" />
                <span>Record New Sale</span>
              </button>
            </div>
          )}
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

      {/* Price Details Modal */}
      {showPriceDetails && (
        <Dialog open={showPriceDetails} onOpenChange={(open) => !open && setShowPriceDetails(false)}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-emerald-600" />
                Price Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="text-center mb-4">
                <h3 className="font-bold text-slate-900">{product.productName}</h3>
                <p className="text-sm text-slate-500">{product.brand.name}</p>
              </div>

              {hasPriceData ? (
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purchase Info</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm">MRP</span>
                      <span className="font-bold text-slate-900">{formatPrice(product.mrp)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm">Purchase Rate</span>
                      <span className="font-bold text-slate-900">{formatPrice(product.purchaseRate)}</span>
                    </div>
                    {product.purchaseDiscountPercent > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 text-sm">Discount</span>
                        <span className="font-bold text-emerald-600">{product.purchaseDiscountPercent}%</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="text-slate-600 text-sm font-medium">Discounted Price</span>
                      <span className="font-bold text-lg text-slate-900">{formatPrice(product.purchaseDiscountedPrice)}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-xl p-4 space-y-3">
                    <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Sale Info</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700 text-sm">Sale Price</span>
                      <span className="font-bold text-lg text-emerald-700">{formatPrice(product.salePrice)}</span>
                    </div>
                    {product.saleDiscountPercent > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-700 text-sm">Discount</span>
                        <span className="font-bold text-emerald-600">{product.saleDiscountPercent}%</span>
                      </div>
                    )}
                    {product.saleDiscountAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-700 text-sm">Discount Amount</span>
                        <span className="font-bold text-emerald-600">{formatPrice(product.saleDiscountAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <IndianRupee className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No pricing details available.</p>
                  <button
                    onClick={() => { setShowPriceDetails(false); setShowEditForm(true); }}
                    className="mt-3 text-brand-600 font-bold text-sm hover:underline"
                  >
                    Add pricing info
                  </button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ProductCard;