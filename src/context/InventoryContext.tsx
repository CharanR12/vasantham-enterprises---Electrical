import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Brand, SaleEntry, InventoryContextType } from '../types/inventory';
import { inventoryApi } from '../services/inventoryApi';
import { useApi } from '../hooks/useApi';
import { useUser, useOrganization, useAuth } from '@clerk/clerk-react';

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const { membership } = useOrganization();
  const { getToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [salesEntries, setSalesEntries] = useState<SaleEntry[]>([]);

  const { loading, error, execute } = useApi();

  const currentRole: 'admin' | 'user' = membership?.role === 'org:admin' ? 'admin' : 'user';

  // DEBUG: Check Clerk role (Inventory)
  useEffect(() => {
    if (membership) {
      console.log('Clerk Membership Role (Inventory):', membership.role);
      console.log('Derived Internal Role (Inventory):', currentRole);
    } else {
      console.log('No organization membership found for inventory user.');
    }
  }, [membership, currentRole]);

  useEffect(() => {
    refreshData();
  }, [user?.id, membership?.id]);

  const refreshData = async () => {
    console.log('Refreshing inventory data...');
    const filterId = currentRole === 'admin' ? undefined : user?.id;

    const [productsResult, brandsResult, salesResult] = await Promise.all([
      execute(async () => {
        const token = await getToken({ template: 'supabase' }) || undefined;
        return inventoryApi.getProducts(filterId, token);
      }),
      execute(async () => {
        const token = await getToken({ template: 'supabase' }) || undefined;
        return inventoryApi.getBrands(filterId, token);
      }),
      execute(async () => {
        const token = await getToken({ template: 'supabase' }) || undefined;
        return inventoryApi.getSaleEntries(filterId, token);
      })
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
    const result = await execute(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return inventoryApi.createProduct(product, user?.id, token);
    });
    if (result) {
      await refreshData();
      return true;
    }
    return false;
  };

  const updateProduct = async (product: Product): Promise<boolean> => {
    console.log('Updating product:', product.productName);
    const result = await execute(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return inventoryApi.updateProduct(product.id, product, token);
    });
    if (result) {
      await refreshData();
      return true;
    }
    return false;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    console.log('Deleting product:', id);
    const result = await execute(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return inventoryApi.deleteProduct(id, token);
    });
    if (result !== null) {
      await refreshData();
      return true;
    }
    return false;
  };

  const addBrand = async (name: string): Promise<boolean> => {
    console.log('Adding brand:', name);
    const result = await execute(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return inventoryApi.createBrand(name, user?.id, token);
    });
    if (result) {
      await refreshData();
      return true;
    }
    return false;
  };

  const updateBrand = async (id: string, name: string): Promise<boolean> => {
    console.log('Updating brand:', id, name);
    const result = await execute(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return inventoryApi.updateBrand(id, name, token);
    });
    if (result) {
      await refreshData();
      return true;
    }
    return false;
  };

  const deleteBrand = async (id: string): Promise<boolean> => {
    console.log('Deleting brand:', id);
    const result = await execute(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return inventoryApi.deleteBrand(id, token);
    });
    if (result !== null) {
      await refreshData();
      return true;
    }
    return false;
  };

  const addSaleEntry = async (saleEntry: Omit<SaleEntry, 'id' | 'createdAt'>): Promise<boolean> => {
    console.log('Adding sale entry for product:', saleEntry.productId);
    const result = await execute(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return inventoryApi.createSaleEntry(saleEntry, user?.id, token);
    });
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