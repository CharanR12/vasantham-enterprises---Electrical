import { getClient, handleSupabaseError } from './apiUtils';
import { Category } from '../types/inventory';

export const categoryService = {
    getCategories: async (brandId?: string, clerkToken?: string): Promise<Category[]> => {
        try {
            const client = getClient(clerkToken);
            let query = client
                .from('categories')
                .select('*');

            if (brandId) {
                query = query.eq('brand_id', brandId);
            }

            const { data, error } = await query.order('name');

            handleSupabaseError(error);

            return (data || []).map(category => ({
                id: category.id,
                brandId: category.brand_id,
                name: category.name,
                createdAt: category.created_at
            }));
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    createCategory: async (name: string, brandId: string, userId?: string, clerkToken?: string): Promise<Category> => {
        try {
            const client = getClient(clerkToken);
            const { data, error } = await client
                .from('categories')
                .insert({
                    name: name.trim(),
                    brand_id: brandId,
                    created_by: userId
                })
                .select()
                .single();

            handleSupabaseError(error);

            return {
                id: data.id,
                brandId: data.brand_id,
                name: data.name,
                createdAt: data.created_at
            };
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },

    updateCategory: async (id: string, name: string, clerkToken?: string): Promise<Category> => {
        try {
            const client = getClient(clerkToken);
            const { data, error } = await client
                .from('categories')
                .update({ name: name.trim() })
                .eq('id', id)
                .select()
                .single();

            handleSupabaseError(error);

            return {
                id: data.id,
                brandId: data.brand_id,
                name: data.name,
                createdAt: data.created_at
            };
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    },

    deleteCategory: async (id: string, clerkToken?: string): Promise<void> => {
        try {
            const client = getClient(clerkToken);
            const { error } = await client
                .from('categories')
                .delete()
                .eq('id', id);

            handleSupabaseError(error);
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    },
};
