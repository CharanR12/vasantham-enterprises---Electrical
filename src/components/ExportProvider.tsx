import React, { useEffect } from 'react';
import { useCustomersQuery, useSalesPersonsQuery } from '../hooks/queries/useCustomerQueries';
import { useProductsQuery, useBrandsQuery, useSalesEntriesQuery } from '../hooks/queries/useInventoryQueries';
import { exportToExcel } from '../utils/excelExport';

type ExportProviderProps = {
  children: React.ReactNode;
};

const ExportProvider: React.FC<ExportProviderProps> = ({ children }) => {
  const { data: customers = [] } = useCustomersQuery();
  const { data: salesPersons = [] } = useSalesPersonsQuery();
  const { data: products = [] } = useProductsQuery();
  const { data: brands = [] } = useBrandsQuery();
  const { data: salesEntries = [] } = useSalesEntriesQuery();

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