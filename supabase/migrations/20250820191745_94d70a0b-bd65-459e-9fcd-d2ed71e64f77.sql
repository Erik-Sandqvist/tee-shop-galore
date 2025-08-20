-- Fix the function search path issue by setting search_path explicitly
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;