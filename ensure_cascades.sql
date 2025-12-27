
-- Safe Deletion Cascades
-- Ensures that when an establishment is deleted, everything related to it is also deleted automatically.

-- 1. Services
ALTER TABLE services
DROP CONSTRAINT IF EXISTS services_establishment_id_fkey,
ADD CONSTRAINT services_establishment_id_fkey
    FOREIGN KEY (establishment_id)
    REFERENCES establishments(id)
    ON DELETE CASCADE;

-- 2. Professionals
ALTER TABLE professionals
DROP CONSTRAINT IF EXISTS professionals_establishment_id_fkey,
ADD CONSTRAINT professionals_establishment_id_fkey
    FOREIGN KEY (establishment_id)
    REFERENCES establishments(id)
    ON DELETE CASCADE;

-- 3. Products
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_establishment_id_fkey,
ADD CONSTRAINT products_establishment_id_fkey
    FOREIGN KEY (establishment_id)
    REFERENCES establishments(id)
    ON DELETE CASCADE;

-- 4. Appointments
ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS appointments_establishment_id_fkey,
ADD CONSTRAINT appointments_establishment_id_fkey
    FOREIGN KEY (establishment_id)
    REFERENCES establishments(id)
    ON DELETE CASCADE;

-- 5. Favorites
ALTER TABLE favorites
DROP CONSTRAINT IF EXISTS favorites_establishment_id_fkey,
ADD CONSTRAINT favorites_establishment_id_fkey
    FOREIGN KEY (establishment_id)
    REFERENCES establishments(id)
    ON DELETE CASCADE;
