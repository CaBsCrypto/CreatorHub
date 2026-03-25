-- Fix relationship for audit_logs to allow PostgREST joins
-- We change the reference from auth.users (not joinable by default) to public.users

ALTER TABLE public.audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_admin_id_fkey;

ALTER TABLE public.audit_logs
ADD CONSTRAINT audit_logs_admin_id_fkey 
FOREIGN KEY (admin_id) 
REFERENCES public.users(id)
ON DELETE SET NULL;

-- Ensure public.users has an index on id (should already have it as PK)
-- This allows the query: .from('audit_logs').select('*, admin:admin_id(display_name, email)')
