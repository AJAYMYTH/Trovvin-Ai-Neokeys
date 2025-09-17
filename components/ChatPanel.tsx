import React, { useState, useRef, useEffect } from 'react';
import { Message, LoadingState } from '../types';
import { getChatStream } from '../services/geminiService';
import { Loader } from './Loader';
import { CloseIcon } from './icons/CloseIcon';

interface ChatPanelProps {
    loadingState: LoadingState;
    setLoadingState: React.Dispatch<React.SetStateAction<LoadingState>>;
    onClose?: () => void; // Optional: A function to call when the panel should be closed (for mobile view)
}

const ChatPanel: React.FC<ChatPanelProps> = ({ loadingState, setLoadingState, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', parts: [{ text: "Hello! I'm Myth AI. How can I help you with your writing today?" }] }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loadingState.chat) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoadingState(prev => ({ ...prev, chat: true }));

    try {
      const stream = await getChatStream(messages, input);
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', parts: [{ text: modelResponse }] };
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred. Please try again.";
      setMessages(prev => [
        ...prev,
        { role: 'model', parts: [{ text: errorMessage }] }
      ]);
    } finally {
        setLoadingState(prev => ({ ...prev, chat: false }));
    }
  };

  return (
    <div className="bg-transparent h-full flex flex-col text-gray-900 dark:text-gray-100">
      <header className="flex justify-between items-center p-4 border-b border-white/20 shrink-0">
        <h2 className="text-xl font-bold">Myth AI</h2>
        {/* Render a close button only if the onClose prop is provided. It's hidden on large screens. */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-500/20 lg:hidden"
            aria-label="Close Chat Panel"
          >
            <CloseIcon />
          </button>
        )}
      </header>
      <div className="flex-grow overflow-y-auto mb-4 p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-500/50 dark:bg-gray-900/50'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.parts.map(p => p.text).join('')}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2 p-4 border-t border-white/20 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Myth AI..."
          className="flex-grow p-2 border border-white/20 rounded-md bg-black/20 focus:ring-2 focus:ring-blue-500"
          disabled={loadingState.chat}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
          disabled={loadingState.chat || !input.trim()}
        >
          {loadingState.chat ? <Loader /> : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;