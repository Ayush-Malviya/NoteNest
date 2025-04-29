import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from '../components/CommentSection';
import ShareModal from '../components/ShareModal';
import { Database } from '../types/supabase';
import { Edit, Share2, ArrowLeft, Trash2, Lock, AlertCircle, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';

type Note = Database['public']['Tables']['notes']['Row'] & {
  profiles?: {
    username: string;
    avatar_url: string | null;
  } | null;
};

const NoteView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { deleteNote, shareNoteWithUser } = useNotes();
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  
  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);
  
  const fetchNote = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch note with author info
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('id', id as string)
        .eq('is_deleted', false)
        .single();
      
      if (error) {
        // Check if it might be a private note
        if (user) {
          // Check if it's shared with the current user
          const { data: sharedData, error: sharedError } = await supabase
            .from('shared_notes')
            .select(`
              notes (
                *,
                profiles:user_id (
                  username,
                  avatar_url
                )
              )
            `)
            .eq('note_id', id as string)
            .eq('shared_with', user.id)
            .single();
          
          if (!sharedError && sharedData && sharedData.notes) {
            setNote(sharedData.notes as Note);
          } else {
            throw new Error('Note not found or you do not have permission to view it');
          }
        } else {
          throw new Error('Note not found or you do not have permission to view it');
        }
      } else {
        setNote(data as Note);
      }
    } catch (err: any) {
      console.error('Error fetching note:', err);
      setError(err.message || 'Failed to load note');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteNote = async () => {
    if (!id) return;
    
    try {
      const { error } = await deleteNote(id);
      
      if (error) throw error;
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setError(err.message || 'Failed to delete note');
    }
  };
  
  const handleReportNote = async () => {
    if (!id || !user) return;
    
    try {
      const { error } = await supabase.from('flagged_content').insert({
        content_type: 'note',
        content_id: id,
        reported_by: user.id,
        reason: reportReason || 'Reported by user',
      });
      
      if (error) throw error;
      
      setReportModalOpen(false);
      alert('Note reported to administrators');
    } catch (err: any) {
      console.error('Error reporting note:', err);
      setError(err.message || 'Failed to report note');
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
  
  if (error || !note) {
    return (
      <div className="max-w-4xl mx-auto bg-red-50 rounded-xl p-6 text-red-700">
        <div className="flex items-start">
          <AlertCircle size={24} className="mr-3 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="mb-4">{error || 'Note not found'}</p>
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary inline-flex items-center"
            >
              <ArrowLeft size={16} className="mr-1" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const isOwner = user && note.user_id === user.id;
  const createdDate = formatDistanceToNow(new Date(note.created_at), { addSuffix: true });
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Back</span>
        </button>
        
        <div className="flex items-center space-x-3">
          {!isOwner && user && (
            <button
              onClick={() => setReportModalOpen(true)}
              className="btn-secondary py-1.5 px-3 inline-flex items-center text-sm"
              aria-label="Report note"
            >
              <Flag size={16} className="mr-1" />
              Report
            </button>
          )}
          
          {isOwner && (
            <>
              <button
                onClick={() => setShareModalOpen(true)}
                className="btn-secondary py-1.5 px-3 inline-flex items-center text-sm"
                aria-label="Share note"
              >
                <Share2 size={16} className="mr-1" />
                Share
              </button>
              
              <Link
                to={`/notes/${id}/edit`}
                className="btn-accent py-1.5 px-3 inline-flex items-center text-sm"
                aria-label="Edit note"
              >
                <Edit size={16} className="mr-1" />
                Edit
              </Link>
              
              <button
                onClick={() => setConfirmDelete(true)}
                className="btn-danger py-1.5 px-3 inline-flex items-center text-sm"
                aria-label="Delete note"
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </button>
            </>
          )}
          
          {isAdmin && !isOwner && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="btn-danger py-1.5 px-3 inline-flex items-center text-sm"
              aria-label="Delete note (admin)"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-fade-in">
        <div className="p-6 sm:p-8">
          <header className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{note.title}</h1>
              {note.is_public ? (
                <Share2 size={18} className="text-accent-500" title="Public note" />
              ) : (
                <Lock size={18} className="text-gray-500" title="Private note" />
              )}
            </div>
            
            <div className="flex items-center text-gray-500 text-sm mb-4">
              <div className="flex items-center">
                <div className="bg-primary-100 text-primary-700 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  {note.profiles?.username.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="font-medium text-gray-700">{note.profiles?.username || 'Unknown user'}</span>
              </div>
              <span className="mx-2">•</span>
              <span>{createdDate}</span>
              
              {note.category && (
                <>
                  <span className="mx-2">•</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {note.category}
                  </span>
                </>
              )}
            </div>
            
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
          
          <div className="prose max-w-none">
            {note.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-100 bg-gray-50 px-6 sm:px-8 py-6">
          <CommentSection noteId={id as string} />
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Note</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleDeleteNote} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Share Modal */}
      {note && (
        <ShareModal
          note={note}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          onShare={shareNoteWithUser}
        />
      )}
      
      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Report Note</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for reporting this note. This will be reviewed by an administrator.
              </p>
              
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Reason for reporting..."
                className="input min-h-24 mb-4"
              />
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleReportNote} className="btn-primary">
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteView;