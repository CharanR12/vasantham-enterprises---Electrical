import React, { useState } from 'react';
import Layout from '../components/Layout';
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
  const [viewMode, setViewMode] = useState<'today' | 'all' | 'period'>('all');
  const [dateRange, setDateRange] = useState({ 
    start: new Date().toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  const [creationDateRange, setCreationDateRange] = useState({ 
    start: new Date().toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  const [filterByCreationDate, setFilterByCreationDate] = useState(false);
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
      
      // Date filter - either by follow-up date or creation date
      let matchesDate = true;
      
      if (filterByCreationDate) {
        // Filter by when follow-ups were created (added to system)
        if (viewMode === 'today') {
          matchesDate = customer.followUps.some(f => {
            // Since we don't have creation timestamps for follow-ups, we'll use customer creation date
            // In a real system, you'd want to add created_at timestamps to follow-ups
            return isToday(parseISO(customer.createdAt));
          });
        } else if (viewMode === 'period' && creationDateRange.start && creationDateRange.end) {
          const start = parseISO(creationDateRange.start);
          const end = parseISO(creationDateRange.end);
          const customerCreatedDate = parseISO(customer.createdAt);
          matchesDate = isWithinInterval(customerCreatedDate, { start, end });
        }
      } else {
        // Filter by follow-up scheduled date (original behavior)
        if (viewMode === 'today') {
          const today = new Date().toISOString().split('T')[0];
          matchesDate = customer.followUps.some(f => f.date === today);
        } else if (viewMode === 'period' && dateRange.start && dateRange.end) {
          const start = parseISO(dateRange.start);
          const end = parseISO(dateRange.end);
          matchesDate = customer.followUps.some(f => {
            const followUpDate = parseISO(f.date);
            return isWithinInterval(followUpDate, { start, end });
          });
        }
      }
      
      return matchesSearch && matchesSalesPerson && matchesStatus && matchesReferralSource && matchesDate && matchesAmountReceived;
    });
  };

  const filtered = filterCustomers();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading customers...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        {error && (
          <ErrorMessage 
            message={error} 
            className="mb-4"
          />
        )}

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
          viewMode={viewMode}
          setViewMode={setViewMode}
          dateRange={dateRange}
          setDateRange={setDateRange}
          creationDateRange={creationDateRange}
          setCreationDateRange={setCreationDateRange}
          filterByCreationDate={filterByCreationDate}
          setFilterByCreationDate={setFilterByCreationDate}
          amountReceivedFilter={amountReceivedFilter}
          setAmountReceivedFilter={setAmountReceivedFilter}
        />

        <KPICards customers={filtered} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length > 0 ? (
            filtered.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No customers found matching the current filters.</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-20 right-4 lg:bottom-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
        </button>

        {showAddForm && (
          <CustomerForm onClose={() => setShowAddForm(false)} />
        )}
      </div>
    </Layout>
  );
};

export default TodayFollowUpsPage;