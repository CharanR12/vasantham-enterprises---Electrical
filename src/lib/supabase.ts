import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Default client with anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates a Supabase client with the Clerk JWT token.
 * This should be used when Row Level Security (RLS) is enabled
 * and linked with Clerk.
 */
export const createClerkSupabaseClient = (clerkToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
};

// Database types
export type Database = {
  public: {
    Tables: {
      sales_persons: {
        Row: {
          id: string;
          name: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string | null;
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          mobile: string;
          location: string;
          referral_source: string;
          sales_person_id: string | null;
          remarks: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          mobile: string;
          location: string;
          referral_source?: string;
          sales_person_id?: string | null;
          remarks?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          mobile?: string;
          location?: string;
          referral_source?: string;
          sales_person_id?: string | null;
          remarks?: string;
          created_by?: string | null;
          created_at?: string;
        };
      };
      follow_ups: {
        Row: {
          id: string;
          customer_id: string;
          date: string;
          status: string;
          remarks: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          date: string;
          status?: string;
          remarks?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          date?: string;
          status?: string;
          remarks?: string;
          created_by?: string | null;
          created_at?: string;
        };
      };
    };
  };
};