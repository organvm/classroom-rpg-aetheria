/**
 * Sandbox Mode Utilities
 * 
 * Provides a safe sandbox environment for external users (outsiders) to explore
 * the application without affecting real classroom data.
 * 
 * Sandbox mode features:
 * - Pre-populated demo data
 * - Isolated storage (separate from production data)
 * - Reset functionality
 * - Clear indicators that user is in sandbox mode
 */

import type { Realm, Quest, UserProfile, Submission, KnowledgeCrystal } from './types'
import { DEFAULT_AVATAR } from './avatar-options'

export const SANDBOX_MODE_KEY = 'aetheria-sandbox-mode'
export const SANDBOX_DATA_VERSION = '1.0.0'

/**
 * Check if sandbox mode is currently active
 */
export function isSandboxMode(): boolean {
  // Check URL parameter (only in browser environment)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('sandbox') === 'true' || urlParams.get('demo') === 'true') {
      return true
    }
  }
  
  // Check localStorage (only in browser environment)
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(SANDBOX_MODE_KEY)
    return stored === 'true'
  }
  
  return false
}

/**
 * Enable sandbox mode
 */
export function enableSandboxMode(): void {
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage not available - cannot enable sandbox mode')
    return
  }
  localStorage.setItem(SANDBOX_MODE_KEY, 'true')
  console.log('🏖️ Sandbox mode enabled - You are exploring with demo data')
}

/**
 * Disable sandbox mode
 */
export function disableSandboxMode(): void {
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage not available - cannot disable sandbox mode')
    return
  }
  localStorage.removeItem(SANDBOX_MODE_KEY)
  console.log('✅ Sandbox mode disabled - Returning to normal mode')
}

/**
 * Toggle sandbox mode
 */
export function toggleSandboxMode(): boolean {
  const current = isSandboxMode()
  if (current) {
    disableSandboxMode()
  } else {
    enableSandboxMode()
  }
  return !current
}

/**
 * Get sandbox-aware storage key
 * In sandbox mode, prepends 'sandbox-' to all keys to isolate data
 */
export function getSandboxKey(key: string): string {
  return isSandboxMode() ? `sandbox-${key}` : key
}

/**
 * Reset sandbox data to default demo state
 */
export function resetSandboxData(): void {
  if (!isSandboxMode()) {
    console.warn('Cannot reset sandbox data when not in sandbox mode')
    return
  }
  
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage not available - cannot reset sandbox data')
    return
  }
  
  // Clear all sandbox keys
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('sandbox-')) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key))
  
  console.log('🔄 Sandbox data reset to defaults')
}

/**
 * Get demo/sample realms for sandbox mode
 */
export function getDemoRealms(): Realm[] {
  return [
    {
      id: 'realm-demo-1',
      name: 'Mathematics Archipelago',
      description: 'A mystical chain of islands where numbers come alive and equations dance in the wind. Master the ancient arts of algebra and geometry.',
      difficulty: 'beginner',
      color: '#3b82f6',
      xpReward: 100,
      icon: '🏝️',
      questIds: ['quest-demo-1', 'quest-demo-2']
    },
    {
      id: 'realm-demo-2',
      name: 'Science Citadel',
      description: 'A towering fortress of discovery where physics, chemistry, and biology converge. Conduct experiments and unlock the secrets of the natural world.',
      difficulty: 'intermediate',
      color: '#10b981',
      xpReward: 200,
      icon: '🔬',
      questIds: ['quest-demo-3']
    },
    {
      id: 'realm-demo-3',
      name: 'Literature Labyrinth',
      description: 'An ever-shifting maze of stories and poems. Navigate through classic tales and modern narratives to find your way to literary mastery.',
      difficulty: 'advanced',
      color: '#8b5cf6',
      xpReward: 300,
      icon: '📚',
      questIds: ['quest-demo-4']
    }
  ]
}

/**
 * Get demo/sample quests for sandbox mode
 */
export function getDemoQuests(): Quest[] {
  return [
    {
      id: 'quest-demo-1',
      realmId: 'realm-demo-1',
      title: 'The Equation Enigma',
      description: 'Ancient scrolls have been discovered containing mysterious equations. Solve them to unlock the first portal of the Mathematics Archipelago.',
      difficulty: 'beginner',
      xpReward: 50,
      objectives: [
        'Solve the quadratic equation: x² - 5x + 6 = 0',
        'Find the slope of the line passing through (2,3) and (4,7)',
        'Calculate the area of a circle with radius 5'
      ],
      status: 'available',
      type: 'learning',
      unlockConditions: []
    },
    {
      id: 'quest-demo-2',
      realmId: 'realm-demo-1',
      title: 'Geometric Guardians',
      description: 'Three geometric guardians block your path. Answer their riddles about shapes, angles, and transformations to proceed.',
      difficulty: 'beginner',
      xpReward: 75,
      objectives: [
        'Calculate the sum of interior angles in a pentagon',
        'Identify the transformation: reflecting over the x-axis',
        'Find the volume of a cube with side length 4'
      ],
      status: 'locked',
      type: 'challenge',
      unlockConditions: ['quest-demo-1']
    },
    {
      id: 'quest-demo-3',
      realmId: 'realm-demo-2',
      title: 'Chemistry Conundrum',
      description: 'The Citadel\'s laboratory needs your help! Balance chemical equations and identify compounds to restore order to the Science Citadel.',
      difficulty: 'intermediate',
      xpReward: 100,
      objectives: [
        'Balance the equation: H₂ + O₂ → H₂O',
        'Identify the compound with formula NaCl',
        'Explain the process of photosynthesis'
      ],
      status: 'available',
      type: 'learning',
      unlockConditions: []
    },
    {
      id: 'quest-demo-4',
      realmId: 'realm-demo-3',
      title: 'Tale of Two Poets',
      description: 'Compare and contrast two famous poems from different eras. Analyze their themes, structures, and historical contexts.',
      difficulty: 'advanced',
      xpReward: 150,
      objectives: [
        'Identify the rhyme scheme of a Shakespearean sonnet',
        'Analyze the use of metaphor in "The Road Not Taken"',
        'Compare themes between classical and modern poetry'
      ],
      status: 'available',
      type: 'essay',
      unlockConditions: []
    }
  ]
}

/**
 * Get demo user profile for sandbox mode
 */
export function getDemoProfile(): UserProfile {
  return {
    id: 'demo-user-1',
    name: 'Explorer',
    role: 'student',
    xp: 125,
    level: 2,
    artifacts: [
      {
        id: 'artifact-demo-1',
        name: 'Beginner\'s Compass',
        description: 'A mystical compass that guides new adventurers through their first quests.',
        rarity: 'common',
        questId: 'quest-demo-1',
        earnedAt: Date.now() - 24 * 60 * 60 * 1000 // 1 day ago
      }
    ],
    avatar: DEFAULT_AVATAR
  }
}

/**
 * Get demo submissions for sandbox mode
 */
export function getDemoSubmissions(): Submission[] {
  return [
    {
      id: 'submission-demo-1',
      questId: 'quest-demo-1',
      studentId: 'demo-user-1',
      content: 'Solutions:\n1. x = 2 or x = 3\n2. slope = 2\n3. area ≈ 78.54 square units',
      submittedAt: Date.now() - 24 * 60 * 60 * 1000,
      status: 'evaluated',
      score: 95,
      feedback: 'Excellent work! All solutions are correct and well-explained.',
      evaluatedAt: Date.now() - 23 * 60 * 60 * 1000
    }
  ]
}

/**
 * Get demo knowledge crystals for sandbox mode
 */
export function getDemoCrystals(): KnowledgeCrystal[] {
  return [
    {
      id: 'crystal-demo-1',
      title: 'Quadratic Mastery',
      content: 'You have mastered the art of solving quadratic equations! Remember: use the quadratic formula x = (-b ± √(b²-4ac)) / 2a',
      questId: 'quest-demo-1',
      createdAt: Date.now() - 23 * 60 * 60 * 1000,
      rarity: 'rare'
    }
  ]
}

/**
 * Initialize sandbox data if needed
 */
export function initializeSandboxData(): {
  realms: Realm[]
  quests: Quest[]
  profile: UserProfile
  submissions: Submission[]
  crystals: KnowledgeCrystal[]
} {
  if (!isSandboxMode()) {
    throw new Error('Cannot initialize sandbox data when not in sandbox mode')
  }
  
  return {
    realms: getDemoRealms(),
    quests: getDemoQuests(),
    profile: getDemoProfile(),
    submissions: getDemoSubmissions(),
    crystals: getDemoCrystals()
  }
}

/**
 * Get sandbox banner message
 */
export function getSandboxBanner(): string {
  return '🏖️ SANDBOX MODE: You are exploring with demo data. Changes will not affect real classrooms.'
}

/**
 * Check if data needs initialization in sandbox mode
 */
export function needsSandboxInitialization(): boolean {
  if (!isSandboxMode()) {
    return false
  }
  
  if (typeof localStorage === 'undefined') {
    return false
  }
  
  // Check if sandbox data exists
  const hasRealms = localStorage.getItem(getSandboxKey('aetheria-realms'))
  const hasQuests = localStorage.getItem(getSandboxKey('aetheria-quests'))
  
  return !hasRealms || !hasQuests
}
