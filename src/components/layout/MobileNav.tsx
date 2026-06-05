import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  House,
  User,
  Target,
  Trophy,
  List,
  Sparkle,
  ArrowsClockwise,
  Palette
} from '@phosphor-icons/react'
import { Theme, Role, THEME_CONFIGS } from '@/lib/types'
import { UserProfile } from '@/lib/types'
import { motion } from 'framer-motion'
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay'
import { DEFAULT_AVATAR } from '@/lib/avatar-options'
import { SoundSettings } from '@/components/settings/SoundSettings'
import { NotificationCenter } from '@/components/feedback/NotificationCenter'
import { useNavigationItems } from '@/hooks/use-navigation-items'
import { usePlayerStats } from '@/hooks/use-player-stats'

interface MobileNavProps {
  profile: UserProfile
  theme: Theme
  role: Role
  currentView: string
  onNavigate: (view: string) => void
  onThemeChange: () => void
  onRoleToggle: () => void
}

export function MobileNav({
  profile,
  theme,
  role,
  currentView,
  onNavigate,
  onThemeChange,
  onRoleToggle
}: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const themeConfig = THEME_CONFIGS[theme]
  const navItems = useNavigationItems(theme, role)
  const { level, levelTitle, xpProgress, xpInCurrentLevel, xpNeededForLevel, xpToNextLevel } = usePlayerStats(profile, role)

  const handleNavigate = (view: string) => {
    onNavigate(view)
    setOpen(false)
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <div className="glass-panel rounded-none border-b-2 border-t-0 border-x-0 p-3">
          <div className="flex items-center justify-between">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <List size={24} weight="bold" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 glass-panel border-r-2 p-0">
                <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  </SheetHeader>
                  
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 border-2 border-primary shadow-lg rounded-full overflow-hidden bg-card">
                        <AvatarDisplay 
                          avatar={profile.avatar || DEFAULT_AVATAR} 
                          size="md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{profile.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs gap-1">
                            <Sparkle size={12} weight="fill" className="text-accent" />
                            Lvl {level}
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate">{levelTitle}</span>
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
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {xpToNextLevel} {themeConfig.xpLabel} to level {level + 1}
                      </div>
                    </div>

                    {profile.artifacts.length > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Trophy size={14} className="text-accent" />
                        <span>{profile.artifacts.length} artifact{profile.artifacts.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </motion.div>

                  <Separator className="bg-border" />

                  <nav className="space-y-2 flex-1">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = currentView === item.id
                      return (
                        <Button
                          key={item.id}
                          variant={isActive ? 'default' : 'ghost'}
                          className="w-full justify-start gap-3"
                          onClick={() => handleNavigate(item.id)}
                        >
                          <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                          {item.label}
                        </Button>
                      )
                    })}
                  </nav>

                  <Separator className="bg-border" />

                  <div className="space-y-2">
                    <SoundSettings />
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                      onClick={onThemeChange}
                    >
                      <Palette size={20} />
                      Reality: {themeConfig.name}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                      onClick={onRoleToggle}
                    >
                      <ArrowsClockwise size={20} />
                      Switch to {role === 'teacher' ? 'Student' : role === 'student' ? 'Parent' : 'Teacher'}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 border-2 border-primary shadow-lg rounded-full overflow-hidden bg-card">
                <AvatarDisplay 
                  avatar={profile.avatar || DEFAULT_AVATAR} 
                  size="sm"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold truncate max-w-[120px]">{profile.name}</span>
                <span className="text-xs text-muted-foreground">Lvl {level}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <NotificationCenter />
              <Badge variant="outline" className="text-xs">
                {profile.artifacts.length}
                <Trophy size={12} className="ml-1" />
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="glass-panel rounded-none border-t-2 border-b-0 border-x-0 p-2">
          <div className="flex items-center justify-around">
            <Button
              variant={currentView === 'world-map' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onNavigate('world-map')}
              className="flex flex-col h-auto py-2 px-3 gap-1"
            >
              <House size={20} weight={currentView === 'world-map' ? 'fill' : 'regular'} />
              <span className="text-xs">Map</span>
            </Button>
            <Button
              variant={currentView === 'quests' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onNavigate('quests')}
              className="flex flex-col h-auto py-2 px-3 gap-1"
            >
              <Target size={20} weight={currentView === 'quests' ? 'fill' : 'regular'} />
              <span className="text-xs">Quests</span>
            </Button>
            <Button
              variant={currentView === 'character' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onNavigate('character')}
              className="flex flex-col h-auto py-2 px-3 gap-1"
            >
              <User size={20} weight={currentView === 'character' ? 'fill' : 'regular'} />
              <span className="text-xs">Hero</span>
            </Button>
            <Button
              variant={currentView === 'leaderboard' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onNavigate('leaderboard')}
              className="flex flex-col h-auto py-2 px-3 gap-1"
            >
              <Trophy size={20} weight={currentView === 'leaderboard' ? 'fill' : 'regular'} />
              <span className="text-xs">Ranks</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
