import { getClient, handleSupabaseError } from './apiUtils';
import { Customer, FollowUp, FollowUpStatus, ReferralSource, PaymentInstallment } from '../types';

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
                followUps: (customer.follow_ups || []).map((fu: any) => {
                    const salesAmt = fu.sales_amount ? parseFloat(fu.sales_amount) : 0;
                    let billAmt = fu.bill_amount ? parseFloat(fu.bill_amount) : undefined;
                    let amtGiven = fu.amount_given ? parseFloat(fu.amount_given) : undefined;
                    let balAmt = fu.balance_amount ? parseFloat(fu.balance_amount) : undefined;
                    let insts = Array.isArray(fu.installments) ? fu.installments : [];

                    // Legacy records alignment fallback
                    if (fu.status === 'Sales completed') {
                        if (billAmt === undefined || billAmt === null || billAmt === 0) {
                            billAmt = salesAmt;
                        }
                        if (amtGiven === undefined || amtGiven === null || amtGiven === 0) {
                            if (fu.amount_received) {
                                amtGiven = billAmt;
                            } else if (balAmt !== undefined && balAmt !== null && balAmt !== 0) {
                                amtGiven = Math.max(0, billAmt - balAmt);
                            } else {
                                amtGiven = 0;
                            }
                        }
                        
                        // Self-correcting balance calculation to prevent any database drift
                        balAmt = billAmt - amtGiven;

                        if (insts.length === 0 && amtGiven > 0) {
                            insts = [{
                                id: 'inst-initial',
                                date: fu.date,
                                amount: amtGiven
                            }];
                        }
                    }

                    return {
                        id: fu.id,
                        date: fu.date,
                        status: fu.status as FollowUpStatus,
                        remarks: fu.remarks || '',
                        salesAmount: salesAmt || billAmt || undefined,
                        amountReceived: fu.amount_received,
                        billNo: fu.bill_no || '',
                        billAmount: billAmt,
                        amountGiven: amtGiven,
                        balanceAmount: balAmt,
                        installments: insts
                    };
                }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
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
                    installments: fu.installments || [],
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

            // Non-destructive follow-up update/insert strategy to preserve all historic IDs and metadata in Supabase
            if (customerData.followUps) {
                // Fetch existing follow-up IDs to distinguish inserts from updates
                const { data: existingList } = await client
                    .from('follow_ups')
                    .select('id')
                    .eq('customer_id', id);
                
                const existingIds = new Set((existingList || []).map(x => x.id));
                const newIds = new Set(customerData.followUps.map(x => x.id).filter(Boolean));

                // 1. Delete only the specific follow-ups that the user explicitly removed in the UI form
                const idsToDelete = [...existingIds].filter(x => !newIds.has(x));
                if (idsToDelete.length > 0) {
                    const { error: deleteError } = await client
                        .from('follow_ups')
                        .delete()
                        .in('id', idsToDelete);
                    handleSupabaseError(deleteError);
                }

                // 2. Insert or Update the remaining follow-ups
                for (const fu of customerData.followUps) {
                    const isExisting = fu.id && existingIds.has(fu.id);
                    const fuData = {
                        date: fu.date,
                        status: fu.status,
                        remarks: fu.remarks || '',
                        sales_amount: fu.salesAmount || fu.billAmount || 0,
                        amount_received: fu.amountReceived || false,
                        bill_no: fu.billNo || null,
                        bill_amount: fu.billAmount || 0,
                        amount_given: fu.amountGiven || 0,
                        balance_amount: fu.balanceAmount || 0,
                        installments: fu.installments || []
                    };

                    if (isExisting) {
                        const { error: updateError } = await client
                            .from('follow_ups')
                            .update(fuData)
                            .eq('id', fu.id);
                        handleSupabaseError(updateError);
                    } else {
                        const { error: insertError } = await client
                            .from('follow_ups')
                            .insert({
                                ...fuData,
                                customer_id: id
                            });
                        handleSupabaseError(insertError);
                    }
                }
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
        installments?: PaymentInstallment[],
        clerkToken?: string
    ): Promise<FollowUp> => {
        try {
            const client = getClient(clerkToken);
            const updateData: any = { status };
            if (status === 'Sales completed') {
                updateData.bill_no = billNo || null;
                updateData.bill_amount = billAmount || salesAmount || 0;
                
                if (installments && installments.length > 0) {
                    updateData.installments = installments;
                    const totalGiven = installments.reduce((sum, inst) => sum + inst.amount, 0);
                    updateData.amount_given = totalGiven;
                    updateData.balance_amount = updateData.bill_amount - totalGiven;
                } else {
                    updateData.amount_given = amountGiven !== undefined ? amountGiven : (salesAmount || 0);
                    updateData.balance_amount = balanceAmount !== undefined ? balanceAmount : (updateData.bill_amount - updateData.amount_given);
                    
                    if (updateData.amount_given > 0) {
                        updateData.installments = [{
                            id: 'inst-initial',
                            date: new Date().toISOString().split('T')[0],
                            amount: updateData.amount_given
                        }];
                    } else {
                        updateData.installments = [];
                    }
                }
                
                updateData.sales_amount = updateData.bill_amount;
                updateData.amount_received = updateData.balance_amount <= 0;
            } else {
                updateData.sales_amount = 0;
                updateData.bill_no = null;
                updateData.bill_amount = 0;
                updateData.amount_given = 0;
                updateData.balance_amount = 0;
                updateData.amount_received = false;
                updateData.installments = [];
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
                balanceAmount: data.balance_amount ? parseFloat(data.balance_amount) : undefined,
                installments: Array.isArray(data.installments) ? data.installments : []
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
            let finalInstallments = followUp.installments || [];
            let totalGiven = followUp.amountGiven || 0;

            if (followUp.status === 'Sales completed') {
                const billAmt = followUp.billAmount || followUp.salesAmount || 0;
                
                if (finalInstallments.length > 0) {
                    totalGiven = finalInstallments.reduce((sum, inst) => sum + inst.amount, 0);
                    balance = billAmt - totalGiven;
                } else {
                    totalGiven = followUp.amountGiven || followUp.salesAmount || 0;
                    balance = billAmt - totalGiven;
                    if (totalGiven > 0) {
                        finalInstallments = [{
                            id: 'inst-initial',
                            date: followUp.date,
                            amount: totalGiven
                        }];
                    }
                }
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
                    amount_given: totalGiven,
                    balance_amount: balance !== undefined ? balance : 0,
                    installments: finalInstallments,
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
                balanceAmount: data.balance_amount ? parseFloat(data.balance_amount) : undefined,
                installments: Array.isArray(data.installments) ? data.installments : []
            };
        } catch (error) {
            console.error('Error adding follow-up:', error);
            throw error;
        }
    },
};
