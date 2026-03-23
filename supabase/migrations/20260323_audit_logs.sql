-- Audit Logs table for tracking administrative actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: only admins can view or insert audit logs
-- Note: is_admin() is defined in 20260320_rls_complete_fix.sql without arguments
CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (is_admin());

-- Logging function for administrative actions
CREATE OR REPLACE FUNCTION log_admin_action() RETURNS TRIGGER AS $$
DECLARE
    entity_name TEXT;
    action_type TEXT;
BEGIN
    -- Determine the human-readable name of the entity
    IF TG_TABLE_NAME = 'users' THEN entity_name := COALESCE(NEW.display_name, NEW.email);
    ELSIF TG_TABLE_NAME = 'campaigns' THEN entity_name := NEW.name;
    ELSIF TG_TABLE_NAME = 'content' THEN entity_name := COALESCE(NEW.title, 'Sin título');
    ELSIF TG_TABLE_NAME = 'payments' THEN entity_name := '$' || NEW.amount || ' ' || NEW.currency;
    ELSE entity_name := 'Unknown';
    END IF;

    -- Determine the action type
    IF (TG_OP = 'UPDATE') THEN
        IF (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
            action_type := 'SOFT_DELETE';
        ELSIF (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
            action_type := 'RESTORE';
        ELSIF (TG_TABLE_NAME = 'users' AND NEW.role != OLD.role) THEN
            action_type := 'CHANGE_ROLE';
        ELSE
            -- Normal update, we might not want to log every single update to avoid noise
            -- but let's log important ones if needed
            RETURN NEW;
        END IF;
    ELSIF (TG_OP = 'INSERT') THEN
        IF TG_TABLE_NAME = 'payments' THEN
            action_type := 'PAYMENT_REGISTERED';
        ELSE
            RETURN NEW; -- Don't log normal inserts for now
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        action_type := 'HARD_DELETE';
    ELSE
        RETURN NEW;
    END IF;

    -- Only log if an admin is performing the action (via auth.uid())
    -- Or if it's a critical system change
    INSERT INTO audit_logs (admin_id, action, target_type, target_id, details)
    VALUES (
        auth.uid(),
        action_type,
        TG_TABLE_NAME,
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
        jsonb_build_object(
            'name', entity_name,
            'table', TG_TABLE_NAME,
            'timestamp', now()
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for logging
DROP TRIGGER IF EXISTS log_content_actions ON content;
CREATE TRIGGER log_content_actions 
    AFTER UPDATE OR DELETE ON content 
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

DROP TRIGGER IF EXISTS log_campaign_actions ON campaigns;
CREATE TRIGGER log_campaign_actions 
    AFTER UPDATE OR DELETE ON campaigns 
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

DROP TRIGGER IF EXISTS log_user_actions ON users;
CREATE TRIGGER log_user_actions 
    AFTER UPDATE OR DELETE ON users 
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

DROP TRIGGER IF EXISTS log_payment_actions ON payments;
CREATE TRIGGER log_payment_actions 
    AFTER INSERT ON payments 
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();
