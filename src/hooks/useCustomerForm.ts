import { useState } from 'react';
import { Customer, ReferralSource, SalesPerson, FollowUpStatus } from '../types';
import {
    useAddCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation
} from './queries/useCustomerQueries';

export const useCustomerForm = (customer: Customer | undefined, salesPersons: SalesPerson[], onClose: () => void) => {
    const addCustomerMutation = useAddCustomerMutation();
    const updateCustomerMutation = useUpdateCustomerMutation();
    const deleteCustomerMutation = useDeleteCustomerMutation();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

        formData.followUps.forEach((followUp, index) => {
            if (followUp.status === 'Sales completed' && (!followUp.salesAmount || followUp.salesAmount <= 0)) {
                newErrors[`followUp_${index}_salesAmount`] = 'Sales amount is required for completed sales';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setFormError(null);

        try {
            if (customer) {
                await updateCustomerMutation.mutateAsync(formData as Customer);
            } else {
                await addCustomerMutation.mutateAsync(formData as Omit<Customer, 'id' | 'createdAt'>);
            }
            onClose();
        } catch (err: any) {
            setFormError(err.message || 'An unexpected error occurred. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (!customer) return;

        try {
            setFormError(null);
            await deleteCustomerMutation.mutateAsync(customer.id);
            onClose();
        } catch (err: any) {
            setFormError(err.message || 'Failed to delete customer. Please try again.');
        } finally {
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

    return {
        formData,
        setFormData,
        errors,
        formLoading: addCustomerMutation.isPending || updateCustomerMutation.isPending,
        deleteLoading: deleteCustomerMutation.isPending,
        formError,
        setFormError,
        serverError: addCustomerMutation.error?.message || updateCustomerMutation.error?.message || deleteCustomerMutation.error?.message || null,
        showDeleteConfirm,
        setShowDeleteConfirm,
        handleSubmit,
        handleDelete,
        handleChange,
        handleSalesPersonChange,
        handleFollowUpChange,
        addNewFollowUp,
        removeFollowUp
    };
};
