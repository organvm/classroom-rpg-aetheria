import { memo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Sword,
  Trophy,
  BookOpen,
  Users,
  Plus,
  Sparkle,
  MagnifyingGlass,
  FolderOpen
} from '@phosphor-icons/react'

type EmptyStateVariant = 'quests' | 'realms' | 'leaderboard' | 'archives' | 'artifacts' | 'search' | 'generic'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  className?: string
}

const variantConfig = {
  quests: {
    icon: Sword,
    defaultTitle: 'No Quests Available',
    defaultDescription: 'There are no quests to display yet. Check back soon for new adventures!'
  },
  realms: {
    icon: Sparkle,
    defaultTitle: 'No Realms Created',
    defaultDescription: 'Create your first realm to begin organizing your learning adventures.'
  },
  leaderboard: {
    icon: Trophy,
    defaultTitle: 'No Heroes Yet',
    defaultDescription: 'Complete quests to earn XP and appear on the leaderboard!'
  },
  archives: {
    icon: BookOpen,
    defaultTitle: 'Archives Empty',
    defaultDescription: 'Knowledge crystals from failed quests will appear here. Study them to unlock redemption quests!'
  },
  artifacts: {
    icon: FolderOpen,
    defaultTitle: 'No Artifacts Collected',
    defaultDescription: 'Score highly on quests to earn rare artifacts and treasures!'
  },
  search: {
    icon: MagnifyingGlass,
    defaultTitle: 'No Results Found',
    defaultDescription: 'Try adjusting your search or filters to find what you\'re looking for.'
  },
  generic: {
    icon: FolderOpen,
    defaultTitle: 'Nothing Here',
    defaultDescription: 'There\'s nothing to display at the moment.'
  }
}

export const EmptyState = memo(function EmptyState({
  variant = 'generic',
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const Icon = config.icon
  const displayTitle = title || config.defaultTitle
  const displayDescription = description || config.defaultDescription

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-panel p-8 md:p-12 text-center ${className}`}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        <div className="inline-flex p-4 rounded-full bg-muted/30">
          <Icon size={48} className="text-muted-foreground" weight="duotone" />
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold mb-2"
      >
        {displayTitle}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mb-6 max-w-md mx-auto"
      >
        {displayDescription}
      </motion.p>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={action.onClick} className="gap-2" size="lg">
            {action.icon || <Plus size={20} weight="bold" />}
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
})

/**
 * Empty state for quest list
 */
export const EmptyQuestList = memo(function EmptyQuestList({
  onCreateQuest
}: {
  onCreateQuest?: () => void
}) {
  return (
    <EmptyState
      variant="quests"
      action={onCreateQuest ? {
        label: 'Create First Quest',
        onClick: onCreateQuest
      } : undefined}
    />
  )
})

/**
 * Empty state for leaderboard
 */
export const EmptyLeaderboard = memo(function EmptyLeaderboard() {
  return <EmptyState variant="leaderboard" />
})

/**
 * Empty state for archives/crystals
 */
export const EmptyArchives = memo(function EmptyArchives() {
  return <EmptyState variant="archives" />
})

/**
 * Empty state for artifacts
 */
export const EmptyArtifacts = memo(function EmptyArtifacts() {
  return <EmptyState variant="artifacts" />
})

/**
 * Empty state for search results
 */
export const EmptySearchResults = memo(function EmptySearchResults({
  onClear
}: {
  onClear?: () => void
}) {
  return (
    <EmptyState
      variant="search"
      action={onClear ? {
        label: 'Clear Search',
        onClick: onClear,
        icon: <MagnifyingGlass size={20} />
      } : undefined}
    />
  )
})
