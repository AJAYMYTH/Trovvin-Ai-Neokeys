import React, { useRef, useEffect } from 'react';
import { Tone, LoadingState, Formatting } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Loader } from './Loader';
import { BoldIcon } from './icons/BoldIcon';
import { ItalicIcon } from './icons/ItalicIcon';
import { UnderlineIcon } from './icons/UnderlineIcon';

interface ToolbarProps {
  onCorrect: () => void;
  onEnhance: (tone: Tone) => void;
  onFormat: (type: Formatting) => void;
  loading: LoadingState;
  hasText: boolean;
  hasSelection: boolean;
  isToneDropdownOpen: boolean;
  setIsToneDropdownOpen: (isOpen: boolean) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onCorrect,
  onEnhance,
  onFormat,
  loading,
  hasText,
  hasSelection,
  isToneDropdownOpen,
  setIsToneDropdownOpen,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleEnhanceClick = (tone: Tone) => {
    onEnhance(tone);
    setIsToneDropdownOpen(false);
  };

  // This effect adds a listener to close the dropdown when a click occurs outside of it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToneDropdownOpen(false);
      }
    };

    if (isToneDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isToneDropdownOpen, setIsToneDropdownOpen]);


  const tones = Object.values(Tone);
  const isAnyLoading = loading.correct || loading.enhance;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
      <button
        onClick={onCorrect}
        disabled={loading.correct || !hasText}
        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-500/50 text-white rounded-md hover:bg-blue-500/70 disabled:bg-blue-500/30 disabled:cursor-not-allowed transition-colors"
      >
        {loading.correct ? <Loader /> : <CheckIcon />}
        <span>Correct</span>
      </button>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsToneDropdownOpen(!isToneDropdownOpen)}
          disabled={loading.enhance || !hasText}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-purple-500/50 text-white rounded-md hover:bg-purple-500/70 disabled:bg-purple-500/30 disabled:cursor-not-allowed transition-colors"
        >
          {loading.enhance ? <Loader /> : <SparklesIcon />}
          <span>Enhance</span>
        </button>
        {isToneDropdownOpen && (
          <div className="absolute z-50 mt-2 w-48 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {tones.map((tone) => (
                <button
                  key={tone}
                  onClick={() => handleEnhanceClick(tone)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-500/20"
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="h-6 w-px bg-white/20 mx-1 sm:mx-2"></div>

      <button
        onClick={() => onFormat('bold')}
        disabled={isAnyLoading || !hasSelection}
        className="p-1.5 sm:p-2 bg-gray-500/30 text-white rounded-md hover:bg-gray-500/50 disabled:bg-gray-500/20 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        aria-label="Bold"
        title="Bold"
      >
        <BoldIcon />
      </button>
      <button
        onClick={() => onFormat('italic')}
        disabled={isAnyLoading || !hasSelection}
        className="p-1.5 sm:p-2 bg-gray-500/30 text-white rounded-md hover:bg-gray-500/50 disabled:bg-gray-500/20 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        aria-label="Italic"
        title="Italic"
      >
        <ItalicIcon />
      </button>
      <button
        onClick={() => onFormat('underline')}
        disabled={isAnyLoading || !hasSelection}
        className="p-1.5 sm:p-2 bg-gray-500/30 text-white rounded-md hover:bg-gray-500/50 disabled:bg-gray-500/20 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        aria-label="Underline"
        title="Underline"
      >
        <UnderlineIcon />
      </button>
    </div>
  );
};

export default Toolbar;