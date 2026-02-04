import { getClient, handleSupabaseError, ApiError } from './apiUtils';
import { SaleEntry } from '../types/inventory';

export const saleEntryService = {
    getSaleEntries: async (creatorId?: string, clerkToken?: string): Promise<SaleEntry[]> => {
        try {
            const client = getClient(clerkToken);
            let query = client
                .from('sale_entries')
                .select('*');

            if (creatorId) {
                query = query.eq('created_by', creatorId);
            }

            const { data, error } = await query
                .order('sale_date', { ascending: false });

            handleSupabaseError(error);

            return (data || []).map(entry => ({
                id: entry.id,
                productId: entry.product_id,
                saleDate: entry.sale_date,
                customerName: entry.customer_name,
                billNumber: entry.bill_number || undefined,
                quantitySold: entry.quantity_sold,
                createdAt: entry.created_at.split('T')[0]
            }));
        } catch (error) {
            console.error('Error fetching sale entries:', error);
            throw error;
        }
    },

    createSaleEntry: async (saleData: Omit<SaleEntry, 'id' | 'createdAt'>, userId?: string, clerkToken?: string): Promise<SaleEntry> => {
        try {
            const client = getClient(clerkToken);
            const { data: product, error: productError } = await client
                .from('products')
                .select('quantity_available')
                .eq('id', saleData.productId)
                .single();

            handleSupabaseError(productError);

            if (!product || product.quantity_available < saleData.quantitySold) {
                throw new ApiError(400, 'Insufficient quantity available or product not found');
            }

            const { data, error } = await client
                .from('sale_entries')
                .insert({
                    product_id: saleData.productId,
                    sale_date: saleData.saleDate,
                    customer_name: saleData.customerName,
                    bill_number: saleData.billNumber || null,
                    quantity_sold: saleData.quantitySold,
                    created_by: userId
                })
                .select()
                .single();

            handleSupabaseError(error);

            const { error: updateError } = await client
                .from('products')
                .update({
                    quantity_available: product.quantity_available - saleData.quantitySold
                })
                .eq('id', saleData.productId);

            handleSupabaseError(updateError);

            return {
                id: data.id,
                productId: data.product_id,
                saleDate: data.sale_date,
                customerName: data.customer_name,
                billNumber: data.bill_number || undefined,
                quantitySold: data.quantity_sold,
                createdAt: data.created_at.split('T')[0]
            };
        } catch (error) {
            console.error('Error creating sale entry:', error);
            throw error;
        }
    }
};
