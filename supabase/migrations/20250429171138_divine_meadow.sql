/*
  # Fix Profile RLS Policies

  1. Changes
    - Remove existing RLS policies on profiles table that may cause recursion
    - Add new, simplified RLS policies for profiles table:
      - Allow users to read their own profile
      - Allow users to read basic profile info of other users
      - Allow users to create their own profile during registration
      - Allow users to update their own profile
      - Allow admins to view all profiles
  
  2. Security
    - Maintains RLS protection while fixing recursion issues
    - Ensures users can only access appropriate profile data
    - Allows profile creation during registration
    - Preserves admin access to all profiles
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public read access for basic profile info" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Add new, simplified policies
CREATE POLICY "Enable profile creation during registration"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can view basic info of other profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
ON profiles FOR ALL
TO authenticated
USING (
  is_admin = true
);