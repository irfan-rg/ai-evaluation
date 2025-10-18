'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	ArrowTopRightOnSquareIcon,
	ArrowTrendingDownIcon,
	ArrowTrendingUpIcon,
	LockClosedIcon,
} from '@heroicons/react/24/outline'
import { cn, motionVariants, transitions } from '@/lib/design-system'
import EvalDetailModal from './EvalDetailModal'

export interface EvaluationRow {
	id: string
	interaction_id: string
	prompt: string
	response: string
	score: number
	latency_ms: number
	pii_tokens_redacted: number | null
	created_at: string
}

interface EvalListProps {
	evaluations: EvaluationRow[]
	page: number
	totalPages: number
	onPageChange: (page: number) => void
	loading?: boolean
	totalCount?: number
}

function statusBadge(score: number) {
	if (score >= 90) return 'bg-[#34C759]/15 text-[#34C759]'
	if (score >= 75) return 'bg-[#007AFF]/15 text-[#007AFF]'
	if (score >= 60) return 'bg-[#FF9500]/15 text-[#FF9500]'
	return 'bg-[#FF3B30]/15 text-[#FF3B30]'
}

export default function EvalList({
	evaluations,
	page,
	totalPages,
	onPageChange,
	loading,
	totalCount,
}: EvalListProps) {
	const [selectedEval, setSelectedEval] = useState<EvaluationRow | null>(null)
	const [modalOpen, setModalOpen] = useState(false)

	const tableData = useMemo(() => {
		return (evaluations ?? []).map((item) => ({
			...item,
			piiDisplay: item.pii_tokens_redacted ?? 0,
			createdDisplay: new Date(item.created_at).toLocaleString(),
		}))
	}, [evaluations])

	const handleInspectClick = (evaluation: EvaluationRow, e: React.MouseEvent) => {
		e.stopPropagation()
		setSelectedEval(evaluation)
		setModalOpen(true)
	}

	return (
		<motion.section
			className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/85 shadow-[0_24px_60px_rgba(15,15,15,0.12)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#1D1D1F]/85"
			variants={motionVariants.fadeUp}
			initial="hidden"
			animate="show"
			transition={transitions.default}
		>
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/50 bg-white/70 px-6 py-5 backdrop-blur-xl dark:border-white/10 dark:bg-[#1D1D1F]/80">
				<div>
					<h2 className="text-lg font-semibold tracking-tight text-[#1C1C1E] dark:text-white">
						Evaluation Stream
					</h2>
					<p className="text-sm text-[#8E8E93]">
						Showing {(evaluations ?? []).length} of {totalCount ?? '—'} evaluations
					</p>
				</div>
				<div className="flex items-center gap-2 text-xs text-[#8E8E93]">
					<span className="inline-flex items-center gap-1 rounded-full bg-[#007AFF]/10 px-3 py-1 text-[#007AFF]">
						<ArrowTrendingUpIcon className="h-3.5 w-3.5" /> Higher score = better
					</span>
					<span className="inline-flex items-center gap-1 rounded-full bg-[#FF3B30]/10 px-3 py-1 text-[#FF3B30]">
						<ArrowTrendingDownIcon className="h-3.5 w-3.5" /> Monitor latency spikes
					</span>
				</div>
			</div>

			<div className="overflow-auto">
				<table className="min-w-full table-fixed">
					<thead className="sticky top-0 z-10 bg-white/90 text-left text-xs uppercase tracking-[0.24em] text-[#8E8E93] backdrop-blur-xl dark:bg-[#1D1D1F]/90">
						<tr>
							<th className="px-6 py-4 font-medium">Interaction</th>
							<th className="px-6 py-4 font-medium">Score</th>
							<th className="px-6 py-4 font-medium">Latency</th>
							<th className="px-6 py-4 font-medium">PII</th>
							<th className="px-6 py-4 font-medium">Captured</th>
							<th className="px-6 py-4 text-right font-medium">Action</th>
						</tr>
					</thead>
					<tbody>
						<AnimatePresence initial={false}>
							{tableData.map((evaluation, index) => (
								<motion.tr
									key={evaluation.id}
                                    onClick={(e) => handleInspectClick(evaluation, e)}
									className={cn(
										'cursor-pointer border-t border-white/40 text-sm transition duration-200 first:border-t-0 dark:border-white/10',
										index % 2 === 0
											? 'bg-white/85 dark:bg-white/5'
											: 'bg-white/75 dark:bg-white/10'
									)}
									whileHover={{ scale: 1.001, translateY: -1 }}
									layout
								>
									<td className="px-6 py-4 font-semibold text-[#007AFF]">
										{evaluation.interaction_id}
									</td>
									<td className="px-6 py-4">
										<span
											className={cn(
												'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-xl',
												statusBadge(evaluation.score)
											)}
										>
											{evaluation.score}
										</span>
									</td>
									<td className="px-6 py-4 text-[#8E8E93] dark:text-[#EBEBF5]/70">
										{evaluation.latency_ms} ms
									</td>
									<td className="px-6 py-4 text-[#8E8E93] dark:text-[#EBEBF5]/70">
										<span className="inline-flex items-center gap-1 text-xs">
											<LockClosedIcon className="h-4 w-4" />
											{evaluation.piiDisplay}
										</span>
									</td>
									<td className="px-6 py-4 text-[#8E8E93] dark:text-[#EBEBF5]/70">
										{evaluation.createdDisplay}
									</td>
									<td className="px-6 py-4 text-right">
										<button
											onClick={(e) => handleInspectClick(evaluation, e)}
											className="inline-flex items-center gap-1 text-xs font-semibold text-[#007AFF] transition hover:text-[#0066CC]"
										>
											Inspect
											<ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
										</button>
									</td>
								</motion.tr>
							))}
						</AnimatePresence>
					</tbody>
				</table>
			</div>

			<div className="flex flex-col items-center justify-between gap-3 border-t border-white/40 bg-white/75 px-6 py-4 text-sm text-[#8E8E93] backdrop-blur-xl sm:flex-row dark:border-white/10 dark:bg-[#1D1D1F]/80">
				<div>
					Page {page} of {totalPages || 1}
				</div>
				<div className="flex items-center gap-2">
					<motion.button
						type="button"
						onClick={() => onPageChange(Math.max(1, page - 1))}
						disabled={page === 1 || loading}
						whileTap={{ scale: 0.97 }}
						className={cn(
							'rounded-full px-4 py-2 text-sm font-semibold transition',
							page === 1 || loading
								? 'cursor-not-allowed bg-white/50 text-[#C8C8CC] dark:bg-white/5'
								: 'bg-[#007AFF]/10 text-[#007AFF] hover:scale-[1.02] hover:bg-[#007AFF]/15'
						)}
					>
						Previous
					</motion.button>
					<motion.button
						type="button"
						onClick={() => onPageChange(Math.min(totalPages || 1, page + 1))}
						disabled={page === totalPages || loading}
						whileTap={{ scale: 0.97 }}
						className={cn(
							'rounded-full px-4 py-2 text-sm font-semibold transition',
							page === totalPages || loading
								? 'cursor-not-allowed bg-white/50 text-[#C8C8CC] dark:bg-white/5'
								: 'bg-[#007AFF] text-white shadow-[0_12px_32px_rgba(0,122,255,0.25)] hover:scale-[1.02]'
						)}
					>
						Next
					</motion.button>
				</div>
			</div>

			<EvalDetailModal
				evaluation={selectedEval}
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
			/>
		</motion.section>
	)
}
