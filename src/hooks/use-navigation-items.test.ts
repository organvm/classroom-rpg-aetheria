import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useNavigationItems } from './use-navigation-items'

describe('useNavigationItems', () => {
  describe('for students', () => {
    it('should return navigation items without teacher-only items', () => {
      const { result } = renderHook(() => useNavigationItems('fantasy', 'student'))

      const ids = result.current.map(item => item.id)
      expect(ids).toContain('world-map')
      expect(ids).toContain('quests')
      expect(ids).toContain('archives')
      expect(ids).toContain('character')
      expect(ids).toContain('leaderboard')
      expect(ids).not.toContain('teacher-dashboard')
      expect(ids).not.toContain('analytics')
    })

    it('should return 6 items for students', () => {
      const { result } = renderHook(() => useNavigationItems('fantasy', 'student'))
      expect(result.current.length).toBe(6)
    })

    it('should include voting for students', () => {
      const { result } = renderHook(() => useNavigationItems('fantasy', 'student'))
      const ids = result.current.map(item => item.id)
      expect(ids).toContain('voting')
    })
  })

  describe('for teachers', () => {
    it('should include teacher-only items', () => {
      const { result } = renderHook(() => useNavigationItems('fantasy', 'teacher'))

      const ids = result.current.map(item => item.id)
      expect(ids).toContain('teacher-dashboard')
      expect(ids).toContain('analytics')
    })

    it('should return 8 items for teachers', () => {
      const { result } = renderHook(() => useNavigationItems('fantasy', 'teacher'))
      expect(result.current.length).toBe(8)
    })
  })

  describe('theme-specific labels', () => {
    it('should use fantasy theme labels', () => {
      const { result } = renderHook(() => useNavigationItems('fantasy', 'student'))

      const questsItem = result.current.find(item => item.id === 'quests')
      expect(questsItem?.label).toBe('Quests')

      const archivesItem = result.current.find(item => item.id === 'archives')
      expect(archivesItem?.label).toBe('Archives')
    })

    it('should use scifi theme labels', () => {
      const { result } = renderHook(() => useNavigationItems('scifi', 'student'))

      const questsItem = result.current.find(item => item.id === 'quests')
      expect(questsItem?.label).toBe('Missions')

      const archivesItem = result.current.find(item => item.id === 'archives')
      expect(archivesItem?.label).toBe('Database')
    })

    it('should use medieval theme labels', () => {
      const { result } = renderHook(() => useNavigationItems('medieval', 'student'))

      const questsItem = result.current.find(item => item.id === 'quests')
      expect(questsItem?.label).toBe('Decrees')

      const archivesItem = result.current.find(item => item.id === 'archives')
      expect(archivesItem?.label).toBe('Library')
    })

    it('should use modern theme labels', () => {
      const { result } = renderHook(() => useNavigationItems('modern', 'student'))

      const questsItem = result.current.find(item => item.id === 'quests')
      expect(questsItem?.label).toBe('Assignments')

      const archivesItem = result.current.find(item => item.id === 'archives')
      expect(archivesItem?.label).toBe('Resources')
    })
  })

  describe('navigation item structure', () => {
    it('should have required properties on each item', () => {
      const { result } = renderHook(() => useNavigationItems('fantasy', 'student'))

      result.current.forEach(item => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('label')
        expect(item).toHaveProperty('icon')
        expect(typeof item.id).toBe('string')
        expect(typeof item.label).toBe('string')
      })
    })
  })
})
