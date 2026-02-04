import React, { useState } from 'react';
import SearchFilter from '../components/SearchFilter';
import KPICards from '../components/KPICards';
import CustomerCard from '../components/CustomerCard';
import CustomerForm from '../components/CustomerForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useCustomers } from '../context/CustomerContext';
import { Customer, FollowUpStatus, ReferralSource } from '../types';
import { Plus } from 'lucide-react';
import { parseISO, isWithinInterval, isToday } from 'date-fns';

const TodayFollowUpsPage: React.FC = () => {
  const {
    customers,
    loading,
    error,
    salesPersons,
    currentRole,
    currentUser
  } = useCustomers();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalesPerson, setSelectedSalesPerson] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FollowUpStatus | ''>('');
  const [selectedReferralSource, setSelectedReferralSource] = useState<ReferralSource | ''>('');
  const [showAddForm, setShowAddForm] = useState(false);

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

  const [amountReceivedFilter, setAmountReceivedFilter] = useState<'all' | 'received' | 'not-received'>('all');

  const filterCustomers = (): Customer[] => {
    return customers.filter((customer) => {
      // Role-based filtering
      if (currentRole === 'user' && currentUser && customer.salesPerson.id !== currentUser.id) {
        return false;
      }

      // Search term filter
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.mobile.includes(searchTerm) ||
        customer.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Sales person filter
      const matchesSalesPerson =
        selectedSalesPerson === '' || customer.salesPerson.id === selectedSalesPerson;

      // Status filter
      const matchesStatus =
        selectedStatus === '' || customer.followUps.some(f => f.status === selectedStatus);

      // Referral source filter
      const matchesReferralSource =
        selectedReferralSource === '' || customer.referralSource === selectedReferralSource;

      // Amount received filter
      let matchesAmountReceived = true;
      if (amountReceivedFilter !== 'all') {
        const completedSales = customer.followUps.filter(f => f.status === 'Sales completed');
        if (completedSales.length > 0) {
          if (amountReceivedFilter === 'received') {
            matchesAmountReceived = completedSales.some(f => f.amountReceived === true);
          } else if (amountReceivedFilter === 'not-received') {
            matchesAmountReceived = completedSales.some(f => f.amountReceived === false || f.amountReceived === undefined);
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
  };

  const filtered = filterCustomers();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] animate-fadeIn">
        <LoadingSpinner size="lg" />
        <p className="mt-6 text-slate-500 font-semibold tracking-wide animate-pulse">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {error && (
        <ErrorMessage
          message={error}
          className="mb-6 rounded-2xl shadow-sm border-red-100"
        />
      )}

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
          salesPersons={currentRole === 'admin' ? salesPersons : (currentUser ? [currentUser] : [])}
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
        />
      </div>

      <div className="animate-fadeIn [animation-delay:100ms]">
        <KPICards customers={filtered} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn [animation-delay:200ms]">
        {filtered.length > 0 ? (
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
                setSelectedStatus('');
                setFollowUpFilter('all');
                setCreationFilter('all');
                setSelectedSalesPerson('');
              }}
              className="mt-4 text-brand-600 font-bold hover:underline underline-offset-4"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-8 right-8 z-40 bg-brand-600 text-white p-4 rounded-2xl shadow-xl shadow-brand-500/20 hover:bg-brand-700 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
        title="Add New Customer"
      >
        <Plus className="h-7 w-7" />
      </button>

      {showAddForm && (
        <CustomerForm onClose={() => setShowAddForm(false)} salesPersons={salesPersons} />
      )}
    </div>
  );
};

export default TodayFollowUpsPage;