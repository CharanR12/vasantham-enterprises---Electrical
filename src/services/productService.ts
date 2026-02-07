import { getClient, handleSupabaseError } from './apiUtils';
import { Product } from '../types/inventory';

export const productService = {
    getProducts: async (creatorId?: string, clerkToken?: string): Promise<Product[]> => {
        try {
            const client = getClient(clerkToken);
            let query = client
                .from('products')
                .select(`
          *,
          brand:brands(id, name)
        `);

            if (creatorId) {
                query = query.eq('created_by', creatorId);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false });

            handleSupabaseError(error);

            return (data || []).map(product => ({
                id: product.id,
                brandId: product.brand_id,
                brand: product.brand || { id: '', name: 'Unknown' },
                productName: product.product_name,
                modelNumber: product.model_number,
                quantityAvailable: product.quantity_available,
                arrivalDate: product.arrival_date,
                mrp: product.mrp || 0,
                purchaseRate: product.purchase_rate || 0,
                purchaseDiscountPercent: product.purchase_discount_percent || 0,
                purchaseDiscountedPrice: product.purchase_discounted_price || 0,
                salePrice: product.sale_price || 0,
                saleDiscountPercent: product.sale_discount_percent || 0,
                saleDiscountAmount: product.sale_discount_amount || 0,
                createdAt: product.created_at,
                updatedAt: product.updated_at
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'brand'>, userId?: string, clerkToken?: string): Promise<Product> => {
        try {
            const client = getClient(clerkToken);
            const { data, error } = await client
                .from('products')
                .insert({
                    brand_id: productData.brandId,
                    product_name: productData.productName,
                    model_number: productData.modelNumber,
                    quantity_available: productData.quantityAvailable,
                    arrival_date: productData.arrivalDate,
                    mrp: productData.mrp,
                    // purchase_rate removed from schema
                    purchase_discount_percent: productData.purchaseDiscountPercent,
                    purchase_discounted_price: productData.purchaseDiscountedPrice,
                    sale_price: productData.salePrice,
                    sale_discount_percent: productData.saleDiscountPercent,
                    // sale_discount_amount removed from UI
                    created_by: userId,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            handleSupabaseError(error);

            const products = await productService.getProducts(undefined, clerkToken);
            return products.find(p => p.id === data.id)!;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    updateProduct: async (id: string, productData: Product, clerkToken?: string): Promise<Product> => {
        try {
            const client = getClient(clerkToken);
            const { error } = await client
                .from('products')
                .update({
                    brand_id: productData.brandId,
                    product_name: productData.productName,
                    model_number: productData.modelNumber,
                    quantity_available: productData.quantityAvailable,
                    arrival_date: productData.arrivalDate,
                    mrp: productData.mrp,
                    // purchase_rate removed
                    purchase_discount_percent: productData.purchaseDiscountPercent,
                    purchase_discounted_price: productData.purchaseDiscountedPrice,
                    sale_price: productData.salePrice,
                    sale_discount_percent: productData.saleDiscountPercent,
                    // sale_discount_amount removed
                    updated_at: productData.updatedAt || new Date().toISOString()
                })
                .eq('id', id);

            handleSupabaseError(error);

            const products = await productService.getProducts(undefined, clerkToken);
            return (products || []).find(p => p.id === id)!;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    deleteProduct: async (id: string, clerkToken?: string): Promise<void> => {
        try {
            const client = getClient(clerkToken);
            const { error } = await client
                .from('products')
                .delete()
                .eq('id', id);

            handleSupabaseError(error);
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },
};
