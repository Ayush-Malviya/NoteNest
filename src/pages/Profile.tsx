import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNotes } from '../contexts/NotesContext';
import { User, Save, Loader2, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { notes } = useNotes();
  
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Stats
  const [totalNotes, setTotalNotes] = useState(0);
  const [publicNotes, setPublicNotes] = useState(0);
  const [privateNotes, setPrivateNotes] = useState(0);
  
  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setFullName(profile.full_name || '');
    }
  }, [profile]);
  
  useEffect(() => {
    if (notes.length > 0) {
      setTotalNotes(notes.length);
      setPublicNotes(notes.filter(note => note.is_public).length);
      setPrivateNotes(notes.filter(note => !note.is_public).length);
    }
  }, [notes]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refreshProfile();
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
            {error && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-start">
                <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-center mb-6">
                <div className="bg-primary-100 text-primary-700 rounded-full w-24 h-24 flex items-center justify-center">
                  <User size={40} />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="input bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Your email address cannot be changed</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                  placeholder="Your full name (optional)"
                />
              </div>
              
              <button
                type="submit"
                className="btn-primary flex items-center justify-center w-full md:w-auto"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Your Stats</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900">{totalNotes}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Public Notes</p>
                <p className="text-2xl font-bold text-primary-600">{publicNotes}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Private Notes</p>
                <p className="text-2xl font-bold text-gray-700">{privateNotes}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="text-lg font-medium text-gray-900">
                  {profile ? new Date(profile.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;