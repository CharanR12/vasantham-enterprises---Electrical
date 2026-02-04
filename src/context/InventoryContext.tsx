import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Brand, SaleEntry, InventoryContextType } from '../types/inventory';
import { inventoryApi } from '../services/inventoryApi';
import { useApi } from '../hooks/useApi';

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [salesEntries, setSalesEntries] = useState<SaleEntry[]>([]);

  const { loading, error, execute } = useApi();

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    console.log('Refreshing inventory data...');
    
    const [productsResult, brandsResult, salesResult] = await Promise.all([
      execute(() => inventoryApi.getProducts()),
      execute(() => inventoryApi.getBrands()),
      execute(() => inventoryApi.getSaleEntries())
    ]);

    if (productsResult) {
      console.log('Products loaded:', productsResult.length);
      setProducts(productsResult);
    }
    
    if (brandsResult) {
      console.log('Brands loaded:', brandsResult.length);
      setBrands(brandsResult);
    }
    
    if (salesResult) {
      console.log('Sales entries loaded:', salesResult.length);
      setSalesEntries(salesResult);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'brand'>): Promise<boolean> => {
    console.log('Adding product:', product.productName);
    const result = await execute(() => inventoryApi.createProduct(product));
    if (result) {
      await refreshData();
      return true;
    }
    return false;
  };

  const updateProduct = async (product: Product): Promise<boolean> => {
    console.log('Updating product:', product.productName);
    const result = await execute(() => inventoryApi.updateProduct(product.id, product));
    if (result) {
      await refreshData();
      return true;
    }
    return false;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    console.log('Deleting product:', id);
    const result = await execute(() => inventoryApi.deleteProduct(id));
    if (result !== null) {
      await refreshData();
      return true;
    }
    return false;
  };

  const addBrand = async (name: string): Promise<boolean> => {
    console.log('Adding brand:', name);
    const result = await execute(() => inventoryApi.createBrand(name));
    if (result) {
      await refreshData();
      return true;
    }
    return false;
  };

  const updateBrand = async (id: string, name: string): Promise<boolean> => {
    console.log('Updating brand:', id, name);
    const result = await execute(() => inventoryApi.updateBrand(id, name));
    if (result) {
      await refreshData();
      return true;
    }
    return false;
  };

  const deleteBrand = async (id: string): Promise<boolean> => {
    console.log('Deleting brand:', id);
    const result = await execute(() => inventoryApi.deleteBrand(id));
    if (result !== null) {
      await refreshData();
      return true;
    }
    return false;
  };

  const addSaleEntry = async (saleEntry: Omit<SaleEntry, 'id' | 'createdAt'>): Promise<boolean> => {
    console.log('Adding sale entry for product:', saleEntry.productId);
    const result = await execute(() => inventoryApi.createSaleEntry(saleEntry));
    if (result) {
      await refreshData();
      return true;
    }
    return false;
  };

  const getSalesForProduct = (productId: string): SaleEntry[] => {
    return salesEntries.filter(entry => entry.productId === productId);
  };

  const value = {
    products,
    brands,
    salesEntries,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addBrand,
    updateBrand,
    deleteBrand,
    addSaleEntry,
    getSalesForProduct,
    refreshData,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};