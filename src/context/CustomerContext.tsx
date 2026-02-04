import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, SalesPerson, FollowUpStatus, User } from '../types';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useUser, useOrganization, useAuth } from '@clerk/clerk-react';

type CustomerContextType = {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<boolean>;
  updateCustomer: (customer: Customer) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
  updateFollowUpStatus: (customerId: string, followUpId: string, status: FollowUpStatus, salesAmount?: number) => Promise<boolean>;
  addFollowUp: (customerId: string, followUp: any) => Promise<boolean>;
  salesPersons: SalesPerson[];
  salesPersonsLoading: boolean;
  salesPersonsError: string | null;
  addSalesPerson: (name: string) => Promise<boolean>;
  updateSalesPerson: (id: string, name: string) => Promise<boolean>;
  removeSalesPerson: (id: string) => Promise<boolean>;
  currentUser: User | null;
  currentRole: 'admin' | 'user';
  refreshCustomers: () => Promise<void>;
  refreshSalesPersons: () => Promise<void>;
};

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const { membership } = useOrganization();
  const { getToken } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);

  // Role is derived from organization membership
  const currentRole: 'admin' | 'user' = membership?.role === 'org:admin' ? 'admin' : 'user';

  // DEBUG: Check Clerk role
  useEffect(() => {
    if (membership) {
      console.log('Clerk Membership Role:', membership.role);
      console.log('Derived Internal Role:', currentRole);
    } else {
      console.log('No organization membership found for user.');
    }
  }, [membership, currentRole]);

  // Map Clerk user to our User type
  const currentUser: User | null = user ? {
    id: user.id,
    name: user.fullName || '',
    mobile: user.primaryPhoneNumber?.phoneNumber || '',
    password: '', // Not needed with Clerk
    role: currentRole,
    createdAt: user.createdAt?.toISOString() || ''
  } : null;

  const { loading, error, execute } = useApi<Customer[]>();
  const { loading: salesPersonsLoading, error: salesPersonsError, execute: executeSalesPersons } = useApi<SalesPerson[]>();

  // Load initial data
  useEffect(() => {
    refreshCustomers();
    refreshSalesPersons();
  }, [user?.id, membership?.id]);

  const refreshCustomers = async () => {
    const filterId = currentRole === 'admin' ? undefined : currentUser?.id;
    const result = await execute(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return api.getCustomers(filterId, token);
    });
    if (result) {
      setCustomers(result);
    }
  };

  const refreshSalesPersons = async () => {
    const filterId = currentRole === 'admin' ? undefined : currentUser?.id;
    const result = await executeSalesPersons(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return api.getSalesPersons(filterId, token);
    });
    if (result) {
      setSalesPersons(result);
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<boolean> => {
    const result = await execute(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return api.createCustomer(customer, currentUser?.id, token) as unknown as Promise<Customer[]>;
    });
    if (result) {
      await refreshCustomers();
      return true;
    }
    return false;
  };

  const updateCustomer = async (customer: Customer): Promise<boolean> => {
    const result = await execute(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return api.updateCustomer(customer.id, customer, token) as unknown as Promise<Customer[]>;
    });
    if (result) {
      await refreshCustomers();
      return true;
    }
    return false;
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    const result = await execute(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return api.deleteCustomer(id, token) as unknown as Promise<Customer[]>;
    });
    if (result !== null) {
      await refreshCustomers();
      return true;
    }
    return false;
  };

  const updateFollowUpStatus = async (customerId: string, followUpId: string, status: FollowUpStatus, salesAmount?: number): Promise<boolean> => {
    const result = await execute(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return api.updateFollowUpStatus(customerId, followUpId, status, salesAmount, token) as unknown as Promise<Customer[]>;
    });
    if (result) {
      await refreshCustomers();
      return true;
    }
    return false;
  };

  const addFollowUp = async (customerId: string, followUp: any): Promise<boolean> => {
    const result = await execute(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return api.addFollowUp(customerId, followUp, currentUser?.id, token) as unknown as Promise<Customer[]>;
    });
    if (result) {
      await refreshCustomers();
      return true;
    }
    return false;
  };

  const addSalesPerson = async (name: string): Promise<boolean> => {
    const result = await executeSalesPersons(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return api.createSalesPerson(name, currentUser?.id, token) as unknown as Promise<SalesPerson[]>;
    });
    if (result) {
      await refreshSalesPersons();
      return true;
    }
    return false;
  };

  const updateSalesPerson = async (id: string, name: string): Promise<boolean> => {
    const result = await executeSalesPersons(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return api.updateSalesPerson(id, name, token) as unknown as Promise<SalesPerson[]>;
    });
    if (result) {
      await refreshSalesPersons();
      return true;
    }
    return false;
  };

  const removeSalesPerson = async (id: string): Promise<boolean> => {
    const result = await executeSalesPersons(async () => {
      const token = await getToken({ template: 'supabase' }) || undefined;
      return api.deleteSalesPerson(id, token) as unknown as Promise<SalesPerson[]>;
    });
    if (result !== null) {
      await refreshSalesPersons();
      return true;
    }
    return false;
  };

  const value = {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateFollowUpStatus,
    addFollowUp,
    salesPersons,
    salesPersonsLoading,
    salesPersonsError,
    addSalesPerson,
    updateSalesPerson,
    removeSalesPerson,
    currentUser,
    currentRole,
    refreshCustomers,
    refreshSalesPersons,
  };

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};