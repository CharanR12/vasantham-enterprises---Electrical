import { useState } from 'react';
import {
    useBrandsQuery,
    useAddBrandMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation,
    useCategoriesQuery,
    useAddCategoryMutation,
    useDeleteCategoryMutation
} from './queries/useInventoryQueries';
import {
    useSalesPersonsQuery,
    useAddSalesPersonMutation,
    useUpdateSalesPersonMutation,
    useDeleteSalesPersonMutation
} from './queries/useCustomerQueries';
import {
    useReferralSourcesQuery,
    useAddReferralSourceMutation,
    useUpdateReferralSourceMutation,
    useDeleteReferralSourceMutation
} from './queries/useReferralSourceQueries';

export const useSettings = () => {
    const { data: brands = [], isLoading: brandsLoading, error: brandsError } = useBrandsQuery();
    const { data: categories = [], isLoading: categoriesLoading } = useCategoriesQuery();
    const { data: salesPersons = [], isLoading: sPLoading, error: sPError } = useSalesPersonsQuery();
    const { data: referralSources = [], isLoading: rsLoading, error: rsError } = useReferralSourcesQuery();

    const addBrandMutation = useAddBrandMutation();
    const updateBrandMutation = useUpdateBrandMutation();
    const deleteBrandMutation = useDeleteBrandMutation();

    const addCategoryMutation = useAddCategoryMutation();
    const deleteCategoryMutation = useDeleteCategoryMutation();

    const addSalesPersonMutation = useAddSalesPersonMutation();
    const updateSalesPersonMutation = useUpdateSalesPersonMutation();
    const deleteSalesPersonMutation = useDeleteSalesPersonMutation();

    const addReferralSourceMutation = useAddReferralSourceMutation();
    const updateReferralSourceMutation = useUpdateReferralSourceMutation();
    const deleteReferralSourceMutation = useDeleteReferralSourceMutation();

    const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
    const [editBrandName, setEditBrandName] = useState('');
    const [newBrandName, setNewBrandName] = useState('');

    // Category State
    const [expandedBrandId, setExpandedBrandId] = useState<string | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [editingSalesPersonId, setEditingSalesPersonId] = useState<string | null>(null);
    const [editSalesPersonName, setEditSalesPersonName] = useState('');
    const [newSalesPersonName, setNewSalesPersonName] = useState('');

    const [editingReferralSourceId, setEditingReferralSourceId] = useState<string | null>(null);
    const [editReferralSourceName, setEditReferralSourceName] = useState('');
    const [newReferralSourceName, setNewReferralSourceName] = useState('');

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

    // Category Handlers
    const handleToggleBrandExpand = (brandId: string) => {
        if (expandedBrandId === brandId) {
            setExpandedBrandId(null);
        } else {
            setExpandedBrandId(brandId);
        }
        setNewCategoryName('');
        setActionError(null);
    };

    const handleAddCategory = async (brandId: string) => {
        if (!newCategoryName.trim()) {
            setActionError('Category name cannot be empty');
            return;
        }

        try {
            await addCategoryMutation.mutateAsync({ name: newCategoryName.trim(), brandId });
            setNewCategoryName('');
        } catch (err: any) {
            setActionError(err.message || 'Failed to add category');
        }
    };

    const handleRemoveCategory = async (id: string) => {
        if (!confirm('Are you sure you want to remove this category?')) return;

        try {
            await deleteCategoryMutation.mutateAsync(id);
        } catch (err: any) {
            setActionError(err.message || 'Failed to remove category');
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

    const handleEditReferralSource = (id: string, name: string) => {
        setEditingReferralSourceId(id);
        setEditReferralSourceName(name);
        setActionError(null);
    };

    const handleSaveReferralSource = async (id: string) => {
        if (!editReferralSourceName.trim()) {
            setActionError('Referral source name cannot be empty');
            return;
        }

        try {
            await updateReferralSourceMutation.mutateAsync({ id, name: editReferralSourceName.trim() });
            setEditingReferralSourceId(null);
            setEditReferralSourceName('');
        } catch (err: any) {
            setActionError(err.message || 'Failed to update referral source');
        }
    };

    const handleAddReferralSource = async () => {
        if (!newReferralSourceName.trim()) {
            setActionError('Referral source name cannot be empty');
            return;
        }

        try {
            await addReferralSourceMutation.mutateAsync(newReferralSourceName.trim());
            setNewReferralSourceName('');
        } catch (err: any) {
            setActionError(err.message || 'Failed to add referral source');
        }
    };

    const handleRemoveReferralSource = async (id: string) => {
        if (!confirm('Are you sure you want to remove this referral source? This may affect associated customers.')) return;

        try {
            await deleteReferralSourceMutation.mutateAsync(id);
        } catch (err: any) {
            setActionError(err.message || 'Failed to remove referral source');
        }
    };

    const handleCancel = () => {
        setEditingBrandId(null);
        setEditBrandName('');
        setEditingSalesPersonId(null);
        setEditSalesPersonName('');
        setEditingReferralSourceId(null);
        setEditReferralSourceName('');
        setActionError(null);
        setNewCategoryName('');
    };

    const actionLoading = addBrandMutation.isPending ? 'add-brand' :
        updateBrandMutation.isPending ? editingBrandId :
            deleteBrandMutation.isPending ? deleteBrandMutation.variables :
                addCategoryMutation.isPending ? 'add-category' :
                    deleteCategoryMutation.isPending ? deleteCategoryMutation.variables :
                        addSalesPersonMutation.isPending ? 'add-sales-person' :
                            updateSalesPersonMutation.isPending ? editingSalesPersonId :
                                deleteSalesPersonMutation.isPending ? deleteSalesPersonMutation.variables :
                                    addReferralSourceMutation.isPending ? 'add-referral-source' :
                                        updateReferralSourceMutation.isPending ? editingReferralSourceId :
                                            deleteReferralSourceMutation.isPending ? deleteReferralSourceMutation.variables : null;

    return {
        brands,
        categories,
        salesPersons,
        referralSources,
        loading: brandsLoading || sPLoading || rsLoading || categoriesLoading,
        error: brandsError || sPError || rsError,
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

        // Category states/handlers
        expandedBrandId,
        newCategoryName,
        setNewCategoryName,
        handleToggleBrandExpand,
        handleAddCategory,
        handleRemoveCategory,

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

        // Referral source states/handlers
        editingReferralSourceId,
        editReferralSourceName,
        setEditReferralSourceName,
        newReferralSourceName,
        setNewReferralSourceName,
        handleEditReferralSource,
        handleSaveReferralSource,
        handleAddReferralSource,
        handleRemoveReferralSource,

        handleCancel
    };
};

