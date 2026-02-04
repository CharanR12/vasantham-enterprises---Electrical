import { supabase, createClerkSupabaseClient } from '../lib/supabase';
import { Product, Brand, SaleEntry } from '../types/inventory';
import { ApiError } from './api';

const handleSupabaseError = (error: any) => {
  if (error) {
    console.error('Supabase error:', error);
    throw new ApiError(400, error.message || 'An error occurred');
  }
};

const getClient = (token?: string) => token ? createClerkSupabaseClient(token) : supabase;

export const inventoryApi = {
  // Brand endpoints
  getBrands: async (creatorId?: string, clerkToken?: string): Promise<Brand[]> => {
    try {
      const client = getClient(clerkToken);
      let query = client
        .from('brands')
        .select('*');

      if (creatorId) {
        query = query.eq('created_by', creatorId);
      }

      const { data, error } = await query
        .order('name');

      handleSupabaseError(error);

      return (data || []).map(brand => ({
        id: brand.id,
        name: brand.name,
        createdAt: brand.created_at.split('T')[0]
      }));
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  },

  createBrand: async (name: string, userId?: string, clerkToken?: string): Promise<Brand> => {
    try {
      const client = getClient(clerkToken);
      const { data, error } = await client
        .from('brands')
        .insert({
          name: name.trim(),
          created_by: userId
        })
        .select()
        .single();

      handleSupabaseError(error);

      return {
        id: data.id,
        name: data.name,
        createdAt: data.created_at.split('T')[0]
      };
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  },

  updateBrand: async (id: string, name: string, clerkToken?: string): Promise<Brand> => {
    try {
      const client = getClient(clerkToken);
      const { data, error } = await client
        .from('brands')
        .update({ name: name.trim() })
        .eq('id', id)
        .select()
        .single();

      handleSupabaseError(error);

      return {
        id: data.id,
        name: data.name,
        createdAt: data.created_at.split('T')[0]
      };
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  },

  deleteBrand: async (id: string, clerkToken?: string): Promise<void> => {
    try {
      const client = getClient(clerkToken);
      const { error } = await client
        .from('brands')
        .delete()
        .eq('id', id);

      handleSupabaseError(error);
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  },

  // Product endpoints
  getProducts: async (creatorId?: string, clerkToken?: string): Promise<Product[]> => {
    try {
      const client = getClient(clerkToken);
      let query = client
        .from('products')
        .select(`
          *,
          brand:brands(id, name)
        `);

      if (creatorId) {
        query = query.eq('created_by', creatorId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      handleSupabaseError(error);

      return (data || []).map(product => ({
        id: product.id,
        brandId: product.brand_id,
        brand: product.brand || { id: '', name: 'Unknown' },
        productName: product.product_name,
        modelNumber: product.model_number,
        quantityAvailable: product.quantity_available,
        arrivalDate: product.arrival_date,
        createdAt: product.created_at.split('T')[0]
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'brand'>, userId?: string, clerkToken?: string): Promise<Product> => {
    try {
      const client = getClient(clerkToken);
      const { data, error } = await client
        .from('products')
        .insert({
          brand_id: productData.brandId,
          product_name: productData.productName,
          model_number: productData.modelNumber,
          quantity_available: productData.quantityAvailable,
          arrival_date: productData.arrivalDate,
          created_by: userId
        })
        .select()
        .single();

      handleSupabaseError(error);

      const products = await inventoryApi.getProducts(undefined, clerkToken);
      return products.find(p => p.id === data.id)!;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id: string, productData: Product, clerkToken?: string): Promise<Product> => {
    try {
      const client = getClient(clerkToken);
      const { error } = await client
        .from('products')
        .update({
          brand_id: productData.brandId,
          product_name: productData.productName,
          model_number: productData.modelNumber,
          quantity_available: productData.quantityAvailable,
          arrival_date: productData.arrivalDate
        })
        .eq('id', id);

      handleSupabaseError(error);

      const products = await inventoryApi.getProducts(undefined, clerkToken);
      return products.find(p => p.id === id)!;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id: string, clerkToken?: string): Promise<void> => {
    try {
      const client = getClient(clerkToken);
      const { error } = await client
        .from('products')
        .delete()
        .eq('id', id);

      handleSupabaseError(error);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Sale entry endpoints
  getSaleEntries: async (creatorId?: string, clerkToken?: string): Promise<SaleEntry[]> => {
    try {
      const client = getClient(clerkToken);
      let query = client
        .from('sale_entries')
        .select('*');

      if (creatorId) {
        query = query.eq('created_by', creatorId);
      }

      const { data, error } = await query
        .order('sale_date', { ascending: false });

      handleSupabaseError(error);

      return (data || []).map(entry => ({
        id: entry.id,
        productId: entry.product_id,
        saleDate: entry.sale_date,
        customerName: entry.customer_name,
        billNumber: entry.bill_number || undefined,
        quantitySold: entry.quantity_sold,
        createdAt: entry.created_at.split('T')[0]
      }));
    } catch (error) {
      console.error('Error fetching sale entries:', error);
      throw error;
    }
  },

  createSaleEntry: async (saleData: Omit<SaleEntry, 'id' | 'createdAt'>, userId?: string, clerkToken?: string): Promise<SaleEntry> => {
    try {
      const client = getClient(clerkToken);
      // First, get the current product to check available quantity
      const { data: product, error: productError } = await client
        .from('products')
        .select('quantity_available')
        .eq('id', saleData.productId)
        .single();

      handleSupabaseError(productError);

      if (!product || product.quantity_available < saleData.quantitySold) {
        throw new ApiError(400, 'Insufficient quantity available or product not found');
      }

      // Create the sale entry
      const { data, error } = await client
        .from('sale_entries')
        .insert({
          product_id: saleData.productId,
          sale_date: saleData.saleDate,
          customer_name: saleData.customerName,
          bill_number: saleData.billNumber || null,
          quantity_sold: saleData.quantitySold,
          created_by: userId
        })
        .select()
        .single();

      handleSupabaseError(error);

      // Update the product quantity
      const { error: updateError } = await client
        .from('products')
        .update({
          quantity_available: product.quantity_available - saleData.quantitySold
        })
        .eq('id', saleData.productId);

      handleSupabaseError(updateError);

      return {
        id: data.id,
        productId: data.product_id,
        saleDate: data.sale_date,
        customerName: data.customer_name,
        billNumber: data.bill_number || undefined,
        quantitySold: data.quantity_sold,
        createdAt: data.created_at.split('T')[0]
      };
    } catch (error) {
      console.error('Error creating sale entry:', error);
      throw error;
    }
  }
};