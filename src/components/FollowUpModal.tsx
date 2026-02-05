import React, { useState } from 'react';
import { Customer, FollowUpStatus } from '../types';
import { Calendar as CalendarIcon, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useUpdateFollowUpStatusMutation } from '../hooks/queries/useCustomerQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type FollowUpModalProps = {
  customer: Customer;
  onClose: () => void;
};

const FollowUpModal: React.FC<FollowUpModalProps> = ({ customer, onClose }) => {
  const updateFollowUpMutation = useUpdateFollowUpStatusMutation();
  const [salesAmounts, setSalesAmounts] = useState<Record<string, number>>({});

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleStatusChange = async (followUpId: string, status: FollowUpStatus) => {
    try {
      if (status === 'Sales completed') {
        const amount = salesAmounts[followUpId];
        if (!amount || amount <= 0) {
          return;
        }
        await updateFollowUpMutation.mutateAsync({ customerId: customer.id, followUpId, status, salesAmount: amount });
      } else {
        await updateFollowUpMutation.mutateAsync({ customerId: customer.id, followUpId, status });
      }
    } catch (error) {
      console.error('Failed to update follow-up status:', error);
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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-brand-600" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-800">Follow-ups</DialogTitle>
            </div>
            <p className="text-slate-400 text-sm font-medium mt-1">Customer: <span className="text-slate-600 font-semibold">{customer.name}</span></p>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {sortedFollowUps.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                <Clock className="h-7 w-7 text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium">No follow-ups found</p>
            </div>
          ) : (
            sortedFollowUps.map((followUp) => (
              <div key={followUp.id} className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-5 space-y-4 transition-all duration-300 hover:border-slate-300 hover:bg-white shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-white rounded-lg border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {formatDate(followUp.date)}
                    </div>
                  </div>

                  <Select
                    value={followUp.status}
                    onValueChange={(value) => handleStatusChange(followUp.id, value as FollowUpStatus)}
                  >
                    <SelectTrigger className="w-auto h-9 bg-white border-slate-200 rounded-xl pl-3 pr-8 text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Not yet contacted" className="text-xs py-2">Not yet contacted</SelectItem>
                      <SelectItem value="Scheduled next follow-up" className="text-xs py-2">Scheduled next follow-up</SelectItem>
                      <SelectItem value="Sales completed" className="text-xs py-2">Sales completed</SelectItem>
                      <SelectItem value="Sales rejected" className="text-xs py-2">Sales rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 min-h-[70px]">
                    <div className="mt-1">
                      <AlertCircle className="h-4 w-4 text-slate-300" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remarks</Label>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed mt-1">
                        {followUp.remarks || "No remarks recorded."}
                      </p>
                    </div>
                  </div>

                  {followUp.status === 'Sales completed' && (
                    <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white border border-emerald-100 flex items-center justify-center text-emerald-600">
                            <DollarSign className="h-4 w-4" />
                          </div>
                          <div>
                            <Label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Sales Amount</Label>
                            {followUp.salesAmount ? (
                              <p className="text-sm font-bold text-emerald-700">{formatCurrency(followUp.salesAmount)}</p>
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  type="number"
                                  value={salesAmounts[followUp.id] || ''}
                                  onChange={(e) => handleSalesAmountChange(followUp.id, e.target.value)}
                                  placeholder="0"
                                  className="h-8 w-24 bg-white border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 px-2"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(followUp.id, 'Sales completed')}
                                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 text-xs font-semibold"
                                >
                                  Save
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {followUp.amountReceived && (
                          <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5">
                            <CheckCircle className="h-3 w-3" />
                            <span>Received</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-center">
          <Button
            onClick={onClose}
            className="h-10 px-8 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowUpModal;