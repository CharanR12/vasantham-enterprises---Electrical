import { getClient, handleSupabaseError } from './apiUtils';
import { Customer, FollowUp, FollowUpStatus, ReferralSource } from '../types';

export const customerService = {
    getCustomers: async (creatorId?: string, clerkToken?: string): Promise<Customer[]> => {
        try {
            const client = getClient(clerkToken);
            let query = client
                .from('customers')
                .select(`
          *,
          sales_person:sales_persons(id, name),
          follow_ups(*)
        `);

            if (creatorId) {
                query = query.eq('created_by', creatorId);
            }

            const { data: customersData, error: customersError } = await query
                .order('created_at', { ascending: false });

            handleSupabaseError(customersError);

            return (customersData || []).map(customer => ({
                id: customer.id,
                name: customer.name,
                mobile: customer.mobile,
                location: customer.location,
                referralSource: customer.referral_source as ReferralSource,
                salesPerson: customer.sales_person || { id: '', name: 'Unknown' },
                remarks: customer.remarks || '',
                lastContactedDate: customer.last_contacted_date || undefined,
                followUps: (customer.follow_ups || []).map((fu: any) => ({
                    id: fu.id,
                    date: fu.date,
                    status: fu.status as FollowUpStatus,
                    remarks: fu.remarks || '',
                    salesAmount: fu.sales_amount ? parseFloat(fu.sales_amount) : undefined,
                    amountReceived: fu.amount_received
                })),
                createdAt: customer.created_at.split('T')[0]
            }));
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    },

    createCustomer: async (customerData: Omit<Customer, 'id' | 'createdAt'>, userId?: string, clerkToken?: string): Promise<Customer> => {
        try {
            const client = getClient(clerkToken);
            const { data: customer, error: customerError } = await client
                .from('customers')
                .insert({
                    name: customerData.name,
                    mobile: customerData.mobile,
                    location: customerData.location,
                    referral_source: customerData.referralSource,
                    sales_person_id: customerData.salesPerson.id,
                    remarks: customerData.remarks,
                    last_contacted_date: customerData.lastContactedDate || null,
                    created_by: userId
                })
                .select()
                .single();

            handleSupabaseError(customerError);

            if (customerData.followUps && customerData.followUps.length > 0) {
                const followUpsToInsert = customerData.followUps.map(fu => ({
                    customer_id: customer.id,
                    date: fu.date,
                    status: fu.status,
                    remarks: fu.remarks,
                    sales_amount: fu.salesAmount || 0,
                    amount_received: fu.amountReceived || false,
                    created_by: userId
                }));

                const { error: followUpsError } = await client
                    .from('follow_ups')
                    .insert(followUpsToInsert);

                handleSupabaseError(followUpsError);
            }

            const customers = await customerService.getCustomers(undefined, clerkToken);
            return customers.find(c => c.id === customer.id)!;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    },

    updateCustomer: async (id: string, customerData: Customer, clerkToken?: string): Promise<Customer> => {
        try {
            const client = getClient(clerkToken);
            const { error: customerError } = await client
                .from('customers')
                .update({
                    name: customerData.name,
                    mobile: customerData.mobile,
                    location: customerData.location,
                    referral_source: customerData.referralSource,
                    sales_person_id: customerData.salesPerson.id,
                    remarks: customerData.remarks,
                    last_contacted_date: customerData.lastContactedDate || null
                })
                .eq('id', id);

            handleSupabaseError(customerError);

            const { error: deleteError } = await client
                .from('follow_ups')
                .delete()
                .eq('customer_id', id);

            handleSupabaseError(deleteError);

            if (customerData.followUps && customerData.followUps.length > 0) {
                const followUpsToInsert = customerData.followUps.map(fu => ({
                    customer_id: id,
                    date: fu.date,
                    status: fu.status,
                    remarks: fu.remarks,
                    sales_amount: fu.salesAmount || 0,
                    amount_received: fu.amountReceived || false
                }));

                const { error: followUpsError } = await client
                    .from('follow_ups')
                    .insert(followUpsToInsert);

                handleSupabaseError(followUpsError);
            }

            const customers = await customerService.getCustomers(undefined, clerkToken);
            return customers.find(c => c.id === id)!;
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    },

    deleteCustomer: async (id: string, clerkToken?: string): Promise<void> => {
        try {
            const client = getClient(clerkToken);
            const { error } = await client
                .from('customers')
                .delete()
                .eq('id', id);

            handleSupabaseError(error);
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    },

    updateFollowUpStatus: async (customerId: string, followUpId: string, status: FollowUpStatus, salesAmount?: number, clerkToken?: string): Promise<FollowUp> => {
        try {
            const client = getClient(clerkToken);
            const updateData: any = { status };
            if (status === 'Sales completed' && salesAmount !== undefined) {
                updateData.sales_amount = salesAmount;
            } else if (status !== 'Sales completed') {
                updateData.sales_amount = 0;
            }

            const { data, error } = await client
                .from('follow_ups')
                .update(updateData)
                .eq('id', followUpId)
                .eq('customer_id', customerId)
                .select()
                .single();

            handleSupabaseError(error);

            return {
                id: data.id,
                date: data.date,
                status: data.status as FollowUpStatus,
                remarks: data.remarks || '',
                salesAmount: data.sales_amount ? parseFloat(data.sales_amount) : undefined,
                amountReceived: data.amount_received
            };
        } catch (error) {
            console.error('Error updating follow-up status:', error);
            throw error;
        }
    },

    addFollowUp: async (customerId: string, followUp: Omit<FollowUp, 'id'>, userId?: string, clerkToken?: string): Promise<FollowUp> => {
        try {
            const client = getClient(clerkToken);
            const { data, error } = await client
                .from('follow_ups')
                .insert({
                    customer_id: customerId,
                    date: followUp.date,
                    status: followUp.status,
                    remarks: followUp.remarks,
                    sales_amount: followUp.salesAmount || 0,
                    amount_received: followUp.amountReceived || false,
                    created_by: userId
                })
                .select()
                .single();

            handleSupabaseError(error);

            return {
                id: data.id,
                date: data.date,
                status: data.status as FollowUpStatus,
                remarks: data.remarks || '',
                salesAmount: data.sales_amount ? parseFloat(data.sales_amount) : undefined,
                amountReceived: data.amount_received
            };
        } catch (error) {
            console.error('Error adding follow-up:', error);
            throw error;
        }
    },
};
