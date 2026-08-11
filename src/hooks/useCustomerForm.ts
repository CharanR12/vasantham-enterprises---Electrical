import { useState, useEffect } from 'react';
import { Customer, ReferralSource, SalesPerson, FollowUpStatus, PaymentInstallment } from '../types';
import { useBranch } from '../contexts/BranchContext';
import {
    useAddCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation
} from './queries/useCustomerQueries';

export const useCustomerForm = (customer: Customer | undefined, salesPersons: SalesPerson[], onClose: () => void) => {
    const { currentBranch } = useBranch(); // Get current branch
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
        amountReceived: false,
        billNo: '',
        billAmount: undefined,
        amountGiven: undefined,
        balanceAmount: undefined,
        installments: []
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

    const getInitialFormData = (): Customer | Omit<Customer, 'id' | 'createdAt'> => {
        if (!customer) return initialState;
        
        // Dynamic legacy check & repair on form load to guarantee zero cached-data issues!
        const repairedFollowUps = customer.followUps.map(fu => {
            if (fu.status === 'Sales completed') {
                const salesAmt = fu.salesAmount || 0;
                let billAmt = fu.billAmount;
                let amtGiven = fu.amountGiven;
                let balAmt = fu.balanceAmount;
                let insts = Array.isArray(fu.installments) ? fu.installments : [];

                if (billAmt === undefined || billAmt === null || billAmt === 0) {
                    billAmt = salesAmt;
                }
                if (amtGiven === undefined || amtGiven === null || amtGiven === 0) {
                    if (fu.amountReceived) {
                        amtGiven = billAmt;
                    } else if (balAmt !== undefined && balAmt !== null && balAmt !== 0) {
                        amtGiven = Math.max(0, billAmt - balAmt);
                    } else {
                        amtGiven = 0;
                    }
                }
                balAmt = billAmt - amtGiven;
                if (insts.length === 0 && amtGiven > 0) {
                    insts = [{
                        id: 'inst-initial',
                        date: fu.date,
                        amount: amtGiven
                    }];
                }

                return {
                    ...fu,
                    billAmount: billAmt,
                    amountGiven: amtGiven,
                    balanceAmount: balAmt,
                    installments: insts
                };
            }
            return fu;
        });

        return {
            ...customer,
            followUps: repairedFollowUps
        };
    };

    const [formData, setFormData] = useState<Customer | Omit<Customer, 'id' | 'createdAt'>>(getInitialFormData());
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-select "Solar Representative" if in Solar branch
    useEffect(() => {
        if (currentBranch === 'Solar') {
            const solarPerson = salesPersons.find(sp =>
                (sp.branch === 'Solar') || // Best check if branch column exists on type
                sp.name.toLowerCase().includes('solar') || // Fallback
                sp.name.toLowerCase().includes('branch')
            );

            if (solarPerson && formData.salesPerson.id !== solarPerson.id) {
                setFormData(prev => ({ ...prev, salesPerson: solarPerson }));
            }
        }
    }, [currentBranch, salesPersons, formData.salesPerson.id]);

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

    const handleFollowUpChange = (index: number, field: string, value: any) => {
        const newFollowUps = [...formData.followUps];
        if (field === 'salesAmount' || field === 'billAmount' || field === 'amountGiven') {
            const parsedValue = value ? parseFloat(value.toString()) : undefined;
            newFollowUps[index] = { ...newFollowUps[index], [field]: parsedValue };
            
            // Auto-calculate balance and received status if it is Sales completed
            const billAmt = field === 'billAmount' ? (parsedValue || 0) : (newFollowUps[index].billAmount || 0);
            const amtGiven = field === 'amountGiven' ? (parsedValue || 0) : (newFollowUps[index].amountGiven || 0);
            const balance = billAmt - amtGiven;
            
            newFollowUps[index].balanceAmount = balance;
            newFollowUps[index].amountReceived = balance <= 0;
            // Align salesAmount for backward compatibility
            newFollowUps[index].salesAmount = billAmt;

            // Auto-register as initial installment in array
            if (amtGiven > 0) {
                newFollowUps[index].installments = [{
                    id: 'inst-initial',
                    date: newFollowUps[index].date || new Date().toISOString().split('T')[0],
                    amount: amtGiven
                }];
            } else {
                newFollowUps[index].installments = [];
            }
        } else if (field === 'amountReceived') {
            const received = !!value;
            const billAmt = newFollowUps[index].billAmount || newFollowUps[index].salesAmount || 0;
            newFollowUps[index].amountReceived = received;
            if (received) {
                newFollowUps[index].amountGiven = billAmt;
                newFollowUps[index].balanceAmount = 0;
                
                const currentInst = newFollowUps[index].installments || [];
                if (currentInst.length === 0 && billAmt > 0) {
                    newFollowUps[index].installments = [{
                        id: 'inst-initial',
                        date: newFollowUps[index].date || new Date().toISOString().split('T')[0],
                        amount: billAmt
                    }];
                } else if (currentInst.length > 0) {
                    const totalGiven = currentInst.reduce((sum, inst) => sum + (inst.amount || 0), 0);
                    if (totalGiven !== billAmt) {
                        newFollowUps[index].installments = [{
                            id: 'inst-initial',
                            date: newFollowUps[index].date || new Date().toISOString().split('T')[0],
                            amount: billAmt
                        }];
                    }
                }
            } else {
                newFollowUps[index].amountGiven = 0;
                newFollowUps[index].balanceAmount = billAmt;
                newFollowUps[index].installments = [];
            }
        } else if (field === 'installments') {
            const list = value as PaymentInstallment[];
            const billAmt = newFollowUps[index].billAmount || 0;
            const totalGiven = list.reduce((sum, inst) => sum + (inst.amount || 0), 0);
            const balance = billAmt - totalGiven;

            newFollowUps[index] = {
                ...newFollowUps[index],
                installments: list,
                amountGiven: totalGiven,
                balanceAmount: balance,
                amountReceived: balance <= 0
            };
        } else if (field === 'date') {
            newFollowUps[index] = { ...newFollowUps[index], [field]: value };
            if (newFollowUps[index].installments && newFollowUps[index].installments.length > 0) {
                newFollowUps[index].installments = newFollowUps[index].installments.map(inst => 
                    inst.id === 'inst-initial' ? { ...inst, date: value } : inst
                );
            }
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
            amountReceived: false,
            billNo: '',
            billAmount: undefined,
            amountGiven: undefined,
            balanceAmount: undefined,
            installments: []
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
