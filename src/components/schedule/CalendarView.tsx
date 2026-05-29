import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CaretLeft, CaretRight, CalendarBlank } from '@phosphor-icons/react'
import type { Quest, Theme } from '@/lib/types'
import { THEME_CONFIGS } from '@/lib/types'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CalendarViewProps {
  quests: Quest[]
  theme: Theme
  onQuestClick?: (questId: string) => void
}

export function CalendarView({ quests, theme, onQuestClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const themeConfig = THEME_CONFIGS[theme]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const questsByDate = new Map<string, Quest[]>()
  quests.forEach((quest) => {
    if (quest.dueDate) {
      const date = new Date(quest.dueDate)
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      if (!questsByDate.has(key)) {
        questsByDate.set(key, [])
      }
      questsByDate.get(key)?.push(quest)
    }
  })

  const getQuestsForDay = (day: number) => {
    const key = `${year}-${month}-${day}`
    return questsByDate.get(key) || []
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const days: React.ReactElement[] = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayQuests = getQuestsForDay(day)
    const isToday = 
      day === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear()

    days.push(
      <motion.div
        key={day}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: day * 0.01 }}
      >
        <Card
          className={cn(
            'glass-panel p-2 aspect-square flex flex-col hover:scale-105 transition-all cursor-pointer',
            isToday && 'ring-2 ring-primary'
          )}
        >
          <div className={cn(
            'text-sm font-semibold mb-1',
            isToday && 'text-primary'
          )}>
            {day}
          </div>
          <div className="flex-1 overflow-hidden space-y-1">
            {dayQuests.slice(0, 3).map((quest) => (
              <motion.div
                key={quest.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => onQuestClick?.(quest.id)}
                className={cn(
                  'text-xs px-1 py-0.5 rounded truncate cursor-pointer',
                  quest.status === 'completed' && 'bg-primary/20 text-primary',
                  quest.status === 'failed' && 'bg-destructive/20 text-destructive',
                  (quest.status === 'available' || quest.status === 'in_progress') && 'bg-accent/20 text-accent-foreground'
                )}
              >
                {quest.name}
              </motion.div>
            ))}
            {dayQuests.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{dayQuests.length - 3} more
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarBlank size={32} weight="fill" className="text-primary" />
          <h2 className="text-2xl font-bold">
            {themeConfig.questLabel} Calendar
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <CaretLeft size={20} weight="bold" />
          </Button>
          <div className="text-lg font-semibold min-w-[180px] text-center">
            {monthNames[month]} {year}
          </div>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <CaretRight size={20} weight="bold" />
          </Button>
        </div>
      </div>

      <Card className="glass-panel p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((name) => (
            <div key={name} className="text-center text-sm font-semibold text-muted-foreground">
              {name}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </Card>

      <Card className="glass-panel p-4">
        <h3 className="font-semibold mb-3">Upcoming Deadlines</h3>
        <div className="space-y-2">
          {quests
            .filter(q => q.dueDate && q.dueDate > Date.now())
            .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
            .slice(0, 5)
            .map((quest) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02, x: 4 }}
                onClick={() => onQuestClick?.(quest.id)}
                className="flex items-center justify-between p-2 glass-panel rounded-lg cursor-pointer"
              >
                <div>
                  <div className="font-medium">{quest.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {quest.dueDate && new Date(quest.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <div className={cn(
                  'px-2 py-1 rounded text-xs font-semibold',
                  quest.status === 'completed' && 'bg-primary/20 text-primary',
                  quest.status === 'available' && 'bg-accent/20 text-accent-foreground'
                )}>
                  {quest.xpValue} {themeConfig.xpLabel}
                </div>
              </motion.div>
            ))}
          {quests.filter(q => q.dueDate && q.dueDate > Date.now()).length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No upcoming deadlines
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
