import React from 'react';
import { Search, Package } from 'lucide-react';
import { Brand } from '../../types/inventory';

type InventorySearchFilterProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
  stockFilter: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  setStockFilter: (value: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock') => void;
  brands: Brand[];
};

const InventorySearchFilter: React.FC<InventorySearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedBrand,
  setSelectedBrand,
  stockFilter,
  setStockFilter,
  brands,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="p-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 truncate"
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id} className="truncate">
              {brand.name}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock')}
          className="p-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Stock Levels</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock (≤5)</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>
    </div>
  );
};

export default InventorySearchFilter;