export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          user_id: string
          is_public: boolean
          is_deleted: boolean
          category: string | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          user_id: string
          is_public?: boolean
          is_deleted?: boolean
          category?: string | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          user_id?: string
          is_public?: boolean
          is_deleted?: boolean
          category?: string | null
          tags?: string[] | null
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          note_id: string
          user_id: string
          content: string
          is_deleted: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          note_id: string
          user_id: string
          content: string
          is_deleted?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          note_id?: string
          user_id?: string
          content?: string
          is_deleted?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
        }
      }
      shared_notes: {
        Row: {
          id: string
          created_at: string
          note_id: string
          shared_by: string
          shared_with: string
          can_edit: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          note_id: string
          shared_by: string
          shared_with: string
          can_edit?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          note_id?: string
          shared_by?: string
          shared_with?: string
          can_edit?: boolean
        }
      }
      flagged_content: {
        Row: {
          id: string
          created_at: string
          content_type: 'note' | 'comment'
          content_id: string
          reported_by: string
          reason: string
          resolved: boolean
          resolved_by: string | null
          resolved_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          content_type: 'note' | 'comment'
          content_id: string
          reported_by: string
          reason: string
          resolved?: boolean
          resolved_by?: string | null
          resolved_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          content_type?: 'note' | 'comment'
          content_id?: string
          reported_by?: string
          reason?: string
          resolved?: boolean
          resolved_by?: string | null
          resolved_at?: string | null
        }
      }
    }
  }
}