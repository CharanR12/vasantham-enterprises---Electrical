import { useState, useMemo, useEffect } from 'react';
import { Product } from '../types/inventory';
import {
    useBrandsQuery,
    useCategoriesQuery,
    useAddProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useAddBrandMutation,
    useDiscountTypesQuery
} from './queries/useInventoryQueries';
import { format } from 'date-fns';

export const useProductForm = (product: Product | undefined, onClose: () => void) => {
    const { data: brands = [] } = useBrandsQuery();
    const { data: categories = [] } = useCategoriesQuery();
    const { data: discountTypes = [] } = useDiscountTypesQuery();
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
        categoryId: '',
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
        updatedAt: '' as string | undefined,
        salesDiscounts: {} as Record<string, number>
    };

    const [formData, setFormData] = useState(product ? {
        brandId: product.brandId,
        categoryId: product.categoryId || '',
        productName: product.productName,
        modelNumber: product.modelNumber,
        quantityAvailable: product.quantityAvailable || '' as number | '',
        arrivalDate: product.arrivalDate,
        mrp: product.mrp || '' as number | '',
        purchaseDiscountPercent: product.purchaseDiscountPercent || '' as number | '',
        purchaseDiscountedPrice: product.purchaseDiscountedPrice || '' as number | '',
        salePrice: product.salePrice || '' as number | '',
        saleDiscountPercent: product.saleDiscountPercent || '' as number | '',
        updatedAt: product.updatedAt,
        salesDiscounts: product.salesDiscounts || {}
    } : { ...initialState, updatedAt: new Date().toISOString() });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const filteredCategories = useMemo(() => {
        if (!formData.brandId) return [];
        return categories.filter(c => c.brandId === formData.brandId);
    }, [categories, formData.brandId]);

    // Reset category when brand changes
    useEffect(() => {
        if (formData.brandId && product?.brandId !== formData.brandId) {
            // If manual change (not initial load), check if current category belongs to new brand
            const isCategoryValid = categories.find(c => c.id === formData.categoryId && c.brandId === formData.brandId);
            if (!isCategoryValid) {
                setFormData(prev => ({ ...prev, categoryId: '' }));
            }
        }
    }, [formData.brandId, product]);

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
                categoryId: formData.categoryId || null, // API expects null for optional foreign keys if empty
                quantityAvailable: formData.quantityAvailable === '' ? 0 : formData.quantityAvailable,
                mrp: formData.mrp === '' ? 0 : formData.mrp,
                purchaseDiscountPercent: formData.purchaseDiscountPercent === '' ? 0 : formData.purchaseDiscountPercent,
                purchaseDiscountedPrice: formData.purchaseDiscountedPrice === '' ? 0 : formData.purchaseDiscountedPrice,
                salePrice: formData.salePrice === '' ? 0 : formData.salePrice,
                saleDiscountPercent: formData.saleDiscountPercent === '' ? 0 : formData.saleDiscountPercent,
                updatedAt: formData.updatedAt, // This is now passed to the service
                salesDiscounts: formData.salesDiscounts
            };

            if (product) {
                await updateProductMutation.mutateAsync({
                    ...product,
                    ...submitData
                } as any); // Cast because submitData might have null categoryId which conflicts if type is strict string
            } else {
                await addProductMutation.mutateAsync(submitData as any);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            // safe cast for calculation purposes
            const inputValue = parseNum(value);

            // Only run calculations if we have valid numbers to work with
            if (name === 'mrp') {
                const discountPct = parseNum(newData.purchaseDiscountPercent);
                const saleDiscountPct = parseNum(newData.saleDiscountPercent);
                newData.purchaseDiscountedPrice = Number((inputValue * (1 - discountPct / 100)).toFixed(2));
                newData.salePrice = Number((inputValue * (1 - saleDiscountPct / 100)).toFixed(2));
            } else if (name === 'purchaseDiscountPercent') {
                newData.purchaseDiscountedPrice = Number((mrpVal * (1 - inputValue / 100)).toFixed(2));
            } else if (name === 'purchaseDiscountedPrice') {
                if (mrpVal > 0) {
                    newData.purchaseDiscountPercent = Number((((mrpVal - inputValue) / mrpVal) * 100).toFixed(2));
                }
            } else if (name === 'saleDiscountPercent') {
                if (mrpVal > 0) {
                    const price = mrpVal * (1 - inputValue / 100);
                    newData.salePrice = parseFloat(price.toFixed(2));
                } else {
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

    const handleDiscountChange = (discountTypeId: string, value: string) => {
        const numValue = parseFloat(value);
        setFormData(prev => ({
            ...prev,
            salesDiscounts: {
                ...prev.salesDiscounts,
                [discountTypeId]: isNaN(numValue) ? 0 : numValue
            }
        }));
    };

    const handleRemoveDiscount = (discountTypeId: string) => {
        setFormData(prev => {
            const updated = { ...prev.salesDiscounts };
            delete updated[discountTypeId];
            return { ...prev, salesDiscounts: updated };
        });
    };

    return {
        brands,
        categories: filteredCategories,
        discountTypes,
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
        handleChange,
        handleDiscountChange,
        handleRemoveDiscount
    };
};
