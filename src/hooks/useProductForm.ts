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
        updatedAt: '' as string | undefined
    };

    const [formData, setFormData] = useState(product ? {
        brandId: product.brandId,
        productName: product.productName,
        modelNumber: product.modelNumber,
        quantityAvailable: product.quantityAvailable || '' as number | '',
        arrivalDate: product.arrivalDate,
        mrp: product.mrp || '' as number | '',
        // purchaseRate removed
        purchaseDiscountPercent: product.purchaseDiscountPercent || '' as number | '',
        purchaseDiscountedPrice: product.purchaseDiscountedPrice || '' as number | '',
        salePrice: product.salePrice || '' as number | '',
        saleDiscountPercent: product.saleDiscountPercent || '' as number | '',

        updatedAt: product.updatedAt
    } : { ...initialState, updatedAt: new Date().toISOString() });

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
                // purchaseRate removed
                purchaseDiscountPercent: formData.purchaseDiscountPercent === '' ? 0 : formData.purchaseDiscountPercent,
                purchaseDiscountedPrice: formData.purchaseDiscountedPrice === '' ? 0 : formData.purchaseDiscountedPrice,
                salePrice: formData.salePrice === '' ? 0 : formData.salePrice,
                saleDiscountPercent: formData.saleDiscountPercent === '' ? 0 : formData.saleDiscountPercent,
                // saleDiscountAmount removed
                updatedAt: formData.updatedAt // This is now passed to the service
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

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Parse values for calculations (safely handle strings and numbers)
            const parseNum = (val: string | number) => {
                if (typeof val === 'number') return val;
                if (!val) return 0;
                return parseFloat(val) || 0;
            };

            const mrpVal = parseNum(newData.mrp);
            const inputValue = parseNum(value);

            // Only run calculations if we have valid numbers to work with
            // We use inputValue instead of the raw string for math

            if (name === 'mrp') {
                const discountPct = parseNum(newData.purchaseDiscountPercent);
                const saleDiscountPct = parseNum(newData.saleDiscountPercent);

                // Recalculate based on new MRP. 
                // We typically want to maintain the Discount % when MRP changes.
                // So New Price = New MRP * (1 - Discount/100)

                // Always recalculate if we have an MRP input
                newData.purchaseDiscountedPrice = Number((inputValue * (1 - discountPct / 100)).toFixed(2));
                newData.salePrice = Number((inputValue * (1 - saleDiscountPct / 100)).toFixed(2));

            } else if (name === 'purchaseDiscountPercent') {
                newData.purchaseDiscountedPrice = Number((mrpVal * (1 - inputValue / 100)).toFixed(2));

            } else if (name === 'purchaseDiscountedPrice') {
                if (mrpVal > 0) {
                    newData.purchaseDiscountPercent = Number((((mrpVal - inputValue) / mrpVal) * 100).toFixed(2));
                }

            } else if (name === 'saleDiscountPercent') {
                // Ensure we have a valid MRP before calculating
                if (mrpVal > 0) {
                    const price = mrpVal * (1 - inputValue / 100);
                    newData.salePrice = parseFloat(price.toFixed(2));
                } else {
                    // If no MRP, price is 0 (or should we keep it?)
                    newData.salePrice = 0;
                }

            } else if (name === 'salePrice') {
                if (mrpVal > 0) {
                    newData.saleDiscountPercent = Number((((mrpVal - inputValue) / mrpVal) * 100).toFixed(2));
                }
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
