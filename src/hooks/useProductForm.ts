import { useState } from 'react';
import { Product } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';
import { format } from 'date-fns';

export const useProductForm = (product: Product | undefined, onClose: () => void) => {
    const { brands, addProduct, updateProduct, deleteProduct, addBrand, error: serverError } = useInventory();
    const [formLoading, setFormLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
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

        setFormLoading(true);
        setFormError(null);

        try {
            let success = false;
            if (product) {
                success = await updateProduct({
                    ...product,
                    ...formData
                });
            } else {
                success = await addProduct(formData);
            }

            if (success) {
                onClose();
            } else {
                setFormError('Failed to save product. Please try again.');
            }
        } catch (err) {
            setFormError('An unexpected error occurred. Please try again.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!product) return;

        setDeleteLoading(true);
        setFormError(null);

        try {
            const success = await deleteProduct(product.id);
            if (success) {
                onClose();
            } else {
                setFormError('Failed to delete product. Please try again.');
            }
        } catch (err) {
            setFormError('An unexpected error occurred while deleting.');
        } finally {
            setDeleteLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleAddBrand = async () => {
        if (!newBrandName.trim()) return;

        setFormLoading(true);
        try {
            const success = await addBrand(newBrandName.trim());
            if (success) {
                setNewBrandName('');
                setShowNewBrandInput(false);
            }
        } catch (err) {
            setFormError('Failed to add brand. Please try again.');
        } finally {
            setFormLoading(false);
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
        formLoading,
        deleteLoading,
        formError,
        setFormError,
        serverError,
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
