import React, { useState, useEffect } from 'react';
import { useProductsQuery, useBrandsQuery, useSalesEntriesQuery } from '../hooks/queries/useInventoryQueries';
import InventorySearchFilter from '../components/inventory/InventorySearchFilter';
import InventoryKPICards from '../components/inventory/InventoryKPICards';
import ProductCard from '../components/inventory/ProductCard';
import ProductForm from '../components/inventory/ProductForm';
import SalesLogModal from '../components/inventory/SalesLogModal';
import InvoiceModal from '../components/invoices/InvoiceModal';
import ErrorMessage from '../components/ErrorMessage';
import { KPISkeleton } from '../components/skeletons/KPISkeleton';
import { ProductSkeleton } from '../components/skeletons/ProductSkeleton';
import { Product, SaleEntry } from '../types/inventory';
import InventoryTable from '../components/inventory/InventoryTable';
import { Plus, LayoutGrid, Table, FileText, X, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const InventoryPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const { data: products = [], isLoading: productsLoading, error: productsError } = useProductsQuery();
  const { data: brands = [], isLoading: brandsLoading } = useBrandsQuery();
  const { data: salesEntries = [], isLoading: salesLoading, error: salesError } = useSalesEntriesQuery();

  const location = useLocation();
  const navigate = useNavigate();

  const loading = productsLoading || brandsLoading || salesLoading;
  const error = (productsError as any)?.message || (salesError as any)?.message || null;

  const getSalesForProduct = (productId: string): SaleEntry[] => {
    return salesEntries.filter(entry => entry.productId === productId);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingSalesLog, setViewingSalesLog] = useState<Product | null>(null);

  // Invoice Mode State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Check for select mode in URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('selectMode') === 'true') {
      setIsSelectMode(true);
      // Clear param but keep mode
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate]);

  // Update global inventory data for export
  useEffect(() => {
    (window as any).inventoryData = {
      products,
      brands,
      salesEntries
    };
  }, [products, brands, salesEntries]);

  const toggleProductSelection = (product: Product) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts(prev => [...prev, {
        ...product,
        // Ensure new fields are mapped if they exist on product, or default them
        discount: product.saleDiscountAmount || 0,
        // purchaseRate removed
        purchaseDiscountPercent: product.purchaseDiscountPercent || 0,
        purchaseDiscountedPrice: product.purchaseDiscountedPrice || 0,
        saleDiscountPercent: product.saleDiscountPercent || 0,
        saleDiscountAmount: product.saleDiscountAmount || 0
      }]);
    }
  };

  const getSelectionNumber = (productId: string) => {
    const index = selectedProducts.findIndex(p => p.id === productId);
    return index !== -1 ? index + 1 : undefined;
  };

  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      // Search term filter
      const matchesSearch =
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.modelNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Brand filter
      const matchesBrand =
        selectedBrand === '' || product.brandId === selectedBrand;

      // Stock filter
      let matchesStock = true;
      switch (stockFilter) {
        case 'in-stock':
          matchesStock = product.quantityAvailable > 5;
          break;
        case 'low-stock':
          matchesStock = product.quantityAvailable > 0 && product.quantityAvailable <= 5;
          break;
        case 'out-of-stock':
          matchesStock = product.quantityAvailable === 0;
          break;
        default:
          matchesStock = true;
      }

      return matchesSearch && matchesBrand && matchesStock;
    });
  }, [products, searchTerm, selectedBrand, stockFilter]);

  return (
    <div className="space-y-8 pb-24">
      {error && (
        <ErrorMessage
          message={error}
          className="mb-6 rounded-2xl shadow-sm border-red-100"
        />
      )}

      {/* Page Header */}
      <div className="animate-fadeIn flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Product Management</p>
        </div>
      </div>

      <div className="animate-fadeIn">
        <InventorySearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          stockFilter={stockFilter}
          setStockFilter={setStockFilter}
          brands={brands}
        />
      </div>

      <div className="flex justify-between items-center animate-fadeIn [animation-delay:50ms]">
        <div className="flex items-center space-x-2 bg-white/50 p-1.5 rounded-2xl border border-slate-200/60 shadow-sm">
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${viewMode === 'card'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${viewMode === 'table'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
        </div>

        {/* Invoice Button */}
        {!isSelectMode && (
          <button
            onClick={() => {
              setIsSelectMode(true);
              setViewMode('card'); // Force card mode for selection
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm"
          >
            <FileText className="h-4 w-4" />
            Create Quotation
          </button>
        )}
      </div>

      <div className="animate-fadeIn [animation-delay:100ms]">
        {loading ? <KPISkeleton /> : <InventoryKPICards products={products} salesEntries={salesEntries} />}
      </div>

      {viewMode === 'table' && !loading && !isSelectMode ? (
        <div className="animate-fadeIn [animation-delay:200ms]">
          <InventoryTable
            products={filteredProducts}
            onEdit={setEditingProduct}
            onViewLog={setViewingSalesLog}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn [animation-delay:200ms]">
          {loading ? (
            <>
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
            </>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                salesEntries={getSalesForProduct(product.id)}
                isSelectMode={isSelectMode}
                isSelected={!!selectedProducts.find(p => p.id === product.id)}
                selectionNumber={getSelectionNumber(product.id)}
                onSelect={() => toggleProductSelection(product)}
              />
            ))
          ) : (
            <div className="col-span-full premium-card py-16 text-center border-dashed">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Plus className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No products match your current filters.</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedBrand(''); setStockFilter('all'); }}
                className="mt-4 text-brand-600 font-bold hover:underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Bar for Select Mode */}
      {isSelectMode && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 w-max max-w-[95vw]">
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-2 p-2 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700/50 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => {
                setIsSelectMode(false);
                setSelectedProducts([]);
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full transition-colors text-sm font-bold"
            >
              <X className="h-4 w-4" />
              Exit
            </button>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="px-2 text-sm font-medium">
              <span className="font-bold text-brand-400">{selectedProducts.length}</span> selected
            </div>
            <button
              onClick={() => setShowInvoiceModal(true)}
              disabled={selectedProducts.length === 0}
              className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-500 rounded-full transition-all text-sm font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Button - Only show when NOT in select mode */}
      {!isSelectMode && (
        <button
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-8 right-8 z-40 bg-brand-600 text-white p-4 rounded-2xl shadow-xl shadow-brand-500/20 hover:bg-brand-700 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
          title="Add New Product"
        >
          <Plus className="h-7 w-7" />
        </button>
      )}

      {showAddForm && (
        <ProductForm onClose={() => setShowAddForm(false)} />
      )}

      {/* Edit Form for Table Selection */}
      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* View Sales Log Modal */}
      {viewingSalesLog && (
        <SalesLogModal
          product={viewingSalesLog}
          salesEntries={getSalesForProduct(viewingSalesLog.id)}
          onClose={() => setViewingSalesLog(null)}
        />
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <InvoiceModal
          selectedProducts={selectedProducts}
          onClose={() => setShowInvoiceModal(false)}
          onSave={() => {
            setShowInvoiceModal(false);
            setIsSelectMode(false);
            setSelectedProducts([]);
            navigate('/invoices');
          }}
        />
      )}
    </div>
  );
};

export default InventoryPage;