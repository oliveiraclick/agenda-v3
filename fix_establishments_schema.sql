-- SAFE MIGRATION: Add missing columns to establishments table
-- This is safe to run multiple times (won't error if columns already exist)

-- Add type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'establishments' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE public.establishments ADD COLUMN type text;
  END IF;
END $$;

-- Add category column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'establishments' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.establishments ADD COLUMN category text;
  END IF;
END $$;

-- Add rating column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'establishments' 
    AND column_name = 'rating'
  ) THEN
    ALTER TABLE public.establishments ADD COLUMN rating numeric DEFAULT 5.0;
  END IF;
END $$;

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'establishments' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.establishments ADD COLUMN image_url text;
  END IF;
END $$;

-- NEW COLUMNS FOR PUBLIC SALON PAGE

-- Add slug column (unique identifier for public URLs)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'establishments' 
    AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.establishments ADD COLUMN slug text UNIQUE;
  END IF;
END $$;

-- Add cover_url (banner image)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'establishments' 
    AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE public.establishments ADD COLUMN cover_url text;
  END IF;
END $$;

-- Add logo_url (salon logo)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'establishments' 
    AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE public.establishments ADD COLUMN logo_url text;
  END IF;
END $$;

-- Add phone
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'establishments' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.establishments ADD COLUMN phone text;
  END IF;
END $$;

-- Add address_city
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'establishments' 
    AND column_name = 'address_city'
  ) THEN
    ALTER TABLE public.establishments ADD COLUMN address_city text;
  END IF;
END $$;

-- Add address_full
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'establishments' 
    AND column_name = 'address_full'
  ) THEN
    ALTER TABLE public.establishments ADD COLUMN address_full text;
  END IF;
END $$;

-- Add description
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'establishments' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.establishments ADD COLUMN description text;
  END IF;
END $$;

-- Add owner_id to link establishment to the profile who created it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'establishments' 
    AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.establishments ADD COLUMN owner_id uuid REFERENCES auth.users;
  END IF;
END $$;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_establishments_slug ON public.establishments(slug);

-- Create index for owner lookups
CREATE INDEX IF NOT EXISTS idx_establishments_owner ON public.establishments(owner_id);

-- Add constraint to ensure slug format (lowercase, numbers, hyphens only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'establishments_slug_format'
  ) THEN
    ALTER TABLE public.establishments 
    ADD CONSTRAINT establishments_slug_format 
    CHECK (slug ~ '^[a-z0-9-]+$' OR slug IS NULL);
  END IF;
END $$;

-- Insert sample data only if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.establishments LIMIT 1) THEN
    INSERT INTO public.establishments (name, type, category, rating, image_url) VALUES
    ('Studio Beauty Elite', 'Cabelo • Hidratação', 'salao', 4.9, 'https://picsum.photos/seed/shop1/400/200'),
    ('Don Barbearia', 'Corte • Barba', 'salao', 4.8, 'https://picsum.photos/seed/barber/400/200'),
    ('Pet Shop Amigo Fiel', 'Banho • Tosa', 'pet', 5.0, 'https://picsum.photos/seed/pet1/400/200'),
    ('Lava Rápido Jet', 'Lavagem • Polimento', 'li', 4.7, 'https://picsum.photos/seed/car/400/200'),
    ('Cantinho do Pet', 'Veterinário • Banho', 'pet', 4.9, 'https://picsum.photos/seed/pet2/400/200');
  END IF;
END $$;
