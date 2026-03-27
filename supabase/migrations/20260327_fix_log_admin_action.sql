-- Fix log_admin_action to safely handle different table schemas
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
        IF (TG_TABLE_NAME = 'users') THEN
            IF (NEW.role != OLD.role) THEN
                action_type := 'CHANGE_ROLE';
            ELSIF (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
                action_type := 'SOFT_DELETE';
            ELSIF (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
                action_type := 'RESTORE';
            ELSE
                RETURN NEW;
            END IF;
        ELSE
            -- For non-user tables, check soft delete columns if they exist
            -- Campaigns, content usually have deleted_at
            IF (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
                action_type := 'SOFT_DELETE';
            ELSIF (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
                action_type := 'RESTORE';
            ELSE
                -- Normal update, don't log to avoid noise
                RETURN NEW;
            END IF;
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
