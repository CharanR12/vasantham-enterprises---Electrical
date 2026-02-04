import React from 'react';
import { Search } from 'lucide-react';
import { Brand } from '../../types/inventory';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';

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
  const brandOptions = [
    { value: 'all', label: 'All Brands' },
    ...brands.map((brand) => ({ value: brand.id, label: brand.name }))
  ];

  const stockOptions = [
    { value: 'all', label: 'All Stock Status' },
    { value: 'in-stock', label: 'In Stock (>5)' },
    { value: 'low-stock', label: 'Low Stock (≤5)' },
    { value: 'out-of-stock', label: 'Out of Stock' },
  ];

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-3 border border-slate-200/50 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            placeholder="Search products, models, or brands..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500"
          />
        </div>

        <Combobox
          options={brandOptions}
          value={selectedBrand || 'all'}
          onChange={(val) => setSelectedBrand(val === 'all' ? '' : val)}
          placeholder="All Brands"
          searchPlaceholder="Search brand..."
          className="w-full"
        />

        <Combobox
          options={stockOptions}
          value={stockFilter}
          onChange={(val) => setStockFilter(val as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock')}
          placeholder="All Stock Status"
          searchPlaceholder="Search status..."
          className="w-full"
        />
      </div>
    </div>
  );
};

export default InventorySearchFilter;