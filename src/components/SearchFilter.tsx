import React from 'react';
import { Search, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { SalesPerson, FollowUpStatus, ReferralSource } from '../types';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { DateFilter } from './ui/date-filter';

type SearchFilterProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  salesPerson: string;
  setSalesPerson: (value: string) => void;
  followUpStatus: FollowUpStatus | '';
  setFollowUpStatus: (value: FollowUpStatus | '') => void;
  referralSource: ReferralSource | '';
  setReferralSource: (value: ReferralSource | '') => void;
  salesPersons: SalesPerson[];
  followUpFilter: 'all' | 'today' | 'custom';
  setFollowUpFilter: (filter: 'all' | 'today' | 'custom') => void;
  followUpDateRange: { start: string; end: string };
  setFollowUpDateRange: (range: { start: string; end: string }) => void;
  creationFilter: 'all' | 'today' | 'custom';
  setCreationFilter: (filter: 'all' | 'today' | 'custom') => void;
  creationDateRange: { start: string; end: string };
  setCreationDateRange: (range: { start: string; end: string }) => void;
  amountReceivedFilter: 'all' | 'received' | 'not-received';
  setAmountReceivedFilter: (value: 'all' | 'received' | 'not-received') => void;
};

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
  salesPerson,
  setSalesPerson,
  followUpStatus,
  setFollowUpStatus,
  referralSource,
  setReferralSource,
  salesPersons,
  followUpFilter,
  setFollowUpFilter,
  followUpDateRange,
  setFollowUpDateRange,
  creationFilter,
  setCreationFilter,
  creationDateRange,
  setCreationDateRange,
  amountReceivedFilter,
  setAmountReceivedFilter,
}) => {
  const salesPersonOptions = [
    { value: 'null', label: 'All Sales Persons' },
    ...salesPersons.map((person) => ({ value: person.id, label: person.name }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Not yet contacted', label: 'Not yet contacted' },
    { value: 'Scheduled next follow-up', label: 'Scheduled next follow-up' },
    { value: 'Sales completed', label: 'Sales completed' },
    { value: 'Sales rejected', label: 'Sales rejected' },
  ];

  const referralOptions = [
    { value: 'all', label: 'All Referral Sources' },
    { value: 'Self Marketing', label: 'Self Marketing' },
    { value: 'Doors Data', label: 'Doors Data' },
    { value: 'Walk-in Customer', label: 'Walk-in Customer' },
    { value: 'Collection', label: 'Collection' },
    { value: 'Build Expo 2024', label: 'Build Expo 2024' },
    { value: 'Build Expo 2025', label: 'Build Expo 2025' },
  ];

  const amountStatusOptions = [
    { value: 'all', label: 'All Amount Status' },
    { value: 'received', label: 'Amount Received' },
    { value: 'not-received', label: 'Amount Not Received' },
  ];

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 shadow-sm transition-all duration-300">
      <div className="flex flex-wrap gap-3">
        {/* Basic Filters */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 font-medium"
          />
        </div>

        <Combobox
          options={salesPersonOptions}
          value={salesPerson || 'null'}
          onChange={(val) => setSalesPerson(val === 'null' ? '' : val)}
          placeholder="All Sales Persons"
          searchPlaceholder="Search sales person..."
          className="w-full sm:w-64"
        />

        <Combobox
          options={statusOptions}
          value={followUpStatus || 'all'}
          onChange={(val) => setFollowUpStatus(val === 'all' ? '' : val as FollowUpStatus)}
          placeholder="All Statuses"
          searchPlaceholder="Search status..."
          className="w-full sm:w-64"
        />

        <Combobox
          options={referralOptions}
          value={referralSource || 'all'}
          onChange={(val) => setReferralSource(val === 'all' ? '' : val as ReferralSource)}
          placeholder="All Referral Sources"
          searchPlaceholder="Search source..."
          className="w-full sm:w-64"
        />

        <Combobox
          options={amountStatusOptions}
          value={amountReceivedFilter}
          onChange={(val) => setAmountReceivedFilter(val as 'all' | 'received' | 'not-received')}
          placeholder="All Amount Status"
          searchPlaceholder="Search..."
          className="w-full sm:w-64"
        />

        {/* Date Filtering Options */}
        <DateFilter
          label="Follow-up Date"
          icon={<CalendarIcon className="h-3.5 w-3.5" />}
          value={followUpFilter}
          onChange={setFollowUpFilter}
          dateRange={followUpDateRange}
          onDateRangeChange={setFollowUpDateRange}
          className="w-full sm:w-64"
        />

        <DateFilter
          label="Creation Date"
          icon={<Plus className="h-3.5 w-3.5" />}
          value={creationFilter}
          onChange={setCreationFilter}
          dateRange={creationDateRange}
          onDateRangeChange={setCreationDateRange}
          className="w-full sm:w-64"
        />
      </div>
    </div>
  );
};

export default SearchFilter;