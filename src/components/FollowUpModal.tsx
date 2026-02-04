import React, { useState } from 'react';
import { Customer, FollowUp, FollowUpStatus } from '../types';
import { X, Calendar, FileText, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useCustomers } from '../context/CustomerContext';
import LoadingSpinner from './LoadingSpinner';

type FollowUpModalProps = {
  customer: Customer;
  onClose: () => void;
};

const FollowUpModal: React.FC<FollowUpModalProps> = ({ customer, onClose }) => {
  const { updateFollowUpStatus, loading } = useCustomers();
  const [salesAmounts, setSalesAmounts] = useState<Record<string, number>>({});

  const formatDate = (dateString: string): string => {
    return format(parseISO(dateString), 'dd/MM/yyyy');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: FollowUpStatus) => {
    switch (status) {
      case 'Sales completed':
        return 'bg-green-100 text-green-800';
      case 'Sales rejected':
        return 'bg-red-100 text-red-800';
      case 'Scheduled next follow-up':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleStatusChange = async (followUpId: string, status: FollowUpStatus) => {
    if (status === 'Sales completed') {
      const amount = salesAmounts[followUpId];
      if (!amount || amount <= 0) {
        alert('Please enter a valid sales amount for completed sales.');
        return;
      }
      await updateFollowUpStatus(customer.id, followUpId, status, amount);
    } else {
      await updateFollowUpStatus(customer.id, followUpId, status);
    }
  };

  const handleSalesAmountChange = (followUpId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setSalesAmounts(prev => ({ ...prev, [followUpId]: numAmount }));
  };

  const sortedFollowUps = [...customer.followUps].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Follow-ups for {customer.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-4">
            {sortedFollowUps.map((followUp) => (
              <div key={followUp.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{formatDate(followUp.date)}</span>
                  </div>
                  <select
                    value={followUp.status}
                    onChange={(e) => handleStatusChange(followUp.id, e.target.value as FollowUpStatus)}
                    className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(followUp.status)}`}
                    disabled={loading}
                  >
                    <option value="Not yet contacted">Not yet contacted</option>
                    <option value="Scheduled next follow-up">Scheduled next follow-up</option>
                    <option value="Sales completed">Sales completed</option>
                    <option value="Sales rejected">Sales rejected</option>
                  </select>
                </div>

                {followUp.status === 'Sales completed' && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    {followUp.salesAmount ? (
                      <span className="text-sm font-medium text-green-600">
                        Sales Amount: {formatCurrency(followUp.salesAmount)}
                        {followUp.amountReceived && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            ✓ Received
                          </span>
                        )}
                        {followUp.amountReceived === false && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                            ⏳ Pending
                          </span>
                        )}
                      </span>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Sales Amount:</span>
                        <input
                          type="number"
                          value={salesAmounts[followUp.id] || ''}
                          onChange={(e) => handleSalesAmountChange(followUp.id, e.target.value)}
                          placeholder="Enter amount"
                          className="w-32 px-2 py-1 text-sm border border-gray-300 rounded"
                          min="0"
                          step="0.01"
                        />
                        <span className="text-sm text-gray-600">₹</span>
                        <label className="flex items-center space-x-2 ml-4">
                          <input
                            type="checkbox"
                            checked={followUp.amountReceived || false}
                            onChange={(e) => {
                              // This would need to be handled by updating the follow-up
                              // For now, it's just visual - you'd need to add an update function
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Amount Received</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {followUp.remarks && (
                  <div className="flex items-start text-gray-600">
                    <FileText className="h-4 w-4 mr-2 mt-1" />
                    <span className="text-sm">{followUp.remarks}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="md" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;