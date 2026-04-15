/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');

const {
  generateNftImages,
} = require('../pages/api/generate-nft-image.ts');

const HUGGING_FACE_ENV_KEYS = [
  'HUGGINGFACE_API_KEY',
  'HF_API_TOKEN',
  'HF_API_KEY',
  'HF_TOKEN',
  'HF_KEY',
];

const REPLICATE_ENV_KEYS = [
  'REPLICATE_API_TOKEN',
  'REPLICATE_API_KEY',
  'REPLICATE_MODEL',
];

const CLOUDFLARE_ENV_KEYS = [
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_IMAGE_MODEL',
];

const originalFetch = global.fetch;
const originalEnv = {};

for (const key of [
  ...HUGGING_FACE_ENV_KEYS,
  ...REPLICATE_ENV_KEYS,
  ...CLOUDFLARE_ENV_KEYS,
]) {
  originalEnv[key] = process.env[key];
}

function resetProviderEnv() {
  for (const key of [
    ...HUGGING_FACE_ENV_KEYS,
    ...REPLICATE_ENV_KEYS,
    ...CLOUDFLARE_ENV_KEYS,
  ]) {
    delete process.env[key];
  }
}

async function testCloudflareGeneratesImages() {
  resetProviderEnv();
  process.env.CLOUDFLARE_API_TOKEN = 'cloudflare-test-token';
  process.env.CLOUDFLARE_ACCOUNT_ID = 'cloudflare-account-id';

  global.fetch = async (input, init = {}) => {
    const url = String(input);

    if (
      url ===
      'https://api.cloudflare.com/client/v4/accounts/cloudflare-account-id/ai/run/@cf/black-forest-labs/flux-1-schnell'
    ) {
      assert.strictEqual(init.method, 'POST');
      assert.strictEqual(
        init.headers.Authorization,
        'Bearer cloudflare-test-token',
      );

      const body = JSON.parse(init.body);
      assert.ok(
        body.prompt.includes('robot tiger nft'),
        'Cloudflare prompt should include the original user prompt',
      );

      return new Response(
        JSON.stringify({
          success: true,
          result: {
            image: 'Y2xvdWRmbGFyZS1pbWFnZS1iaW5hcnk=',
          },
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    throw new Error(`Unexpected fetch URL: ${url}`);
  };

  const result = await generateNftImages('robot tiger nft', false);

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.provider, 'cloudflare');
  assert.strictEqual(result.images.length, 1);
  assert.ok(result.images[0].startsWith('data:image/png;base64,'));
}

async function testCloudflareFallsBackToReplicate() {
  resetProviderEnv();
  process.env.CLOUDFLARE_API_TOKEN = 'cloudflare-test-token';
  process.env.CLOUDFLARE_ACCOUNT_ID = 'cloudflare-account-id';
  process.env.REPLICATE_API_TOKEN = 'replicate-test-token';

  global.fetch = async (input, init = {}) => {
    const url = String(input);

    if (
      url ===
      'https://api.cloudflare.com/client/v4/accounts/cloudflare-account-id/ai/run/@cf/black-forest-labs/flux-1-schnell'
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: [{ message: 'cloudflare failed' }],
        }),
        {
          status: 500,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    if (
      url ===
      'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions'
    ) {
      assert.strictEqual(init.headers.Authorization, 'Bearer replicate-test-token');

      return new Response(
        JSON.stringify({
          status: 'succeeded',
          output: ['https://example.com/generated.png'],
        }),
        {
          status: 201,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    if (url === 'https://example.com/generated.png') {
      return new Response(Buffer.from('png-image-binary'), {
        status: 200,
        headers: { 'content-type': 'image/png' },
      });
    }

    throw new Error(`Unexpected fetch URL: ${url}`);
  };

  const result = await generateNftImages('robot tiger nft', false);

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.provider, 'replicate');
  assert.strictEqual(result.images.length, 1);
  assert.ok(result.images[0].startsWith('data:image/png;base64,'));
}

async function testReplicateGeneratesImages() {
  resetProviderEnv();
  process.env.REPLICATE_API_TOKEN = 'replicate-test-token';

  global.fetch = async (input, init = {}) => {
    const url = String(input);

    if (
      url ===
      'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions'
    ) {
      assert.strictEqual(init.method, 'POST');
      assert.strictEqual(
        init.headers.Authorization,
        'Bearer replicate-test-token',
      );
      assert.strictEqual(init.headers.Prefer, 'wait');

      const body = JSON.parse(init.body);
      assert.ok(
        body.input.prompt.includes('robot tiger nft'),
        'Replicate prompt should include the original user prompt',
      );

      return new Response(
        JSON.stringify({
          status: 'succeeded',
          output: ['https://example.com/generated.png'],
        }),
        {
          status: 201,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    if (url === 'https://example.com/generated.png') {
      return new Response(Buffer.from('png-image-binary'), {
        status: 200,
        headers: { 'content-type': 'image/png' },
      });
    }

    throw new Error(`Unexpected fetch URL: ${url}`);
  };

  const result = await generateNftImages('robot tiger nft', false);

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.provider, 'replicate');
  assert.strictEqual(result.images.length, 1);
  assert.ok(result.images[0].startsWith('data:image/png;base64,'));
}

async function testReplicateFallsBackToPlaceholderWithoutOtherProviders() {
  resetProviderEnv();
  process.env.REPLICATE_API_TOKEN = 'replicate-test-token';

  global.fetch = async (input) => {
    const url = String(input);

    if (
      url ===
      'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions'
    ) {
      return new Response(
        JSON.stringify({
          error: 'prediction failed',
          status: 'failed',
        }),
        {
          status: 500,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    throw new Error(`Unexpected fetch URL: ${url}`);
  };

  const result = await generateNftImages('robot tiger nft', false);

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.provider, 'placeholder');
  assert.strictEqual(result.images.length, 1);
  assert.ok(result.images[0].startsWith('data:image/svg+xml;base64,'));
}

async function main() {
  try {
    await testCloudflareGeneratesImages();
    await testCloudflareFallsBackToReplicate();
    await testReplicateGeneratesImages();
    await testReplicateFallsBackToPlaceholderWithoutOtherProviders();
  } finally {
    resetProviderEnv();
    for (const [key, value] of Object.entries(originalEnv)) {
      if (typeof value === 'string') {
        process.env[key] = value;
      }
    }
    global.fetch = originalFetch;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
