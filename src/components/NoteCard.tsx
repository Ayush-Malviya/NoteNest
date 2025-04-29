import React from 'react';
import { Link } from 'react-router-dom';
import { Database } from '../types/supabase';
import { Edit, Trash2, Eye, Share2, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Note = Database['public']['Tables']['notes']['Row'];

interface NoteCardProps {
  note: Note;
  isOwner: boolean;
  onDelete?: (id: string) => void;
  onShare?: (note: Note) => void;
}

const NoteCard = ({ note, isOwner, onDelete, onShare }: NoteCardProps) => {
  // Truncate content to a preview
  const contentPreview = note.content.length > 150 
    ? `${note.content.substring(0, 150)}...` 
    : note.content;

  // Format date
  const timeAgo = formatDistanceToNow(new Date(note.updated_at), { addSuffix: true });

  return (
    <div className="card group hover:border-primary-200 animate-fade-in">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{note.title}</h3>
        <div className="flex items-center text-gray-500">
          {note.is_public ? (
            <Share2 size={16} className="text-accent-500" title="Public note" />
          ) : (
            <Lock size={16} title="Private note" />
          )}
        </div>
      </div>
      
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {note.tags.map((tag, index) => (
            <span 
              key={index} 
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{contentPreview}</p>
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">Updated {timeAgo}</span>
        
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link 
            to={`/notes/${note.id}`} 
            className="p-1 text-gray-500 hover:text-primary-600 transition-colors duration-200"
            title="View note"
          >
            <Eye size={18} />
          </Link>
          
          {isOwner && (
            <>
              <Link 
                to={`/notes/${note.id}/edit`} 
                className="p-1 text-gray-500 hover:text-accent-500 transition-colors duration-200"
                title="Edit note"
              >
                <Edit size={18} />
              </Link>
              
              {onDelete && (
                <button 
                  onClick={() => onDelete(note.id)} 
                  className="p-1 text-gray-500 hover:text-red-500 transition-colors duration-200"
                  title="Delete note"
                >
                  <Trash2 size={18} />
                </button>
              )}
              
              {onShare && (
                <button 
                  onClick={() => onShare(note)} 
                  className="p-1 text-gray-500 hover:text-accent-500 transition-colors duration-200"
                  title="Share note"
                >
                  <Share2 size={18} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;