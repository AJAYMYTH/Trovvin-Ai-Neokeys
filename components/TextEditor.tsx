import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Formatting } from '../types';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSelectionChange: (selection: { start: number, end: number } | null) => void;
}

export interface EditorHandle {
  formatText: (type: Formatting) => void;
}

const TextEditor = forwardRef<EditorHandle, TextEditorProps>(
  ({ value, onChange, onSelectionChange }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSelect = () => {
      if (!textareaRef.current) return;
      const { selectionStart, selectionEnd } = textareaRef.current;
      if (selectionStart !== selectionEnd) {
        onSelectionChange({ start: selectionStart, end: selectionEnd });
      } else {
        onSelectionChange(null);
      }
    };
    
    useImperativeHandle(ref, () => ({
      formatText: (type) => {
        if (!textareaRef.current) return;
        
        const { selectionStart, selectionEnd, value } = textareaRef.current;
        const selectedText = value.substring(selectionStart, selectionEnd);
        
        if (!selectedText) return;

        let prefix = '';
        let suffix = '';

        switch (type) {
          case 'bold':
            prefix = '**';
            suffix = '**';
            break;
          case 'italic':
            prefix = '*';
            suffix = '*';
            break;
          case 'underline':
            prefix = '__';
            suffix = '__';
            break;
        }

        const newValue = 
          value.substring(0, selectionStart) +
          prefix + selectedText + suffix +
          value.substring(selectionEnd);
        
        onChange(newValue);

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const newSelectionStart = selectionStart + prefix.length;
            const newSelectionEnd = selectionEnd + prefix.length;
            textareaRef.current.setSelectionRange(newSelectionStart, newSelectionEnd);
            onSelectionChange({ start: newSelectionStart, end: newSelectionEnd });
          }
        }, 0);
      },
    }));

    return (
      <div className="relative flex-grow w-full h-full">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleSelect}
          className="w-full h-full p-4 bg-black/10 dark:bg-black/20 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-400 border border-white/20 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 resize-none"
          placeholder="Start writing here..."
        />
      </div>
    );
  }
);

TextEditor.displayName = 'TextEditor';

export default TextEditor;