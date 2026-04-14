import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { ArrowUp } from 'phosphor-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: Date;
  isLoading?: boolean;
}

interface AIGeneratorChatProps {
  onGenerateImages?: (prompt: string) => void;
}

export const AIGeneratorChat: React.FC<AIGeneratorChatProps> = ({
  onGenerateImages
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Welcome to AI NFT Creator! 🎨\n\nDescribe the NFT you want to create in detail. Include style, elements, colors, mood, and any artistic references.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGenerateImages = async (prompt: string) => {
    if (!prompt.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('[AIGeneratorChat] Sending prompt:', prompt);
      const response = await fetch('/api/generate-nft-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[AIGeneratorChat] API error:', response.status, data);
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.success) {
        console.log('[AIGeneratorChat] Images generated successfully, count:', data.images?.length);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '✨ Here are 3 AI-generated NFT designs based on your prompt:',
          images: data.images,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        onGenerateImages?.(prompt);
      } else {
        console.error('[AIGeneratorChat] Generation failed:', data.error);
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (error) {
      console.error('[AIGeneratorChat] Error caught:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `Oops! Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-gray-950 via-black to-gray-950 rounded-2xl border border-gray-800/50 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-800/30 bg-gradient-to-r from-gray-900/50 to-gray-950/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">AI NFT Creator</h2>
            <p className="text-xs text-gray-400 mt-1">Powered by Stable Diffusion</p>
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-400">Ready</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700">
        {messages.map((message, idx) => (
          <div
            key={message.id}
            className={clsx(
              'flex gap-4 animate-fadeIn',
              message.type === 'user' && 'flex-row-reverse'
            )}
          >
            {/* Avatar */}
            <div
              className={clsx(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-none',
                message.type === 'user'
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                  : 'bg-gradient-to-br from-purple-600 to-pink-600'
              )}
            >
              {message.type === 'user' ? '👤' : '✨'}
            </div>

            {/* Message Content */}
            <div
              className={clsx(
                'flex-1 max-w-3xl',
                message.type === 'user' && 'text-right'
              )}
            >
              {/* Text Message */}
              <div
                className={clsx(
                  'inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed break-words',
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                    : 'bg-gray-800/80 text-gray-100 rounded-bl-none border border-gray-700/50'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {/* Generated Images Grid */}
              {message.images && message.images.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {message.images.map((image, imageIdx) => (
                    <div
                      key={imageIdx}
                      className="group relative overflow-hidden rounded-xl border border-gray-700/50 hover:border-cyan-500/50 bg-gray-800/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20"
                    >
                      <img
                        src={image}
                        alt={`Generated NFT ${imageIdx + 1}`}
                        className="w-full h-48 sm:h-56 object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                        <div className="flex gap-2 w-full px-3">
                          <button
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105"
                            onClick={() => downloadImage(image, `nft-${imageIdx + 1}.png`)}
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading State */}
        {isLoading && (
          <div className="flex gap-4 animate-fadeIn">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold flex-none">
              ✨
            </div>
            <div className="flex-1 max-w-3xl">
              <div className="inline-block px-4 py-3 rounded-2xl bg-gray-800/80 border border-gray-700/50">
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-gray-400 text-xs ml-2">Generating your NFTs...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-800/50 p-4 bg-gradient-to-t from-gray-950 to-gray-900/80 backdrop-blur-md">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerateImages(input);
                }
              }}
              placeholder="Describe your NFT idea... (Shift+Enter for new line)"
              disabled={isLoading}
              className={clsx(
                'w-full px-4 py-3 pr-12 rounded-full bg-gray-800/60 border border-gray-700/50 text-white placeholder-gray-500',
                'focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30',
                'transition-all duration-200 backdrop-blur-sm',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            />
            <button
              onClick={() => handleGenerateImages(input)}
              disabled={isLoading || !input.trim()}
              className={clsx(
                'absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                !isLoading && input.trim()
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white hover:scale-110'
                  : 'bg-gray-700/50 text-gray-400'
              )}
            >
              <ArrowUp size={20} weight="bold" />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            💡 Be specific about style, mood, and elements for better results
          </p>
          <p className="text-xs text-gray-600">
            Press Enter or click arrow to generate
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to download images
function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
