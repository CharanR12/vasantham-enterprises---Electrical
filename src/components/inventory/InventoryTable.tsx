import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Product } from '../../types/inventory';
import { format, parseISO } from 'date-fns';
import { Package, Pencil, Eye } from 'lucide-react';
import CustomNoRowsOverlay from '../CustomNoRowsOverlay';
import { useUserRole } from '../../hooks/useUserRole';

type InventoryTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onViewLog: (product: Product) => void;
};

const formatDate = (date: string) => {
  try {
    return format(parseISO(date), 'dd MMM yyyy');
  } catch {
    return '-';
  }
};

// Temporary placeholders (replace with your real ones)
const BrandRenderer = (params: any) => {
  return <span className="font-medium">{params.value || '-'}</span>;
};

const QuantityRenderer = (params: any) => {
  return (
    <span className={params.value > 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
      {params.value}
    </span>
  );
};

const InventoryTable: React.FC<InventoryTableProps> = ({ products, onEdit, onViewLog }) => {
  const { currentRole, user } = useUserRole();

  const canViewPurchaseInfo = (params: any) => {
    if (currentRole === 'admin') return true;
    return params.data.createdBy === user?.id;
  };

  const PurchaseInfoRenderer = (params: any) => {
    if (!canViewPurchaseInfo(params)) {
      return <span className="text-slate-400 font-medium select-none">***</span>;
    }

    if (params.colDef.field === 'mrp') {
      return `₹${params.value?.toLocaleString() || 0}`;
    } else if (params.colDef.field === 'purchaseDiscountPercent') {
      return <span className="text-slate-500 font-medium">{params.value}%</span>;
    } else if (params.colDef.field === 'purchaseDiscountedPrice') {
      return (
        <span className="font-bold text-slate-700">
          ₹{params.value?.toLocaleString() || 0}
        </span>
      );
    }
    return params.value;
  };

  const columnDefs: ColDef[] = React.useMemo(
    () => [
      {
        field: 'productName',
        headerName: 'Product Name',
        flex: 2,
        minWidth: 200,
        pinned: 'left',
        filter: 'agTextColumnFilter',
        cellStyle: { fontWeight: '700', color: '#0f172a' },
        cellRenderer: (params: any) => (
          <div className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-slate-400" />
            <span>{params.value}</span>
          </div>
        ),
      },
      {
        field: 'brand.name',
        headerName: 'Brand',
        flex: 1,
        minWidth: 130,
        cellRenderer: BrandRenderer,
      },
      {
        field: 'modelNumber',
        headerName: 'Model Number',
        flex: 1,
        minWidth: 130,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'quantityAvailable',
        headerName: 'In Stock',
        width: 100,
        cellRenderer: QuantityRenderer,
        sort: 'desc',
      },
      {
        headerName: 'Purchase Info',
        children: [
          {
            field: 'mrp',
            headerName: 'MRP',
            width: 90,
            cellRenderer: PurchaseInfoRenderer,
          },
          {
            field: 'purchaseDiscountPercent',
            headerName: 'Pur Disc',
            width: 80,
            cellRenderer: PurchaseInfoRenderer,
          },
          {
            field: 'purchaseDiscountedPrice',
            headerName: 'Pur Rate',
            width: 100,
            cellRenderer: PurchaseInfoRenderer,
          },
        ],
      },
      {
        headerName: 'Sales Info',
        children: [
          {
            field: 'saleDiscountPercent',
            headerName: 'Sales Disc',
            width: 100,
            cellRenderer: (params: any) => (
              <span className="text-slate-500 font-medium">{params.value}%</span>
            ),
          },
          {
            field: 'salePrice',
            headerName: 'Net Rate',
            width: 100,
            cellRenderer: (params: any) => (
              <span className="font-bold text-emerald-600">
                ₹{Number(params.value || 0).toLocaleString()}
              </span>
            ),
          },
        ],
      },
      {
        field: 'updatedAt',
        headerName: 'Last Updated',
        width: 120,
        valueFormatter: (params: any) =>
          params.value ? formatDate(params.value) : '-',
      },
      {
        headerName: 'Actions',
        width: 90,
        pinned: 'right',
        cellRenderer: (params: any) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(params.data)}
              className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              title="Edit Product"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onViewLog(params.data)}
              className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
              title="View Logs"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
        sortable: false,
        filter: false,
      },
    ],
    [onEdit, onViewLog, currentRole, user?.id]
  );

  return (
    <div className="ag-theme-quartz ag-theme-premium">
      <AgGridReact
        rowData={products}
        columnDefs={columnDefs}
        defaultColDef={{
          resizable: true,
          sortable: true,
          filter: true,
        }}
        animateRows={true}
        headerHeight={50}
        rowHeight={60}
        noRowsOverlayComponent={CustomNoRowsOverlay}
      />
    </div>
  );
};

export default InventoryTable;
