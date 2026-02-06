import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Customer, FollowUpStatus } from '../types';
import { format, parseISO, isFuture } from 'date-fns';
import { Phone, MapPin, Pencil, FileText } from 'lucide-react';
import CustomNoRowsOverlay from './CustomNoRowsOverlay';

type CustomerTableProps = {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onViewLog: (customer: Customer) => void;
};

const CustomerTable: React.FC<CustomerTableProps> = ({ customers, onEdit, onViewLog }) => {
  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const StatusBadge = (params: any) => {
    const status = params.value as FollowUpStatus;
    const getStatusStyles = (status: FollowUpStatus) => {
      switch (status) {
        case 'Sales completed':
          return {
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            dot: 'bg-emerald-500'
          };
        case 'Sales rejected':
          return {
            badge: 'bg-rose-50 text-rose-700 border-rose-100',
            dot: 'bg-rose-500'
          };
        case 'Scheduled next follow-up':
          return {
            badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
            dot: 'bg-indigo-500'
          };
        default:
          return {
            badge: 'bg-amber-50 text-amber-700 border-amber-100',
            dot: 'bg-amber-500'
          };
      }
    };

    const styles = getStatusStyles(status);

    return (
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
        <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${styles.badge}`}>
          {status}
        </span>
      </div>
    );
  };

  const columnDefs: ColDef[] = React.useMemo(() => [
    {
      field: 'name',
      headerName: 'Customer Name',
      flex: 2,
      minWidth: 200,
      pinned: 'left',
      filter: 'agTextColumnFilter',
      cellStyle: { fontWeight: '700', color: '#0f172a' }
    },
    {
      field: 'mobile',
      headerName: 'Mobile',
      flex: 1,
      minWidth: 140,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3 text-emerald-500" />
          <span>+91 {params.value}</span>
        </div>
      )
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1.5,
      minWidth: 150,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2 truncate">
          <MapPin className="h-3 w-3 text-brand-500" />
          <span className="truncate">{params.value}</span>
        </div>
      )
    },
    {
      field: 'salesPerson.name',
      headerName: 'Representative',
      flex: 1,
      minWidth: 130
    },
    {
      headerName: 'Next Action',
      flex: 1,
      minWidth: 140,
      valueGetter: (params: any) => {
        const nextFollowUp = params.data.followUps
          .filter((f: any) => isFuture(parseISO(f.date)))
          .sort((a: any, b: any) => parseISO(a.date).getTime() - parseISO(b.date).getTime())[0];
        return nextFollowUp ? nextFollowUp.date : null;
      },
      cellRenderer: (params: any) => params.value ? formatDate(params.value) : '-'
    },
    {
      field: 'lastContactedDate',
      headerName: 'Last Contact',
      flex: 1,
      minWidth: 130,
      cellRenderer: (params: any) => params.value ? formatDate(params.value) : '-'
    },
    {
      headerName: 'Status',
      flex: 1,
      minWidth: 180,
      valueGetter: (params: any) => {
        const nextFollowUp = params.data.followUps
          .filter((f: any) => isFuture(parseISO(f.date)))
          .sort((a: any, b: any) => parseISO(a.date).getTime() - parseISO(b.date).getTime())[0];
        return nextFollowUp ? nextFollowUp.status : 'N/A';
      },
      cellRenderer: StatusBadge
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
            title="Edit Customer"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onViewLog(params.data)}
            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
            title="View Logs"
          >
            <FileText className="h-3.5 w-3.5" />
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
        rowData={customers}
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

export default CustomerTable;