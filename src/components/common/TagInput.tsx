// ============================================
// src/components/common/TagInput.tsx
// Tag Input Component - FULL LUCIDE ICONS + Neobrutalist
// ============================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  X, 
  Loader2, 
  Lightbulb, 
  ArrowUp, 
  ArrowDown, 
  CornerDownLeft,
  Hash,
  TrendingUp
} from 'lucide-react';

interface Tag {
  _id: string;
  name: string;
  usageCount: number;
}

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export default function TagInput({
  tags,
  onChange,
  placeholder = 'Add tags (press Enter)',
  maxTags = 10,
}: TagInputProps) {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch suggestions from database
  useEffect(() => {
    if (!input.trim() || input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(input);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [input]);

  const fetchSuggestions = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tags?action=search&q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      
      // Filter out already selected tags
      const filtered = (data.tags || []).filter(
        (tag: Tag) => !tags.includes(tag.name)
      );
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase();
    
    if (!trimmedTag) return;
    
    if (tags.includes(trimmedTag)) {
      alert('Tag already added!');
      return;
    }
    
    if (tags.length >= maxTags) {
      alert(`Maximum ${maxTags} tags allowed!`);
      return;
    }

    // Validate tag name
    if (trimmedTag.length < 2) {
      alert('Tag must be at least 2 characters!');
      return;
    }

    if (trimmedTag.length > 50) {
      alert('Tag must be less than 50 characters!');
      return;
    }

    onChange([...tags, trimmedTag]);
    setInput('');
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        // Select from suggestions
        addTag(suggestions[selectedIndex].name);
      } else if (input.trim()) {
        // Add new tag
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      // Remove last tag when backspace on empty input
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="relative">
      {/* Tags Display */}
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-3 py-1.5 border-2 border-blue-600 font-bold text-sm group"
          >
            <Hash className="w-3 h-3" />
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="p-0.5 hover:bg-blue-100 transition-colors border border-transparent hover:border-blue-600"
              title="Remove tag"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => input && setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:border-blue-600 font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={tags.length >= maxTags}
        />

        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion._id}
                type="button"
                onClick={() => addTag(suggestion.name)}
                className={`w-full text-left px-4 py-3 transition-colors border-b-2 border-gray-200 last:border-b-0 ${
                  index === selectedIndex 
                    ? 'bg-blue-50 border-l-4 border-l-blue-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-900 font-bold">{suggestion.name}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 border border-gray-300 px-2 py-1">
                    <TrendingUp className="w-3 h-3 text-gray-600" />
                    <span className="text-xs text-gray-700 font-bold">
                      {suggestion.usageCount}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="mt-2 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="flex items-center gap-1">
            Press 
            <kbd className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 border border-gray-300 font-bold">
              <CornerDownLeft className="w-3 h-3" />
              Enter
            </kbd> 
            to add
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 border border-gray-300 font-bold">
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" />
            </kbd> 
            to navigate
          </span>
        </div>
        <span className={`font-bold ${tags.length >= maxTags ? 'text-red-600' : 'text-gray-600'}`}>
          {tags.length}/{maxTags}
        </span>
      </div>

      {/* Info message for new tag */}
      {input.trim().length > 0 && !loading && suggestions.length === 0 && (
        <div className="mt-3 bg-blue-50 border-2 border-blue-600 px-3 py-2">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 font-medium">
              <span className="font-bold">"{input}"</span> will be created as a new tag
            </p>
          </div>
        </div>
      )}
    </div>
  );
}