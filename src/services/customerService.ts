import { getClient, handleSupabaseError } from './apiUtils';
import { Customer, FollowUp, FollowUpStatus, ReferralSource } from '../types';

export const customerService = {
    getCustomers: async (branch: string, clerkToken?: string): Promise<Customer[]> => {
        try {
            const client = getClient(clerkToken);
            let query = client
                .from('customers')
                .select(`
          *,
          sales_person:sales_persons(id, name),
          follow_ups(*)
        `)
                .eq('branch', branch);

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
                    amountReceived: fu.amount_received,
                    billNo: fu.bill_no || '',
                    billAmount: fu.bill_amount ? parseFloat(fu.bill_amount) : undefined,
                    amountGiven: fu.amount_given ? parseFloat(fu.amount_given) : undefined,
                    balanceAmount: fu.balance_amount ? parseFloat(fu.balance_amount) : undefined
                })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                createdAt: customer.created_at.split('T')[0],
                branch: customer.branch
            }));
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    },

    createCustomer: async (customerData: Omit<Customer, 'id' | 'createdAt'>, branch: string, userId?: string, clerkToken?: string): Promise<Customer> => {
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
                    created_by: userId,
                    branch: branch
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
                    sales_amount: fu.salesAmount || fu.billAmount || 0,
                    amount_received: fu.amountReceived || false,
                    bill_no: fu.billNo || null,
                    bill_amount: fu.billAmount || 0,
                    amount_given: fu.amountGiven || 0,
                    balance_amount: fu.balanceAmount || 0,
                    created_by: userId
                }));

                const { error: followUpsError } = await client
                    .from('follow_ups')
                    .insert(followUpsToInsert);

                handleSupabaseError(followUpsError);
            }

            const customers = await customerService.getCustomers(branch, clerkToken);
            return customers.find(c => c.id === customer.id)!;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    },

    updateCustomer: async (id: string, customerData: Customer, branch: string, clerkToken?: string): Promise<Customer> => {
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
                    sales_amount: fu.salesAmount || fu.billAmount || 0,
                    amount_received: fu.amountReceived || false,
                    bill_no: fu.billNo || null,
                    bill_amount: fu.billAmount || 0,
                    amount_given: fu.amountGiven || 0,
                    balance_amount: fu.balanceAmount || 0
                }));

                const { error: followUpsError } = await client
                    .from('follow_ups')
                    .insert(followUpsToInsert);

                handleSupabaseError(followUpsError);
            }

            const customers = await customerService.getCustomers(branch, clerkToken);
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

    updateFollowUpStatus: async (
        customerId: string, 
        followUpId: string, 
        status: FollowUpStatus, 
        salesAmount?: number, 
        billNo?: string,
        billAmount?: number,
        amountGiven?: number,
        balanceAmount?: number,
        clerkToken?: string
    ): Promise<FollowUp> => {
        try {
            const client = getClient(clerkToken);
            const updateData: any = { status };
            if (status === 'Sales completed') {
                updateData.sales_amount = billAmount || salesAmount || 0;
                updateData.bill_no = billNo || null;
                updateData.bill_amount = billAmount || salesAmount || 0;
                updateData.amount_given = amountGiven || salesAmount || 0;
                const calculatedBalance = (billAmount !== undefined && amountGiven !== undefined)
                    ? (billAmount - amountGiven)
                    : 0;
                updateData.balance_amount = balanceAmount !== undefined ? balanceAmount : calculatedBalance;
                updateData.amount_received = updateData.balance_amount <= 0;
            } else {
                updateData.sales_amount = 0;
                updateData.bill_no = null;
                updateData.bill_amount = 0;
                updateData.amount_given = 0;
                updateData.balance_amount = 0;
                updateData.amount_received = false;
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
                amountReceived: data.amount_received,
                billNo: data.bill_no || '',
                billAmount: data.bill_amount ? parseFloat(data.bill_amount) : undefined,
                amountGiven: data.amount_given ? parseFloat(data.amount_given) : undefined,
                balanceAmount: data.balance_amount ? parseFloat(data.balance_amount) : undefined
            };
        } catch (error) {
            console.error('Error updating follow-up status:', error);
            throw error;
        }
    },

    addFollowUp: async (customerId: string, followUp: Omit<FollowUp, 'id'>, userId?: string, clerkToken?: string): Promise<FollowUp> => {
        try {
            const client = getClient(clerkToken);

            let balance = followUp.balanceAmount;
            let received = followUp.amountReceived;
            if (followUp.status === 'Sales completed') {
                const billAmt = followUp.billAmount || followUp.salesAmount || 0;
                const amtGiven = followUp.amountGiven || followUp.salesAmount || 0;
                balance = billAmt - amtGiven;
                received = balance <= 0;
            }

            const { data, error } = await client
                .from('follow_ups')
                .insert({
                    customer_id: customerId,
                    date: followUp.date,
                    status: followUp.status,
                    remarks: followUp.remarks,
                    sales_amount: followUp.salesAmount || followUp.billAmount || 0,
                    amount_received: received || false,
                    bill_no: followUp.billNo || null,
                    bill_amount: followUp.billAmount || 0,
                    amount_given: followUp.amountGiven || 0,
                    balance_amount: balance !== undefined ? balance : 0,
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
                amountReceived: data.amount_received,
                billNo: data.bill_no || '',
                billAmount: data.bill_amount ? parseFloat(data.bill_amount) : undefined,
                amountGiven: data.amount_given ? parseFloat(data.amount_given) : undefined,
                balanceAmount: data.balance_amount ? parseFloat(data.balance_amount) : undefined
            };
        } catch (error) {
            console.error('Error adding follow-up:', error);
            throw error;
        }
    },
};
