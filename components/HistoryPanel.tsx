import React from 'react';
import { InteractionHistoryItem } from '../types';

interface HistoryPanelProps {
  history: InteractionHistoryItem[];
  onApply: (item: InteractionHistoryItem) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onApply, onClear }) => {
  if (history.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No history yet.</p>;
  }

  return (
    <div className="space-y-4">
       <div className="flex justify-end">
        <button
          onClick={onClear}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 transition-colors text-sm"
        >
          Clear History
        </button>
      </div>
      {history.map((item) => (
        <div key={item.id} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg">{item.type}{item.tone ? ` (${item.tone})` : ''}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => onApply(item)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Apply
            </button>
          </div>
          <div className="mt-2 space-y-2">
            <div>
              <h4 className="font-semibold text-gray-600 dark:text-gray-300">Original:</h4>
              <p className="text-sm p-2 bg-red-100 dark:bg-red-900/30 rounded-md line-through">{item.original}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-600 dark:text-gray-300">New Version:</h4>
              <p className="text-sm p-2 bg-green-100 dark:bg-green-900/30 rounded-md">{item.corrected}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryPanel;