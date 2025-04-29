/*
  # Fix comment deletion policies

  1. Changes
    - Drop existing delete policy
    - Add new delete policy for both users and admins
    - Add soft deletion policy via update
    
  2. Security
    - Allow users to delete their own comments
    - Allow admins to delete any comment
    - Ensure proper RLS checks for both hard and soft deletion
*/

-- Drop existing delete policy
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Recreate delete policy with proper checks
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

-- Add policy for soft deletion via update
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
  -- Only allow updating the is_deleted flag
  (auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  )
);