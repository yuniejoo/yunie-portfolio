'use client'

import { useState } from 'react'
import Button from '@/src/components/ui/Button'
import Tag from '@/src/components/ui/Tag'
import Divider from '@/src/components/ui/Divider'
import ProjectCover from '@/src/components/ProjectCover'
import ProjectImgFrame from '@/src/components/ui/ProjectImgFrame'
import ProjectItem from '@/src/components/ProjectItem'

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function Home() {
  // One hover state per card — each tracks whether that specific card is being hovered.
  // useState(false) means "start as not hovered". When the mouse enters the wrapper div,
  // we flip it to true; when it leaves, we flip it back to false.
  const [hovered0, setHovered0] = useState(false)
  const [hovered1, setHovered1] = useState(false)
  const [hovered2, setHovered2] = useState(false)

  return (
    <main className="flex min-h-screen flex-col items-start justify-center gap-12 px-16 bg-white">

      {/* ── Divider preview ── */}
      <div className="flex flex-col gap-6 w-full">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Divider component</p>
        <Divider />
      </div>

      {/* ── Tag preview ── */}
      <div className="flex flex-col gap-6">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Tag component — all variants</p>
        <div className="flex flex-row gap-6 items-center">
          <Tag variant="minimal" color="default">Case Study</Tag>
          <Tag variant="minimal" color="subtle">Case Study</Tag>
          <Tag variant="minimal" color="primary">Case Study</Tag>
          <Tag variant="outlined" color="default">Case Study</Tag>
          <Tag variant="outlined" color="subtle">Case Study</Tag>
          <Tag variant="outlined" color="primary">Case Study</Tag>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Primary — Default</p>
        <Button type="primary" isSelected={false}>Work</Button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Primary — Selected</p>
        <Button type="primary" isSelected={true}>Work</Button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Primary — Default + Icon</p>
        <Button type="primary" isSelected={false} hasIcon icon={<ArrowRight />}>Work</Button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Primary — Selected + Icon</p>
        <Button type="primary" isSelected={true} hasIcon icon={<ArrowRight />}>Work</Button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Secondary — Default</p>
        <Button type="secondary" isSelected={false}>Case Study</Button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Secondary — Selected</p>
        <Button type="secondary" isSelected={true}>Case Study</Button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Secondary — Default + Icon</p>
        <Button type="secondary" isSelected={false} hasIcon icon={<ArrowRight />}>Case Study</Button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Secondary — Selected + Icon</p>
        <Button type="secondary" isSelected={true} hasIcon icon={<ArrowRight />}>Case Study</Button>
      </div>

      {/* ── ProjectImgFrame preview ── */}
      <div className="flex flex-col gap-6 w-full">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">ProjectImgFrame component — with placeholder image inside</p>
        <div className="flex flex-row gap-6 flex-wrap">
          <ProjectImgFrame>
            <div className="placeholder-image w-full h-full" />
          </ProjectImgFrame>
        </div>
      </div>

      {/* ── ProjectCover preview ── */}
      <div className="flex flex-col gap-6 w-full">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">ProjectCover component — all three color variants</p>
        {/* py-12 gives breathing room so the rotated cards don't clip at the edges */}
        <div className="flex flex-row gap-12 flex-wrap py-12">

          {/* Each card is wrapped in a div that handles rotation and hover detection.
              Default: rotate(-2deg). Hovered: rotate(-4deg).
              The transition animates the rotation change smoothly.
              onMouseEnter fires when the cursor enters the div → sets hovered to true.
              onMouseLeave fires when the cursor leaves → sets hovered back to false. */}
          <div
            onMouseEnter={() => setHovered0(true)}
            onMouseLeave={() => setHovered0(false)}
            style={{ transform: hovered0 ? 'rotate(-4deg)' : 'rotate(-2deg)', transition: 'transform 0.2s ease' }}
          >
            <ProjectCover color="blue" tag="Case Study" title="Detail Page Design" description="Redesigning a dense information view for field ops teams across 12 time zones." isHovered={hovered0} />
          </div>

          <div
            onMouseEnter={() => setHovered1(true)}
            onMouseLeave={() => setHovered1(false)}
            style={{ transform: hovered1 ? 'rotate(-4deg)' : 'rotate(-2deg)', transition: 'transform 0.2s ease' }}
          >
            <ProjectCover color="indigo" tag="Case Study" title="Permission System" description="A ground-up access control system built for a 200-person enterprise." isHovered={hovered1} />
          </div>

          <div
            onMouseEnter={() => setHovered2(true)}
            onMouseLeave={() => setHovered2(false)}
            style={{ transform: hovered2 ? 'rotate(-4deg)' : 'rotate(-2deg)', transition: 'transform 0.2s ease' }}
          >
            <ProjectCover color="purple" tag="Snapshot" title="Visual Archive" description="A curated set of explorations and experiments from 2023–2024." isHovered={hovered2} />
          </div>

        </div>
      </div>


      {/* ── ProjectItem preview ── */}
      <div className="flex flex-col gap-6 w-full">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">ProjectItem — seed 1, 3 frames (hover me)</p>
        <ProjectItem
          rotationSeed={1}
          cover={(hovered) => (
            <ProjectCover
              color="blue"
              tag="Case Study"
              title="Detail Page"
              description="Redesigning a dense information view for field ops teams."
              isHovered={hovered}
            />
          )}
          images={[
            <ProjectImgFrame key={0}><div className="placeholder-image w-full h-full" /></ProjectImgFrame>,
            <ProjectImgFrame key={1}><div className="placeholder-image w-full h-full" /></ProjectImgFrame>,
            <ProjectImgFrame key={2}><div className="placeholder-image w-full h-full" /></ProjectImgFrame>,
          ]}
        />
      </div>

    </main>
  )
}
