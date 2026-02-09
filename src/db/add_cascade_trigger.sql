-- Function to update customer referral sources when the source name changes
CREATE OR REPLACE FUNCTION update_customer_referral_source()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all customers that reference the old referral source name
    UPDATE customers
    SET referral_source = NEW.name
    WHERE referral_source = OLD.name;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS on_referral_source_update ON referral_sources;

CREATE TRIGGER on_referral_source_update
AFTER UPDATE OF name ON referral_sources
FOR EACH ROW
WHEN (OLD.name IS DISTINCT FROM NEW.name)
EXECUTE FUNCTION update_customer_referral_source();
