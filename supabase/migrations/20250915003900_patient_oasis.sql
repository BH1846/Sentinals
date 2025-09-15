/*
  # Collections Table Schema

  1. New Tables
    - `collections`
      - `id` (uuid, primary key) - matches frontend record ID
      - `herb_type` (text) - type of herb collected
      - `quantity` (numeric) - amount in kilograms  
      - `latitude` (numeric) - GPS latitude
      - `longitude` (numeric) - GPS longitude
      - `location_accuracy` (numeric) - GPS accuracy in meters
      - `timestamp` (timestamptz) - when collection was made
      - `synced_at` (timestamptz) - when record was synced to backend
      - `blockchain_hash` (text, nullable) - transaction hash when logged to blockchain
      - `created_at` (timestamptz) - record creation time

  2. Security
    - Enable RLS on `collections` table
    - Add policy for public read access (for transparency)
    - Add policy for backend service to insert records

  3. Indexes
    - Index on timestamp for efficient querying
    - Index on herb_type for analytics
    - Index on blockchain_hash for verification
*/

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY,
  herb_type text NOT NULL,
  quantity numeric(10,2) NOT NULL CHECK (quantity > 0),
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL, 
  location_accuracy numeric(10,2),
  timestamp timestamptz NOT NULL,
  synced_at timestamptz NOT NULL DEFAULT now(),
  blockchain_hash text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (transparency)
CREATE POLICY "Public read access for collections"
  ON collections
  FOR SELECT
  TO public
  USING (true);

-- Create policy for service role to insert records
CREATE POLICY "Service role can insert collections"
  ON collections
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_timestamp 
  ON collections (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_collections_herb_type 
  ON collections (herb_type);

CREATE INDEX IF NOT EXISTS idx_collections_blockchain_hash 
  ON collections (blockchain_hash) 
  WHERE blockchain_hash IS NOT NULL;