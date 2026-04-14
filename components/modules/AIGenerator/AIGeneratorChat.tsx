import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

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
      content: 'Welcome to AI NFT Generator! 🎨\n\nDescribe the NFT you want to create. Be as creative as possible with details about style, colors, elements, and mood.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const response = await fetch('/api/generate-nft-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate images');

      const data = await response.json();

      if (data.success) {
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
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `Oops! Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-lg border border-gray-700 overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
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
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                message.type === 'user'
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  : 'bg-gradient-to-br from-pink-500 to-rose-600'
              )}
            >
              {message.type === 'user' ? '👤' : '🤖'}
            </div>

            {/* Message Content */}
            <div
              className={clsx(
                'flex-1 max-w-2xl',
                message.type === 'user' && 'text-right'
              )}
            >
              <div
                className={clsx(
                  'inline-block px-4 py-3 rounded-lg',
                  message.type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                )}
              >
                <p className="whitespace-pre-wrap text-sm break-words">
                  {message.content}
                </p>
              </div>

              {/* Generated Images */}
              {message.images && message.images.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {message.images.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative group overflow-hidden rounded-lg border border-gray-600 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20"
                    >
                      <img
                        src={image}
                        alt={`Generated NFT ${idx + 1}`}
                        className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <button
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                          onClick={() => downloadImage(image, `nft-${idx + 1}.png`)}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-sm font-bold">
              🤖
            </div>
            <div className="flex-1 max-w-2xl">
              <div className="inline-block px-4 py-3 rounded-lg bg-gray-700">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce-delay-100" />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce-delay-200" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-700 p-4 bg-gray-900/90 backdrop-blur">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerateImages(input)}
            placeholder="Describe your NFT idea... (e.g., 'A cyberpunk dragon with neon wings')"
            disabled={isLoading}
            className={clsx(
              'flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500',
              'focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
              'transition-all duration-200',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          />
          <button
            onClick={() => handleGenerateImages(input)}
            disabled={isLoading || !input.trim()}
            className={clsx(
              'px-6 py-3 rounded-lg font-medium transition-all duration-200',
              'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
              'text-white shadow-lg hover:shadow-indigo-500/50',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
            )}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: More detailed descriptions produce better NFT designs
        </p>
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
