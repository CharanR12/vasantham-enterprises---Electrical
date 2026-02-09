import React from 'react';
import { Customer, SalesPerson } from '../types';
import { Trash2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { Button } from '@/components/ui/button';
import { useReferralSourcesQuery } from '../hooks/queries/useReferralSourceQueries'; // Import hook
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCustomerForm } from '../hooks/useCustomerForm';
import { CustomerBasicDetails } from './forms/CustomerBasicDetails';
import { CustomerFollowUpSection } from './forms/CustomerFollowUpSection';

type CustomerFormProps = {
  customer?: Customer;
  onClose: () => void;
  salesPersons: SalesPerson[];
};

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onClose, salesPersons }) => {
  const { data: referralSources = [] } = useReferralSourcesQuery(); // Fetch referral sources
  const {
    formData,
    setFormData,
    errors,
    formLoading,
    deleteLoading,
    formError,
    setFormError,
    serverError,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSubmit,
    handleDelete,
    handleChange,
    handleSalesPersonChange,
    handleFollowUpChange,
    addNewFollowUp,
    removeFollowUp
  } = useCustomerForm(customer, salesPersons, onClose);

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
            {(serverError || formError) && (
              <ErrorMessage
                message={formError || serverError || ''}
                onDismiss={() => setFormError(null)}
                className="mb-4"
              />
            )}

            <div className="space-y-10">
              <CustomerBasicDetails
                formData={formData}
                errors={errors}
                handleChange={handleChange}
                setFormData={setFormData}
                handleSalesPersonChange={handleSalesPersonChange}
                salesPersons={salesPersons}
                referralSources={referralSources}
                disabled={formLoading || deleteLoading}
              />

              <CustomerFollowUpSection
                followUps={formData.followUps}
                errors={errors}
                handleFollowUpChange={handleFollowUpChange}
                addNewFollowUp={addNewFollowUp}
                removeFollowUp={removeFollowUp}
                disabled={formLoading || deleteLoading}
              />

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