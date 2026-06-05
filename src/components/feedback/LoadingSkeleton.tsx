import { memo } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export const Skeleton = memo(function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted/50',
        className
      )}
    />
  )
})

/**
 * Skeleton for a quest card
 */
export const QuestCardSkeleton = memo(function QuestCardSkeleton() {
  return (
    <div className="glass-panel p-4 md:p-6 border-2 border-muted">
      <div className="flex items-start gap-3 md:gap-4">
        <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
})

/**
 * Skeleton for a list of quest cards
 */
export const QuestListSkeleton = memo(function QuestListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <QuestCardSkeleton key={i} />
      ))}
    </div>
  )
})

/**
 * Skeleton for leaderboard entry
 */
export const LeaderboardEntrySkeleton = memo(function LeaderboardEntrySkeleton() {
  return (
    <div className="glass-panel p-6 border-2 border-muted">
      <div className="flex items-center gap-6">
        <Skeleton className="w-12 h-8" />
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>
    </div>
  )
})

/**
 * Skeleton for leaderboard
 */
export const LeaderboardSkeleton = memo(function LeaderboardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <LeaderboardEntrySkeleton key={i} />
      ))}
    </div>
  )
})

/**
 * Skeleton for character sheet stats
 */
export const CharacterStatsSkeleton = memo(function CharacterStatsSkeleton() {
  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    </div>
  )
})

/**
 * Skeleton for dashboard statistics
 */
export const DashboardStatsSkeleton = memo(function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-panel p-4 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ))}
    </div>
  )
})

/**
 * Full page loading state
 */
export const PageLoadingSkeleton = memo(function PageLoadingSkeleton() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <DashboardStatsSkeleton />
      <QuestListSkeleton count={4} />
    </div>
  )
})
