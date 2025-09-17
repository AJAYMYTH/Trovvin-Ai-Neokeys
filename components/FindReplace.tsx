import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface FindReplaceProps {
  findValue: string;
  replaceValue: string;
  onFindChange: (value: string) => void;
  onReplaceChange: (value: string) => void;
  onFindNext: () => void;
  onFindPrev: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
  matchCount: number;
  currentMatchIndex: number;
}

export const FindReplace: React.FC<FindReplaceProps> = ({
  findValue,
  replaceValue,
  onFindChange,
  onReplaceChange,
  onFindNext,
  onFindPrev,
  onReplace,
  onReplaceAll,
  onClose,
  matchCount,
  currentMatchIndex
}) => {
  return (
    /*
      The widget's width is made responsive.
      - Default: Takes up nearly the full width on very small screens to ensure content is not clipped.
      - Small screens ('sm' breakpoint) and up: Reverts to a fixed width ('w-80') for a more traditional desktop feel.
    */
    <div className="absolute top-2 right-2 bg-white/70 dark:bg-gray-800/80 backdrop-blur-md p-3 rounded-lg shadow-lg z-10 w-[calc(100%-1rem)] sm:w-80 border border-white/20">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Find & Replace</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20" aria-label="Close">
            <CloseIcon />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Find"
            value={findValue}
            onChange={(e) => onFindChange(e.target.value)}
            className="flex-grow p-1.5 bg-black/10 dark:bg-black/20 border border-white/20 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-center">
            {matchCount > 0 ? `${currentMatchIndex + 1} / ${matchCount}` : '0 / 0'}
          </span>
          <button onClick={onFindPrev} disabled={matchCount < 2} className="p-1 rounded hover:bg-gray-500/20 disabled:opacity-50" aria-label="Previous match">↑</button>
          <button onClick={onFindNext} disabled={matchCount < 2} className="p-1 rounded hover:bg-gray-500/20 disabled:opacity-50" aria-label="Next match">↓</button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Replace"
            value={replaceValue}
            onChange={(e) => onReplaceChange(e.target.value)}
            className="flex-grow p-1.5 bg-black/10 dark:bg-black/20 border border-white/20 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
          />
          <button onClick={onReplace} disabled={matchCount === 0} className="px-2 py-1 text-sm bg-blue-500/80 text-white rounded hover:bg-blue-600/80 disabled:bg-blue-500/30">Replace</button>
          <button onClick={onReplaceAll} disabled={matchCount === 0} className="px-2 py-1 text-sm bg-blue-500/80 text-white rounded hover:bg-blue-600/80 disabled:bg-blue-500/30">All</button>
        </div>
      </div>
    </div>
  );
};
