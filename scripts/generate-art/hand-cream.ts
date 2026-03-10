/**
 * Generate ASCII art — Hand Cream Tube
 *
 * Setup (one-time):
 *   npm install @anthropic-ai/sdk
 *   npm install -D ts-node
 *   export ANTHROPIC_API_KEY=your-api-key-here
 *
 * Run:
 *   npx ts-node scripts/generate-art/hand-cream.ts
 *
 * Copy the console output into:
 *   src/components/ui/ArtworkFrame.tsx
 *   → ARTWORKS array, id: 'hand-cream', art: `<paste here>`
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
        content: `Generate ASCII art of a hand cream tube.

Style: dense, intricate, like Japanese ASCII art animals. No text labels inside the shape. The silhouette and form must come entirely from the arrangement of characters.

Key features to capture:
- Short, fat cylindrical squeeze tube (wide relative to height)
- Flip cap at the top (a hinged cap, slightly offset or angled)
- The body is wider than typical tubes — plump squeeze shape
- Flat or slightly pinched bottom

Approximately 12–15 lines tall. Monospace font assumed.
Output only the ASCII art, nothing else.`,
      },
    ],
  })

  const art = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log(art)
}

generateArt().catch(console.error)
