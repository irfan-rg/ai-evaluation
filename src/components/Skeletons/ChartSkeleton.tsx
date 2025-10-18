'use client'

import Skeleton from 'react-loading-skeleton'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const baseColorLight = 'rgba(0, 0, 0, 0.06)'
const highlightColorLight = 'rgba(0, 0, 0, 0.12)'
const baseColorDark = 'rgba(255, 255, 255, 0.08)'
const highlightColorDark = 'rgba(255, 255, 255, 0.18)'

// Use a consistent palette to avoid hydration mismatch
function useSkeletonPalette() {
  const [palette, setPalette] = useState({
    baseColor: baseColorLight,
    highlightColor: highlightColorLight,
  })

  useEffect(() => {
    // Only check theme preference on client side after hydration
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setPalette(
      prefersDark
        ? { baseColor: baseColorDark, highlightColor: highlightColorDark }
        : { baseColor: baseColorLight, highlightColor: highlightColorLight }
    )
  }, [])

  return palette
}

export function ChartSkeleton({ fast = false }: { fast?: boolean }) {
  const palette = useSkeletonPalette()

  return (
    <motion.div
      className="glass-card w-full rounded-3xl p-6"
      initial={{ opacity: 0, y: fast ? 2 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: fast ? 0.1 : 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-6 flex items-center justify-between">
        <Skeleton
          width={180}
          height={24}
          borderRadius={12}
          baseColor={palette.baseColor}
          highlightColor={palette.highlightColor}
        />
        <Skeleton
          width={120}
          height={18}
          borderRadius={999}
          baseColor={palette.baseColor}
          highlightColor={palette.highlightColor}
        />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_item, index) => (
          <Skeleton
            key={`chart-line-${index}`}
            height={20 + index * 6}
            borderRadius={14}
            baseColor={palette.baseColor}
            highlightColor={palette.highlightColor}
          />
        ))}
      </div>
    </motion.div>
  )
}
