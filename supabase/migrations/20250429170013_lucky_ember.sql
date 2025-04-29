/*
  # Initial schema for Notes Sharing Application

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - references auth.users
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `username` (text, unique)
      - `full_name` (text, nullable)
      - `avatar_url` (text, nullable)
      - `is_admin` (boolean)
    
    - `notes`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `title` (text)
      - `content` (text)
      - `user_id` (uuid, references profiles.id)
      - `is_public` (boolean)
      - `is_deleted` (boolean)
      - `category` (text, nullable)
      - `tags` (text[], nullable)
    
    - `shared_notes`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `note_id` (uuid, references notes.id)
      - `shared_by` (uuid, references profiles.id)
      - `shared_with` (uuid, references profiles.id)
      - `can_edit` (boolean)
    
    - `comments`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `note_id` (uuid, references notes.id)
      - `user_id` (uuid, references profiles.id)
      - `content` (text)
      - `is_deleted` (boolean)
    
    - `flagged_content`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `content_type` (enum: 'note' or 'comment')
      - `content_id` (uuid)
      - `reported_by` (uuid, references profiles.id)
      - `reason` (text)
      - `resolved` (boolean)
      - `resolved_by` (uuid, references profiles.id, nullable)
      - `resolved_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for viewing public notes
    - Add policies for admin access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  is_admin boolean DEFAULT false
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL,
  content text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_public boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  category text,
  tags text[]
);

-- Create shared_notes table
CREATE TABLE IF NOT EXISTS shared_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  shared_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shared_with uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  can_edit boolean DEFAULT false,
  UNIQUE(note_id, shared_with)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_deleted boolean DEFAULT false
);

-- Create flagged_content table
CREATE TABLE IF NOT EXISTS flagged_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  content_type text NOT NULL CHECK (content_type IN ('note', 'comment')),
  content_id uuid NOT NULL,
  reported_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES profiles(id),
  resolved_at timestamptz
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_content ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for notes table
CREATE POLICY "Users can CRUD their own notes"
  ON notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public notes"
  ON notes
  FOR SELECT
  TO authenticated
  USING (is_public = true AND is_deleted = false);

CREATE POLICY "Users can view notes shared with them"
  ON notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shared_notes
      WHERE note_id = notes.id
      AND shared_with = auth.uid()
    )
    AND is_deleted = false
  );

CREATE POLICY "Users can update notes shared with them with edit permission"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shared_notes
      WHERE note_id = notes.id
      AND shared_with = auth.uid()
      AND can_edit = true
    )
    AND is_deleted = false
  );

-- Create policies for shared_notes table
CREATE POLICY "Users can read shares for their notes"
  ON shared_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = shared_by OR auth.uid() = shared_with);

CREATE POLICY "Users can create shares for their notes"
  ON shared_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = shared_by AND
    EXISTS (
      SELECT 1 FROM notes
      WHERE id = note_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shares for their notes"
  ON shared_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = shared_by);

-- Create policies for comments table
CREATE POLICY "Users can read comments on public notes"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE id = note_id
      AND (is_public = true OR user_id = auth.uid())
      AND is_deleted = false
    )
    AND is_deleted = false
  );

CREATE POLICY "Users can read comments on notes shared with them"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shared_notes
      WHERE note_id = comments.note_id
      AND shared_with = auth.uid()
    )
    AND is_deleted = false
  );

CREATE POLICY "Users can add comments to accessible notes"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE id = note_id
      AND (
        is_public = true
        OR user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM shared_notes
          WHERE note_id = notes.id
          AND shared_with = auth.uid()
        )
      )
      AND is_deleted = false
    )
  );

CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for flagged_content table
CREATE POLICY "Users can report content"
  ON flagged_content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view their own reports"
  ON flagged_content
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reported_by);

CREATE POLICY "Admins can view all flagged content"
  ON flagged_content
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can update flagged content"
  ON flagged_content
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Create admin policies
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can view all notes"
  ON notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete any note"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete any comment"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Create functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();