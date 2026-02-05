import { useState } from 'react';
import { Product } from '../types/inventory';
import {
    useBrandsQuery,
    useAddProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useAddBrandMutation
} from './queries/useInventoryQueries';
import { format } from 'date-fns';

export const useProductForm = (product: Product | undefined, onClose: () => void) => {
    const { data: brands = [] } = useBrandsQuery();
    const addProductMutation = useAddProductMutation();
    const updateProductMutation = useUpdateProductMutation();
    const deleteProductMutation = useDeleteProductMutation();
    const addBrandMutation = useAddBrandMutation();

    const [formError, setFormError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showNewBrandInput, setShowNewBrandInput] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');

    const initialState = {
        brandId: '',
        productName: '',
        modelNumber: '',
        quantityAvailable: 0,
        arrivalDate: format(new Date(), 'yyyy-MM-dd')
    };

    const [formData, setFormData] = useState(product ? {
        brandId: product.brandId,
        productName: product.productName,
        modelNumber: product.modelNumber,
        quantityAvailable: product.quantityAvailable,
        arrivalDate: product.arrivalDate
    } : initialState);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.brandId) newErrors.brandId = 'Brand is required';
        if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
        if (!formData.modelNumber.trim()) newErrors.modelNumber = 'Model number is required';
        if (formData.quantityAvailable < 0) newErrors.quantityAvailable = 'Quantity cannot be negative';
        if (!formData.arrivalDate) newErrors.arrivalDate = 'Arrival date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!validateForm()) return;

        setFormError(null);

        try {
            if (product) {
                await updateProductMutation.mutateAsync({
                    ...product,
                    ...formData
                });
            } else {
                await addProductMutation.mutateAsync(formData);
            }
            onClose();
        } catch (err: any) {
            setFormError(err.message || 'An unexpected error occurred. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (!product) return;

        setFormError(null);

        try {
            await deleteProductMutation.mutateAsync(product.id);
            onClose();
        } catch (err: any) {
            setFormError(err.message || 'An unexpected error occurred while deleting.');
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    const handleAddBrand = async () => {
        if (!newBrandName.trim()) return;

        setFormError(null);
        try {
            await addBrandMutation.mutateAsync(newBrandName.trim());
            setNewBrandName('');
            setShowNewBrandInput(false);
        } catch (err: any) {
            setFormError(err.message || 'Failed to add brand. Please try again.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantityAvailable' ? parseInt(value) || 0 : value
        }));
    };

    return {
        brands,
        formData,
        setFormData,
        errors,
        formLoading: addProductMutation.isPending || updateProductMutation.isPending || addBrandMutation.isPending,
        deleteLoading: deleteProductMutation.isPending,
        formError,
        setFormError,
        serverError: addProductMutation.error?.message || updateProductMutation.error?.message || deleteProductMutation.error?.message || addBrandMutation.error?.message || null,
        showDeleteConfirm,
        setShowDeleteConfirm,
        showNewBrandInput,
        setShowNewBrandInput,
        newBrandName,
        setNewBrandName,
        handleSubmit,
        handleDelete,
        handleAddBrand,
        handleChange
    };
};
