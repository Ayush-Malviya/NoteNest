import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, filters: { category?: string; tags?: string[] }) => void;
  categories?: string[];
}

const SearchBar = ({ onSearch, categories = [] }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, {
      category: selectedCategory || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleClearAll = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedTags([]);
    onSearch('', {});
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center px-4 py-2">
          <Search size={20} className="text-gray-400 mr-2" />
          
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="flex-grow py-2 px-2 focus:outline-none text-gray-700"
          />
          
          {(query || selectedCategory || selectedTags.length > 0) && (
            <button 
              type="button"
              onClick={handleClearAll}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
          
          <button 
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-2 text-sm font-medium ${
              showFilters ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            Filters {selectedCategory || selectedTags.length > 0 ? `(${(selectedCategory ? 1 : 0) + selectedTags.length})` : ''}
          </button>
          
          <button 
            type="submit"
            className="ml-3 btn-primary py-1.5 px-3"
          >
            Search
          </button>
        </div>
        
        {showFilters && (
          <div className="border-t border-gray-200 p-4 animate-slide-down">
            {categories.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input py-1.5"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  className="input py-1.5 flex-grow"
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
                  className="ml-2 btn-secondary py-1.5 px-3"
                >
                  Add
                </button>
              </div>
              
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTags.map((tag) => (
                    <span key={tag} className="inline-flex items-center bg-gray-100 text-gray-800 text-xs rounded-full px-3 py-1">
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
        )}
      </form>
    </div>
  );
};

export default SearchBar;