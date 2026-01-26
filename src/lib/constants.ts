/**
 * Game constants for the Classroom RPG Aetheria platform.
 * Centralizes magic numbers for consistency and maintainability.
 */

// Quest scoring thresholds
export const QUEST_PASS_THRESHOLD = 70
export const ARTIFACT_THRESHOLD = 90

// Rarity thresholds based on quest score
export const RARITY_THRESHOLDS = {
  legendary: 98,
  epic: 95,
  rare: 90,
} as const

// XP level thresholds - each index represents the XP required for that level
export const XP_LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000] as const

// Redemption quest XP multiplier (50% of original quest XP)
export const REDEMPTION_XP_MULTIPLIER = 0.5

// Quest XP value constraints
export const MIN_QUEST_XP = 10
export const MAX_QUEST_XP = 1000
export const DEFAULT_QUEST_XP = 100

// LLM retry configuration
export const LLM_MAX_RETRIES = 3
export const LLM_RETRY_DELAY_MS = 2000
export const LLM_TIMEOUT_MS = 30000 // 30 seconds max per LLM call

// Input validation constraints
export const NAME_MIN_LENGTH = 3
export const NAME_MAX_LENGTH = 100
export const DESCRIPTION_MIN_LENGTH = 10
export const DESCRIPTION_MAX_LENGTH = 2000
export const QUEST_CONTENT_MAX_LENGTH = 5000
export const IMPORT_FILE_MAX_SIZE = 1024 * 1024 // 1MB in bytes
