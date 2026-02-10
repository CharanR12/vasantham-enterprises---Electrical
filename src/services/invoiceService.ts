import { getClient } from './apiUtils';
import { Invoice, InvoiceItem } from '../types/inventory';
import { handleSupabaseError } from './apiUtils';

export const invoiceService = {
    // Fetch all invoices
    getAll: async (token?: string): Promise<Invoice[]> => {
        try {
            const client = getClient(token);
            const { data: invoices, error } = await client
                .from('invoices')
                .select(`
                *,
                items:invoice_items(*)
            `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map database fields to frontend types
            return (invoices || []).map((invoice: any) => ({
                id: invoice.id,
                invoiceNumber: invoice.invoice_number,
                customerName: invoice.customer_name,
                companyName: invoice.company_name,
                totalAmount: invoice.total_amount,
                status: invoice.status || 'Unpaid',
                createdAt: invoice.created_at,
                items: (invoice.items || []).map((item: any) => ({
                    id: item.id,
                    invoiceId: item.invoice_id,
                    productId: item.product_id,
                    productName: item.product_name,
                    modelNumber: item.model_number,
                    brandName: item.brand_name,
                    mrp: item.mrp,
                    salePrice: item.sale_price,
                    discount: item.discount || 0,

                    // purchaseRate: item.purchase_rate || 0, // Removed
                    purchaseDiscountPercent: item.purchase_discount_percent || 0,
                    purchaseDiscountedPrice: item.purchase_discounted_price || 0,
                    saleDiscountPercent: item.sale_discount_percent || 0,
                    saleDiscountAmount: item.sale_discount_amount || 0,
                    quantity: item.quantity,
                    lineTotal: item.line_total,
                    sortOrder: item.sort_order,
                    createdAt: item.created_at
                })).sort((a: InvoiceItem, b: InvoiceItem) => a.sortOrder - b.sortOrder)
            }));
        } catch (error) {
            handleSupabaseError(error);
            throw error;
        }
    },

    // Get next invoice number
    getNextInvoiceNumber: async (token?: string): Promise<string> => {
        try {
            const client = getClient(token);
            const { data, error } = await client
                .from('invoices')
                .select('invoice_number')
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (!data || data.length === 0) {
                return 'QTN-0001';
            }

            const lastNumber = data[0].invoice_number;
            // Extract number part: INV-0001 -> 0001
            const match = lastNumber.match(/(?:INV|QTN)-(\d+)/);
            if (match && match[1]) {
                const nextNum = parseInt(match[1]) + 1;
                return `QTN-${nextNum.toString().padStart(4, '0')}`;
            }

            return 'QTN-0001';
        } catch (error) {
            console.error('Error fetching next invoice number:', error);
            return `QTN-${Date.now().toString().slice(-4)}`; // Fallback
        }
    },

    // Create new invoice
    create: async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'items'> & { items: Omit<InvoiceItem, 'id' | 'invoiceId' | 'createdAt'>[] }, token?: string): Promise<Invoice> => {
        try {
            const client = getClient(token);
            // 1. Create invoice header
            const { data: newInvoice, error: invoiceError } = await client
                .from('invoices')
                .insert([{
                    invoice_number: invoice.invoiceNumber,
                    customer_name: invoice.customerName || null,
                    company_name: invoice.companyName || null,
                    total_amount: invoice.totalAmount,
                    status: invoice.status || 'Unpaid'
                }])
                .select()
                .single();

            if (invoiceError) throw invoiceError;

            // 2. Create invoice items
            const invoiceItems = invoice.items.map((item, index) => ({
                invoice_id: newInvoice.id,
                product_id: item.productId,
                product_name: item.productName,
                model_number: item.modelNumber,
                brand_name: item.brandName,
                mrp: item.mrp,
                sale_price: item.salePrice,
                discount: item.discount, // Manual discount
                // Snapshot fields
                // purchase_rate: item.purchaseRate, // Removed
                purchase_discount_percent: item.purchaseDiscountPercent,
                purchase_discounted_price: item.purchaseDiscountedPrice,
                sale_discount_percent: item.saleDiscountPercent,
                sale_discount_amount: item.saleDiscountAmount,
                quantity: item.quantity,
                line_total: item.lineTotal,
                sort_order: index
            }));

            const { error: itemsError } = await client
                .from('invoice_items')
                .insert(invoiceItems);

            if (itemsError) {
                await client.from('invoices').delete().eq('id', newInvoice.id);
                throw itemsError;
            }

            // 3. Update stock if status is Paid
            if (invoice.status === 'Paid') {
                await invoiceService.updateStock(invoice.items, 'deduct', token);
            }

            // Return Fetch the complete invoice to return standard format
            const { data: completeInvoice, error: fetchError } = await client
                .from('invoices')
                .select(`
                *,
                items:invoice_items(*)
            `)
                .eq('id', newInvoice.id)
                .single();

            if (fetchError) throw fetchError;

            return {
                id: completeInvoice.id,
                invoiceNumber: completeInvoice.invoice_number,
                customerName: completeInvoice.customer_name,
                companyName: completeInvoice.company_name,
                totalAmount: completeInvoice.total_amount,
                status: completeInvoice.status,
                createdAt: completeInvoice.created_at,
                items: (completeInvoice.items || []).map((item: any) => ({
                    id: item.id,
                    invoiceId: item.invoice_id,
                    productId: item.product_id,
                    productName: item.product_name,
                    modelNumber: item.model_number,
                    brandName: item.brand_name,
                    mrp: item.mrp,
                    salePrice: item.sale_price,
                    discount: item.discount || 0,
                    purchaseRate: item.purchase_rate || 0,
                    purchaseDiscountPercent: item.purchase_discount_percent || 0,
                    purchaseDiscountedPrice: item.purchase_discounted_price || 0,
                    saleDiscountPercent: item.sale_discount_percent || 0,
                    saleDiscountAmount: item.sale_discount_amount || 0,
                    quantity: item.quantity,
                    lineTotal: item.line_total,
                    sortOrder: item.sort_order,
                    createdAt: item.created_at
                })).sort((a: InvoiceItem, b: InvoiceItem) => a.sortOrder - b.sortOrder)
            };

        } catch (error) {
            handleSupabaseError(error);
            throw error;
        }
    },

    // Update existing invoice
    update: async (id: string, invoice: Omit<Partial<Invoice>, 'items'> & { items?: Omit<InvoiceItem, 'id' | 'invoiceId' | 'createdAt'>[] }, token?: string): Promise<Invoice> => {
        try {
            const client = getClient(token);

            // Fetch original invoice to handle stock restoration if needed
            const { data: originalInvoice, error: fetchOriginalError } = await client
                .from('invoices')
                .select(`*, items:invoice_items(*)`)
                .eq('id', id)
                .single();

            if (fetchOriginalError) throw fetchOriginalError;

            // 1. Restore stock if original was Paid
            if (originalInvoice.status === 'Paid') {
                const originalItems = originalInvoice.items.map((item: any) => ({
                    productId: item.product_id,
                    quantity: item.quantity
                }));
                await invoiceService.updateStock(originalItems, 'restore', token);
            }

            // 2. Update invoice header if needed
            if (invoice.customerName !== undefined || invoice.companyName !== undefined || invoice.totalAmount !== undefined || invoice.status !== undefined) {
                const { error: updateError } = await client
                    .from('invoices')
                    .update({
                        customer_name: invoice.customerName,
                        company_name: invoice.companyName,
                        total_amount: invoice.totalAmount,
                        status: invoice.status
                    })
                    .eq('id', id);

                if (updateError) throw updateError;
            }

            // 3. Update items if provided (Full replacement strategy)
            if (invoice.items) {
                // Delete existing items
                const { error: deleteError } = await client
                    .from('invoice_items')
                    .delete()
                    .eq('invoice_id', id);

                if (deleteError) throw deleteError;

                // Insert new/updated items
                const invoiceItems = invoice.items.map((item, index) => ({
                    invoice_id: id,
                    product_id: item.productId,
                    product_name: item.productName,
                    model_number: item.modelNumber,
                    brand_name: item.brandName,
                    mrp: item.mrp,
                    sale_price: item.salePrice,
                    discount: item.discount || 0,
                    // Snapshot fields (re-save them)
                    // purchase_rate: item.purchaseRate, // Removed
                    purchase_discount_percent: item.purchaseDiscountPercent,
                    purchase_discounted_price: item.purchaseDiscountedPrice,
                    sale_discount_percent: item.saleDiscountPercent,
                    sale_discount_amount: item.saleDiscountAmount,
                    quantity: item.quantity,
                    line_total: item.lineTotal,
                    sort_order: index
                }));

                const { error: insertError } = await client
                    .from('invoice_items')
                    .insert(invoiceItems);

                if (insertError) throw insertError;
            }

            // 4. Deduct stock if new status is Paid
            // Use the new status if provided, otherwise use original status
            const newStatus = invoice.status !== undefined ? invoice.status : originalInvoice.status;

            if (newStatus === 'Paid') {
                // If items were updated, use new items. Otherwise use original items.
                const itemsToDeduct = invoice.items ? invoice.items : originalInvoice.items.map((item: any) => ({
                    productId: item.product_id,
                    quantity: item.quantity
                }));
                await invoiceService.updateStock(itemsToDeduct, 'deduct', token);
            }

            // Return updated invoice
            const { data: completeInvoice, error: fetchError } = await client
                .from('invoices')
                .select(`
                *,
                items:invoice_items(*)
            `)
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            return {
                id: completeInvoice.id,
                invoiceNumber: completeInvoice.invoice_number,
                customerName: completeInvoice.customer_name,
                companyName: completeInvoice.company_name,
                totalAmount: completeInvoice.total_amount,
                status: completeInvoice.status,
                createdAt: completeInvoice.created_at,
                items: (completeInvoice.items || []).map((item: any) => ({
                    id: item.id,
                    invoiceId: item.invoice_id,
                    productId: item.product_id,
                    productName: item.product_name,
                    modelNumber: item.model_number,
                    brandName: item.brand_name,
                    mrp: item.mrp,
                    salePrice: item.sale_price,
                    discount: item.discount || 0,
                    purchaseRate: item.purchase_rate || 0,
                    purchaseDiscountPercent: item.purchase_discount_percent || 0,
                    purchaseDiscountedPrice: item.purchase_discounted_price || 0,
                    saleDiscountPercent: item.sale_discount_percent || 0,
                    saleDiscountAmount: item.sale_discount_amount || 0,
                    quantity: item.quantity,
                    lineTotal: item.line_total,
                    sortOrder: item.sort_order,
                    createdAt: item.created_at
                })).sort((a: InvoiceItem, b: InvoiceItem) => a.sortOrder - b.sortOrder)
            };

        } catch (error) {
            handleSupabaseError(error);
            throw error;
        }
    },

    // Delete invoice
    delete: async (id: string, token?: string): Promise<void> => {
        try {
            const client = getClient(token);

            // Fetch invoice to check status before deleting
            const { data: invoice, error: fetchError } = await client
                .from('invoices')
                .select(`*, items:invoice_items(*)`)
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // Restore stock if it was Paid
            if (invoice.status === 'Paid') {
                const itemsToRestore = invoice.items.map((item: any) => ({
                    productId: item.product_id,
                    quantity: item.quantity
                }));
                await invoiceService.updateStock(itemsToRestore, 'restore', token);
            }

            const { error } = await client
                .from('invoices')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            handleSupabaseError(error);
            throw error;
        }
    },

    // Helper to update stock
    updateStock: async (items: { productId: string; quantity: number }[], direction: 'deduct' | 'restore', token?: string) => {
        const client = getClient(token);

        // This should ideally be a database function to handle concurrency better,
        // but for now we'll do iterative updates.
        await Promise.all(items.map(async (item) => {
            // Get current stock first to ensure safety (optional but good practice)
            // Or use SQL increment/decrement if possible.
            // Supabase/Postgres doesn't support 'increment' in simple update without raw SQL or function.
            // We will fetching current stock and updating.

            const { data: product, error: fetchError } = await client
                .from('products')
                .select('quantity_available')
                .eq('id', item.productId)
                .single();

            if (fetchError) {
                console.error(`Failed to fetch product ${item.productId} for stock update`);
                return;
            }

            const newQuantity = direction === 'deduct'
                ? product.quantity_available - item.quantity
                : product.quantity_available + item.quantity;

            const { error: updateError } = await client
                .from('products')
                .update({ quantity_available: newQuantity })
                .eq('id', item.productId);

            if (updateError) {
                console.error(`Failed to update stock for product ${item.productId}`, updateError);
                throw updateError;
            }
        }));
    }
};
