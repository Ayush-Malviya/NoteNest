import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import NoteCard from '../components/NoteCard';
import SearchBar from '../components/SearchBar';
import { Table as Tabs, Component as TabsContent, List as TabsList, Refrigerator as TabsTrigger } from 'lucide-react';
import { Database } from '../types/supabase';

type Note = Database['public']['Tables']['notes']['Row'];

const SharedNotes = () => {
  const { sharedNotes, publicNotes, loading } = useNotes();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('shared-with-me');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  
  const handleSearch = (query: string, filters: { category?: string; tags?: string[] }) => {
    setSearchQuery(query);
    
    const notesToFilter = activeTab === 'shared-with-me' ? sharedNotes : publicNotes;
    
    if (!query && !filters.category && !filters.tags?.length) {
      setFilteredNotes([]);
      return;
    }
    
    const filtered = notesToFilter.filter(note => {
      const matchesQuery = !query || 
        note.title.toLowerCase().includes(query.toLowerCase()) || 
        note.content.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = !filters.category || note.category === filters.category;
      
      const matchesTags = !filters.tags?.length || 
        (note.tags && filters.tags.every(tag => note.tags?.includes(tag)));
      
      return matchesQuery && matchesCategory && matchesTags;
    });
    
    setFilteredNotes(filtered);
  };
  
  const getCategories = () => {
    const notes = activeTab === 'shared-with-me' ? sharedNotes : publicNotes;
    const categories = notes
      .map(note => note.category)
      .filter(Boolean) as string[];
    
    return [...new Set(categories)];
  };
  
  const displayedNotes = searchQuery ? filteredNotes : (
    activeTab === 'shared-with-me' ? sharedNotes : publicNotes
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shared Notes</h1>
      </div>
      
      <div className="mb-6">
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('shared-with-me');
              setSearchQuery('');
              setFilteredNotes([]);
            }}
            className={`px-4 py-2 font-medium ${
              activeTab === 'shared-with-me'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Shared with me
          </button>
          <button
            onClick={() => {
              setActiveTab('public');
              setSearchQuery('');
              setFilteredNotes([]);
            }}
            className={`px-4 py-2 font-medium ${
              activeTab === 'public'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Public Notes
          </button>
        </div>
        
        <SearchBar onSearch={handleSearch} categories={getCategories()} />
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : displayedNotes.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'shared-with-me' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <path d="M16 6a4 4 0 0 0-8 0v6h8V6z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery
              ? 'No notes match your search'
              : activeTab === 'shared-with-me'
              ? 'No notes have been shared with you'
              : 'No public notes available'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'Try adjusting your search terms or filters'
              : activeTab === 'shared-with-me'
              ? 'When someone shares a note with you, it will appear here'
              : 'Be the first to share a public note with the community'}
          </p>
          {activeTab === 'public' && !searchQuery && (
            <Link to="/notes/new" className="btn-primary inline-flex items-center">
              Create a public note
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedNotes;