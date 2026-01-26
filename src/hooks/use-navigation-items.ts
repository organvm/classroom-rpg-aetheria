import { useMemo } from 'react'
import {
  House,
  User,
  BookOpen,
  Target,
  Trophy,
  ChalkboardTeacher,
  ChartBar,
  Handshake
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { Theme, Role, THEME_CONFIGS } from '@/lib/types'

export interface NavigationItem {
  id: string
  label: string
  icon: Icon
  teacherOnly?: boolean
}

/**
 * Returns the list of navigation items for the app sidebar/nav.
 * Filters and labels items based on theme and role.
 */
export function useNavigationItems(theme: Theme, role: Role): NavigationItem[] {
  const themeConfig = THEME_CONFIGS[theme]

  return useMemo(() => {
    const items: NavigationItem[] = [
      { id: 'world-map', label: 'World Map', icon: House },
      { id: 'quests', label: `${themeConfig.questLabel}s`, icon: Target },
      { id: 'archives', label: themeConfig.archiveLabel, icon: BookOpen },
      { id: 'character', label: 'My Hero', icon: User },
      { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
      { id: 'voting', label: 'Voting', icon: Handshake },
      { id: 'teacher-dashboard', label: 'Manage', icon: ChalkboardTeacher, teacherOnly: true },
      { id: 'analytics', label: 'Analytics', icon: ChartBar, teacherOnly: true },
    ]

    // Filter out teacher-only items for students
    return role === 'teacher'
      ? items
      : items.filter(item => !item.teacherOnly)
  }, [theme, role, themeConfig.questLabel, themeConfig.archiveLabel])
}
