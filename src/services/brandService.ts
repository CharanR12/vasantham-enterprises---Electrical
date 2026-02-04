import { getClient, handleSupabaseError } from './apiUtils';
import { Brand } from '../types/inventory';

export const brandService = {
    getBrands: async (creatorId?: string, clerkToken?: string): Promise<Brand[]> => {
        try {
            const client = getClient(clerkToken);
            let query = client
                .from('brands')
                .select('*');

            if (creatorId) {
                query = query.eq('created_by', creatorId);
            }

            const { data, error } = await query
                .order('name');

            handleSupabaseError(error);

            return (data || []).map(brand => ({
                id: brand.id,
                name: brand.name,
                createdAt: brand.created_at.split('T')[0]
            }));
        } catch (error) {
            console.error('Error fetching brands:', error);
            throw error;
        }
    },

    createBrand: async (name: string, userId?: string, clerkToken?: string): Promise<Brand> => {
        try {
            const client = getClient(clerkToken);
            const { data, error } = await client
                .from('brands')
                .insert({
                    name: name.trim(),
                    created_by: userId
                })
                .select()
                .single();

            handleSupabaseError(error);

            return {
                id: data.id,
                name: data.name,
                createdAt: data.created_at.split('T')[0]
            };
        } catch (error) {
            console.error('Error creating brand:', error);
            throw error;
        }
    },

    updateBrand: async (id: string, name: string, clerkToken?: string): Promise<Brand> => {
        try {
            const client = getClient(clerkToken);
            const { data, error } = await client
                .from('brands')
                .update({ name: name.trim() })
                .eq('id', id)
                .select()
                .single();

            handleSupabaseError(error);

            return {
                id: data.id,
                name: data.name,
                createdAt: data.created_at.split('T')[0]
            };
        } catch (error) {
            console.error('Error updating brand:', error);
            throw error;
        }
    },

    deleteBrand: async (id: string, clerkToken?: string): Promise<void> => {
        try {
            const client = getClient(clerkToken);
            const { error } = await client
                .from('brands')
                .delete()
                .eq('id', id);

            handleSupabaseError(error);
        } catch (error) {
            console.error('Error deleting brand:', error);
            throw error;
        }
    },
};
