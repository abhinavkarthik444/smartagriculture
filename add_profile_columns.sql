-- Add phone_number and address columns to users table
ALTER TABLE users 
ADD COLUMN phone_number VARCHAR(20) NULL AFTER farm_location,
ADD COLUMN address TEXT NULL AFTER phone_number;

-- Update existing users with default values
UPDATE users SET phone_number = NULL, address = NULL WHERE phone_number IS NULL OR address IS NULL;
