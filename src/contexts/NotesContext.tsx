import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Database } from '../types/supabase';

type Note = Database['public']['Tables']['notes']['Row'];
type NoteInsert = Database['public']['Tables']['notes']['Insert'];
type NoteUpdate = Database['public']['Tables']['notes']['Update'];

interface NotesContextType {
  notes: Note[];
  sharedNotes: Note[];
  publicNotes: Note[];
  loading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  fetchNoteById: (id: string) => Promise<Note | null>;
  createNote: (note: NoteInsert) => Promise<{ data: Note | null; error: any }>;
  updateNote: (id: string, updates: NoteUpdate) => Promise<{ data: Note | null; error: any }>;
  deleteNote: (id: string) => Promise<{ error: any }>;
  shareNoteWithUser: (noteId: string, userId: string, canEdit: boolean) => Promise<{ error: any }>;
  unshareNoteWithUser: (noteId: string, userId: string) => Promise<{ error: any }>;
  searchNotes: (query: string, filters?: { category?: string; tags?: string[] }) => Promise<Note[]>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [sharedNotes, setSharedNotes] = useState<Note[]>([]);
  const [publicNotes, setPublicNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotes();
    } else {
      setNotes([]);
      setSharedNotes([]);
      setLoading(false);
    }
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user's own notes
      const { data: userNotes, error: userNotesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });
      
      if (userNotesError) throw userNotesError;
      setNotes(userNotes || []);
      
      // Fetch notes shared with the user
      const { data: sharedWithUser, error: sharedError } = await supabase
        .from('shared_notes')
        .select(`
          note_id,
          notes (*)
        `)
        .eq('shared_with', user.id)
        .eq('notes.is_deleted', false);
      
      if (sharedError) throw sharedError;
      
      const formattedSharedNotes = sharedWithUser
        ? sharedWithUser.map(item => item.notes).filter(Boolean) as Note[]
        : [];
      
      setSharedNotes(formattedSharedNotes);
      
      // Fetch public notes (excluding user's own)
      const { data: public_notes, error: publicError } = await supabase
        .from('notes')
        .select('*')
        .eq('is_public', true)
        .eq('is_deleted', false)
        .neq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);
      
      if (publicError) throw publicError;
      setPublicNotes(public_notes || []);
      
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNoteById = async (id: string) => {
    try {
      // First try to fetch as owner
      let { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();
      
      if (error && user) {
        // Then check if shared with user
        const { data: sharedNote, error: sharedError } = await supabase
          .from('shared_notes')
          .select('notes (*)')
          .eq('note_id', id)
          .eq('shared_with', user.id)
          .eq('notes.is_deleted', false)
          .single();
        
        if (!sharedError && sharedNote) {
          data = sharedNote.notes;
        } else if (error) {
          // Finally check if public
          const { data: publicNote, error: publicError } = await supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .eq('is_public', true)
            .eq('is_deleted', false)
            .single();
          
          if (!publicError) {
            data = publicNote;
          } else {
            return null;
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching note by ID:', error);
      return null;
    }
  };

  const createNote = async (note: NoteInsert) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([note])
        .select()
        .single();
      
      if (!error && data) {
        setNotes(prev => [data, ...prev]);
      }
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const updateNote = async (id: string, updates: NoteUpdate) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (!error && data) {
        setNotes(prev => prev.map(note => note.id === id ? data : note));
      }
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const deleteNote = async (id: string) => {
    try {
      // Soft delete by setting is_deleted to true
      const { error } = await supabase
        .from('notes')
        .update({ is_deleted: true })
        .eq('id', id);
      
      if (!error) {
        setNotes(prev => prev.filter(note => note.id !== id));
      }
      
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const shareNoteWithUser = async (noteId: string, userId: string, canEdit: boolean) => {
    try {
      const { error } = await supabase
        .from('shared_notes')
        .insert({
          note_id: noteId,
          shared_by: user?.id as string,
          shared_with: userId,
          can_edit: canEdit
        });
      
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const unshareNoteWithUser = async (noteId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('shared_notes')
        .delete()
        .eq('note_id', noteId)
        .eq('shared_with', userId);
      
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const searchNotes = async (
    query: string,
    filters?: { category?: string; tags?: string[] }
  ) => {
    if (!user) return [];
    
    try {
      let queryBuilder = supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false);
      
      // Add text search
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }
      
      // Add category filter
      if (filters?.category) {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }
      
      // Add tags filter (if supported by your Supabase config)
      if (filters?.tags && filters.tags.length > 0) {
        queryBuilder = queryBuilder.contains('tags', filters.tags);
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        sharedNotes,
        publicNotes,
        loading,
        error,
        fetchNotes,
        fetchNoteById,
        createNote,
        updateNote,
        deleteNote,
        shareNoteWithUser,
        unshareNoteWithUser,
        searchNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}