import { supabase, createClerkSupabaseClient } from '../lib/supabase';

export const getClient = (token?: string) => token ? createClerkSupabaseClient(token) : supabase;

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export const handleSupabaseError = (error: any) => {
    if (error) {
        console.error('Supabase error:', error);
        throw new ApiError(400, error.message || 'An error occurred');
    }
};
