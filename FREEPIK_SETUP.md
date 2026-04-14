# AI NFT Generator - Setup Guide

## Dual AI Integration

Your AI NFT Generator now supports **two powerful AI services**:

### 1. ⚡ Stable Diffusion (Fast, Free)
- **Speed**: 5-15 seconds per 3 images
- **Cost**: Free tier available
- **Quality**: Good
- **Setup**: Requires Hugging Face API key

### 2. ✨ Freepik Mystic (Ultra-Realistic, Commercial)
- **Speed**: 30-60 seconds per 3 images (async generation)
- **Cost**: Paid API
- **Quality**: Ultra-realistic (state-of-the-art)
- **Setup**: Requires Freepik API key
- **Features**: 4K resolution, multiple models (realism, fluid, zen, etc.)

---

## Setup Instructions

### Option A: Only Stable Diffusion (Recommended for Testing)

1. Get API key from [Hugging Face](https://huggingface.co/settings/tokens)
2. Add to `.env.local`:
   ```
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```
3. Restart dev server
4. Use the **⚡ SD** button in chat header

### Option B: Both Services (Maximum Flexibility)

1. **Hugging Face Setup** (same as above)
   ```
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```

2. **Freepik Setup**:
   - Go to [Freepik API Dashboard](https://www.freepik.com/api)
   - Create account and request API access
   - Get your API key
   - Add to `.env.local`:
     ```
     FREEPIK_API_KEY=your_freepik_key_here
     ```

3. Restart dev server
4. Toggle between **⚡ SD** and **✨ Mystic** buttons in chat

---

## How It Works

### Stable Diffusion Flow
```
User Input → API Request → Direct Image Generation (5-15s) → Display Images
```

### Freepik Mystic Flow
```
User Input → Create Task (async) → Poll Status Every 2s → Task Complete → Download Images → Display Images
```

---

## Features

### Stable Diffusion (⚡ SD)
- ✅ Instant generation
- ✅ No polling needed
- ✅ Good quality
- ✅ Free tier available
- ⏱️ Faster turnaround

### Freepik Mystic (✨ Mystic)
- ✅ Ultra-realistic images
- ✅ 4K resolution
- ✅ Multiple AI models
- ✅ Better for professional NFTs
- ⏱️ Takes longer (worth it!)

---

## API Endpoints

### POST `/api/generate-nft-image`
Generates images with selected AI service

**Request**:
```json
{
  "prompt": "your description here",
  "useFreepik": true  // false = Stable Diffusion
}
```

**Response**:
- Status 200 (Stable Diffusion): Immediate images
- Status 202 (Freepik): Task ID for polling

### GET `/api/check-freepik-task?taskId=...`
Polls Freepik task status

**Response**:
```json
{
  "success": true,
  "status": "COMPLETED",
  "images": ["data:image/png;base64,..."]
}
```

---

## Troubleshooting

### "API Key not configured"
- Check `.env.local` exists in project root
- Restart dev server after adding keys
- Verify key format (Hugging Face starts with `hf_`)

### "Still generating..." (Freepik)
- Normal! Freepik takes 30-60 seconds
- Polling happens every 2 seconds automatically
- Wait for it to complete

### Images not showing
- Check browser console for errors
- Verify API keys have correct permissions
- Try Stable Diffusion first to test

### "FAILED" status (Freepik)
- Your prompt may have violated content policy
- Try a different/simpler prompt
- Switch to Stable Diffusion

---

## Best Practices

### For Best Freepik Mystic Results
- Use detailed, specific prompts
- Include artistic style references
- Specify mood/lighting
- Use the "editorial_portraits" model for close-ups

### For Best Stable Diffusion Results
- Keep prompts concise but descriptive
- Avoid overly complex compositions
- Specify art style clearly

---

## Cost Estimation

### Hugging Face (Stable Diffusion)
- **Free tier**: ~20 API calls/month
- **Paid tier**: Variable pricing
- Per NFT (3 images): ~3 API calls

### Freepik (Mystic)
- **Free tier**: Limited credits
- **Paid tier**: Pay-per-generation model
- Check pricing at [Freepik API Pricing](https://www.freepik.com/api/pricing)

---

## Environment Variables

```env
# For Stable Diffusion (free or paid)
HUGGINGFACE_API_KEY=hf_your_token_here

# For Freepik Mystic (commercial, optional)
FREEPIK_API_KEY=your_freepik_api_key_here
```

---

## Next Steps

1. Choose which service(s) to set up
2. Get API keys
3. Add to `.env.local`
4. Restart dev server (`yarn dev`)
5. Go to `/generate-with-ai`
6. Start creating NFTs! 🎨
