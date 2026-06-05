/**
 * Artifact Detail Modal Component
 *
 * Displays detailed information about an artifact including
 * rarity, earning date, source quest, and any special effects.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Artifact, Quest, ThemeConfig } from '@/lib/types'
import { THEME_CONFIGS } from '@/lib/types'
import { Sparkle, Trophy, Calendar, Scroll, Star, Lightning, X } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ArtifactDetailModalProps {
  artifact: Artifact | null
  quest?: Quest // the quest that awarded this artifact
  open: boolean
  onOpenChange: (open: boolean) => void
  theme?: ThemeConfig
}

// Rarity configuration with colors and effects
// Note: Artifact rarity type is 'common' | 'rare' | 'epic' | 'legendary'
const RARITY_CONFIG: Record<string, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  glowClass: string
  xpBonus: number
  description: string
}> = {
  common: {
    label: 'Common',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/30',
    borderColor: 'border-muted',
    glowClass: '',
    xpBonus: 0,
    description: 'A basic reward for completing quests'
  },
  rare: {
    label: 'Rare',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/50',
    glowClass: 'shadow-primary/30',
    xpBonus: 10,
    description: 'A notable achievement requiring skill'
  },
  epic: {
    label: 'Epic',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/50',
    glowClass: 'shadow-secondary/40',
    xpBonus: 25,
    description: 'Exceptional performance on challenging tasks'
  },
  legendary: {
    label: 'Legendary',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/50',
    glowClass: 'shadow-accent/50',
    xpBonus: 50,
    description: 'The pinnacle of achievement - truly legendary'
  }
}

export function ArtifactDetailModal({
  artifact,
  quest,
  open,
  onOpenChange,
  theme
}: ArtifactDetailModalProps) {
  if (!artifact) return null

  const themeConfig = theme || THEME_CONFIGS.fantasy
  const rarity = RARITY_CONFIG[artifact.rarity] || RARITY_CONFIG.common
  const earnedDate = new Date(artifact.earnedAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "glass-panel max-w-md overflow-hidden",
        "border-2",
        rarity.borderColor
      )}>
        <DialogHeader className="sr-only">
          <DialogTitle>{artifact.name}</DialogTitle>
          <DialogDescription>Artifact details</DialogDescription>
        </DialogHeader>

        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
          onClick={() => onOpenChange(false)}
        >
          <X size={18} />
          <span className="sr-only">Close</span>
        </Button>

        {/* Rarity glow background effect */}
        <div className={cn(
          "absolute inset-0 opacity-20 pointer-events-none",
          rarity.bgColor
        )} />

        {/* Content */}
        <div className="relative space-y-6 pt-2">
          {/* Artifact Icon Display */}
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className={cn(
                "relative w-32 h-32 rounded-full flex items-center justify-center",
                "border-4",
                rarity.borderColor,
                rarity.bgColor,
                artifact.rarity === 'legendary' || artifact.rarity === 'epic'
                  ? `shadow-2xl ${rarity.glowClass}`
                  : ''
              )}
              animate={artifact.rarity === 'legendary' ? {
                boxShadow: [
                  '0 0 20px rgba(var(--accent), 0.3)',
                  '0 0 40px rgba(var(--accent), 0.5)',
                  '0 0 20px rgba(var(--accent), 0.3)'
                ]
              } : {}}
              transition={{
                duration: 2,
                repeat: artifact.rarity === 'legendary' ? Infinity : 0
              }}
            >
              {/* Animated sparkles for epic/legendary */}
              {(artifact.rarity === 'legendary' || artifact.rarity === 'epic') && (
                <>
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  >
                    {[0, 60, 120, 180, 240, 300].map((angle) => (
                      <Star
                        key={angle}
                        size={12}
                        weight="fill"
                        className={cn("absolute", rarity.color)}
                        style={{
                          top: `${50 + 45 * Math.sin(angle * Math.PI / 180)}%`,
                          left: `${50 + 45 * Math.cos(angle * Math.PI / 180)}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    ))}
                  </motion.div>
                </>
              )}

              <motion.div
                animate={artifact.rarity === 'legendary' ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                } : artifact.rarity === 'epic' ? {
                  scale: [1, 1.05, 1]
                } : {}}
                transition={{
                  duration: artifact.rarity === 'legendary' ? 3 : 2,
                  repeat: Infinity
                }}
              >
                <Sparkle
                  size={56}
                  weight="fill"
                  className={rarity.color}
                />
              </motion.div>
            </motion.div>

            {/* Artifact Name */}
            <div className="text-center">
              <h2 className="text-2xl font-bold">{artifact.name}</h2>
              <Badge
                className={cn(
                  "mt-2",
                  artifact.rarity === 'legendary' && "bg-accent text-accent-foreground",
                  artifact.rarity === 'epic' && "bg-secondary text-secondary-foreground",
                  artifact.rarity === 'rare' && "bg-primary text-primary-foreground",
                  artifact.rarity === 'common' && "bg-muted text-muted-foreground"
                )}
              >
                {rarity.label}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel p-4 rounded-lg space-y-2">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {artifact.description}
            </p>
            <p className="text-xs italic text-muted-foreground/70">
              {rarity.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Earned Date */}
            <div className="glass-panel p-3 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar size={16} />
                <span className="text-xs uppercase tracking-wide">Earned</span>
              </div>
              <p className="font-medium text-sm">
                {earnedDate.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* XP Bonus */}
            <div className="glass-panel p-3 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Lightning size={16} weight="fill" />
                <span className="text-xs uppercase tracking-wide">{themeConfig.xpLabel} Bonus</span>
              </div>
              <p className={cn("font-bold text-sm", rarity.xpBonus > 0 && rarity.color)}>
                {rarity.xpBonus > 0 ? `+${rarity.xpBonus}` : 'None'}
              </p>
            </div>
          </div>

          {/* Source Quest */}
          {quest && (
            <div className="glass-panel p-4 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Scroll size={16} />
                <span className="text-xs uppercase tracking-wide">
                  Source {themeConfig.questLabel}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Trophy size={24} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{quest.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {quest.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
