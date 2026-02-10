import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../services/invoiceService';
import { Invoice, InvoiceItem } from '../types/inventory';
import { useAuth } from '@clerk/clerk-react';

export const useInvoices = () => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();

    const invoicesQuery = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const token = await getToken({ template: 'supabase' });
            return invoiceService.getAll(token || undefined);
        },
    });

    const createInvoiceMutation = useMutation({
        mutationFn: async (newInvoice: Omit<Invoice, 'id' | 'createdAt' | 'items'> & { items: Omit<InvoiceItem, 'id' | 'invoiceId' | 'createdAt'>[] }) => {
            const token = await getToken({ template: 'supabase' });
            return invoiceService.create(newInvoice, token || undefined);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });

    const deleteInvoiceMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken({ template: 'supabase' });
            return invoiceService.delete(id, token || undefined);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });

    const updateInvoiceMutation = useMutation({
        mutationFn: async ({ id, invoice }: { id: string; invoice: Omit<Partial<Invoice>, 'items'> & { items?: Omit<InvoiceItem, 'id' | 'invoiceId' | 'createdAt'>[] } }) => {
            const token = await getToken({ template: 'supabase' });
            return invoiceService.update(id, invoice, token || undefined);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });

    const getNextInvoiceNumber = async () => {
        const token = await getToken({ template: 'supabase' });
        return await invoiceService.getNextInvoiceNumber(token || undefined);
    };

    return {
        invoices: invoicesQuery.data || [],
        isLoading: invoicesQuery.isLoading,
        error: invoicesQuery.error,
        createInvoice: createInvoiceMutation.mutateAsync,
        isCreating: createInvoiceMutation.isPending,
        createError: createInvoiceMutation.error,
        updateInvoice: updateInvoiceMutation.mutateAsync,
        isUpdating: updateInvoiceMutation.isPending,
        updateError: updateInvoiceMutation.error,
        deleteInvoice: deleteInvoiceMutation.mutateAsync,
        isDeleting: deleteInvoiceMutation.isPending,
        deleteError: deleteInvoiceMutation.error,
        getNextInvoiceNumber
    };
};
