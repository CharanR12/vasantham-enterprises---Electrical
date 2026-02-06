import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../services/invoiceService';
import { Invoice, InvoiceItem } from '../types/inventory';

export const useInvoices = () => {
    const queryClient = useQueryClient();

    const invoicesQuery = useQuery({
        queryKey: ['invoices'],
        queryFn: invoiceService.getAll,
    });

    const createInvoiceMutation = useMutation({
        mutationFn: (newInvoice: Omit<Invoice, 'id' | 'createdAt' | 'items'> & { items: Omit<InvoiceItem, 'id' | 'invoiceId' | 'createdAt'>[] }) =>
            invoiceService.create(newInvoice),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });

    const deleteInvoiceMutation = useMutation({
        mutationFn: (id: string) => invoiceService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });

    const updateInvoiceMutation = useMutation({
        mutationFn: ({ id, invoice }: { id: string; invoice: Omit<Partial<Invoice>, 'items'> & { items?: Omit<InvoiceItem, 'id' | 'invoiceId' | 'createdAt'>[] } }) =>
            invoiceService.update(id, invoice),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });

    const getNextInvoiceNumber = async () => {
        return await invoiceService.getNextInvoiceNumber();
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
