import React, { useState } from 'react';
import { Customer, ReferralSource, SalesPerson, FollowUpStatus } from '../types';
import { useCustomers } from '../context/CustomerContext';
import { X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

type CustomerFormProps = {
  customer?: Customer;
  onClose: () => void;
};

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onClose }) => {
  const { salesPersons, addCustomer, updateCustomer, deleteCustomer, loading, error } = useCustomers();
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initialFollowUp = {
    id: Date.now().toString(),
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Not yet contacted' as FollowUpStatus,
    remarks: '',
    salesAmount: undefined
  };

  const initialState = {
    name: '',
    mobile: '',
    location: '',
    referralSource: 'Self Marketing' as ReferralSource,
    salesPerson: salesPersons[0] || { id: '', name: '' },
    remarks: '',
    lastContactedDate: '',
    followUps: [initialFollowUp]
  };

  const [formData, setFormData] = useState(customer || initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Enter valid 10-digit Indian mobile number';
    }
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.salesPerson.id) newErrors.salesPerson = 'Sales person is required';
    
    // Validate sales amounts for completed sales
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
        success = await updateCustomer(formData);
      } else {
        success = await addCustomer(formData);
      }
      
      if (success) {
        onClose();
      } else {
        setFormError('Failed to save customer. Please try again.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customer) return;
    
    setDeleteLoading(true);
    setFormError(null);
    
    try {
      const success = await deleteCustomer(customer.id);
      if (success) {
        onClose();
      } else {
        setFormError('Failed to delete customer. Please try again.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred while deleting.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'mobile' && !/^\d*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSalesPersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPersonId = e.target.value;
    const selectedPerson = salesPersons.find(person => person.id === selectedPersonId);
    if (selectedPerson) {
      setFormData(prev => ({ ...prev, salesPerson: selectedPerson }));
    }
  };

  const handleFollowUpChange = (index: number, field: string, value: string | number) => {
    const newFollowUps = [...formData.followUps];
    if (field === 'salesAmount') {
      newFollowUps[index] = { ...newFollowUps[index], [field]: value ? parseFloat(value.toString()) : undefined };
    } else {
      newFollowUps[index] = { ...newFollowUps[index], [field]: value };
    }
    
    // Clear sales amount if status is not "Sales completed"
    if (field === 'status' && value !== 'Sales completed') {
      newFollowUps[index].salesAmount = undefined;
    }
    
    setFormData(prev => ({ ...prev, followUps: newFollowUps }));
  };

  const addNewFollowUp = () => {
    setFormData(prev => ({
      ...prev,
      followUps: [...prev.followUps, {
        ...initialFollowUp,
        id: Date.now().toString()
      }]
    }));
  };

  const removeFollowUp = (index: number) => {
    if (formData.followUps.length > 1) {
      setFormData(prev => ({
        ...prev,
        followUps: prev.followUps.filter((_, i) => i !== index)
      }));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
            <h2 className="text-lg font-semibold">{customer ? 'Edit' : 'Add'} Customer</h2>
            <div className="flex items-center space-x-2">
              {customer && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete customer"
                  disabled={formLoading || deleteLoading}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {(error || formError) && (
              <ErrorMessage 
                message={formError || error || ''} 
                onDismiss={() => setFormError(null)}
                className="mb-4"
              />
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={formLoading || deleteLoading}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <div className="flex">
                  <div className="flex items-center bg-gray-50 border border-r-0 border-gray-300 rounded-l-md px-3">
                    <span className="text-sm">+91</span>
                  </div>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-r-md ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
                    maxLength={10}
                    disabled={formLoading || deleteLoading}
                  />
                </div>
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={formLoading || deleteLoading}
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Contacted Date</label>
                <input
                  type="date"
                  name="lastContactedDate"
                  value={formData.lastContactedDate || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={formLoading || deleteLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Source</label>
                <select
                  name="referralSource"
                  value={formData.referralSource}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white"
                  disabled={formLoading || deleteLoading}
                >
                  <option value="Self Marketing">Self Marketing</option>
                  <option value="Doors Data">Doors Data</option>
                  <option value="Walk-in Customer">Walk-in Customer</option>
                  <option value="Collection">Collection</option>
                  <option value="Build Expo 2024">Build Expo 2024</option>
                  <option value="Build Expo 2025">Build Expo 2025</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Person</label>
                <select
                  value={formData.salesPerson.id}
                  onChange={handleSalesPersonChange}
                  className={`w-full p-2 border rounded-md bg-white ${errors.salesPerson ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={formLoading || deleteLoading}
                >
                  <option value="">Select Sales Person</option>
                  {salesPersons.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
                {errors.salesPerson && <p className="text-red-500 text-xs mt-1">{errors.salesPerson}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Follow-ups</label>
                  <button
                    type="button"
                    onClick={addNewFollowUp}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    disabled={formLoading || deleteLoading}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Follow-up</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.followUps.map((followUp, index) => (
                    <div key={followUp.id} className="border rounded-md p-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Follow-up {index + 1}</span>
                        {formData.followUps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFollowUp(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={formLoading || deleteLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        
                        <div className="mt-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={followUp.amountReceived || false}
                              onChange={(e) => handleFollowUpChange(index, 'amountReceived', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              disabled={formLoading || deleteLoading}
                            />
                            <span className="text-sm text-gray-700">Amount Received</span>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={followUp.date}
                          onChange={(e) => handleFollowUpChange(index, 'date', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          disabled={formLoading || deleteLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={followUp.status}
                          onChange={(e) => handleFollowUpChange(index, 'status', e.target.value as FollowUpStatus)}
                          className="w-full p-2 border border-gray-300 rounded-md bg-white"
                          disabled={formLoading || deleteLoading}
                        >
                          <option value="Not yet contacted">Not yet contacted</option>
                          <option value="Scheduled next follow-up">Scheduled next follow-up</option>
                          <option value="Sales completed">Sales completed</option>
                          <option value="Sales rejected">Sales rejected</option>
                        </select>
                      </div>

                      {followUp.status === 'Sales completed' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sales Amount (₹)</label>
                          <input
                            type="number"
                            value={followUp.salesAmount || ''}
                            onChange={(e) => handleFollowUpChange(index, 'salesAmount', e.target.value)}
                            className={`w-full p-2 border rounded-md ${errors[`followUp_${index}_salesAmount`] ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter sales amount"
                            min="0"
                            step="0.01"
                            disabled={formLoading || deleteLoading}
                          />
                          {errors[`followUp_${index}_salesAmount`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`followUp_${index}_salesAmount`]}</p>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                        <textarea
                          value={followUp.remarks}
                          onChange={(e) => handleFollowUpChange(index, 'remarks', e.target.value)}
                          rows={2}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          disabled={formLoading || deleteLoading}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={formLoading || deleteLoading}
                />
              </div>

              {/* Add some bottom padding to ensure content doesn't get hidden behind fixed buttons */}
              <div className="h-20"></div>
            </div>
          </div>

          {/* Fixed Footer with Buttons */}
          <div className="flex-shrink-0 border-t bg-white p-4 rounded-b-lg">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={formLoading || deleteLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                disabled={formLoading || deleteLoading}
              >
                {formLoading && <LoadingSpinner size="sm" className="mr-2" />}
                {customer ? 'Update' : 'Add'} Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Delete Customer</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{customer?.name}"? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center transition-colors"
                disabled={deleteLoading}
              >
                {deleteLoading && <LoadingSpinner size="sm" className="mr-2" />}
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerForm;