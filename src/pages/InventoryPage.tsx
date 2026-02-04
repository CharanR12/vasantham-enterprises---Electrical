import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import InventorySearchFilter from '../components/inventory/InventorySearchFilter';
import InventoryKPICards from '../components/inventory/InventoryKPICards';
import ProductCard from '../components/inventory/ProductCard';
import ProductForm from '../components/inventory/ProductForm';
import ErrorMessage from '../components/ErrorMessage';
import { KPISkeleton } from '../components/skeletons/KPISkeleton';
import { ProductSkeleton } from '../components/skeletons/ProductSkeleton';
import { Product } from '../types/inventory';
import { Plus } from 'lucide-react';

const InventoryPage: React.FC = () => {
  const {
    products,
    brands,
    salesEntries,
    loading,
    error,
    getSalesForProduct
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Update global inventory data for export
  useEffect(() => {
    (window as any).inventoryData = {
      products,
      brands,
      salesEntries
    };
  }, [products, brands, salesEntries]);

  const filterProducts = (): Product[] => {
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
  };

  const filteredProducts = filterProducts();

  // Removed full-page loading in favor of integrated skeletons

  return (
    <div className="space-y-8 pb-12">
      {error && (
        <ErrorMessage
          message={error}
          className="mb-6 rounded-2xl shadow-sm border-red-100"
        />
      )}

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

      <div className="animate-fadeIn [animation-delay:100ms]">
        {loading ? <KPISkeleton /> : <InventoryKPICards products={products} salesEntries={salesEntries} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn [animation-delay:200ms]">
        {loading ? (
          <>
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
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

      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-8 right-8 z-40 bg-brand-600 text-white p-4 rounded-2xl shadow-xl shadow-brand-500/20 hover:bg-brand-700 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
        title="Add New Product"
      >
        <Plus className="h-7 w-7" />
      </button>

      {showAddForm && (
        <ProductForm onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
};

export default InventoryPage;