import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { customerService } from '../../services/customerService';
import { salesPersonService } from '../../services/salesPersonService';
import { useUserRole } from '../useUserRole';
import { Customer, FollowUpStatus, FollowUp } from '../../types';

export const customerKeys = {
    all: ['customers'] as const,
    lists: () => [...customerKeys.all, 'list'] as const,
    list: (filterId?: string) => [...customerKeys.lists(), { filterId }] as const,
};

export const salesPersonKeys = {
    all: ['salesPersons'] as const,
    lists: () => [...salesPersonKeys.all, 'list'] as const,
    list: (filterId?: string) => [...salesPersonKeys.lists(), { filterId }] as const,
};

export const useCustomersQuery = () => {
    const { getToken } = useAuth();
    const { filterId } = useUserRole();

    return useQuery({
        queryKey: customerKeys.list(filterId),
        queryFn: async () => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return customerService.getCustomers(filterId, token);
        },
    });
};

export const useSalesPersonsQuery = () => {
    const { getToken } = useAuth();
    const { filterId } = useUserRole();

    return useQuery({
        queryKey: salesPersonKeys.list(filterId),
        queryFn: async () => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return salesPersonService.getSalesPersons(filterId, token);
        },
    });
};

export const useAddCustomerMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();
    const { user } = useUserRole();

    return useMutation({
        mutationFn: async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return customerService.createCustomer(customerData, user?.id, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.all });
        },
    });
};

export const useUpdateCustomerMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async (customer: Customer) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return customerService.updateCustomer(customer.id, customer, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.all });
        },
    });
};

export const useDeleteCustomerMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return customerService.deleteCustomer(id, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.all });
        },
    });
};

export const useUpdateFollowUpStatusMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async ({ customerId, followUpId, status, salesAmount }: { customerId: string, followUpId: string, status: FollowUpStatus, salesAmount?: number }) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return customerService.updateFollowUpStatus(customerId, followUpId, status, salesAmount, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.all });
        },
    });
};

export const useAddFollowUpMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();
    const { user } = useUserRole();

    return useMutation({
        mutationFn: async ({ customerId, followUp }: { customerId: string, followUp: Omit<FollowUp, 'id'> }) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return customerService.addFollowUp(customerId, followUp, user?.id, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.all });
        },
    });
};

export const useAddSalesPersonMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();
    const { user } = useUserRole();

    return useMutation({
        mutationFn: async (name: string) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return salesPersonService.createSalesPerson(name, user?.id, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: salesPersonKeys.all });
        },
    });
};

export const useUpdateSalesPersonMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async ({ id, name }: { id: string, name: string }) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return salesPersonService.updateSalesPerson(id, name, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: salesPersonKeys.all });
        },
    });
};

export const useDeleteSalesPersonMutation = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken({ template: 'supabase' }) || undefined;
            return salesPersonService.deleteSalesPerson(id, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: salesPersonKeys.all });
        },
    });
};
