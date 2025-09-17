import React, { useState, useEffect, useRef, useCallback } from 'react';
import TextEditor, { EditorHandle } from './components/TextEditor';
import Toolbar from './components/Toolbar';
import ChatPanel from './components/ChatPanel';
import HistoryPanel from './components/HistoryPanel';
import ThemeToggle from './components/ThemeToggle';
import { Tone, InteractionHistoryItem, LoadingState, Formatting } from './types';
import { correctText, enhanceText } from './services/geminiService';
import useLocalStorage from './hooks/useLocalStorage';
import { HistoryIcon } from './components/icons/HistoryIcon';
import Modal from './components/Modal';
import { LogoIcon } from './components/icons/LogoIcon';
import { ChatIcon } from './components/icons/ChatIcon';
import { CloseIcon } from './components/icons/CloseIcon';

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<LoadingState>({ correct: false, enhance: false, chat: false });
  const [history, setHistory] = useLocalStorage<InteractionHistoryItem[]>('writing-assistant-history', []);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState<boolean>(false);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ start: number, end: number } | null>(null);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  // State for the 'Enhance' dropdown, lifted from Toolbar to allow control via keyboard shortcuts.
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const editorRef = useRef<EditorHandle>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleCorrectText = useCallback(async () => {
    if (!text.trim() || loading.correct) return;
    setLoading(prev => ({ ...prev, correct: true }));
    setError(null);
    try {
      const corrected = await correctText(text);
      if (corrected !== text) {
        setHistory(prev => [
          {
            id: Date.now().toString(),
            type: 'Correction',
            original: text,
            corrected,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
        setText(corrected);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during correction.");
    } finally {
      setLoading(prev => ({ ...prev, correct: false }));
    }
  }, [text, loading.correct, setHistory]);

  const handleEnhanceText = useCallback(async (tone: Tone) => {
    if (!text.trim() || loading.enhance) return;
    setLoading(prev => ({ ...prev, enhance: true }));
    setError(null);
    try {
      const enhanced = await enhanceText(text, tone);
      if (enhanced !== text) {
        setHistory(prev => [
          {
            id: Date.now().toString(),
            type: 'Enhancement',
            original: text,
            corrected: enhanced,
            tone,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
        setText(enhanced);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : `An unknown error occurred while enhancing with ${tone} tone.`);
    } finally {
      setLoading(prev => ({ ...prev, enhance: false }));
    }
  }, [text, loading.enhance, setHistory]);
  
  const handleFormatText = useCallback((type: Formatting) => {
    editorRef.current?.formatText(type);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // The Escape key closes modals and panels in a specific order of priority.
      if (event.key === 'Escape') {
        if (error) { setError(null); return; }
        if (isHistoryPanelOpen) { setIsHistoryPanelOpen(false); return; }
        if (isToneDropdownOpen) { setIsToneDropdownOpen(false); return; }
        if (isChatPanelOpen) { setIsChatPanelOpen(false); return; }
      }

      // Handle Ctrl (or Cmd on macOS) key combinations for main actions.
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'e':
            event.preventDefault();
            if (event.shiftKey) { // Ctrl+Shift+E: Toggle Enhance dropdown
              if (text.trim()) setIsToneDropdownOpen(prev => !prev);
            } else { // Ctrl+E: Correct text
              if (text.trim()) handleCorrectText();
            }
            break;
          case 'b': // Ctrl+B: Bold
            event.preventDefault();
            if (selection) handleFormatText('bold');
            break;
          case 'i': // Ctrl+I: Italic
            event.preventDefault();
            if (selection) handleFormatText('italic');
            break;
          case 'u': // Ctrl+U: Underline
            event.preventDefault();
            if (selection) handleFormatText('underline');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    error, isHistoryPanelOpen, isToneDropdownOpen, 
    isChatPanelOpen, text, selection, handleCorrectText, handleFormatText
  ]);


  const handleApplyHistory = (item: InteractionHistoryItem) => {
    setText(item.corrected);
    setIsHistoryPanelOpen(false);
  };
  
  const handleClearHistory = () => {
    setHistory([]);
  };


  return (
    <div className="h-screen w-screen bg-transparent text-gray-900 dark:text-gray-100 flex flex-col p-2 sm:p-4 gap-4 font-sans overflow-hidden">
        
        <header className="flex justify-between items-center p-3 sm:p-4 rounded-2xl shadow-lg bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/30 shrink-0">
            <div className="flex items-center gap-3">
              <LogoIcon />
              <h1 className="text-xl sm:text-2xl font-bold">Trovvin AI Keyboard</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsChatPanelOpen(!isChatPanelOpen)}
                className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors hidden lg:flex"
                aria-label={isChatPanelOpen ? "Close Chat Panel" : "Open Chat Panel"}
                aria-controls="chat-panel"
                aria-expanded={isChatPanelOpen}
              >
                {isChatPanelOpen ? <CloseIcon /> : <ChatIcon />}
              </button>
              <button
                onClick={() => setIsHistoryPanelOpen(true)}
                className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
                aria-label="View history"
              >
                <HistoryIcon />
              </button>
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
        </header>

        <main className="flex-grow flex lg:flex-row gap-4 overflow-hidden">
            <div className={`w-full flex-shrink transition-all duration-300 ${isChatPanelOpen ? 'lg:w-2/3' : 'lg:w-full'} flex flex-col gap-4 rounded-2xl shadow-lg bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/30 p-4`}>
                <Toolbar
                  onCorrect={handleCorrectText}
                  onEnhance={handleEnhanceText}
                  onFormat={handleFormatText}
                  loading={loading}
                  hasText={!!text.trim()}
                  hasSelection={!!selection}
                  isToneDropdownOpen={isToneDropdownOpen}
                  setIsToneDropdownOpen={setIsToneDropdownOpen}
                />
                <TextEditor
                  ref={editorRef}
                  value={text}
                  onChange={setText}
                  onSelectionChange={setSelection}
                />
            </div>

            <div
              id="chat-panel"
              className={`
                w-full max-w-md flex flex-col bg-white/20 dark:bg-black/30 backdrop-blur-xl border-white/30 overflow-hidden
                fixed top-0 right-0 h-full z-40 transform transition-transform duration-300 ease-in-out
                ${isChatPanelOpen ? 'translate-x-0' : 'translate-x-full'}
                lg:relative lg:w-1/3 lg:max-w-none lg:h-auto lg:transform-none lg:transition-none lg:rounded-2xl lg:shadow-lg lg:border
                ${isChatPanelOpen ? 'lg:flex' : 'lg:hidden'}
              `}
              aria-hidden={!isChatPanelOpen}
            >
                <ChatPanel 
                  loadingState={loading} 
                  setLoadingState={setLoading} 
                  onClose={() => setIsChatPanelOpen(false)} 
                />
            </div>
        </main>
        
        {isChatPanelOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setIsChatPanelOpen(false)}
            aria-hidden="true"
          ></div>
        )}

        <button
          onClick={() => setIsChatPanelOpen(!isChatPanelOpen)}
          className="fixed bottom-4 right-4 z-50 flex items-center justify-center h-14 w-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 lg:hidden"
          aria-label={isChatPanelOpen ? "Close Chat Panel" : "Open Chat Panel"}
          aria-controls="chat-panel"
          aria-expanded={isChatPanelOpen}
        >
          {isChatPanelOpen ? <CloseIcon /> : <ChatIcon />}
        </button>

        <Modal isOpen={isHistoryPanelOpen} onClose={() => setIsHistoryPanelOpen(false)} title="Interaction History">
          <HistoryPanel 
            history={history} 
            onApply={handleApplyHistory} 
            onClear={handleClearHistory} 
          />
        </Modal>

        <Modal isOpen={!!error} onClose={() => setError(null)} title="An Error Occurred">
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
        </Modal>
    </div>
  );
};

export default App;