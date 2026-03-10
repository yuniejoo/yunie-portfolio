/**
 * Generate ASCII art — Lip Balm
 *
 * Setup (one-time):
 *   npm install @anthropic-ai/sdk
 *   npm install -D ts-node
 *   export ANTHROPIC_API_KEY=your-api-key-here
 *
 * Run:
 *   npx ts-node scripts/generate-art/lip-balm.ts
 *
 * Copy the console output into:
 *   src/components/ui/ArtworkFrame.tsx
 *   → ARTWORKS array, id: 'lip-balm', art: `<paste here>`
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
        content: `Generate ASCII art of a lip balm tube.

Style: dense, intricate, like Japanese ASCII art animals. No text labels inside the shape. The silhouette and form must come entirely from the arrangement of characters.

Key features to capture:
- Thin, tall cylindrical tube (narrow proportions)
- Small domed or rounded cap at the top
- Twist base at the bottom for dispensing
- The cap should be visually distinct from the tube body

Approximately 12–15 lines tall. Monospace font assumed.
Output only the ASCII art, nothing else.`,
      },
    ],
  })

  const art = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log(art)
}

generateArt().catch(console.error)
