/**
 * Generate ASCII art — Rabbit Hole
 *
 * Setup (one-time):
 *   npm install @anthropic-ai/sdk
 *   npm install -D ts-node
 *   export ANTHROPIC_API_KEY=your-api-key-here
 *
 * Run:
 *   npx ts-node scripts/generate-art/rabbit-hole.ts
 *
 * Copy the console output into:
 *   src/components/ui/ArtworkFrame.tsx
 *   → ARTWORKS array, id: 'rabbit-hole', art: `<paste here>`
 */

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

async function generateArt() {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Generate ASCII art of a rabbit disappearing into a rabbit hole, viewed from above.

Style: dense, intricate, like Japanese ASCII art animals. No text labels inside the shape. The silhouette and form must come entirely from the arrangement of characters.

Key features to capture:
- The rabbit is seen from above/behind, descending into a dark spiral hole in the ground
- Only the tail and tips of the ears are visible at the rim of the hole
- The hole is a dark spiral or circular void in the center
- The surrounding ground area frames the hole
- The composition conveys the rabbit is mostly gone, just disappearing

Approximately 12–15 lines tall. Monospace font assumed.
Output only the ASCII art, nothing else.`,
      },
    ],
  })

  const art = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log(art)
}

generateArt().catch(console.error)
