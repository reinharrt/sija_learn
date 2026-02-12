// ============================================
// src/components/common/TagInput.tsx
// Tag Input Component - FULL LUCIDE ICONS + Neobrutalist + Dark Mode
// ============================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
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
  const { showToast } = useNotification();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!input.trim() || input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

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
      showToast('warning', 'Tag sudah ditambahkan!');
      return;
    }

    if (tags.length >= maxTags) {
      showToast('warning', `Maksimal ${maxTags} tags!`);
      return;
    }

    if (trimmedTag.length < 2) {
      showToast('warning', 'Tag minimal 2 karakter!');
      return;
    }

    if (trimmedTag.length > 50) {
      showToast('warning', 'Tag maksimal 50 karakter!');
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
        addTag(suggestions[selectedIndex].name);
      } else if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
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
            className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 px-3 py-1.5 border-2 border-blue-600 dark:border-blue-500 font-bold text-sm group transition-colors duration-300"
          >
            <Hash className="w-3 h-3" />
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-transparent hover:border-blue-600 dark:hover:border-blue-500 duration-300"
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
          className="w-full px-4 py-3 border-2 border-sija-border bg-sija-background text-sija-text focus:outline-none focus:border-sija-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          disabled={tags.length >= maxTags}
        />

        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-sija-primary animate-spin" />
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-sija-surface border-2 border-sija-border shadow-hard max-h-60 overflow-y-auto transition-colors duration-300">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion._id}
                type="button"
                onClick={() => addTag(suggestion.name)}
                className={`w-full text-left px-4 py-3 transition-colors border-b-2 border-sija-border/30 last:border-b-0 ${index === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-l-4 border-l-sija-primary'
                    : 'hover:bg-sija-light dark:hover:bg-sija-dark/50'
                  } duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-sija-text/60" />
                    <span className="text-sija-text font-bold transition-colors duration-300">{suggestion.name}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-sija-light dark:bg-sija-dark/50 border border-sija-border px-2 py-1 transition-colors duration-300">
                    <TrendingUp className="w-3 h-3 text-sija-text/60" />
                    <span className="text-xs text-sija-text/70 dark:text-sija-text/60 font-bold">
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
        <div className="flex items-center gap-2 text-sija-text/60 dark:text-sija-text/50 transition-colors duration-300">
          <span className="flex items-center gap-1">
            Press
            <kbd className="inline-flex items-center gap-1 px-2 py-0.5 bg-sija-light dark:bg-sija-dark/50 border border-sija-border font-bold transition-colors duration-300">
              <CornerDownLeft className="w-3 h-3" />
              Enter
            </kbd>
            to add
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex items-center gap-1 px-2 py-0.5 bg-sija-light dark:bg-sija-dark/50 border border-sija-border font-bold transition-colors duration-300">
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" />
            </kbd>
            to navigate
          </span>
        </div>
        <span className={`font-bold transition-colors duration-300 ${tags.length >= maxTags ? 'text-red-600 dark:text-red-400' : 'text-sija-text/60 dark:text-sija-text/50'}`}>
          {tags.length}/{maxTags}
        </span>
      </div>

      {/* Info message for new tag */}
      {input.trim().length > 0 && !loading && suggestions.length === 0 && (
        <div className="mt-3 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-600 dark:border-blue-500 px-3 py-2 transition-colors duration-300">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 dark:text-blue-300 font-medium transition-colors duration-300">
              <span className="font-bold">"{input}"</span> will be created as a new tag
            </p>
          </div>
        </div>
      )}
    </div>
  );
}