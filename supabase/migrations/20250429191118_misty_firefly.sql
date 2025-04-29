/*
  # Fix comment deletion policies

  1. Changes
    - Drop existing delete policy for comments table
    - Create new delete policy with correct conditions
    - Ensure soft delete policy works correctly

  2. Security
    - Users can delete their own comments
    - Admins can delete any comment
    - Deletion is controlled through is_deleted flag
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Users can soft delete their own comments" ON comments;

-- Create new delete policy
CREATE POLICY "Users can delete their own comments"
ON comments
FOR DELETE
TO authenticated
USING (
  uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = uid()
    AND profiles.is_admin = true
  )
);

-- Create new update policy for soft deletion
CREATE POLICY "Users can soft delete their own comments"
ON comments
FOR UPDATE
TO authenticated
USING (
  uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = uid()
    AND profiles.is_admin = true
  )
);