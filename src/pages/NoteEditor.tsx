import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../types/supabase';
import { Save, X, AlertCircle, Loader2 } from 'lucide-react';

type NoteInsert = Database['public']['Tables']['notes']['Insert'];
type NoteUpdate = Database['public']['Tables']['notes']['Update'];

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { fetchNoteById, createNote, updateNote } = useNotes();
  
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Categories for dropdown selection
  const categoryOptions = ['Personal', 'Work', 'Study', 'Ideas', 'Other'];
  
  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);
  
  const fetchNote = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const note = await fetchNoteById(id as string);
      
      if (!note) {
        setError('Note not found');
        return;
      }
      
      // Check if user has permission to edit
      if (note.user_id !== user?.id) {
        // Check if user has permission to edit this note
        // This would involve checking the shared_notes table if implemented
        setError('You do not have permission to edit this note');
        return;
      }
      
      setTitle(note.title);
      setContent(note.content);
      setIsPublic(note.is_public);
      setCategory(note.category || '');
      setTags(note.tags || []);
      
    } catch (err) {
      console.error('Error fetching note:', err);
      setError('Failed to load note');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (!profile?.id) {
      setError('Your profile is not properly set up. Please try logging out and back in.');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      if (id) {
        // Update existing note
        const updateData: NoteUpdate = {
          title,
          content,
          is_public: isPublic,
          category: category || null,
          tags: tags.length > 0 ? tags : null,
        };
        
        const { error } = await updateNote(id, updateData);
        
        if (error) throw error;
        
        navigate(`/notes/${id}`);
      } else {
        // Create new note
        const newNote: NoteInsert = {
          title,
          content,
          user_id: profile.id,
          is_public: isPublic,
          category: category || null,
          tags: tags.length > 0 ? tags : null,
        };
        
        const { data, error } = await createNote(newNote);
        
        if (error) throw error;
        
        navigate(`/notes/${data?.id}`);
      }
    } catch (err: any) {
      console.error('Error saving note:', err);
      setError(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading note...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{id ? 'Edit Note' : 'Create New Note'}</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-start">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Note title"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input min-h-64"
            placeholder="Write your note here..."
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              <option value="">Select a category</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex">
              <input
                id="tagInput"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="input rounded-r-none flex-grow"
                placeholder="Add tags..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 bg-gray-200 text-gray-800 rounded-r-lg hover:bg-gray-300 transition-colors"
              >
                Add
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-xs bg-gray-100 text-gray-800 rounded-full px-2.5 py-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 text-gray-500 hover:text-gray-700"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-gray-700">Make this note public</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            Public notes can be viewed by anyone with the link
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteEditor;