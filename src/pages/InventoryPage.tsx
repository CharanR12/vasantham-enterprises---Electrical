import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useInventory } from '../context/InventoryContext';
import InventorySearchFilter from '../components/inventory/InventorySearchFilter';
import InventoryKPICards from '../components/inventory/InventoryKPICards';
import ProductCard from '../components/inventory/ProductCard';
import ProductForm from '../components/inventory/ProductForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
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

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading inventory...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        {error && (
          <ErrorMessage 
            message={error} 
            className="mb-4"
          />
        )}

        <InventorySearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          stockFilter={stockFilter}
          setStockFilter={setStockFilter}
          brands={brands}
        />

        <InventoryKPICards products={products} salesEntries={salesEntries} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                salesEntries={getSalesForProduct(product.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No products found matching the current filters.</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-20 right-4 lg:bottom-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
        </button>

        {showAddForm && (
          <ProductForm onClose={() => setShowAddForm(false)} />
        )}
      </div>
    </Layout>
  );
};

export default InventoryPage;