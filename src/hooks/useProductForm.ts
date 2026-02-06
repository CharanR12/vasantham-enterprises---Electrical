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
        quantityAvailable: '' as number | '',
        arrivalDate: format(new Date(), 'yyyy-MM-dd'),
        mrp: '' as number | '',
        purchaseRate: '' as number | '',
        purchaseDiscountPercent: '' as number | '',
        purchaseDiscountedPrice: '' as number | '',
        salePrice: '' as number | '',
        saleDiscountPercent: '' as number | '',
        saleDiscountAmount: '' as number | ''
    };

    const [formData, setFormData] = useState(product ? {
        brandId: product.brandId,
        productName: product.productName,
        modelNumber: product.modelNumber,
        quantityAvailable: product.quantityAvailable || '' as number | '',
        arrivalDate: product.arrivalDate,
        mrp: product.mrp || '' as number | '',
        purchaseRate: product.purchaseRate || '' as number | '',
        purchaseDiscountPercent: product.purchaseDiscountPercent || '' as number | '',
        purchaseDiscountedPrice: product.purchaseDiscountedPrice || '' as number | '',
        salePrice: product.salePrice || '' as number | '',
        saleDiscountPercent: product.saleDiscountPercent || '' as number | '',
        saleDiscountAmount: product.saleDiscountAmount || '' as number | ''
    } : initialState);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.brandId) newErrors.brandId = 'Brand is required';
        if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
        if (!formData.modelNumber.trim()) newErrors.modelNumber = 'Model number is required';
        const qty = typeof formData.quantityAvailable === 'number' ? formData.quantityAvailable : 0;
        if (qty < 0) newErrors.quantityAvailable = 'Quantity cannot be negative';
        if (!formData.arrivalDate) newErrors.arrivalDate = 'Arrival date is required';
        const mrpVal = typeof formData.mrp === 'number' ? formData.mrp : 0;
        if (mrpVal < 0) newErrors.mrp = 'MRP cannot be negative';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!validateForm()) return;

        setFormError(null);

        try {
            // Convert empty strings to 0 for submission
            const submitData = {
                ...formData,
                quantityAvailable: formData.quantityAvailable === '' ? 0 : formData.quantityAvailable,
                mrp: formData.mrp === '' ? 0 : formData.mrp,
                purchaseRate: formData.purchaseRate === '' ? 0 : formData.purchaseRate,
                purchaseDiscountPercent: formData.purchaseDiscountPercent === '' ? 0 : formData.purchaseDiscountPercent,
                purchaseDiscountedPrice: formData.purchaseDiscountedPrice === '' ? 0 : formData.purchaseDiscountedPrice,
                salePrice: formData.salePrice === '' ? 0 : formData.salePrice,
                saleDiscountPercent: formData.saleDiscountPercent === '' ? 0 : formData.saleDiscountPercent,
                saleDiscountAmount: formData.saleDiscountAmount === '' ? 0 : formData.saleDiscountAmount
            };

            if (product) {
                await updateProductMutation.mutateAsync({
                    ...product,
                    ...submitData
                });
            } else {
                await addProductMutation.mutateAsync(submitData);
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
        const isTextfield = ['productName', 'modelNumber', 'arrivalDate', 'brandId'].includes(name);

        setFormData(prev => {
            let newValue: string | number = value;
            if (!isTextfield) {
                // For numeric fields, keep empty string or parse to number
                newValue = value === '' ? '' : parseFloat(value) || 0;
            }

            const newData = { ...prev, [name]: newValue };

            // Only run calculations if we have numeric values
            const mrpVal = typeof newData.mrp === 'number' ? newData.mrp : 0;
            const discountPct = typeof newData.purchaseDiscountPercent === 'number' ? newData.purchaseDiscountPercent : 0;
            const salePriceVal = typeof newData.salePrice === 'number' ? newData.salePrice : 0;
            const saleDiscPct = typeof newData.saleDiscountPercent === 'number' ? newData.saleDiscountPercent : 0;

            // Logic for calculations
            if (name === 'mrp' && typeof newValue === 'number') {
                newData.purchaseDiscountedPrice = newValue * (1 - discountPct / 100);
            } else if (name === 'purchaseDiscountPercent' && typeof newValue === 'number') {
                newData.purchaseDiscountedPrice = mrpVal * (1 - newValue / 100);
            } else if (name === 'purchaseDiscountedPrice' && typeof newValue === 'number') {
                if (mrpVal > 0) {
                    newData.purchaseDiscountPercent = ((mrpVal - newValue) / mrpVal) * 100;
                }
            } else if (name === 'salePrice' || name === 'saleDiscountPercent') {
                newData.saleDiscountAmount = salePriceVal * (saleDiscPct / 100);
            }

            return newData;
        });
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
