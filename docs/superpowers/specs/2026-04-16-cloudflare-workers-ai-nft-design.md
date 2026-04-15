# Cloudflare Workers AI NFT Generation Design

## Goal

Prefer Cloudflare Workers AI for the non-Freepik NFT image generation path while keeping Replicate, Hugging Face, and placeholder fallbacks intact.

## Scope

- Keep `useFreepik` behavior unchanged.
- For non-Freepik generation, try providers in this order:
  1. Cloudflare Workers AI
  2. Replicate
  3. Hugging Face
  4. Placeholder image
- Preserve the existing API response shape and UI contract.

## Design

Add a `generateWithCloudflare()` helper in `pages/api/generate-nft-image.ts` that calls the Workers AI REST API:

- Endpoint: `POST https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{MODEL}`
- Auth: `Authorization: Bearer {CLOUDFLARE_API_TOKEN}`
- Default model: `@cf/black-forest-labs/flux-1-schnell`

The helper should:

- Read `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and optional `CLOUDFLARE_IMAGE_MODEL`
- Send the prompt with a few conservative generation parameters
- Read `result.image` from the JSON response
- Return a `data:image/...;base64,...` URL and provider `cloudflare`
- Fall back to Replicate on missing config or API failure

## Testing

Extend the existing targeted script test to cover:

- Cloudflare success returning provider `cloudflare`
- Cloudflare failure falling back to Replicate

## Notes

- Do not remove existing providers.
- Do not change frontend behavior beyond the provider label.
- Do not commit as part of this task.
