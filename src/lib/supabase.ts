// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl as string, 
  supabaseAnonKey as string
);

// Helper function to get the current user
export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

// Helper function to get the current session
export const getSession = async () => {
  return await supabase.auth.getSession();
};