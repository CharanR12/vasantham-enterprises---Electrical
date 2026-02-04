import { supabase } from '../lib/supabase';
import { Customer, SalesPerson, FollowUp, FollowUpStatus, ReferralSource } from '../types';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleSupabaseError = (error: any) => {
  if (error) {
    console.error('Supabase error:', error);
    throw new ApiError(400, error.message || 'An error occurred');
  }
};

export const api = {
  // Customer endpoints
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          *,
          sales_person:sales_persons(id, name),
          follow_ups(*)
        `)
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
  
  createCustomer: async (customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
    try {
      // First, create the customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: customerData.name,
          mobile: customerData.mobile,
          location: customerData.location,
          referral_source: customerData.referralSource,
          sales_person_id: customerData.salesPerson.id,
          remarks: customerData.remarks,
          last_contacted_date: customerData.lastContactedDate || null
        })
        .select()
        .single();

      handleSupabaseError(customerError);

      // Then, create the follow-ups
      if (customerData.followUps && customerData.followUps.length > 0) {
        const followUpsToInsert = customerData.followUps.map(fu => ({
          customer_id: customer.id,
          date: fu.date,
          status: fu.status,
          remarks: fu.remarks,
          sales_amount: fu.salesAmount || 0,
          amount_received: fu.amountReceived || false
        }));

        const { error: followUpsError } = await supabase
          .from('follow_ups')
          .insert(followUpsToInsert);

        handleSupabaseError(followUpsError);
      }

      // Return the created customer with follow-ups
      const customers = await api.getCustomers();
      return customers.find(c => c.id === customer.id)!;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  updateCustomer: async (id: string, customerData: Customer): Promise<Customer> => {
    try {
      // Update customer
      const { error: customerError } = await supabase
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

      // Delete existing follow-ups and recreate them
      const { error: deleteError } = await supabase
        .from('follow_ups')
        .delete()
        .eq('customer_id', id);

      handleSupabaseError(deleteError);

      // Insert updated follow-ups
      if (customerData.followUps && customerData.followUps.length > 0) {
        const followUpsToInsert = customerData.followUps.map(fu => ({
          customer_id: id,
          date: fu.date,
          status: fu.status,
          remarks: fu.remarks,
          sales_amount: fu.salesAmount || 0,
          amount_received: fu.amountReceived || false
        }));

        const { error: followUpsError } = await supabase
          .from('follow_ups')
          .insert(followUpsToInsert);

        handleSupabaseError(followUpsError);
      }

      // Return the updated customer
      const customers = await api.getCustomers();
      return customers.find(c => c.id === id)!;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  deleteCustomer: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      handleSupabaseError(error);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Follow-up endpoints
  updateFollowUpStatus: async (customerId: string, followUpId: string, status: FollowUpStatus, salesAmount?: number): Promise<FollowUp> => {
    try {
      const updateData: any = { status };
      if (status === 'Sales completed' && salesAmount !== undefined) {
        updateData.sales_amount = salesAmount;
      } else if (status !== 'Sales completed') {
        updateData.sales_amount = 0;
      }

      const { data, error } = await supabase
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

  addFollowUp: async (customerId: string, followUp: Omit<FollowUp, 'id'>): Promise<FollowUp> => {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .insert({
          customer_id: customerId,
          date: followUp.date,
          status: followUp.status,
          remarks: followUp.remarks,
          sales_amount: followUp.salesAmount || 0,
          amount_received: followUp.amountReceived || false
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

  // Sales person endpoints
  getSalesPersons: async (): Promise<SalesPerson[]> => {
    try {
      const { data, error } = await supabase
        .from('sales_persons')
        .select('*')
        .order('name');

      handleSupabaseError(error);

      return (data || []).map(person => ({
        id: person.id,
        name: person.name
      }));
    } catch (error) {
      console.error('Error fetching sales persons:', error);
      throw error;
    }
  },
  
  createSalesPerson: async (name: string): Promise<SalesPerson> => {
    try {
      console.log('Creating sales person with name:', name);
      
      const { data, error } = await supabase
        .from('sales_persons')
        .insert({ name: name.trim() })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating sales person:', error);
        handleSupabaseError(error);
      }

      console.log('Sales person created successfully:', data);

      return {
        id: data.id,
        name: data.name
      };
    } catch (error) {
      console.error('Error creating sales person:', error);
      throw error;
    }
  },

  updateSalesPerson: async (id: string, name: string): Promise<SalesPerson> => {
    try {
      console.log('Updating sales person:', id, 'with name:', name);
      
      const { data, error } = await supabase
        .from('sales_persons')
        .update({ name: name.trim() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating sales person:', error);
        handleSupabaseError(error);
      }

      console.log('Sales person updated successfully:', data);

      return {
        id: data.id,
        name: data.name
      };
    } catch (error) {
      console.error('Error updating sales person:', error);
      throw error;
    }
  },

  deleteSalesPerson: async (id: string): Promise<void> => {
    try {
      console.log('Deleting sales person:', id);
      
      const { error } = await supabase
        .from('sales_persons')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting sales person:', error);
        handleSupabaseError(error);
      }

      console.log('Sales person deleted successfully');
    } catch (error) {
      console.error('Error deleting sales person:', error);
      throw error;
    }
  },
};

export { ApiError };