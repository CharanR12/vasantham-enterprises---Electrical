import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { referralSourceService } from '../../services/referralSourceService';
import { useUserRole } from '../useUserRole';

export const referralSourceKeys = {
    all: ['referralSources'] as const,
    lists: () => [...referralSourceKeys.all, 'list'] as const,
    list: (filterId?: string) => [...referralSourceKeys.lists(), { filterId }] as const,
};

export const useReferralSourcesQuery = () => {
    const { getToken } = useAuth();

    // filterId removed

    return useQuery({
        queryKey: referralSourceKeys.list(undefined),
        queryFn: async () => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return referralSourceService.getReferralSources(token);
        },
    });
};

export const useAddReferralSourceMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();
    const { user } = useUserRole();

    return useMutation({
        mutationFn: async (name: string) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return referralSourceService.createReferralSource(name, user?.id, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: referralSourceKeys.all });
        },
    });
};

export const useUpdateReferralSourceMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async ({ id, name }: { id: string, name: string }) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return referralSourceService.updateReferralSource(id, name, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: referralSourceKeys.all });
        },
    });
};

export const useDeleteReferralSourceMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return referralSourceService.deleteReferralSource(id, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: referralSourceKeys.all });
        },
    });
};
