import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { Shield, Loader2, Check, X, AlertCircle } from 'lucide-react';

type FlaggedContent = Database['public']['Tables']['flagged_content']['Row'] & {
  notes?: Database['public']['Tables']['notes']['Row'];
  comments?: Database['public']['Tables']['comments']['Row'];
  reporter?: { username: string };
};

const Admin = () => {
  const { isAdmin, user } = useAuth();
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isAdmin) {
      fetchFlaggedContent();
    }
  }, [isAdmin]);
  
  const fetchFlaggedContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('flagged_content')
        .select(`
          *,
          notes:content_id (*),
          comments:content_id (*),
          reporter:reported_by (username)
        `)
        .eq('resolved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setFlaggedContent(data as FlaggedContent[]);
    } catch (err: any) {
      console.error('Error fetching flagged content:', err);
      setError(err.message || 'Failed to load flagged content');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResolve = async (id: string, action: 'approve' | 'remove') => {
    if (!user) return;
    
    try {
      // First mark the flagged content as resolved
      const { error: resolveError } = await supabase
        .from('flagged_content')
        .update({
          resolved: true,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (resolveError) throw resolveError;
      
      // Get the item to determine what to do
      const item = flaggedContent.find(item => item.id === id);
      
      if (!item) return;
      
      // If action is remove, then delete/hide the content
      if (action === 'remove') {
        if (item.content_type === 'note') {
          const { error } = await supabase
            .from('notes')
            .update({ is_deleted: true })
            .eq('id', item.content_id);
          
          if (error) throw error;
        } else if (item.content_type === 'comment') {
          const { error } = await supabase
            .from('comments')
            .update({ is_deleted: true })
            .eq('id', item.content_id);
          
          if (error) throw error;
        }
      }
      
      // Refresh the list
      fetchFlaggedContent();
    } catch (err: any) {
      console.error('Error resolving flagged content:', err);
      setError(err.message || 'Failed to resolve flagged content');
    }
  };
  
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-red-50 text-red-700 p-8 rounded-xl">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p>You do not have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Shield size={24} className="text-primary-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
        <h2 className="text-xl font-semibold mb-6">Flagged Content</h2>
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-start">
            <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center">
              <Loader2 size={24} className="animate-spin text-primary-600 mb-2" />
              <p className="text-gray-600">Loading flagged content...</p>
            </div>
          </div>
        ) : flaggedContent.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-accent-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No flagged content</h3>
            <p className="text-gray-600">
              All content has been reviewed. Check back later for new reports.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {flaggedContent.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-800">
                      {item.content_type === 'note' ? 'Flagged Note' : 'Flagged Comment'}
                    </span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      Reported by {item.reporter?.username || 'Unknown'} on{' '}
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResolve(item.id, 'approve')}
                      className="inline-flex items-center px-3 py-1 bg-accent-500 text-white rounded hover:bg-accent-600"
                      title="Approve content (ignore report)"
                    >
                      <Check size={16} className="mr-1" />
                      <span className="text-sm">Approve</span>
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'remove')}
                      className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      title="Remove content"
                    >
                      <X size={16} className="mr-1" />
                      <span className="text-sm">Remove</span>
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Reason for report:</span>
                    <p className="text-gray-600 bg-red-50 p-2 rounded mt-1">{item.reason}</p>
                  </div>
                  
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-700">Content:</span>
                    <div className="bg-gray-50 p-3 rounded mt-1 text-gray-700">
                      {item.content_type === 'note' && item.notes ? (
                        <>
                          <h4 className="font-medium">{item.notes.title}</h4>
                          <p className="mt-2 whitespace-pre-line">{item.notes.content}</p>
                        </>
                      ) : item.content_type === 'comment' && item.comments ? (
                        <p className="whitespace-pre-line">{item.comments.content}</p>
                      ) : (
                        <p className="italic text-gray-500">Content not available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;