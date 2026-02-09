import React from 'react';
import { Search, Calendar as CalendarIcon, Plus, X } from 'lucide-react';
import { SalesPerson } from '../types';
import { useReferralSourcesQuery } from '../hooks/queries/useReferralSourceQueries';
import { Input } from '@/components/ui/input';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import { DateFilter } from './ui/date-filter';

type SearchFilterProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  salesPerson: string[];
  setSalesPerson: (value: string[]) => void;
  followUpStatus: string[];
  setFollowUpStatus: (value: string[]) => void;
  referralSource: string[];
  setReferralSource: (value: string[]) => void;
  salesPersons: SalesPerson[];
  followUpFilter: 'all' | 'today' | 'custom';
  setFollowUpFilter: (filter: 'all' | 'today' | 'custom') => void;
  followUpDateRange: { start: string; end: string };
  setFollowUpDateRange: (range: { start: string; end: string }) => void;
  creationFilter: 'all' | 'today' | 'custom';
  setCreationFilter: (filter: 'all' | 'today' | 'custom') => void;
  creationDateRange: { start: string; end: string };
  setCreationDateRange: (range: { start: string; end: string }) => void;
  amountReceivedFilter: string[];
  setAmountReceivedFilter: (value: string[]) => void;
  onClear: () => void;
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
  onClear,
}) => {
  const { data: referralSources = [] } = useReferralSourcesQuery();

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

  const amountStatusOptions = [
    { value: 'all', label: 'All Amount Status' },
    { value: 'received', label: 'Amount Received' },
    { value: 'not-received', label: 'Amount Not Received' },
  ];

  const hasActiveFilters =
    searchTerm !== '' ||
    salesPerson.length > 0 ||
    followUpStatus.length > 0 ||
    referralSource.length > 0 ||
    amountReceivedFilter.length > 0 ||
    followUpFilter !== 'all' ||
    creationFilter !== 'all';

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 shadow-sm transition-all duration-300">
      <div className="flex flex-col gap-4">
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

          <MultiSelectCombobox
            options={salesPersonOptions}
            selectedValues={salesPerson}
            onChange={setSalesPerson}
            placeholder="Filter Sales Persons"
            searchPlaceholder="Search sales person..."
            className="w-full sm:w-64"
          />

          <MultiSelectCombobox
            options={statusOptions}
            selectedValues={followUpStatus}
            onChange={setFollowUpStatus}
            placeholder="Filter Statuses"
            searchPlaceholder="Search status..."
            className="w-full sm:w-64"
          />

          <MultiSelectCombobox
            options={[
              { value: 'all', label: 'All Referral Sources' },
              ...referralSources.map(source => ({ value: source.name, label: source.name }))
            ]}
            selectedValues={referralSource}
            onChange={setReferralSource}
            placeholder="Filter Referral Sources"
            searchPlaceholder="Search source..."
            className="w-full sm:w-64"
          />

          <MultiSelectCombobox
            options={amountStatusOptions}
            selectedValues={amountReceivedFilter}
            onChange={setAmountReceivedFilter}
            placeholder="Filter Amount Status"
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

          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="h-10 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;