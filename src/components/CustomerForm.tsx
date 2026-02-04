import React, { useState } from 'react';
import { Customer, ReferralSource, SalesPerson, FollowUpStatus } from '../types';
import { useCustomers } from '../context/CustomerContext';
import { Plus, Trash2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type CustomerFormProps = {
  customer?: Customer;
  onClose: () => void;
  salesPersons: SalesPerson[];
};

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onClose, salesPersons }) => {
  const { addCustomer, updateCustomer, deleteCustomer, error } = useCustomers();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const initialFollowUp = {
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    status: 'Not yet contacted' as FollowUpStatus,
    remarks: '',
    amountReceived: false
  };

  const initialState = {
    name: '',
    mobile: '',
    location: '',
    referralSource: 'Self Marketing' as ReferralSource,
    salesPerson: salesPersons.length > 0 ? salesPersons[0] : { id: '', name: '', mobile: '', location: '', target: 0, customersHandled: 0, salesCompleted: 0, totalRevenue: 0 },
    remarks: '',
    lastContactedDate: new Date().toISOString().split('T')[0],
    followUps: [initialFollowUp]
  };

  const [formData, setFormData] = useState<Customer | Omit<Customer, 'id' | 'createdAt'>>(customer || initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile is required';
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Mobile must be 10 digits';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.salesPerson || !formData.salesPerson.id) newErrors.salesPerson = 'Sales person is required';

    // Validate follow-ups
    formData.followUps.forEach((followUp, index) => {
      if (followUp.status === 'Sales completed' && (!followUp.salesAmount || followUp.salesAmount <= 0)) {
        newErrors[`followUp_${index}_salesAmount`] = 'Sales amount is required for completed sales';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    setFormError(null);

    try {
      let success = false;
      if (customer) {
        success = await updateCustomer(formData as Customer);
      } else {
        success = await addCustomer(formData as Omit<Customer, 'id' | 'createdAt'>);
      }

      if (success) {
        onClose();
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customer) return;

    try {
      setDeleteLoading(true);
      setFormError(null);
      const success = await deleteCustomer(customer.id);
      if (success) {
        onClose();
      }
    } catch (err) {
      setFormError('Failed to delete customer. Please try again.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'mobile' && !/^\d*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSalesPersonChange = (selectedPersonId: string) => {
    const selectedPerson = salesPersons.find(person => person.id === selectedPersonId);
    if (selectedPerson) {
      setFormData(prev => ({ ...prev, salesPerson: selectedPerson }));
    }
  };

  const handleFollowUpChange = (index: number, field: string, value: string | number | boolean) => {
    const newFollowUps = [...formData.followUps];
    if (field === 'salesAmount') {
      newFollowUps[index] = { ...newFollowUps[index], [field]: value ? parseFloat(value.toString()) : undefined };
    } else {
      newFollowUps[index] = { ...newFollowUps[index], [field]: value };
    }
    setFormData(prev => ({ ...prev, followUps: newFollowUps }));
  };

  const addNewFollowUp = () => {
    const newFollowUp = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      status: 'Not yet contacted' as FollowUpStatus,
      remarks: '',
      amountReceived: false
    };
    setFormData(prev => ({
      ...prev,
      followUps: [newFollowUp, ...prev.followUps]
    }));
  };

  const removeFollowUp = (index: number) => {
    const newFollowUps = [...formData.followUps];
    newFollowUps.splice(index, 1);
    setFormData(prev => ({ ...prev, followUps: newFollowUps }));
  };

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl h-[90vh] p-0 overflow-hidden rounded-3xl">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">
                {customer ? 'Edit Customer' : 'Add Customer'}
              </DialogTitle>
              <p className="text-slate-400 text-sm font-medium mt-1">Manage customer details</p>
            </DialogHeader>
            <div className="flex items-center gap-2">
              {customer && (
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {(error || formError) && (
              <ErrorMessage
                message={formError || error || ''}
                onDismiss={() => setFormError(null)}
                className="mb-4"
              />
            )}

            <div className="space-y-10">
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Johnathan Doe"
                    className={`h-12 bg-slate-50 border-slate-200/60 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-slate-700 font-medium ${errors.name ? 'border-red-500 bg-red-50/30' : ''}`}
                    disabled={formLoading || deleteLoading}
                  />
                  {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="mobile" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Mobile</Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-sm font-bold text-slate-400">+91</span>
                      </div>
                      <Input
                        id="mobile"
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className={`h-12 pl-12 bg-slate-50 border-slate-200/60 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-slate-700 font-medium ${errors.mobile ? 'border-red-500 bg-red-50/30' : ''}`}
                        maxLength={10}
                        placeholder="00000 00000"
                        disabled={formLoading || deleteLoading}
                      />
                    </div>
                    {errors.mobile && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.mobile}</p>}
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="location" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Chennai, TN"
                      className={`h-12 bg-slate-50 border-slate-200/60 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-slate-700 font-medium ${errors.location ? 'border-red-500 bg-red-50/30' : ''}`}
                      disabled={formLoading || deleteLoading}
                    />
                    {errors.location && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.location}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Referral Source</Label>
                    <Select
                      value={formData.referralSource}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, referralSource: value as ReferralSource }))}
                    >
                      <SelectTrigger className="h-12 bg-slate-50 border-slate-200/60 rounded-xl focus:ring-brand-500/20 focus:border-brand-500 text-slate-700 font-medium">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 shadow-xl overflow-hidden">
                        <SelectItem value="Self Marketing" className="py-3 focus:bg-brand-50">Self Marketing</SelectItem>
                        <SelectItem value="Doors Data" className="py-3 focus:bg-brand-50">Doors Data</SelectItem>
                        <SelectItem value="Walk-in Customer" className="py-3 focus:bg-brand-50">Walk-in Customer</SelectItem>
                        <SelectItem value="Collection" className="py-3 focus:bg-brand-50">Collection</SelectItem>
                        <SelectItem value="Build Expo 2024" className="py-3 focus:bg-brand-50">Build Expo 2024</SelectItem>
                        <SelectItem value="Build Expo 2025" className="py-3 focus:bg-brand-50">Build Expo 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Sales Person</Label>
                    <Select
                      value={formData.salesPerson.id}
                      onValueChange={handleSalesPersonChange}
                    >
                      <SelectTrigger className={`h-12 bg-slate-50 border-slate-200/60 rounded-xl focus:ring-brand-500/20 focus:border-brand-500 text-slate-700 font-medium ${errors.salesPerson ? 'border-red-500 bg-red-50/30' : ''}`}>
                        <SelectValue placeholder="Executive" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 shadow-xl overflow-hidden">
                        {salesPersons.map((person) => (
                          <SelectItem key={person.id} value={person.id} className="py-3 focus:bg-brand-50">
                            {person.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.salesPerson && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1">{errors.salesPerson}</p>}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Follow Ups</Label>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 ml-1 italic">Track customer interactions</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addNewFollowUp}
                      className="h-9 px-4 border-brand-200 text-brand-600 hover:bg-brand-50 hover:border-brand-300 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5"
                      disabled={formLoading || deleteLoading}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Follow Up</span>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.followUps.map((followUp, index) => (
                      <div key={followUp.id} className="bg-slate-50/40 border border-slate-200/50 rounded-3xl p-6 space-y-6 transition-all duration-300 hover:border-slate-300/60 hover:bg-white shadow-sm hover:shadow-md group">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-brand-600 group-hover:border-brand-100 transition-colors">
                              {String(index + 1).padStart(2, '0')}
                            </div>
                            <div>
                              <span className="text-sm font-black text-slate-800 tracking-tight">Follow Up #{formData.followUps.length - index}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${followUp.amountReceived ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{followUp.amountReceived ? 'Received' : 'Pending'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <Checkbox
                                id={`received-${index}`}
                                checked={followUp.amountReceived || false}
                                onCheckedChange={(checked) => handleFollowUpChange(index, 'amountReceived', !!checked)}
                                disabled={formLoading || deleteLoading}
                                className="w-4 h-4 rounded border-slate-300 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600 transition-all duration-300"
                              />
                              <Label htmlFor={`received-${index}`} className="text-[10px] font-black text-slate-500 cursor-pointer uppercase tracking-wider">Amount Received</Label>
                            </div>

                            {formData.followUps.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => removeFollowUp(index)}
                                className="h-9 w-9 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                                disabled={formLoading || deleteLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</Label>
                            <Input
                              type="date"
                              value={followUp.date}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFollowUpChange(index, 'date', e.target.value)}
                              className="h-11 bg-white border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-brand-500/20"
                              disabled={formLoading || deleteLoading}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</Label>
                            <Select
                              value={followUp.status}
                              onValueChange={(value) => handleFollowUpChange(index, 'status', value as FollowUpStatus)}
                            >
                              <SelectTrigger className="h-11 bg-white border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-brand-500/20">
                                <SelectValue placeholder="Set Status" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border-slate-200 shadow-xl overflow-hidden">
                                <SelectItem value="Not yet contacted" className="py-2.5 focus:bg-brand-50">Not yet contacted</SelectItem>
                                <SelectItem value="Scheduled next follow-up" className="py-2.5 focus:bg-brand-50">Scheduled next follow-up</SelectItem>
                                <SelectItem value="Sales completed" className="py-2.5 focus:bg-brand-50">Sales completed</SelectItem>
                                <SelectItem value="Sales rejected" className="py-2.5 focus:bg-brand-50">Sales rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {followUp.status === 'Sales completed' && (
                          <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sales Amount (₹)</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-sm font-black text-brand-600 italic">₹</span>
                              </div>
                              <Input
                                type="number"
                                value={followUp.salesAmount || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFollowUpChange(index, 'salesAmount', e.target.value)}
                                className={`h-11 pl-9 bg-white border-slate-200/60 rounded-2xl text-sm font-black text-slate-800 focus:ring-brand-500/20 ${errors[`followUp_${index}_salesAmount`] ? 'border-red-500 bg-red-50/20' : ''}`}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                disabled={formLoading || deleteLoading}
                              />
                            </div>
                            {errors[`followUp_${index}_salesAmount`] && (
                              <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1 mt-1.5">{errors[`followUp_${index}_salesAmount`]}</p>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks</Label>
                          <Textarea
                            value={followUp.remarks}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFollowUpChange(index, 'remarks', e.target.value)}
                            rows={2}
                            className="bg-white border-slate-200/60 rounded-2xl text-sm font-medium resize-none placeholder:text-slate-300 focus:ring-brand-500/20 p-4"
                            placeholder="Add highlights from the interaction..."
                            disabled={formLoading || deleteLoading}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Remarks</Label>
                  <Textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows={3}
                    className="bg-slate-50 border-slate-200/60 rounded-[1.5rem] text-sm font-medium resize-none placeholder:text-slate-300 focus:ring-brand-500/20 p-5"
                    placeholder="Add any notes about this customer..."
                    disabled={formLoading || deleteLoading}
                  />
                </div>

                <div className="h-6"></div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-10 px-6 rounded-xl font-medium"
              disabled={formLoading || deleteLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="h-10 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-md"
              disabled={formLoading || deleteLoading}
            >
              {formLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {customer ? 'Save Changes' : 'Add Customer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showDeleteConfirm && (
        <Dialog open={showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(false)}>
          <DialogContent className="max-w-sm rounded-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900 mb-2">Delete Customer?</DialogTitle>
              <p className="text-slate-500 text-sm mb-6">
                You're about to delete <span className="font-semibold text-slate-800">"{customer?.name}"</span>. This cannot be undone.
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleDelete}
                  className="h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold"
                  disabled={deleteLoading}
                >
                  {deleteLoading && <LoadingSpinner size="sm" className="mr-2" />}
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-11 text-slate-500 hover:text-slate-700"
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CustomerForm;