
-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_percent INTEGER NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (for now, to allow testing)
CREATE POLICY "Allow all access to campaigns" ON campaigns FOR ALL USING (true) WITH CHECK (true);
