import { useCallback, KeyboardEvent, memo, useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Quest, THEME_CONFIGS, Theme } from '@/lib/types'
import { Sword, Skull, ArrowBendUpLeft, Lock, CheckCircle, XCircle, Eye, Play, ShareNetwork, DotsThree } from '@phosphor-icons/react'
import { formatTimeAgo } from '@/lib/game-utils'
import { useTouchGestures } from '@/hooks/use-touch-gestures'

interface QuestCardProps {
  quest: Quest
  theme: Theme
  onClick: () => void
  isLocked?: boolean
  onStartQuest?: () => void
  onShare?: () => void
}

export const QuestCard = memo(function QuestCard({ quest, theme, onClick, isLocked, onStartQuest, onShare }: QuestCardProps) {
  const themeConfig = THEME_CONFIGS[theme]
  const [showQuickActions, setShowQuickActions] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const longPressTriggered = useRef(false)

  // Touch gesture handlers for long-press
  const touchGestures = useTouchGestures({
    onLongPress: () => {
      if (!isLocked) {
        longPressTriggered.current = true
        setShowQuickActions(true)
      }
    }
  })

  // Reset long press flag when popover closes
  useEffect(() => {
    if (!showQuickActions) {
      // Small delay to prevent click from firing after popover closes
      const timer = setTimeout(() => {
        longPressTriggered.current = false
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [showQuickActions])

  const handleQuickAction = (action: 'view' | 'start' | 'share') => {
    setShowQuickActions(false)
    switch (action) {
      case 'view':
        onClick()
        break
      case 'start':
        onStartQuest?.() || onClick()
        break
      case 'share':
        onShare?.()
        break
    }
  }

  const getQuestIcon = () => {
    if (quest.type === 'boss') return <Skull size={24} weight="fill" aria-hidden="true" />
    if (quest.type === 'redemption') return <ArrowBendUpLeft size={24} aria-hidden="true" />
    return <Sword size={24} aria-hidden="true" />
  }

  const getStatusColor = () => {
    if (isLocked) return 'border-muted-foreground/30'
    if (quest.status === 'completed') return 'border-accent glow-border'
    if (quest.status === 'failed') return 'border-destructive'
    if (quest.type === 'boss') return 'border-destructive animate-pulse-glow'
    return 'border-primary'
  }

  const getStatusIcon = () => {
    if (quest.status === 'completed') return <CheckCircle size={20} weight="fill" className="text-accent" aria-hidden="true" />
    if (quest.status === 'failed') return <XCircle size={20} weight="fill" className="text-destructive" aria-hidden="true" />
    if (isLocked) return <Lock size={20} className="text-muted-foreground" aria-hidden="true" />
    return null
  }

  const getStatusLabel = () => {
    if (quest.status === 'completed') return 'Completed'
    if (quest.status === 'failed') return 'Failed'
    if (isLocked) return 'Locked'
    return 'Available'
  }

  const handleClick = useCallback(() => {
    // Don't trigger click if long press was just triggered
    if (longPressTriggered.current) return
    if (!isLocked) onClick()
  }, [isLocked, onClick])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (isLocked) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }, [isLocked, onClick])

  return (
    <Popover open={showQuickActions} onOpenChange={setShowQuickActions}>
      <PopoverTrigger asChild>
        <Card
          ref={cardRef}
          className={`glass-panel p-4 md:p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-xl border-2 ${getStatusColor()} ${isLocked ? 'opacity-50' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onTouchStart={touchGestures.onTouchStart}
          onTouchMove={touchGestures.onTouchMove}
          onTouchEnd={touchGestures.onTouchEnd}
          role="button"
          tabIndex={isLocked ? -1 : 0}
          aria-disabled={isLocked}
          aria-label={`${quest.name}, ${quest.type} quest, ${quest.xpValue} ${themeConfig.xpLabel}, ${getStatusLabel()}. Long press for quick actions.`}
        >
          <div className="flex items-start gap-3 md:gap-4">
            <div className={`p-2 md:p-3 rounded-lg flex-shrink-0 ${quest.type === 'boss' ? 'bg-destructive/20' : 'bg-primary/20'}`}>
              {getQuestIcon()}
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base md:text-lg leading-tight">{quest.name}</h3>
                <div className="flex-shrink-0">{getStatusIcon()}</div>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{quest.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {quest.xpValue} {themeConfig.xpLabel}
                </Badge>
                {quest.type === 'boss' && (
                  <Badge variant="destructive" className="text-xs">
                    Boss
                  </Badge>
                )}
                {quest.type === 'redemption' && (
                  <Badge variant="outline" className="text-xs">
                    Redemption
                  </Badge>
                )}
                {quest.dueDate && (
                  <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                    Due {formatTimeAgo(quest.dueDate)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="flex flex-col gap-1">
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
            onClick={() => handleQuickAction('view')}
          >
            <Eye size={18} />
            View Details
          </button>
          {quest.status !== 'completed' && quest.status !== 'failed' && (
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
              onClick={() => handleQuickAction('start')}
            >
              <Play size={18} />
              Start {themeConfig.questLabel}
            </button>
          )}
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
            onClick={() => handleQuickAction('share')}
          >
            <ShareNetwork size={18} />
            Share
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
})
