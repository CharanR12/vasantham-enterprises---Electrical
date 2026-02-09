import React, { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Brand, Category } from '../../types/inventory';
import { Input } from '@/components/ui/input';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';

type InventorySearchFilterProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedBrands: string[];
  setSelectedBrands: (value: string[]) => void;
  selectedCategories: string[];
  setSelectedCategories: (value: string[]) => void;
  stockFilter: string[];
  setStockFilter: (value: string[]) => void;
  brands: Brand[];
  categories: Category[];
  onClear: () => void;
};

const InventorySearchFilter: React.FC<InventorySearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedBrands,
  setSelectedBrands,
  selectedCategories,
  setSelectedCategories,
  stockFilter,
  setStockFilter,
  brands,
  categories,
  onClear,
}) => {
  const brandOptions = brands.map((brand) => ({ value: brand.id, label: brand.name }));

  const categoryOptions = useMemo(() => {
    // If brands are selected, show only categories from those brands
    if (selectedBrands.length > 0) {
      return categories
        .filter(c => selectedBrands.includes(c.brandId))
        .map(c => ({ value: c.id, label: c.name }));
    }
    return categories.map(c => ({ value: c.id, label: c.name }));
  }, [categories, selectedBrands]);

  const stockOptions = [
    { value: 'all', label: 'All Stock Status' },
    { value: 'in-stock', label: 'In Stock (>5)' },
    { value: 'low-stock', label: 'Low Stock (≤5)' },
    { value: 'out-of-stock', label: 'Out of Stock' },
  ];

  const hasActiveFilters = searchTerm !== '' || selectedBrands.length > 0 || selectedCategories.length > 0 || stockFilter.length > 0;

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-3 border border-slate-200/50 shadow-sm transition-all duration-300">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-start">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500"
            />
          </div>

          <MultiSelectCombobox
            options={brandOptions}
            selectedValues={selectedBrands}
            onChange={setSelectedBrands}
            placeholder="Filter Brands"
            searchPlaceholder="Search brands..."
            className="w-full sm:w-64"
          />

          <MultiSelectCombobox
            options={categoryOptions}
            selectedValues={selectedCategories}
            onChange={setSelectedCategories}
            placeholder="Filter Categories"
            searchPlaceholder="Search categories..."
            className="w-full sm:w-64"
            disabled={categories.length === 0}
          />

          <MultiSelectCombobox
            options={stockOptions}
            selectedValues={stockFilter}
            onChange={setStockFilter}
            placeholder="Filter Stock Status"
            searchPlaceholder="Search status..."
            className="w-full sm:w-64"
          />

          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="h-11 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventorySearchFilter;