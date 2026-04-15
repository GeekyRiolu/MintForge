import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import clsx from 'clsx';
import { ArrowUp, Check, Warning } from 'phosphor-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

import { useIPFSUpload } from 'hooks/useIPFSUpload';
import { useNFTMint } from 'hooks/useNFTMint';
import type { AIChatMessage, GeneratedImagesData } from 'types/ai-chat';

const INITIAL_MESSAGES: AIChatMessage[] = [
  {
    id: 'welcome-message',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: 'Welcome to AI NFT Creator.\n\nDescribe the NFT you want to create in detail. Include style, elements, colors, mood, and any artistic references. I will generate 3 visual directions for you with the same image API you already use.',
      },
    ],
  },
];

interface AIGeneratorChatProps {
  onGenerateImages?: (prompt: string) => void;
}

export const AIGeneratorChat: React.FC<AIGeneratorChatProps> = ({
  onGenerateImages,
}) => {
  const { address, isConnected } = useAccount();
  const { upload: uploadToIPFS, isLoading: isUploading } = useIPFSUpload();
  const [input, setInput] = useState('');
  const [useFreepik, setUseFreepik] = useState(false);
  const [mintingStates, setMintingStates] = useState<Record<string, 'idle' | 'uploading' | 'minting' | 'success' | 'error'>>({});
  const [mintErrors, setMintErrors] = useState<Record<string, string>>({});
  const handledImageMessagesRef = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { error, messages, sendMessage, status } = useChat<AIChatMessage>({
    messages: INITIAL_MESSAGES,
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    for (const message of messages) {
      const generatedImages = getGeneratedImages(message);
      if (
        !generatedImages ||
        handledImageMessagesRef.current.has(message.id)
      ) {
        continue;
      }

      handledImageMessagesRef.current.add(message.id);
      onGenerateImages?.(generatedImages.prompt);
    }
  }, [messages, onGenerateImages]);

  async function handleSendMessage() {
    const prompt = input.trim();
    if (!prompt || isLoading) {
      return;
    }

    setInput('');

    try {
      await sendMessage(
        {
          text: prompt,
        },
        {
          body: {
            useFreepik,
          },
        },
      );
    } catch (_sendError) {
      setInput(prompt);
    } finally {
      inputRef.current?.focus();
    }
  }

  async function handleMintImage(
    imageUrl: string,
    prompt: string,
    messageId: string,
    imageIndex: number,
  ) {
    const mintKey = `${messageId}-${imageIndex}`;

    if (!isConnected || !address) {
      setMintErrors(prev => ({
        ...prev,
        [mintKey]: 'Please connect your wallet first',
      }));
      return;
    }

    try {
      setMintingStates(prev => ({ ...prev, [mintKey]: 'uploading' }));
      setMintErrors(prev => ({ ...prev, [mintKey]: '' }));

      // Upload image to IPFS
      const uploadResult = await uploadToIPFS(
        imageUrl,
        `ai-nft-${Date.now()}-${imageIndex}.png`,
      );

      if (!uploadResult.success || !uploadResult.ipfsUrl) {
        throw new Error(uploadResult.error || 'Failed to upload to IPFS');
      }

      setMintingStates(prev => ({ ...prev, [mintKey]: 'minting' }));

      // TODO: Implement actual minting once contract address is configured
      // For now, show success after simulating upload
      console.log('Image uploaded to IPFS:', uploadResult.ipfsUrl);
      console.log('Ready to mint with metadata:', {
        imageUri: uploadResult.ipfsUrl,
        prompt,
        address,
      });

      setMintingStates(prev => ({ ...prev, [mintKey]: 'success' }));

      // Reset success state after 2 seconds
      setTimeout(() => {
        setMintingStates(prev => ({ ...prev, [mintKey]: 'idle' }));
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Minting failed';
      console.error('Mint error:', error);

      setMintingStates(prev => ({ ...prev, [mintKey]: 'error' }));
      setMintErrors(prev => ({ ...prev, [mintKey]: errorMessage }));

      // Reset error state after 5 seconds
      setTimeout(() => {
        setMintingStates(prev => ({ ...prev, [mintKey]: 'idle' }));
        setMintErrors(prev => ({ ...prev, [mintKey]: '' }));
      }, 5000);
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-[#f7f0de] shadow-[0_24px_80px_rgba(0,0,0,0.16)]">
      <div className="relative overflow-hidden border-b border-black/10 bg-white px-6 py-5">
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#f9d54c] blur-3xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex rounded-full border border-black/10 bg-[#fff3c2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black">
              Mintly AI Studio
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-black">
              Create NFT with AI
            </h2>
            <p className="mt-1 max-w-xl text-sm text-black/65">
              Vercel AI chat controls the conversation flow, while your current
              image generation API still creates the artwork.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setUseFreepik(!useFreepik)}
            disabled={isLoading}
            className={clsx(
              'relative shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition',
              useFreepik
                ? 'border-black bg-black text-white'
                : 'border-black/10 bg-white text-black hover:border-black/25',
              isLoading && 'cursor-not-allowed opacity-60',
            )}
            title={
              useFreepik
                ? 'Using Freepik Mystic for slower but more realistic results'
                : 'Using Stable Diffusion for faster results'
            }
          >
            {useFreepik ? 'Mystic Mode' : 'Fast Mode'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
        <div className="space-y-4">
          {messages.map((message) => {
            const generatedImages = getGeneratedImages(message);
            const text = getMessageText(message);

            return (
              <div
                key={message.id}
                className={clsx(
                  'flex gap-4',
                  message.role === 'user' && 'justify-end',
                )}
              >
                {message.role !== 'user' && (
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black text-sm font-semibold text-white">
                    AI
                  </div>
                )}

                <div
                  className={clsx(
                    'max-w-3xl',
                    message.role === 'user' ? 'items-end' : 'items-start',
                  )}
                >
                  {!!text && (
                    <div
                      className={clsx(
                        'rounded-[1.75rem] px-5 py-4 text-sm leading-7 shadow-sm',
                        message.role === 'user'
                          ? 'rounded-br-md bg-black text-white'
                          : 'rounded-bl-md border border-black/10 bg-white text-black',
                      )}
                    >
                      <p className="whitespace-pre-wrap">{text}</p>
                    </div>
                  )}

                  {generatedImages && (
                    <div className="mt-4">
                      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/50">
                        <span>Generated Concepts</span>
                        <span className="h-1 w-1 rounded-full bg-black/20" />
                        <span>{generatedImages.provider}</span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {generatedImages.images.map((image, imageIndex) => {
                          const mintKey = `${message.id}-${imageIndex}`;
                          const mintState = mintingStates[mintKey] || 'idle';
                          const errorMessage = mintErrors[mintKey];

                          return (
                            <div
                              key={`${message.id}-${imageIndex}`}
                              className="group overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                              <div className="overflow-hidden">
                                <img
                                  src={image}
                                  alt={`Generated NFT ${imageIndex + 1}`}
                                  className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                />
                              </div>
                              <div className="flex flex-col gap-3 border-t border-black/5 px-4 py-3">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-xs uppercase tracking-[0.16em] text-black/45">
                                    Variation {imageIndex + 1}
                                  </p>
                                  <button
                                    type="button"
                                    className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-black transition hover:border-black/25 hover:bg-[#fff3c2]"
                                    onClick={() =>
                                      downloadImage(
                                        image,
                                        `nft-${imageIndex + 1}.png`,
                                      )
                                    }
                                  >
                                    Download
                                  </button>
                                </div>

                                {/* Mint Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMintImage(
                                      image,
                                      generatedImages.prompt,
                                      message.id,
                                      imageIndex,
                                    )
                                  }
                                  disabled={
                                    !isConnected ||
                                    isUploading ||
                                    mintState === 'uploading' ||
                                    mintState === 'minting'
                                  }
                                  className={clsx(
                                    'w-full rounded-full py-2 text-xs font-semibold uppercase tracking-[0.16em] transition',
                                    mintState === 'success'
                                      ? 'border border-green-400/50 bg-green-50 text-green-700'
                                      : mintState === 'error'
                                        ? 'border border-red-400/50 bg-red-50 text-red-700'
                                        : isConnected
                                          ? 'border border-[#f9d54c] bg-[#f9d54c] text-black hover:bg-[#f4b400] disabled:opacity-60'
                                          : 'border border-black/10 bg-white text-black/35',
                                  )}
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    {mintState === 'uploading' ||
                                    mintState === 'minting' ? (
                                      <>
                                        <span className="h-1.5 w-1.5 animate-spin rounded-full border border-current border-t-transparent" />
                                        {mintState === 'uploading'
                                          ? 'Uploading...'
                                          : 'Minting...'}
                                      </>
                                    ) : mintState === 'success' ? (
                                      <>
                                        <Check size={14} weight="bold" />
                                        Minted!
                                      </>
                                    ) : mintState === 'error' ? (
                                      <>
                                        <Warning size={14} weight="bold" />
                                        Error
                                      </>
                                    ) : isConnected ? (
                                      'Mint NFT'
                                    ) : (
                                      'Connect Wallet'
                                    )}
                                  </div>
                                </button>

                                {/* Error Message */}
                                {errorMessage && (
                                  <p className="text-[10px] text-red-600">
                                    {errorMessage}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f9d54c] text-sm font-semibold text-black">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black text-sm font-semibold text-white">
                AI
              </div>
              <div className="rounded-[1.75rem] rounded-bl-md border border-black/10 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#f4b400]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#f4b400] [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#f4b400] [animation-delay:300ms]" />
                  <span className="ml-2 text-xs uppercase tracking-[0.18em] text-black/45">
                    Generating
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-[1.5rem] border border-[#f4b400]/30 bg-[#fff6da] px-4 py-3 text-sm text-black/75">
              {error.message}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-black/10 bg-white px-5 py-4 sm:px-6">
        <div className="rounded-[1.75rem] border border-black/10 bg-[#fcf7ea] p-2">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void handleSendMessage();
                }
              }}
              placeholder="Describe your NFT idea in detail..."
              disabled={isLoading}
              className="max-h-40 min-h-[56px] flex-1 resize-none border-0 bg-transparent px-4 py-3 text-sm leading-6 text-black placeholder:text-black/35 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                void handleSendMessage();
              }}
              disabled={isLoading || !input.trim()}
              className={clsx(
                'mb-1 mr-1 flex h-11 w-11 items-center justify-center rounded-full transition',
                input.trim() && !isLoading
                  ? 'bg-black text-white hover:bg-[#2c2c2c]'
                  : 'bg-black/10 text-black/35',
              )}
            >
              <ArrowUp size={18} weight="bold" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 text-[11px] uppercase tracking-[0.16em] text-black/40 sm:flex-row sm:items-center sm:justify-between">
          <p>Tip: mention composition, lighting, texture, and mood.</p>
          <p>Press Enter to generate, Shift+Enter for a new line.</p>
        </div>
      </div>
    </div>
  );
};

function getMessageText(message: AIChatMessage): string {
  return message.parts
    .filter((part): part is Extract<AIChatMessage['parts'][number], { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

function getGeneratedImages(
  message: AIChatMessage,
): GeneratedImagesData | null {
  const part = message.parts.find(
    (
      candidate,
    ): candidate is Extract<
      AIChatMessage['parts'][number],
      { type: 'data-generatedImages' }
    > => candidate.type === 'data-generatedImages',
  );

  return part?.data ?? null;
}

function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
