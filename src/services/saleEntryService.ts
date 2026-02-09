import { getClient, handleSupabaseError, ApiError } from './apiUtils';
import { SaleEntry } from '../types/inventory';

export const saleEntryService = {
    getSaleEntries: async (clerkToken?: string): Promise<SaleEntry[]> => {
        try {
            const client = getClient(clerkToken);
            let query = client
                .from('sale_entries')
                .select('*');



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
    },

    deleteSaleEntry: async (id: string, clerkToken?: string): Promise<void> => {
        try {
            const client = getClient(clerkToken);

            // 1. Get the sale entry to know product and quantity
            const { data: saleEntry, error: fetchError } = await client
                .from('sale_entries')
                .select('*')
                .eq('id', id)
                .single();

            handleSupabaseError(fetchError);

            if (!saleEntry) {
                throw new Error('Sale entry not found');
            }

            // 2. Get the product to update stock
            const { data: product, error: productError } = await client
                .from('products')
                .select('quantity_available')
                .eq('id', saleEntry.product_id)
                .single();

            handleSupabaseError(productError);

            // 3. Delete the sale entry
            const { error: deleteError } = await client
                .from('sale_entries')
                .delete()
                .eq('id', id);

            handleSupabaseError(deleteError);

            // 4. Update the product stock (add back quantity)
            if (product) {
                const { error: updateError } = await client
                    .from('products')
                    .update({
                        quantity_available: product.quantity_available + saleEntry.quantity_sold
                    })
                    .eq('id', saleEntry.product_id);

                handleSupabaseError(updateError);
            }
        } catch (error) {
            console.error('Error deleting sale entry:', error);
            throw error;
        }
    }
};
