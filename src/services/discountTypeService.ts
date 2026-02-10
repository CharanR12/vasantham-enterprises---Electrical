import { supabase } from '../lib/supabase';
import { DiscountType } from '../types/inventory';

export const discountTypeService = {
    async getDiscountTypes(token?: string): Promise<DiscountType[]> {
        const { data, error } = await supabase
            .from('discount_types')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data.map(dt => ({
            id: dt.id,
            name: dt.name,
            isActive: dt.is_active,
            createdAt: dt.created_at
        }));
    },

    async createDiscountType(name: string, userId?: string, token?: string): Promise<DiscountType> {
        const { data, error } = await supabase
            .from('discount_types')
            .insert([{ name, is_active: true }])
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            isActive: data.is_active,
            createdAt: data.created_at
        };
    },

    async updateDiscountType(id: string, name: string, token?: string): Promise<DiscountType> {
        const { data, error } = await supabase
            .from('discount_types')
            .update({ name })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            isActive: data.is_active,
            createdAt: data.created_at
        };
    },

    async deleteDiscountType(id: string, token?: string): Promise<void> {
        // Soft delete by setting is_active to false
        const { error } = await supabase
            .from('discount_types')
            .update({ is_active: false })
            .eq('id', id);

        if (error) throw error;
    }
};
