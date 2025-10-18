'use client'

import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/design-system'
import type { EvaluationRow } from './EvalList'

interface EvalDetailModalProps {
  evaluation: EvaluationRow | null
  isOpen: boolean
  onClose: () => void
}

function statusBadge(score: number) {
  if (score >= 90) return 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/25'
  if (score >= 75) return 'bg-[#007AFF]/15 text-[#007AFF] border-[#007AFF]/25'
  if (score >= 60) return 'bg-[#FF9500]/15 text-[#FF9500] border-[#FF9500]/25'
  return 'bg-[#FF3B30]/15 text-[#FF3B30] border-[#FF3B30]/25'
}

export default function EvalDetailModal({ evaluation, isOpen, onClose }: EvalDetailModalProps) {
  if (!evaluation) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white/95 p-6 text-left align-middle shadow-2xl transition-all backdrop-blur-xl dark:bg-[#1D1D1F]/95">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/10">
                    <div>
                      <Dialog.Title className="text-xl font-semibold text-[#1C1C1E] dark:text-white">
                        Evaluation Details
                      </Dialog.Title>
                      <p className="text-sm text-[#8E8E93]">
                        Interaction: {evaluation.interaction_id}
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-full p-2 text-[#8E8E93] transition hover:bg-black/5 hover:text-[#1C1C1E] dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Metrics */}
                  <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-gradient-to-br from-[#007AFF]/10 to-[#007AFF]/5 p-4 backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full border text-lg font-bold',
                          statusBadge(evaluation.score)
                        )}>
                          {evaluation.score}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-[#8E8E93]">Score</p>
                          <p className="text-sm font-semibold text-[#1C1C1E] dark:text-white">
                            Quality Rating
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-[#FF9500]/10 to-[#FF9500]/5 p-4 backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF9500]/15 text-[#FF9500]">
                          <ClockIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-[#8E8E93]">Latency</p>
                          <p className="text-sm font-semibold text-[#1C1C1E] dark:text-white">
                            {evaluation.latency_ms} ms
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-[#34C759]/10 to-[#34C759]/5 p-4 backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34C759]/15 text-[#34C759]">
                          <ShieldCheckIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-[#8E8E93]">PII Protected</p>
                          <p className="text-sm font-semibold text-[#1C1C1E] dark:text-white">
                            {evaluation.pii_tokens_redacted || 0} tokens
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 text-xs uppercase tracking-[0.24em] text-[#8E8E93]">
                        User Prompt
                      </h3>
                      <div className="rounded-2xl bg-gradient-to-br from-white/80 to-white/60 p-6 shadow-inner backdrop-blur-xl dark:from-white/10 dark:to-white/5">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#1C1C1E] dark:text-white">
                          {evaluation.prompt}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 text-xs uppercase tracking-[0.24em] text-[#8E8E93]">
                        AI Response
                      </h3>
                      <div className="rounded-2xl bg-gradient-to-br from-white/80 to-white/60 p-6 shadow-inner backdrop-blur-xl dark:from-white/10 dark:to-white/5">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#1C1C1E] dark:text-white">
                          {evaluation.response}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-between border-t border-black/10 pt-4 text-xs text-[#8E8E93] dark:border-white/10">
                    <span>Evaluation ID: {evaluation.id}</span>
                    <span>Created: {new Date(evaluation.created_at).toLocaleString()}</span>
                  </div>
                </motion.div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}