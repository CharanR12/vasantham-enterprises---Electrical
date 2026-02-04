import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, SalesPerson, FollowUpStatus, User } from '../types';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useUser } from '@clerk/clerk-react';

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);

  // Map Clerk user to our User type
  const currentUser: User | null = user ? {
    id: user.id,
    name: user.fullName || '',
    mobile: user.primaryPhoneNumber?.phoneNumber || '',
    password: '', // Not needed with Clerk
    role: 'admin', // Default to admin for now
    createdAt: user.createdAt?.toISOString() || ''
  } : null;

  const currentRole: 'admin' | 'user' = 'admin';

  const { loading, error, execute } = useApi<Customer[]>();
  const { loading: salesPersonsLoading, error: salesPersonsError, execute: executeSalesPersons } = useApi<SalesPerson[]>();

  // Load initial data
  useEffect(() => {
    refreshCustomers();
    refreshSalesPersons();
  }, []);


  const refreshCustomers = async () => {
    console.log('Refreshing customers...');
    const result = await execute(() => api.getCustomers());
    if (result) {
      console.log('Customers loaded:', result.length);
      setCustomers(result);
    }
  };

  const refreshSalesPersons = async () => {
    console.log('Refreshing sales persons...');
    const result = await executeSalesPersons(() => api.getSalesPersons());
    if (result) {
      console.log('Sales persons loaded:', result.length);
      setSalesPersons(result);
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<boolean> => {
    console.log('Adding customer:', customer.name);
    const result = await execute(() => api.createCustomer(customer));
    if (result) {
      await refreshCustomers();
      return true;
    }
    return false;
  };

  const updateCustomer = async (customer: Customer): Promise<boolean> => {
    console.log('Updating customer:', customer.name);
    const result = await execute(() => api.updateCustomer(customer.id, customer));
    if (result) {
      await refreshCustomers();
      return true;
    }
    return false;
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    console.log('Deleting customer:', id);
    const result = await execute(() => api.deleteCustomer(id));
    if (result !== null) {
      await refreshCustomers();
      return true;
    }
    return false;
  };

  const updateFollowUpStatus = async (customerId: string, followUpId: string, status: FollowUpStatus, salesAmount?: number): Promise<boolean> => {
    console.log('Updating follow-up status:', followUpId, status, salesAmount);
    const result = await execute(() => api.updateFollowUpStatus(customerId, followUpId, status, salesAmount));
    if (result) {
      await refreshCustomers();
      return true;
    }
    return false;
  };

  const addFollowUp = async (customerId: string, followUp: any): Promise<boolean> => {
    console.log('Adding follow-up for customer:', customerId);
    const result = await execute(() => api.addFollowUp(customerId, followUp));
    if (result) {
      await refreshCustomers();
      return true;
    }
    return false;
  };

  const addSalesPerson = async (name: string): Promise<boolean> => {
    console.log('Adding sales person:', name);
    const result = await executeSalesPersons(() => api.createSalesPerson(name));
    if (result) {
      console.log('Sales person added successfully');
      await refreshSalesPersons();
      return true;
    }
    console.log('Failed to add sales person');
    return false;
  };

  const updateSalesPerson = async (id: string, name: string): Promise<boolean> => {
    console.log('Updating sales person:', id, name);
    const result = await executeSalesPersons(() => api.updateSalesPerson(id, name));
    if (result) {
      console.log('Sales person updated successfully');
      await refreshSalesPersons();
      return true;
    }
    console.log('Failed to update sales person');
    return false;
  };

  const removeSalesPerson = async (id: string): Promise<boolean> => {
    console.log('Removing sales person:', id);
    const result = await executeSalesPersons(() => api.deleteSalesPerson(id));
    if (result !== null) {
      console.log('Sales person removed successfully');
      await refreshSalesPersons();
      return true;
    }
    console.log('Failed to remove sales person');
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