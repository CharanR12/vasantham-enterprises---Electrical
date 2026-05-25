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
  const [salesDetails, setSalesDetails] = useState<Record<string, {
    billNo: string;
    billAmount: string;
    amountGiven: string;
  }>>({});

  const [editingDetailsId, setEditingDetailsId] = useState<string | null>(null);

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
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
        const existingFollowUp = customer.followUps.find(f => f.id === followUpId);
        setSalesDetails(prev => ({
          ...prev,
          [followUpId]: {
            billNo: existingFollowUp?.billNo || '',
            billAmount: String(existingFollowUp?.billAmount || existingFollowUp?.salesAmount || ''),
            amountGiven: String(existingFollowUp?.amountGiven || existingFollowUp?.salesAmount || '')
          }
        }));
        setEditingDetailsId(followUpId);
      } else {
        await updateFollowUpMutation.mutateAsync({ customerId: customer.id, followUpId, status });
        setEditingDetailsId(null);
      }
    } catch (error) {
      console.error('Failed to update follow-up status:', error);
    }
  };

  const handleSalesDetailChange = (followUpId: string, field: 'billNo' | 'billAmount' | 'amountGiven', value: string) => {
    setSalesDetails(prev => ({
      ...prev,
      [followUpId]: {
        ...prev[followUpId] || { billNo: '', billAmount: '', amountGiven: '' },
        [field]: value
      }
    }));
  };

  const calculateBalance = (followUpId: string): number => {
    const details = salesDetails[followUpId];
    if (!details) return 0;
    const billAmt = parseFloat(details.billAmount) || 0;
    const amtGiven = parseFloat(details.amountGiven) || 0;
    return Math.max(0, billAmt - amtGiven);
  };

  const handleSaveSalesDetails = async (followUpId: string) => {
    const details = salesDetails[followUpId];
    if (!details) return;

    const billAmount = parseFloat(details.billAmount) || 0;
    const amountGiven = parseFloat(details.amountGiven) || 0;
    const balanceAmount = billAmount - amountGiven;

    if (billAmount <= 0) {
      alert("Please enter a valid bill amount.");
      return;
    }

    try {
      await updateFollowUpMutation.mutateAsync({
        customerId: customer.id,
        followUpId,
        status: 'Sales completed',
        salesAmount: billAmount, // legacy fallback
        billNo: details.billNo || '',
        billAmount,
        amountGiven,
        balanceAmount
      });
      setEditingDetailsId(null);
    } catch (error) {
      console.error("Failed to save follow-up payment details:", error);
    }
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

        <div className="p-4 overflow-y-auto max-h-[60vh]">
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
                    <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-5 shadow-sm space-y-4 animate-in fade-in duration-300">
                      {editingDetailsId === followUp.id || (!followUp.billAmount && !followUp.salesAmount) ? (
                        /* Edit / Form mode */
                        <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider">Configure Sales Payments</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bill No</Label>
                              <Input
                                type="text"
                                value={salesDetails[followUp.id]?.billNo || ''}
                                onChange={(e) => handleSalesDetailChange(followUp.id, 'billNo', e.target.value)}
                                className="h-9 bg-white border-emerald-100 rounded-xl text-xs font-medium"
                                placeholder="INV-001"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bill Amount (₹)</Label>
                              <Input
                                type="number"
                                value={salesDetails[followUp.id]?.billAmount || ''}
                                onChange={(e) => handleSalesDetailChange(followUp.id, 'billAmount', e.target.value)}
                                className="h-9 bg-white border-emerald-100 rounded-xl text-xs font-bold"
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount Given (₹)</Label>
                              <Input
                                type="number"
                                value={salesDetails[followUp.id]?.amountGiven || ''}
                                onChange={(e) => handleSalesDetailChange(followUp.id, 'amountGiven', e.target.value)}
                                className="h-9 bg-white border-emerald-100 rounded-xl text-xs font-bold"
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-1 flex flex-col justify-end">
                              <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</Label>
                              <div className="h-9 flex items-center px-3 bg-emerald-100/60 rounded-xl text-xs font-black text-emerald-800">
                                {formatCurrency(calculateBalance(followUp.id))}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            {(followUp.billAmount || followUp.salesAmount) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingDetailsId(null)}
                                className="h-8 rounded-lg text-xs"
                              >
                                Cancel
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => handleSaveSalesDetails(followUp.id)}
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 text-xs font-bold"
                            >
                              Save Details
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Presentation mode */
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-700">
                                <DollarSign className="h-4 w-4" />
                              </div>
                              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">Completed Sale Details</span>
                            </div>
                            {followUp.amountReceived ? (
                              <div className="px-2.5 py-1 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                <span>Fully Received</span>
                              </div>
                            ) : (
                              <div className="px-2.5 py-1 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                <span>Pending Payment</span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm text-xs">
                            <div className="space-y-0.5">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bill No</div>
                              <div className="font-semibold text-slate-800">{followUp.billNo || 'N/A'}</div>
                            </div>
                            <div className="space-y-0.5">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bill Amount</div>
                              <div className="font-bold text-slate-800">{formatCurrency(followUp.billAmount || followUp.salesAmount || 0)}</div>
                            </div>
                            <div className="space-y-0.5">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Amount Paid</div>
                              <div className="font-bold text-emerald-700">{formatCurrency(followUp.amountGiven || followUp.salesAmount || 0)}</div>
                            </div>
                            <div className="space-y-0.5">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Balance Pending</div>
                              <div className={`font-black ${followUp.balanceAmount && followUp.balanceAmount > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                {formatCurrency(followUp.balanceAmount !== undefined ? followUp.balanceAmount : (followUp.amountReceived ? 0 : (followUp.salesAmount || 0)))}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSalesDetails(prev => ({
                                  ...prev,
                                  [followUp.id]: {
                                    billNo: followUp.billNo || '',
                                    billAmount: String(followUp.billAmount || followUp.salesAmount || ''),
                                    amountGiven: String(followUp.amountGiven || followUp.salesAmount || '')
                                  }
                                }));
                                setEditingDetailsId(followUp.id);
                              }}
                              className="h-8 hover:bg-emerald-100/50 hover:text-emerald-700 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-1.5"
                            >
                              Edit/Update Payments
                            </Button>
                          </div>
                        </div>
                      )}
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