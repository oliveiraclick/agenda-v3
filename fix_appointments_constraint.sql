-- Make user_id nullable to allow manual appointments without registered users
ALTER TABLE appointments ALTER COLUMN user_id DROP NOT NULL;

-- Add client_name column if it doesn't represent the user_id relation (just in case, though schema likely has it)
-- The error confirms user_id is the issue.
