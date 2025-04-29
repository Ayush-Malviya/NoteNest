import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import NoteCard from '../components/NoteCard';
import SearchBar from '../components/SearchBar';
import ShareModal from '../components/ShareModal';
import { Database } from '../types/supabase';
import { Plus, Trash2, Loader2, Filter, AlertCircle } from 'lucide-react';

type Note = Database['public']['Tables']['notes']['Row'];

const Dashboard = () => {
  const { notes, loading, error, fetchNotes, deleteNote, searchNotes, shareNoteWithUser } = useNotes();
  const { user, profile } = useAuth();
  
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    // Extract unique categories from notes
    if (notes.length > 0) {
      const uniqueCategories = Array.from(
        new Set(
          notes
            .map(note => note.category)
            .filter(Boolean) as string[]
        )
      );
      setCategories(uniqueCategories);
    }
  }, [notes]);

  const handleSearch = async (query: string, filters: { category?: string; tags?: string[] }) => {
    if (!query && !filters.category && !filters.tags) {
      setSearchResults(null);
      return;
    }
    
    const results = await searchNotes(query, filters);
    setSearchResults(results);
  };

  const handleDeleteNote = async (id: string) => {
    if (confirmDelete === id) {
      await deleteNote(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  const handleShareNote = (note: Note) => {
    setSelectedNote(note);
    setShareModalOpen(true);
  };

  const displayedNotes = searchResults !== null ? searchResults : notes;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
        <Link to="/notes/new" className="btn-primary flex items-center">
          <Plus size={18} className="mr-1" />
          New Note
        </Link>
      </div>
      
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} categories={categories} />
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="flex flex-col items-center">
            <Loader2 size={24} className="animate-spin text-primary-600 mb-2" />
            <p className="text-gray-600">Loading your notes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start mb-6">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>Failed to load notes: {error}</p>
        </div>
      ) : displayedNotes.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <StickNote size={24} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-600 mb-6">
            {searchResults !== null 
              ? "No notes match your search criteria. Try adjusting your filters."
              : "You haven't created any notes yet. Create your first note to get started!"}
          </p>
          {searchResults !== null ? (
            <button
              onClick={() => setSearchResults(null)}
              className="btn-secondary inline-flex items-center"
            >
              <Filter size={16} className="mr-1" />
              Clear filters
            </button>
          ) : (
            <Link to="/notes/new" className="btn-primary inline-flex items-center">
              <Plus size={16} className="mr-1" />
              Create a note
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isOwner={note.user_id === user?.id}
              onDelete={(id) => handleDeleteNote(id)}
              onShare={(note) => handleShareNote(note)}
            />
          ))}
        </div>
      )}
      
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Note</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteNote(confirmDelete)} 
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {selectedNote && (
        <ShareModal
          note={selectedNote}
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedNote(null);
          }}
          onShare={shareNoteWithUser}
        />
      )}
    </div>
  );
};

export default Dashboard;

// Fix for undefined StickNote
const StickNote = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/>
      <path d="M15 3v6h6"/>
    </svg>
  );
};