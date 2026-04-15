# Cloudflare Workers AI NFT Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prefer Cloudflare Workers AI for non-Freepik NFT image generation while keeping Replicate, Hugging Face, and placeholder fallbacks intact.

**Architecture:** Add a Cloudflare-first helper in the existing API route and keep the current provider chain behind it. Update the narrow regression script so the new provider order is verified without changing the route contract.

**Tech Stack:** Next.js API route, TypeScript, plain Node regression script, Cloudflare Workers AI REST API

---

### Task 1: Add regression coverage for Cloudflare-first behavior

**Files:**
- Modify: `scripts/test-generate-nft-image.js`

- [ ] **Step 1: Write the failing test**

Add a Cloudflare success test and a Cloudflare-to-Replicate fallback test in `scripts/test-generate-nft-image.js`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node -r ts-node/register/transpile-only scripts/test-generate-nft-image.js`
Expected: FAIL because the route does not yet support provider `cloudflare`

- [ ] **Step 3: Write minimal implementation**

Implement Cloudflare-first generation in `pages/api/generate-nft-image.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node -r ts-node/register/transpile-only scripts/test-generate-nft-image.js`
Expected: PASS

- [ ] **Step 5: Verify touched files**

Run: `./node_modules/.bin/eslint scripts/test-generate-nft-image.js`
Expected: PASS

### Task 2: Wire Cloudflare into the provider chain

**Files:**
- Modify: `pages/api/generate-nft-image.ts`
- Modify: `types/ai-chat.ts`

- [ ] **Step 1: Add provider type**

Extend `ImageGenerationProvider` with `cloudflare`.

- [ ] **Step 2: Add Cloudflare helper**

Create `generateWithCloudflare()` using `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and optional `CLOUDFLARE_IMAGE_MODEL`.

- [ ] **Step 3: Make Cloudflare the preferred fast-mode provider**

Change the non-Freepik path to `Cloudflare -> Replicate -> Hugging Face -> placeholder`.

- [ ] **Step 4: Run regression test**

Run: `node -r ts-node/register/transpile-only scripts/test-generate-nft-image.js`
Expected: PASS

- [ ] **Step 5: Record verification**

Capture the exact commands and outcomes for the final handoff.
