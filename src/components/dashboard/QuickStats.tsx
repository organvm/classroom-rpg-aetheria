import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Target, CheckCircle, XCircle, Trophy } from '@phosphor-icons/react'
import { Theme, THEME_CONFIGS } from '@/lib/types'

interface QuickStatsProps {
  totalQuests: number
  completedQuests: number
  failedQuests: number
  totalArtifacts: number
  theme: Theme
}

export function QuickStats({ totalQuests, completedQuests, failedQuests, totalArtifacts, theme }: QuickStatsProps) {
  const themeConfig = THEME_CONFIGS[theme]
  const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0

  const stats = [
    {
      label: `Total ${themeConfig.questLabel}s`,
      value: totalQuests,
      icon: Target,
      color: 'text-primary'
    },
    {
      label: 'Completed',
      value: completedQuests,
      icon: CheckCircle,
      color: 'text-accent'
    },
    {
      label: 'Failed',
      value: failedQuests,
      icon: XCircle,
      color: 'text-destructive'
    },
    {
      label: 'Artifacts',
      value: totalArtifacts,
      icon: Trophy,
      color: 'text-accent'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="glass-panel p-4 hover:scale-105 transition-all">
            <div className="flex items-center gap-3">
              <stat.icon size={24} className={stat.color} weight="fill" />
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground truncate">{stat.label}</div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
