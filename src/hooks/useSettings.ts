import { useState } from 'react';
import {
    useBrandsQuery,
    useAddBrandMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation
} from './queries/useInventoryQueries';
import {
    useSalesPersonsQuery,
    useAddSalesPersonMutation,
    useUpdateSalesPersonMutation,
    useDeleteSalesPersonMutation
} from './queries/useCustomerQueries';

export const useSettings = () => {
    const { data: brands = [], isLoading: brandsLoading, error: brandsError } = useBrandsQuery();
    const { data: salesPersons = [], isLoading: sPLoading, error: sPError } = useSalesPersonsQuery();

    const addBrandMutation = useAddBrandMutation();
    const updateBrandMutation = useUpdateBrandMutation();
    const deleteBrandMutation = useDeleteBrandMutation();

    const addSalesPersonMutation = useAddSalesPersonMutation();
    const updateSalesPersonMutation = useUpdateSalesPersonMutation();
    const deleteSalesPersonMutation = useDeleteSalesPersonMutation();

    const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
    const [editBrandName, setEditBrandName] = useState('');
    const [newBrandName, setNewBrandName] = useState('');

    const [editingSalesPersonId, setEditingSalesPersonId] = useState<string | null>(null);
    const [editSalesPersonName, setEditSalesPersonName] = useState('');
    const [newSalesPersonName, setNewSalesPersonName] = useState('');

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

        try {
            await updateBrandMutation.mutateAsync({ id, name: editBrandName.trim() });
            setEditingBrandId(null);
            setEditBrandName('');
        } catch (err: any) {
            setActionError(err.message || 'Failed to update brand');
        }
    };

    const handleAddBrand = async () => {
        if (!newBrandName.trim()) {
            setActionError('Brand name cannot be empty');
            return;
        }

        try {
            await addBrandMutation.mutateAsync(newBrandName.trim());
            setNewBrandName('');
        } catch (err: any) {
            setActionError(err.message || 'Failed to add brand');
        }
    };

    const handleRemoveBrand = async (id: string) => {
        if (!confirm('Are you sure you want to remove this brand? This may affect associated products.')) return;

        try {
            await deleteBrandMutation.mutateAsync(id);
        } catch (err: any) {
            setActionError(err.message || 'Failed to remove brand');
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

        try {
            await updateSalesPersonMutation.mutateAsync({ id, name: editSalesPersonName.trim() });
            setEditingSalesPersonId(null);
            setEditSalesPersonName('');
        } catch (err: any) {
            setActionError(err.message || 'Failed to update sales person');
        }
    };

    const handleAddSalesPerson = async () => {
        if (!newSalesPersonName.trim()) {
            setActionError('Sales person name cannot be empty');
            return;
        }

        try {
            await addSalesPersonMutation.mutateAsync(newSalesPersonName.trim());
            setNewSalesPersonName('');
        } catch (err: any) {
            setActionError(err.message || 'Failed to add sales person');
        }
    };

    const handleRemoveSalesPerson = async (id: string) => {
        if (!confirm('Are you sure you want to remove this sales person? This may affect associated customers.')) return;

        try {
            await deleteSalesPersonMutation.mutateAsync(id);
        } catch (err: any) {
            setActionError(err.message || 'Failed to remove sales person');
        }
    };

    const handleCancel = () => {
        setEditingBrandId(null);
        setEditBrandName('');
        setEditingSalesPersonId(null);
        setEditSalesPersonName('');
        setActionError(null);
    };

    const actionLoading = addBrandMutation.isPending ? 'add-brand' :
        updateBrandMutation.isPending ? editingBrandId :
            deleteBrandMutation.isPending ? deleteBrandMutation.variables : // Simplified
                addSalesPersonMutation.isPending ? 'add-sales-person' :
                    updateSalesPersonMutation.isPending ? editingSalesPersonId :
                        deleteSalesPersonMutation.isPending ? deleteSalesPersonMutation.variables : null;

    return {
        brands,
        salesPersons,
        loading: brandsLoading || sPLoading,
        error: brandsError || sPError,
        actionLoading: actionLoading as string | null,
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
