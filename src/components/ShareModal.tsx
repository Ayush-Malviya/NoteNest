import React, { useState, useEffect } from 'react';
import { X, Mail, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { useAuth } from '../contexts/AuthContext';

type Note = Database['public']['Tables']['notes']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ShareModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
  onShare: (userId: string, canEdit: boolean) => Promise<{ error: any }>;
}

const ShareModal = ({ note, isOpen, onClose, onShare }: ShareModalProps) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [sharedUsers, setSharedUsers] = useState<{id: string, username: string, can_edit: boolean}[]>([]);
  const [isPublic, setIsPublic] = useState(note.is_public);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedUser(null);
      setIsPublic(note.is_public);
      fetchSharedUsers();
    }
  }, [isOpen, note]);

  const fetchSharedUsers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('shared_notes')
        .select(`
          shared_with,
          can_edit,
          profiles:shared_with (
            id,
            username
          )
        `)
        .eq('note_id', note.id)
        .eq('shared_by', user.id);
      
      if (error) throw error;
      
      setSharedUsers(
        data?.map(item => ({
          id: item.shared_with,
          username: item.profiles?.username || 'Unknown',
          can_edit: item.can_edit
        })) || []
      );
    } catch (err) {
      console.error('Error fetching shared users:', err);
    }
  };

  const searchUsers = async () => {
    if (searchTerm.length < 3 || !user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .ilike('username', `%${searchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      
      // Filter out already shared users
      const filteredUsers = data?.filter(
        u => !sharedUsers.some(su => su.id === u.id)
      ) || [];
      
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 3) {
        searchUsers();
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleShareWithUser = async () => {
    if (!selectedUser) return;
    
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await onShare(selectedUser.id, canEdit);
      
      if (error) throw error;
      
      setSharedUsers([
        ...sharedUsers,
        {
          id: selectedUser.id,
          username: selectedUser.username,
          can_edit: canEdit
        }
      ]);
      
      setSelectedUser(null);
      setSearchTerm('');
      setUsers([]);
      setSuccess(`Note shared with ${selectedUser.username}`);
    } catch (err: any) {
      console.error('Error sharing note:', err);
      setError(err.message);
    }
  };

  const handleRemoveShare = async (userId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('shared_notes')
        .delete()
        .eq('note_id', note.id)
        .eq('shared_with', userId);
      
      if (error) throw error;
      
      setSharedUsers(sharedUsers.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error removing share:', err);
    }
  };

  const togglePublicStatus = async () => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_public: !isPublic })
        .eq('id', note.id);
      
      if (error) throw error;
      
      setIsPublic(!isPublic);
    } catch (err) {
      console.error('Error updating note visibility:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Share "{note.title}"</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={togglePublicStatus}
                className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Make note public (anyone with the link can view)</span>
            </label>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Share with specific users
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username..."
                className="input pl-9"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            
            {loading && (
              <div className="flex justify-center mt-2">
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {users.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-48 overflow-y-auto">
                {users.map((userItem) => (
                  <div
                    key={userItem.id}
                    className={`p-2 hover:bg-gray-50 cursor-pointer ${
                      selectedUser?.id === userItem.id ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => setSelectedUser(userItem)}
                  >
                    <div className="flex items-center">
                      <div className="bg-primary-100 text-primary-700 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                        {userItem.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-800">{userItem.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchTerm.length >= 3 && users.length === 0 && !loading && (
              <p className="text-sm text-gray-500 mt-2">No users found</p>
            )}
          </div>
          
          {selectedUser && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-primary-100 text-primary-700 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-800">{selectedUser.username}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canEdit}
                      onChange={(e) => setCanEdit(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Can edit</span>
                  </label>
                  
                  <button
                    onClick={handleShareWithUser}
                    className="btn-primary py-1 px-3"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center">
              <Check size={16} className="mr-2" />
              {success}
            </div>
          )}
          
          {sharedUsers.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Shared with</h4>
              <div className="space-y-2">
                {sharedUsers.map((sharedUser) => (
                  <div key={sharedUser.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-gray-200 text-gray-700 rounded-full w-7 h-7 flex items-center justify-center mr-2">
                        {sharedUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-gray-800 text-sm">{sharedUser.username}</span>
                        {sharedUser.can_edit && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-200 rounded text-gray-700">
                            Can edit
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveShare(sharedUser.id)}
                      className="text-gray-500 hover:text-red-500"
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-b-xl flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;