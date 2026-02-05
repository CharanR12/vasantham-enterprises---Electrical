import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { brandService } from '../../services/brandService';
import { productService } from '../../services/productService';
import { saleEntryService } from '../../services/saleEntryService';
import { useUserRole } from '../useUserRole';
import { Product, SaleEntry } from '../../types/inventory';

export const inventoryKeys = {
    all: ['inventory'] as const,
    brands: () => [...inventoryKeys.all, 'brands'] as const,
    products: () => [...inventoryKeys.all, 'products'] as const,
    sales: () => [...inventoryKeys.all, 'sales'] as const,
    brandList: (filterId?: string) => [...inventoryKeys.brands(), { filterId }] as const,
    productList: (filterId?: string) => [...inventoryKeys.products(), { filterId }] as const,
    saleList: (filterId?: string) => [...inventoryKeys.sales(), { filterId }] as const,
};

export const useBrandsQuery = () => {
    const { getToken } = useAuth();
    const { filterId } = useUserRole();

    return useQuery({
        queryKey: inventoryKeys.brandList(filterId),
        queryFn: async () => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return brandService.getBrands(filterId, token);
        },
    });
};

export const useProductsQuery = () => {
    const { getToken } = useAuth();
    const { filterId } = useUserRole();

    return useQuery({
        queryKey: inventoryKeys.productList(filterId),
        queryFn: async () => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return productService.getProducts(filterId, token);
        },
    });
};

export const useSalesEntriesQuery = () => {
    const { getToken } = useAuth();
    const { filterId } = useUserRole();

    return useQuery({
        queryKey: inventoryKeys.saleList(filterId),
        queryFn: async () => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return saleEntryService.getSaleEntries(filterId, token);
        },
    });
};

export const useAddProductMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();
    const { user } = useUserRole();

    return useMutation({
        mutationFn: async (product: Omit<Product, 'id' | 'createdAt' | 'brand'>) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return productService.createProduct(product, user?.id, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
        },
    });
};

export const useUpdateProductMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async (product: Product) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return productService.updateProduct(product.id, product, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
        },
    });
};

export const useDeleteProductMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return productService.deleteProduct(id, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
        },
    });
};

export const useAddBrandMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();
    const { user } = useUserRole();

    return useMutation({
        mutationFn: async (name: string) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return brandService.createBrand(name, user?.id, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.brands() });
        },
    });
};

export const useUpdateBrandMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async ({ id, name }: { id: string, name: string }) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return brandService.updateBrand(id, name, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.brands() });
        },
    });
};

export const useDeleteBrandMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return brandService.deleteBrand(id, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.brands() });
        },
    });
};

export const useAddSaleEntryMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();
    const { user } = useUserRole();

    return useMutation({
        mutationFn: async (saleEntry: Omit<SaleEntry, 'id' | 'createdAt'>) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return saleEntryService.createSaleEntry(saleEntry, user?.id, token);
        },
        onSuccess: () => {
            // Sale entry affects both sales list and product stock
            queryClient.invalidateQueries({ queryKey: inventoryKeys.sales() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
        },
    });
};
