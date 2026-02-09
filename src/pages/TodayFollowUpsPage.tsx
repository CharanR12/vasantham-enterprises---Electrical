import React, { useState } from 'react';
import SearchFilter from '../components/SearchFilter';
import KPICards from '../components/KPICards';
import CustomerCard from '../components/CustomerCard';
import CustomerForm from '../components/CustomerForm';
import FollowUpModal from '../components/FollowUpModal';
import ErrorMessage from '../components/ErrorMessage';
import { KPISkeleton } from '../components/skeletons/KPISkeleton';
import { CustomerSkeleton } from '../components/skeletons/CustomerSkeleton';
import { useCustomersQuery, useSalesPersonsQuery } from '../hooks/queries/useCustomerQueries';
import { useUserRole } from '../hooks/useUserRole';
import { Customer, FollowUpStatus, ReferralSource } from '../types';
import CustomerTable from '../components/CustomerTable';
import { Plus, LayoutGrid, Table } from 'lucide-react';
import { parseISO, isWithinInterval, isToday } from 'date-fns';

const TodayFollowUpsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const { data: customers = [], isLoading: customersLoading, error: customersError } = useCustomersQuery();
  const { data: salesPersons = [], isLoading: spLoading } = useSalesPersonsQuery();
  const { currentRole, user: currentUser } = useUserRole();

  const loading = customersLoading || spLoading;
  const error = (customersError as any)?.message || null;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalesPerson, setSelectedSalesPerson] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedReferralSource, setSelectedReferralSource] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingFollowUps, setViewingFollowUps] = useState<Customer | null>(null);

  // Follow-up Date Filter
  const [followUpFilter, setFollowUpFilter] = useState<'all' | 'today' | 'custom'>('all');
  const [followUpDateRange, setFollowUpDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Creation Date Filter
  const [creationFilter, setCreationFilter] = useState<'all' | 'today' | 'custom'>('all');
  const [creationDateRange, setCreationDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [amountReceivedFilter, setAmountReceivedFilter] = useState<string[]>([]);

  const filtered = React.useMemo(() => {
    return customers.filter((customer) => {

      // Search term filter
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.mobile.includes(searchTerm) ||
        customer.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Sales person filter
      const matchesSalesPerson =
        selectedSalesPerson.length === 0 || selectedSalesPerson.includes(customer.salesPerson.id);

      // Status filter
      const matchesStatus =
        selectedStatus.length === 0 || customer.followUps.some(f => selectedStatus.includes(f.status));

      // Referral source filter
      const matchesReferralSource =
        selectedReferralSource.length === 0 || selectedReferralSource.includes(customer.referralSource);

      // Amount received filter
      let matchesAmountReceived = true;
      if (amountReceivedFilter.length > 0) {
        // If "received", we want to see completed sales where amountReceived is true
        // If "not-received", we want sales where amountReceived is false/undefined
        // If both selected, we want either.
        const completedSales = customer.followUps.filter(f => f.status === 'Sales completed');
        if (completedSales.length > 0) {
          let hasReceived = false;
          let hasNotReceived = false;

          if (amountReceivedFilter.includes('received')) {
            hasReceived = completedSales.some(f => f.amountReceived === true);
          }
          if (amountReceivedFilter.includes('not-received')) {
            hasNotReceived = completedSales.some(f => f.amountReceived === false || f.amountReceived === undefined);
          }

          if (amountReceivedFilter.includes('received') && amountReceivedFilter.includes('not-received')) {
            matchesAmountReceived = hasReceived || hasNotReceived;
          } else if (amountReceivedFilter.includes('received')) {
            matchesAmountReceived = hasReceived;
          } else if (amountReceivedFilter.includes('not-received')) {
            matchesAmountReceived = hasNotReceived;
          }
        } else {
          matchesAmountReceived = false;
        }
      }

      // Filter by Follow-up Scheduled Date
      let matchesFollowUpDate = true;
      if (followUpFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        matchesFollowUpDate = customer.followUps.some(f => f.date === today);
      } else if (followUpFilter === 'custom' && followUpDateRange.start && followUpDateRange.end) {
        const start = parseISO(followUpDateRange.start);
        const end = parseISO(followUpDateRange.end);
        matchesFollowUpDate = customer.followUps.some(f => {
          const followUpDate = parseISO(f.date);
          return isWithinInterval(followUpDate, { start, end });
        });
      }

      // Filter by Creation Date
      let matchesCreationDate = true;
      if (creationFilter === 'today') {
        matchesCreationDate = isToday(parseISO(customer.createdAt));
      } else if (creationFilter === 'custom' && creationDateRange.start && creationDateRange.end) {
        const start = parseISO(creationDateRange.start);
        const end = parseISO(creationDateRange.end);
        const customerCreatedDate = parseISO(customer.createdAt);
        matchesCreationDate = isWithinInterval(customerCreatedDate, { start, end });
      }

      return matchesSearch &&
        matchesSalesPerson &&
        matchesStatus &&
        matchesReferralSource &&
        matchesAmountReceived &&
        matchesFollowUpDate &&
        matchesCreationDate;
    });
  }, [customers, currentRole, currentUser, searchTerm, selectedSalesPerson, selectedStatus, selectedReferralSource, amountReceivedFilter, followUpFilter, followUpDateRange, creationFilter, creationDateRange]);

  // Removed full-page loading in favor of integrated skeletons

  return (
    <div className="space-y-8 pb-12">
      {error && (
        <ErrorMessage
          message={error}
          className="mb-6 rounded-2xl shadow-sm border-red-100"
        />
      )}

      {/* Page Header */}
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Customer Follow-ups</p>
      </div>

      <div className="animate-fadeIn">
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          salesPerson={selectedSalesPerson}
          setSalesPerson={setSelectedSalesPerson}
          followUpStatus={selectedStatus}
          setFollowUpStatus={setSelectedStatus}
          referralSource={selectedReferralSource}
          setReferralSource={setSelectedReferralSource}
          salesPersons={salesPersons}
          followUpFilter={followUpFilter}
          setFollowUpFilter={setFollowUpFilter}
          followUpDateRange={followUpDateRange}
          setFollowUpDateRange={setFollowUpDateRange}
          creationFilter={creationFilter}
          setCreationFilter={setCreationFilter}
          creationDateRange={creationDateRange}
          setCreationDateRange={setCreationDateRange}
          amountReceivedFilter={amountReceivedFilter}
          setAmountReceivedFilter={setAmountReceivedFilter}
          onClear={() => {
            setSearchTerm('');
            setSelectedSalesPerson([]);
            setSelectedStatus([]);
            setSelectedReferralSource([]);
            setFollowUpFilter('all');
            setCreationFilter('all');
            setAmountReceivedFilter([]);
            // Optimally reset date ranges to today too
            const today = new Date().toISOString().split('T')[0];
            setFollowUpDateRange({ start: today, end: today });
            setCreationDateRange({ start: today, end: today });
          }}
        />
      </div>

      <div className="flex justify-between items-center animate-fadeIn [animation-delay:50ms]">
        <div className="flex items-center space-x-2 bg-white/50 p-1.5 rounded-2xl border border-slate-200/60 shadow-sm">
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${viewMode === 'card'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${viewMode === 'table'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      <div className="animate-fadeIn [animation-delay:100ms]">
        {loading ? <KPISkeleton /> : <KPICards customers={filtered} />}
      </div>

      {viewMode === 'table' && !loading ? (
        <div className="animate-fadeIn [animation-delay:200ms]">
          <div className="animate-fadeIn [animation-delay:200ms]">
            <CustomerTable
              customers={filtered}
              onEdit={setEditingCustomer}
              onViewLog={setViewingFollowUps}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn [animation-delay:200ms]">
          {loading ? (
            <>
              <CustomerSkeleton />
              <CustomerSkeleton />
              <CustomerSkeleton />
              <CustomerSkeleton />
              <CustomerSkeleton />
              <CustomerSkeleton />
            </>
          ) : filtered.length > 0 ? (
            filtered.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
              />
            ))
          ) : (
            <div className="col-span-full premium-card py-16 text-center border-dashed">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Plus className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No customers match your current filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus([]);
                  setFollowUpFilter('all');
                  setCreationFilter('all');
                  setSelectedSalesPerson([]);
                }}
                className="mt-4 text-brand-600 font-bold hover:underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-8 right-8 z-40 bg-brand-600 text-white p-4 rounded-2xl shadow-xl shadow-brand-500/20 hover:bg-brand-700 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
        title="Add New Customer"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* Edit Form for Table Selection */}
      {editingCustomer && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          salesPersons={salesPersons}
        />
      )}

      {/* View Logs Modal */}
      {viewingFollowUps && (
        <FollowUpModal
          customer={viewingFollowUps}
          onClose={() => setViewingFollowUps(null)}
        />
      )}

      {showAddForm && (
        <CustomerForm onClose={() => setShowAddForm(false)} salesPersons={salesPersons} />
      )}
    </div>
  );
};

export default TodayFollowUpsPage;