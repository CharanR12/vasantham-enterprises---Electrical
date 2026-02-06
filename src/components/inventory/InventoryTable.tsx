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
            flex: 1,
            minWidth: 120,
            cellRenderer: QuantityRenderer,
            sort: 'desc'
        },
        {
            field: 'mrp',
            headerName: 'MRP',
            width: 100,
            cellRenderer: (params: any) => `₹${params.value?.toLocaleString() || 0}`
        },
        {
            field: 'purchaseDiscountedPrice',
            headerName: 'Purchase (Disc.)',
            width: 140,
            cellRenderer: (params: any) => (
                <div className="flex flex-col leading-tight">
                    <span className="font-bold">₹{params.value?.toLocaleString() || 0}</span>
                    <span className="text-[10px] text-slate-500">{params.data.purchaseDiscountPercent}% off</span>
                </div>
            )
        },
        {
            field: 'salePrice',
            headerName: 'Sale Price',
            width: 120,
            cellRenderer: (params: any) => `₹${params.value?.toLocaleString() || 0}`
        },
        {
            field: 'arrivalDate',
            headerName: 'Arrival Date',
            flex: 1,
            minWidth: 130,
            cellRenderer: (params: any) => formatDate(params.value)
        },
        {
            headerName: 'Actions',
            width: 120,
            pinned: 'right',
            cellRenderer: (params: any) => (
                <div className="flex items-center gap-2">
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
