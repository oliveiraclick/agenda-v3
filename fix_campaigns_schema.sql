-- Add missing columns to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS establishment_id UUID REFERENCES establishments(id);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS content TEXT;

-- Update RLS policies
DROP POLICY IF EXISTS "Allow all access to campaigns" ON campaigns;

CREATE POLICY "Owners can view their own campaigns"
ON campaigns FOR SELECT
USING (auth.uid() IN (
    SELECT owner_id FROM establishments WHERE id = campaigns.establishment_id
));

CREATE POLICY "Owners can insert their own campaigns"
ON campaigns FOR INSERT
WITH CHECK (auth.uid() IN (
    SELECT owner_id FROM establishments WHERE id = campaigns.establishment_id
));

CREATE POLICY "Owners can update their own campaigns"
ON campaigns FOR UPDATE
USING (auth.uid() IN (
    SELECT owner_id FROM establishments WHERE id = campaigns.establishment_id
));

CREATE POLICY "Owners can delete their own campaigns"
ON campaigns FOR DELETE
USING (auth.uid() IN (
    SELECT owner_id FROM establishments WHERE id = campaigns.establishment_id
));
