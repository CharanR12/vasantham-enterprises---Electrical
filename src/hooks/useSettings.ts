import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useCustomers } from '../context/CustomerContext';

export const useSettings = () => {
    const {
        brands,
        addBrand,
        updateBrand,
        deleteBrand,
        loading: inventoryLoading,
        error: inventoryError
    } = useInventory();

    const {
        salesPersons,
        addSalesPerson,
        updateSalesPerson,
        removeSalesPerson,
        salesPersonsLoading,
        salesPersonsError
    } = useCustomers();

    const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
    const [editBrandName, setEditBrandName] = useState('');
    const [newBrandName, setNewBrandName] = useState('');

    const [editingSalesPersonId, setEditingSalesPersonId] = useState<string | null>(null);
    const [editSalesPersonName, setEditSalesPersonName] = useState('');
    const [newSalesPersonName, setNewSalesPersonName] = useState('');

    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const handleEditBrand = (id: string, name: string) => {
        setEditingBrandId(id);
        setEditBrandName(name);
        setActionError(null);
    };

    const handleSaveBrand = async (id: string) => {
        if (!editBrandName.trim()) {
            setActionError('Brand name cannot be empty');
            return;
        }

        setActionLoading(id);
        setActionError(null);

        try {
            const success = await updateBrand(id, editBrandName.trim());
            if (success) {
                setEditingBrandId(null);
                setEditBrandName('');
            } else {
                setActionError('Failed to update brand');
            }
        } catch (err: any) {
            setActionError(err.message || 'An unexpected error occurred');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddBrand = async () => {
        if (!newBrandName.trim()) {
            setActionError('Brand name cannot be empty');
            return;
        }

        setActionLoading('add-brand');
        setActionError(null);

        try {
            const success = await addBrand(newBrandName.trim());
            if (success) {
                setNewBrandName('');
            } else {
                setActionError('Failed to add brand');
            }
        } catch (err: any) {
            setActionError(err.message || 'An unexpected error occurred');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveBrand = async (id: string) => {
        if (!confirm('Are you sure you want to remove this brand? This may affect associated products.')) return;

        setActionLoading(id);
        setActionError(null);

        try {
            const success = await deleteBrand(id);
            if (!success) {
                setActionError('Failed to remove brand. It may have associated products.');
            }
        } catch (err: any) {
            setActionError(err.message || 'An unexpected error occurred');
        } finally {
            setActionLoading(null);
        }
    };

    const handleEditSalesPerson = (id: string, name: string) => {
        setEditingSalesPersonId(id);
        setEditSalesPersonName(name);
        setActionError(null);
    };

    const handleSaveSalesPerson = async (id: string) => {
        if (!editSalesPersonName.trim()) {
            setActionError('Sales person name cannot be empty');
            return;
        }

        setActionLoading(id);
        setActionError(null);

        try {
            const success = await updateSalesPerson(id, editSalesPersonName.trim());
            if (success) {
                setEditingSalesPersonId(null);
                setEditSalesPersonName('');
            } else {
                setActionError('Failed to update sales person');
            }
        } catch (err: any) {
            setActionError(err.message || 'An unexpected error occurred');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddSalesPerson = async () => {
        if (!newSalesPersonName.trim()) {
            setActionError('Sales person name cannot be empty');
            return;
        }

        setActionLoading('add-sales-person');
        setActionError(null);

        try {
            const success = await addSalesPerson(newSalesPersonName.trim());
            if (success) {
                setNewSalesPersonName('');
            } else {
                setActionError('Failed to add sales person');
            }
        } catch (err: any) {
            setActionError(err.message || 'An unexpected error occurred');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveSalesPerson = async (id: string) => {
        if (!confirm('Are you sure you want to remove this sales person? This may affect associated customers.')) return;

        setActionLoading(id);
        setActionError(null);

        try {
            const success = await removeSalesPerson(id);
            if (!success) {
                setActionError('Failed to remove sales person. They may have associated customers.');
            }
        } catch (err: any) {
            setActionError('An unexpected error occurred while removing sales person');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = () => {
        setEditingBrandId(null);
        setEditBrandName('');
        setEditingSalesPersonId(null);
        setEditSalesPersonName('');
        setActionError(null);
    };

    return {
        brands,
        salesPersons,
        loading: inventoryLoading || salesPersonsLoading,
        error: inventoryError || salesPersonsError,
        actionLoading,
        actionError,
        setActionError,

        // Brand states/handlers
        editingBrandId,
        editBrandName,
        setEditBrandName,
        newBrandName,
        setNewBrandName,
        handleEditBrand,
        handleSaveBrand,
        handleAddBrand,
        handleRemoveBrand,

        // Sales person states/handlers
        editingSalesPersonId,
        editSalesPersonName,
        setEditSalesPersonName,
        newSalesPersonName,
        setNewSalesPersonName,
        handleEditSalesPerson,
        handleSaveSalesPerson,
        handleAddSalesPerson,
        handleRemoveSalesPerson,

        handleCancel
    };
};
