import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sword, Brain, Shield, GraduationCap, ArrowsClockwise, Palette, Trophy, Sparkle } from '@phosphor-icons/react'
import { Theme, Role, THEME_CONFIGS } from '@/lib/types'
import { UserProfile } from '@/lib/types'
import { motion } from 'framer-motion'
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay'
import { DEFAULT_AVATAR } from '@/lib/avatar-options'
import { SoundSettings } from '@/components/settings/SoundSettings'
import { NotificationCenter } from '@/components/feedback/NotificationCenter'
import { useNavigationItems } from '@/hooks/use-navigation-items'
import { usePlayerStats } from '@/hooks/use-player-stats'
import { useMotionConfig } from '@/hooks/use-reduced-motion'

interface HUDSidebarProps {
  profile: UserProfile
  theme: Theme
  role: Role
  currentView: string
  onNavigate: (view: string) => void
  onThemeChange: () => void
  onRoleToggle: () => void
}

export function HUDSidebar({
  profile,
  theme,
  role,
  currentView,
  onNavigate,
  onThemeChange,
  onRoleToggle
}: HUDSidebarProps) {
  const themeConfig = THEME_CONFIGS[theme]
  const navItems = useNavigationItems(theme, role)
  const { level, levelTitle, xpProgress, xpInCurrentLevel, xpNeededForLevel, xpToNextLevel } = usePlayerStats(profile, role)
  const { shouldAnimate, animationProps } = useMotionConfig()

  const RoleIcon = theme === 'fantasy' ? Sword :
                   theme === 'scifi' ? Brain :
                   theme === 'medieval' ? Shield :
                   GraduationCap

  return (
    <div className="hidden md:flex w-80 h-screen glass-panel rounded-none border-r-2 border-l-0 border-t-0 border-b-0 flex-col p-6 space-y-6 overflow-y-auto">
      <motion.div
        className="space-y-4"
        initial={shouldAnimate ? { opacity: 0, y: -20 } : false}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
        transition={shouldAnimate ? { duration: 0.5 } : { duration: 0 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={shouldAnimate ? { scale: 1.05, rotate: [0, -5, 5, 0] } : undefined}
            transition={shouldAnimate ? { duration: 0.3 } : { duration: 0 }}
          >
            <div className="w-16 h-16 border-2 border-primary shadow-lg rounded-full overflow-hidden bg-card">
              <AvatarDisplay
                avatar={profile.avatar || DEFAULT_AVATAR}
                size="md"
              />
            </div>
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{profile.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1">
                <Sparkle size={12} weight="fill" className="text-accent" />
                Lvl {level}
              </Badge>
              <span className="text-xs text-muted-foreground">{levelTitle}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{themeConfig.xpLabel}</span>
            <span className="font-medium">{xpInCurrentLevel} / {xpNeededForLevel}</span>
          </div>
          <div className="relative">
            <Progress value={xpProgress} className="h-3" />
            {shouldAnimate && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            )}
          </div>
          <div className="text-xs text-muted-foreground text-right">
            {xpToNextLevel} {themeConfig.xpLabel} to level {level + 1}
          </div>
        </div>

        {profile.artifacts.length > 0 && (
          <motion.div
            className="text-xs text-muted-foreground flex items-center gap-2"
            initial={shouldAnimate ? { opacity: 0 } : false}
            animate={shouldAnimate ? { opacity: 1 } : false}
            transition={shouldAnimate ? { delay: 0.3 } : { duration: 0 }}
          >
            <Trophy size={14} className="text-accent" />
            <span>{profile.artifacts.length} artifact{profile.artifacts.length !== 1 ? 's' : ''} collected</span>
          </motion.div>
        )}
      </motion.div>

      <Separator className="bg-border" />

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <motion.div
              key={item.id}
              whileHover={shouldAnimate ? { scale: 1.02 } : undefined}
              whileTap={shouldAnimate ? { scale: 0.98 } : undefined}
              initial={item.teacherOnly && shouldAnimate ? { opacity: 0, x: -20 } : undefined}
              animate={item.teacherOnly && shouldAnimate ? { opacity: 1, x: 0 } : undefined}
            >
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start gap-3"
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                {item.label}
              </Button>
            </motion.div>
          )
        })}
      </nav>

      <Separator className="bg-border" />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <motion.div whileHover={shouldAnimate ? { scale: 1.02 } : undefined} whileTap={shouldAnimate ? { scale: 0.98 } : undefined} className="flex-1">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={onRoleToggle}
            >
              <RoleIcon size={20} />
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground">Playing as</span>
                <span className="font-medium">
                  {role === 'teacher' ? themeConfig.teacherTitle : themeConfig.studentTitle}
                </span>
              </div>
              <ArrowsClockwise size={16} className="ml-auto" />
            </Button>
          </motion.div>
          <motion.div whileHover={shouldAnimate ? { scale: 1.05 } : undefined} whileTap={shouldAnimate ? { scale: 0.95 } : undefined}>
            <NotificationCenter />
          </motion.div>
          <motion.div whileHover={shouldAnimate ? { scale: 1.05 } : undefined} whileTap={shouldAnimate ? { scale: 0.95 } : undefined}>
            <SoundSettings />
          </motion.div>
        </div>

        <motion.div whileHover={shouldAnimate ? { scale: 1.02 } : undefined} whileTap={shouldAnimate ? { scale: 0.98 } : undefined}>
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={onThemeChange}
          >
            <Palette size={20} weight="fill" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground">Reality</span>
              <span className="font-medium">{themeConfig.name}</span>
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
