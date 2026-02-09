import { getClient, handleSupabaseError } from './apiUtils';

export interface ReferralSourceEntity {
    id: string;
    name: string;
}

export const referralSourceService = {
    getReferralSources: async (clerkToken?: string): Promise<ReferralSourceEntity[]> => {
        try {
            const client = getClient(clerkToken);
            let query = client
                .from('referral_sources')
                .select('*');



            const { data, error } = await query
                .order('name');

            handleSupabaseError(error);

            return (data || []).map(source => ({
                id: source.id,
                name: source.name
            }));
        } catch (error) {
            console.error('Error fetching referral sources:', error);
            throw error;
        }
    },

    createReferralSource: async (name: string, userId?: string, clerkToken?: string): Promise<ReferralSourceEntity> => {
        try {
            const client = getClient(clerkToken);
            const { data, error } = await client
                .from('referral_sources')
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
            console.error('Error creating referral source:', error);
            throw error;
        }
    },

    updateReferralSource: async (id: string, name: string, clerkToken?: string): Promise<ReferralSourceEntity> => {
        try {
            const client = getClient(clerkToken);
            const { data, error } = await client
                .from('referral_sources')
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
            console.error('Error updating referral source:', error);
            throw error;
        }
    },

    deleteReferralSource: async (id: string, clerkToken?: string): Promise<void> => {
        try {
            const client = getClient(clerkToken);
            const { error } = await client
                .from('referral_sources')
                .delete()
                .eq('id', id);

            handleSupabaseError(error);
        } catch (error) {
            console.error('Error deleting referral source:', error);
            throw error;
        }
    },
};
