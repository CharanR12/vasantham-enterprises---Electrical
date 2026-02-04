import React, { useEffect } from 'react';
import { useCustomers } from '../context/CustomerContext';
import { useInventory } from '../context/InventoryContext';
import { exportToExcel } from '../utils/excelExport';

type ExportProviderProps = {
  children: React.ReactNode;
};

const ExportProvider: React.FC<ExportProviderProps> = ({ children }) => {
  const { customers, salesPersons } = useCustomers();
  const { products, brands, salesEntries } = useInventory();

  useEffect(() => {
    // Make inventory data available globally for export
    (window as any).inventoryData = {
      products,
      brands,
      salesEntries
    };

    // Make export function available globally
    (window as any).exportAllData = () => {
      exportToExcel(customers, salesPersons, products, brands, salesEntries);
    };
  }, [customers, salesPersons, products, brands, salesEntries]);

  return <>{children}</>;
};

export default ExportProvider;