'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/design-system'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning'

export interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastMessage extends ToastOptions {
  id: string
}

interface ToastContextValue {
  notify: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const VARIANT_STYLES: Record<ToastVariant, string> = {
  default:
    'border border-black/5 bg-white/90 text-[#1C1C1E] shadow-[0_18px_36px_rgba(15,15,15,0.14)] dark:border-white/10 dark:bg-[#2C2C2E]/85 dark:text-white',
  success:
    'border border-[#34C759]/40 bg-[#34C759]/10 text-[#1C1C1E] shadow-[0_18px_36px_rgba(52,199,89,0.32)] dark:border-[#34C759]/40 dark:bg-[#1C1C1E] dark:text-white',
  error:
    'border border-[#FF3B30]/45 bg-[#FF3B30]/12 text-[#1C1C1E] shadow-[0_18px_36px_rgba(255,59,48,0.28)] dark:border-[#FF453A]/45 dark:bg-[#1C1C1E] dark:text-white',
  warning:
    'border border-[#FF9500]/40 bg-[#FF9500]/12 text-[#1C1C1E] shadow-[0_18px_36px_rgba(255,149,0,0.28)] dark:border-[#FF9F0A]/40 dark:bg-[#1C1C1E] dark:text-white',
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const notify = useCallback((options: ToastOptions) => {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, ...options }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
        {children}
        <div className="pointer-events-none fixed inset-x-0 top-3 z-[999] flex flex-col gap-3 px-4 sm:items-end sm:justify-start">
          <AnimatePresence initial={false}>
            {toasts.map((toast) => {
              const variant = toast.variant ?? 'default'
              return (
                <ToastPrimitive.Root
                  key={toast.id}
                  open
                  onOpenChange={(open) => {
                    if (!open) removeToast(toast.id)
                  }}
                  duration={toast.duration ?? 4000}
                  forceMount
                  asChild
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: -16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.97 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      'pointer-events-auto w-full max-w-sm overflow-hidden rounded-3xl px-5 py-4 backdrop-blur-xl',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/30',
                      VARIANT_STYLES[variant]
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      {toast.title && (
                        <ToastPrimitive.Title className="text-sm font-semibold tracking-tight">
                          {toast.title}
                        </ToastPrimitive.Title>
                      )}
                      {toast.description && (
                        <ToastPrimitive.Description className="text-sm text-[#8E8E93] dark:text-[#EBEBF5]/70">
                          {toast.description}
                        </ToastPrimitive.Description>
                      )}
                    </div>
                  </motion.div>
                </ToastPrimitive.Root>
              )
            })}
          </AnimatePresence>
        </div>
        <ToastPrimitive.Viewport className="hidden" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
