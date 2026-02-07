import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Product } from '../../types/inventory';
import { format, parseISO } from 'date-fns';
import { Package, Tag, AlertTriangle, Pencil, Eye } from 'lucide-react';
import CustomNoRowsOverlay from '../CustomNoRowsOverlay';

type InventoryTableProps = {
    products: Product[];
    onEdit: (product: Product) => void;
    onViewLog: (product: Product) => void;
};

const InventoryTable: React.FC<InventoryTableProps> = ({ products, onEdit, onViewLog }) => {
    const formatDate = (dateString: string): string => {
        try {
            return format(parseISO(dateString), 'dd/MM/yyyy');
        } catch {
            return dateString;
        }
    };


    const QuantityRenderer = (params: any) => {
        const qty = params.value;
        const isLow = qty <= 5;

        return (
            <div className={`flex items-center gap-2 font-bold ${isLow ? 'text-rose-600' : 'text-slate-700'}`}>
                {isLow && <AlertTriangle className="h-3 w-3" />}
                <span>{qty} units</span>
            </div>
        );
    };

    const BrandRenderer = (params: any) => {
        return (
            <div className="flex items-center gap-2">
                <Tag className="h-3 w-3 text-brand-500" />
                <span className="px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {params.value}
                </span>
            </div>
        );
    };

    const columnDefs: ColDef[] = React.useMemo(() => [
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
            )
        },
        {
            field: 'brand.name',
            headerName: 'Brand',
            flex: 1,
            minWidth: 130,
            cellRenderer: BrandRenderer
        },
        {
            field: 'modelNumber',
            headerName: 'Model Number',
            flex: 1,
            minWidth: 130,
            filter: 'agTextColumnFilter'
        },
        {
            field: 'quantityAvailable',
            headerName: 'In Stock',
            width: 100,
            cellRenderer: QuantityRenderer,
            sort: 'desc'
        },
        {
            headerName: 'Purchase Info',
            children: [
                {
                    field: 'mrp',
                    headerName: 'MRP',
                    width: 90,
                    cellRenderer: (params: any) => `₹${params.value?.toLocaleString() || 0}`
                },
                // Removed Basic Rate column as per user request
                {
                    field: 'purchaseDiscountPercent',
                    headerName: 'Pur Disc',
                    width: 80,
                    cellRenderer: (params: any) => (
                        <span className="text-slate-500 font-medium">{params.value}%</span>
                    )
                },
                {
                    field: 'purchaseDiscountedPrice',
                    headerName: 'Pur Rate',
                    width: 100,
                    cellRenderer: (params: any) => (
                        <span className="font-bold text-slate-700">₹{params.value?.toLocaleString() || 0}</span>
                    )
                }
            ]
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
                    )
                },
                {
                    field: 'salePrice',
                    headerName: 'Net Rate',
                    width: 100,
                    cellRenderer: (params: any) => (
                        <span className="font-bold text-emerald-600">₹{parseFloat(params.value || 0).toLocaleString()}</span>
                    )
                }
            ]
        },
        {
            field: 'updatedAt',
            headerName: 'Last Updated',
            width: 120,
            valueFormatter: (params: any) => params.value ? formatDate(params.value) : '-'
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
            filter: false
        }
    ], [onEdit, onViewLog]);

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
