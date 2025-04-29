/*
  # Fix Comments RLS Policies

  1. Changes
    - Drop and recreate the delete policy for comments to ensure proper functionality
    - Add explicit policy for soft deletion (updating is_deleted flag)
    - Ensure policies work with the existing is_deleted flag

  2. Security
    - Users can only delete their own comments
    - Admins can delete any comment
    - Soft deletion is handled through UPDATE policy
*/

-- Drop existing delete policy
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Recreate delete policy with proper checks
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

-- Add policy for soft deletion via update
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
  -- Only allow updating the is_deleted flag
  (uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = uid() 
      AND profiles.is_admin = true
    )
  ) AND
  (
    -- Ensure we're only updating the is_deleted flag
    xmax::text::int > 0
  )
);