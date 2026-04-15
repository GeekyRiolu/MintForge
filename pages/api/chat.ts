import { createUIMessageStream, pipeUIMessageStreamToResponse } from 'ai';
import type { UIMessage } from 'ai';
import type { NextApiRequest, NextApiResponse } from 'next';

import { generateNftImages } from './generate-nft-image';

import type { AIChatMessage, ImageGenerationProvider } from 'types/ai-chat';

type ChatRequestBody = {
  messages?: UIMessage[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages = [] } = (req.body ?? {}) as ChatRequestBody;
  const prompt = getLatestUserPrompt(messages);

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const stream = createUIMessageStream<AIChatMessage>({
    originalMessages: messages as AIChatMessage[],
    execute: async ({ writer }) => {
      const textId = 'nft-generator-response';

      writer.write({
        type: 'text-start',
        id: textId,
      });
      writer.write({
        type: 'text-delta',
        id: textId,
        delta: 'Generating your NFT design now.',
      });

      try {
        const result = await resolveImages(prompt);

        writer.write({
          type: 'text-delta',
          id: textId,
          delta: `\n\nHere is your AI-generated NFT design based on your prompt.`,
        });
        writer.write({
          type: 'text-end',
          id: textId,
        });
        writer.write({
          type: 'data-generatedImages',
          data: {
            images: result.images,
            prompt,
            provider: result.provider,
          },
        });
      } catch (error) {
        writer.write({
          type: 'text-delta',
          id: textId,
          delta: `\n\nOops! Something went wrong: ${getErrorMessage(error)}. Please try again.`,
        });
        writer.write({
          type: 'text-end',
          id: textId,
        });
      }
    },
    onError: getErrorMessage,
  });

  pipeUIMessageStreamToResponse({
    response: res,
    stream,
  });
}

async function resolveImages(
  prompt: string,
): Promise<{ images: string[]; provider: ImageGenerationProvider }> {
  const result = await generateNftImages(prompt);

  if (!result.success) {
    throw new Error(result.error);
  }

  return {
    images: result.images,
    provider: result.provider,
  };
}

function getLatestUserPrompt(messages: UIMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== 'user') {
      continue;
    }

    const prompt = message.parts
      .filter(isTextPart)
      .map((part) => part.text.trim())
      .filter(Boolean)
      .join('\n')
      .trim();

    if (prompt) {
      return prompt;
    }
  }

  return null;
}

function isTextPart(
  part: UIMessage['parts'][number],
): part is Extract<UIMessage['parts'][number], { type: 'text' }> {
  return part.type === 'text';
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
