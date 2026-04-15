/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');

const {
  generateNftImages,
} = require('../pages/api/generate-nft-image.ts');

const PROVIDER_ENV_KEYS = [
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_IMAGE_MODEL',
];

const originalFetch = global.fetch;
const originalEnv = {};

for (const key of PROVIDER_ENV_KEYS) {
  originalEnv[key] = process.env[key];
}

function resetProviderEnv() {
  for (const key of PROVIDER_ENV_KEYS) {
    delete process.env[key];
  }
}

async function testCloudflareGeneratesImages() {
  resetProviderEnv();
  process.env.CLOUDFLARE_API_TOKEN = 'cloudflare-test-token';
  process.env.CLOUDFLARE_ACCOUNT_ID = 'cloudflare-account-id';

  global.fetch = async (input, init = {}) => {
    const url = String(input);

    assert.strictEqual(
      url,
      'https://api.cloudflare.com/client/v4/accounts/cloudflare-account-id/ai/run/@cf/black-forest-labs/flux-1-schnell',
    );
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
  };

  const result = await generateNftImages('robot tiger nft');

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.provider, 'cloudflare');
  assert.strictEqual(result.images.length, 1);
  assert.ok(result.images[0].startsWith('data:image/png;base64,'));
}

async function testCloudflareFailureReturnsFailure() {
  resetProviderEnv();
  process.env.CLOUDFLARE_API_TOKEN = 'cloudflare-test-token';
  process.env.CLOUDFLARE_ACCOUNT_ID = 'cloudflare-account-id';

  global.fetch = async (input) => {
    const url = String(input);

    assert.strictEqual(
      url,
      'https://api.cloudflare.com/client/v4/accounts/cloudflare-account-id/ai/run/@cf/black-forest-labs/flux-1-schnell',
    );

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
  };

  const result = await generateNftImages('robot tiger nft');

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, 'Failed to generate images with Cloudflare');
}

async function testMissingCloudflareConfigReturnsFailure() {
  resetProviderEnv();

  global.fetch = async (input) => {
    throw new Error(`Unexpected fetch URL: ${String(input)}`);
  };

  const result = await generateNftImages('robot tiger nft');

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, 'Cloudflare image generation is not configured');
}

async function main() {
  try {
    await testCloudflareGeneratesImages();
    await testCloudflareFailureReturnsFailure();
    await testMissingCloudflareConfigReturnsFailure();
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
