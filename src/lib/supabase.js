import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = supabaseUrl && supabaseUrl !== 'undefined' && supabaseUrl.trim() !== '';
const isValidKey = supabaseAnonKey && supabaseAnonKey !== 'undefined' && supabaseAnonKey.trim() !== '';

// supabase client will be null if env vars are not properly configured
export const supabase = (isValidUrl && isValidKey)
  ? createClient(supabaseUrl.trim(), supabaseAnonKey.trim())
  : null;