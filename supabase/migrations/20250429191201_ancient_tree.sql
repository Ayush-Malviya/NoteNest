/*
  # Fix comment deletion policies

  1. Changes
    - Drop existing comment deletion policies
    - Add new policy for hard deletion of comments
    - Add new policy for soft deletion of comments
  
  2. Security
    - Allow users to delete their own comments
    - Allow admins to delete any comment
    - Support both hard and soft deletion
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
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Create new update policy for soft deletion
CREATE POLICY "Users can soft delete their own comments"
ON comments
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);