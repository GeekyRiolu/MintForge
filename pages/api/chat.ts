import { createUIMessageStream, pipeUIMessageStreamToResponse } from 'ai';
import type { UIMessage } from 'ai';
import type { NextApiRequest, NextApiResponse } from 'next';

import { checkFreepikTask } from './check-freepik-task';
import { generateNftImages } from './generate-nft-image';

import type { AIChatMessage, ImageGenerationProvider } from 'types/ai-chat';

type ChatRequestBody = {
  messages?: UIMessage[];
  useFreepik?: boolean;
};

const FREEPIK_POLL_INTERVAL_MS = 2000;
const FREEPIK_MAX_POLLS = 30;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages = [], useFreepik = false } = (req.body ?? {}) as ChatRequestBody;
  const prompt = getLatestUserPrompt(messages);

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const stream = createUIMessageStream<AIChatMessage>({
    originalMessages: messages as AIChatMessage[],
    execute: async ({ writer }) => {
      const textId = 'nft-generator-response';
      const intro = useFreepik
        ? 'Generating your NFT concepts with Freepik Mystic. This can take up to a minute.'
        : 'Generating three NFT concepts for you now.';

      writer.write({
        type: 'text-start',
        id: textId,
      });
      writer.write({
        type: 'text-delta',
        id: textId,
        delta: intro,
      });

      try {
        const result = await resolveImages(prompt, useFreepik);

        writer.write({
          type: 'text-delta',
          id: textId,
          delta: `\n\nHere are 3 AI-generated NFT designs based on your prompt.`,
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
  useFreepik: boolean,
): Promise<{ images: string[]; provider: ImageGenerationProvider }> {
  const result = await generateNftImages(prompt, useFreepik);

  if (!result.success) {
    throw new Error(result.error);
  }

  if ('taskId' in result) {
    return pollForFreepikImages(result.taskId, prompt);
  }

  return {
    images: result.images,
    provider: result.provider,
  };
}

async function pollForFreepikImages(
  taskId: string,
  prompt: string,
): Promise<{ images: string[]; provider: ImageGenerationProvider }> {
  for (let attempt = 0; attempt < FREEPIK_MAX_POLLS; attempt += 1) {
    const result = await checkFreepikTask(taskId);

    if (result.success && result.images?.length) {
      return {
        images: result.images,
        provider: 'freepik',
      };
    }

    if (result.status === 'FAILED') {
      throw new Error(result.error ?? 'Image generation failed');
    }

    await sleep(FREEPIK_POLL_INTERVAL_MS);
  }

  throw new Error(
    `Image generation timed out for "${prompt}". Please try again.`,
  );
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
