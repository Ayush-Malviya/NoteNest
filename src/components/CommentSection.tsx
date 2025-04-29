import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../types/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Flag, Trash2 } from 'lucide-react';

type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles?: {
    username: string;
    avatar_url: string | null;
  } | null;
};

interface CommentSectionProps {
  noteId: string;
}

const CommentSection = ({ noteId }: CommentSectionProps) => {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
    
    // Set up real-time subscription for comments
    const subscription = supabase
      .channel('comments-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `note_id=eq.${noteId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [noteId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('note_id', noteId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setComments(data || []);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newComment.trim()) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const { error } = await supabase.from('comments').insert({
        note_id: noteId,
        user_id: user.id,
        content: newComment.trim(),
      });
      
      if (error) throw error;
      
      setNewComment('');
      await fetchComments();
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_deleted: true })
        .eq('id', commentId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await fetchComments();
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(err.message);
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from('flagged_content').insert({
        content_type: 'comment',
        content_id: commentId,
        reported_by: user.id,
        reason: 'Reported by user',
      });
      
      if (error) throw error;
      
      alert('Comment reported to administrators');
    } catch (err: any) {
      console.error('Error reporting comment:', err);
      setError(err.message);
    }
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {comments.length === 0 ? (
            <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-4 mb-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary-100 text-primary-700 rounded-full w-8 h-8 flex items-center justify-center">
                        {comment.profiles?.username.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{comment.profiles?.username || 'Unknown user'}</p>
                        <p className="text-xs text-gray-500 mb-2">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {(user?.id === comment.user_id || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Delete comment"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      
                      {user && user.id !== comment.user_id && (
                        <button
                          onClick={() => handleReportComment(comment.id)}
                          className="text-gray-400 hover:text-amber-500"
                          title="Report comment"
                        >
                          <Flag size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {user ? (
            <form onSubmit={handleSubmitComment} className="mt-4">
              <div className="mb-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input min-h-24"
                  placeholder="Write a comment..."
                  required
                />
              </div>
              
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <p className="text-gray-500 italic mt-4">
              Please <a href="/login" className="text-primary-600 hover:underline">log in</a> to leave a comment.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default CommentSection;