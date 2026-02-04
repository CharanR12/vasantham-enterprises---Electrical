import React from 'react';
import { Search, Calendar } from 'lucide-react';
import { SalesPerson, FollowUpStatus, ReferralSource } from '../types';

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
  viewMode: 'today' | 'all' | 'period';
  setViewMode: (mode: 'today' | 'all' | 'period') => void;
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  creationDateRange: { start: string; end: string };
  setCreationDateRange: (range: { start: string; end: string }) => void;
  filterByCreationDate: boolean;
  setFilterByCreationDate: (value: boolean) => void;
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
  viewMode,
  setViewMode,
  dateRange,
  setDateRange,
  creationDateRange,
  setCreationDateRange,
  filterByCreationDate,
  setFilterByCreationDate,
  amountReceivedFilter,
  setAmountReceivedFilter,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 space-y-4">
        {/* First Row - Basic Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={salesPerson}
            onChange={(e) => setSalesPerson(e.target.value)}
            className="p-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 truncate"
          >
            <option value="">All Sales Persons</option>
            {salesPersons.map((person) => (
              <option key={person.id} value={person.id} className="truncate">
                {person.name}
              </option>
            ))}
          </select>

          <select
            value={followUpStatus}
            onChange={(e) => setFollowUpStatus(e.target.value as FollowUpStatus | '')}
            className="p-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Not yet contacted">Not yet contacted</option>
            <option value="Scheduled next follow-up">Scheduled next follow-up</option>
            <option value="Sales completed">Sales completed</option>
            <option value="Sales rejected">Sales rejected</option>
          </select>

          <select
            value={referralSource}
            onChange={(e) => setReferralSource(e.target.value as ReferralSource | '')}
            className="p-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Referral Sources</option>
            <option value="Self Marketing">Self Marketing</option>
            <option value="Doors Data">Doors Data</option>
            <option value="Walk-in Customer">Walk-in Customer</option>
            <option value="Collection">Collection</option>
            <option value="Build Expo 2024">Build Expo 2024</option>
            <option value="Build Expo 2025">Build Expo 2025</option>
          </select>

          <select
            value={amountReceivedFilter}
            onChange={(e) => setAmountReceivedFilter(e.target.value as 'all' | 'received' | 'not-received')}
            className="p-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Amount Status</option>
            <option value="received">Amount Received</option>
            <option value="not-received">Amount Not Received</option>
          </select>
        </div>

        {/* Second Row - Date Filtering Options */}
        <div className="border-t pt-4">
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <h3 className="text-sm font-medium text-gray-700">Date Filtering:</h3>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="dateFilter"
                checked={!filterByCreationDate}
                onChange={() => setFilterByCreationDate(false)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">By Follow-up Date</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="dateFilter"
                checked={filterByCreationDate}
                onChange={() => setFilterByCreationDate(true)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">By Creation Date</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'today' | 'all' | 'period')}
              className="p-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All {filterByCreationDate ? 'Created' : 'Follow-ups'}</option>
              <option value="today">Today's {filterByCreationDate ? 'Created' : 'Follow-ups'}</option>
              <option value="period">Custom Period</option>
            </select>

            {viewMode === 'period' && (
              <>
                <input
                  type="date"
                  value={filterByCreationDate ? creationDateRange.start : dateRange.start}
                  onChange={(e) => {
                    if (filterByCreationDate) {
                      setCreationDateRange({ ...creationDateRange, start: e.target.value });
                    } else {
                      setDateRange({ ...dateRange, start: e.target.value });
                    }
                  }}
                  className="p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={filterByCreationDate ? creationDateRange.end : dateRange.end}
                  onChange={(e) => {
                    if (filterByCreationDate) {
                      setCreationDateRange({ ...creationDateRange, end: e.target.value });
                    } else {
                      setDateRange({ ...dateRange, end: e.target.value });
                    }
                  }}
                  className="p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="End date"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;