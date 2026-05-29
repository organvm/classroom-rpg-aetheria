/**
 * Notification Center Component
 *
 * Bell icon with unread badge that opens a popover showing notification list.
 * Provides mark as read, dismiss, and mark all as read functionality.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useNotifications, NotificationType } from '@/hooks/use-notifications'
import {
  Bell,
  BellRinging,
  CheckCircle,
  Trophy,
  Handshake,
  ArrowUp,
  Info,
  Check,
  X,
  Trash
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const NOTIFICATION_ICONS: Record<NotificationType, typeof Bell> = {
  'quest-graded': CheckCircle,
  'achievement-earned': Trophy,
  'vote-cast': Handshake,
  'vote-decided': CheckCircle,
  'level-up': ArrowUp,
  info: Info
}

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  'quest-graded': 'text-purple-500',
  'achievement-earned': 'text-yellow-500',
  'vote-cast': 'text-amber-500',
  'vote-decided': 'text-green-500',
  'level-up': 'text-blue-500',
  info: 'text-muted-foreground'
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll
  } = useNotifications()

  const hasUnread = unreadCount > 0

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative glass-button"
          aria-label={`Notifications${hasUnread ? ` (${unreadCount} unread)` : ''}`}
        >
          {hasUnread ? (
            <BellRinging size={20} weight="fill" className="text-accent" />
          ) : (
            <Bell size={20} />
          )}
          {hasUnread && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground font-medium"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 glass-panel" align="end" sideOffset={8}>
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <div className="flex items-center gap-1">
              {hasUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={markAllAsRead}
                >
                  <Check size={12} className="mr-1" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={clearAll}
                  aria-label="Clear all notifications"
                >
                  <Trash size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
              <p className="text-xs mt-1">You're all caught up!</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => {
                const Icon = NOTIFICATION_ICONS[notification.type]
                const iconColor = NOTIFICATION_COLORS[notification.type]

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={cn(
                      'p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors',
                      !notification.read && 'bg-primary/5'
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn('mt-0.5 flex-shrink-0', iconColor)}>
                        <Icon
                          size={18}
                          weight={notification.read ? 'regular' : 'fill'}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p
                              className={cn(
                                'text-sm truncate',
                                !notification.read && 'font-medium'
                              )}
                            >
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => markAsRead(notification.id)}
                                aria-label="Mark as read"
                              >
                                <Check size={12} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => dismissNotification(notification.id)}
                              aria-label="Dismiss notification"
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(notification.timestamp, {
                              addSuffix: true
                            })}
                          </span>
                          {!notification.read && (
                            <Badge
                              variant="secondary"
                              className="h-4 text-[10px] px-1"
                            >
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 text-center">
              <span className="text-[10px] text-muted-foreground">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                {hasUnread && ` (${unreadCount} unread)`}
              </span>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
