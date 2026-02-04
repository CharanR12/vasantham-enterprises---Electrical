import { getClient, handleSupabaseError } from './apiUtils';
import { SalesPerson } from '../types';

export const salesPersonService = {
    getSalesPersons: async (creatorId?: string, clerkToken?: string): Promise<SalesPerson[]> => {
        try {
            const client = getClient(clerkToken);
            let query = client
                .from('sales_persons')
                .select('*');

            if (creatorId) {
                query = query.eq('created_by', creatorId);
            }

            const { data, error } = await query
                .order('name');

            handleSupabaseError(error);

            return (data || []).map(person => ({
                id: person.id,
                name: person.name
            }));
        } catch (error) {
            console.error('Error fetching sales persons:', error);
            throw error;
        }
    },

    createSalesPerson: async (name: string, userId?: string, clerkToken?: string): Promise<SalesPerson> => {
        try {
            const client = getClient(clerkToken);
            const { data, error } = await client
                .from('sales_persons')
                .insert({
                    name: name.trim(),
                    created_by: userId
                })
                .select()
                .single();

            handleSupabaseError(error);

            return {
                id: data.id,
                name: data.name
            };
        } catch (error) {
            console.error('Error creating sales person:', error);
            throw error;
        }
    },

    updateSalesPerson: async (id: string, name: string, clerkToken?: string): Promise<SalesPerson> => {
        try {
            const client = getClient(clerkToken);
            const { data, error } = await client
                .from('sales_persons')
                .update({ name: name.trim() })
                .eq('id', id)
                .select()
                .single();

            handleSupabaseError(error);

            return {
                id: data.id,
                name: data.name
            };
        } catch (error) {
            console.error('Error updating sales person:', error);
            throw error;
        }
    },

    deleteSalesPerson: async (id: string, clerkToken?: string): Promise<void> => {
        try {
            const client = getClient(clerkToken);
            const { error } = await client
                .from('sales_persons')
                .delete()
                .eq('id', id);

            handleSupabaseError(error);
        } catch (error) {
            console.error('Error deleting sales person:', error);
            throw error;
        }
    },
};
