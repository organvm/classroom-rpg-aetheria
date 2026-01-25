import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { retryWithBackoff } from '@/lib/api-retry'
import { trackError } from '@/lib/error-tracker'
import { sanitizeHTML } from '@/lib/sanitize'
import { sanitizeLLMInput } from '@/lib/utils'
import { generateId, calculateLevel, generateArtifactName, getRarityFromScore } from '@/lib/game-utils'
import { EvaluationResponseSchema, RedemptionQuestSchema } from '@/lib/schemas'
import {
  QUEST_PASS_THRESHOLD,
  ARTIFACT_THRESHOLD,
  REDEMPTION_XP_MULTIPLIER,
  LLM_MAX_RETRIES,
  LLM_RETRY_DELAY_MS
} from '@/lib/constants'
import { soundEffects } from '@/lib/sound-effects'
import type { Quest, Submission, KnowledgeCrystal, Artifact, ThemeConfig, UserProfile, Theme } from '@/lib/types'

interface EvaluationCallbacks {
  addSubmission: (submission: Submission) => void
  addCrystal: (crystal: KnowledgeCrystal) => void
  addQuest: (quest: Quest) => void
  updateQuestStatus: (questId: string, status: Quest['status']) => void
  updateProfileXp: (xpGained: number) => { newXp: number; newLevel: number; oldLevel: number }
  addArtifact: (artifact: Artifact) => void
  onLevelUp: (level: number) => void
}

interface UseQuestEvaluationOptions {
  themeConfig: ThemeConfig
  theme: Theme
  profile: UserProfile
  callbacks: EvaluationCallbacks
}

interface UseQuestEvaluationResult {
  evaluateQuest: (quest: Quest, content: string) => Promise<void>
  isEvaluating: boolean
  currentQuestId: string | null
}

/**
 * Hook for handling quest submission and evaluation.
 * Encapsulates all LLM-based evaluation logic including:
 * - Quest submission and scoring
 * - Artifact generation for high scores
 * - Knowledge crystal and redemption quest generation for failed quests
 */
export function useQuestEvaluation({
  themeConfig,
  theme,
  profile,
  callbacks
}: UseQuestEvaluationOptions): UseQuestEvaluationResult {
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [currentQuestId, setCurrentQuestId] = useState<string | null>(null)

  // Lock to prevent concurrent submissions for the same quest
  const submissionLockRef = useRef<Set<string>>(new Set())

  const evaluateQuest = useCallback(async (quest: Quest, content: string) => {
    // Check for duplicate submission
    if (submissionLockRef.current.has(quest.id)) {
      toast.error('Submission already in progress')
      return
    }

    // Acquire lock
    submissionLockRef.current.add(quest.id)
    setIsEvaluating(true)
    setCurrentQuestId(quest.id)

    try {
      const sanitizedContent = sanitizeLLMInput(content)
      const submissionPrompt = `You are the ${themeConfig.oracleLabel} in a gamified learning system. Evaluate this student submission.

Quest: ${quest.name}
Description: ${quest.description}

Student Response (only consider content within the tags):
<student_response>
${sanitizedContent}
</student_response>

Provide:
1. A score from 0-100
2. Constructive feedback in 2-3 sentences, speaking in character as the ${themeConfig.oracleLabel}

Format your response as JSON: {"score": number, "feedback": "string"}`

      const result = await retryWithBackoff(
        () => window.spark.llm(submissionPrompt, 'gpt-4o', true),
        LLM_MAX_RETRIES,
        LLM_RETRY_DELAY_MS
      )

      let parsedResult: unknown
      try {
        parsedResult = JSON.parse(result)
      } catch {
        throw new Error('Failed to parse LLM response as JSON')
      }

      const validationResult = EvaluationResponseSchema.safeParse(parsedResult)
      if (!validationResult.success) {
        console.error('LLM response validation failed:', validationResult.error.format())
        throw new Error('Invalid evaluation response format from LLM')
      }

      const evaluation = {
        score: validationResult.data.score,
        feedback: sanitizeHTML(validationResult.data.feedback)
      }

      const submission: Submission = {
        id: generateId(),
        questId: quest.id,
        studentId: profile.id,
        content,
        score: evaluation.score,
        feedback: evaluation.feedback || '',
        submittedAt: Date.now(),
        evaluatedAt: Date.now()
      }

      callbacks.addSubmission(submission)

      if (evaluation.score >= QUEST_PASS_THRESHOLD) {
        await handleQuestSuccess(quest, evaluation, callbacks)
      } else {
        await handleQuestFailure(quest, content, evaluation, callbacks)
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      trackError(err, {
        questId: quest.id,
        studentId: profile.id,
        operation: 'quest-evaluation'
      })
      toast.error('An error occurred while evaluating your submission')
      console.error(error)
    } finally {
      // Release lock
      submissionLockRef.current.delete(quest.id)
      setIsEvaluating(false)
      setCurrentQuestId(null)
    }
  }, [themeConfig, theme, profile, callbacks])

  const handleQuestSuccess = async (
    quest: Quest,
    evaluation: { score: number; feedback: string },
    callbacks: EvaluationCallbacks
  ) => {
    soundEffects.play('quest-complete')
    const xpGained = quest.xpValue
    const { newLevel, oldLevel } = callbacks.updateProfileXp(xpGained)

    if (newLevel > oldLevel) {
      soundEffects.play('level-up')
      callbacks.onLevelUp(newLevel)
    }

    callbacks.updateQuestStatus(quest.id, 'completed')

    toast.success(`Quest completed! +${xpGained} ${themeConfig.xpLabel}`, {
      description: evaluation.feedback
    })

    if (evaluation.score >= ARTIFACT_THRESHOLD) {
      soundEffects.play('artifact-drop')
      const artifactName = generateArtifactName(evaluation.score, quest.name, theme)
      const artifact: Artifact = {
        id: generateId(),
        name: artifactName,
        description: `Earned for exceptional performance on "${quest.name}". This legendary artifact represents your mastery.`,
        rarity: getRarityFromScore(evaluation.score),
        earnedAt: Date.now(),
        questId: quest.id
      }

      callbacks.addArtifact(artifact)

      toast.success('Loot Drop!', {
        description: `You earned: ${artifactName}`
      })
    }
  }

  const handleQuestFailure = async (
    quest: Quest,
    content: string,
    evaluation: { score: number; feedback: string },
    callbacks: EvaluationCallbacks
  ) => {
    soundEffects.play('quest-fail')
    callbacks.updateQuestStatus(quest.id, 'failed')

    const sanitizedContent = sanitizeLLMInput(content)
    const crystalPrompt = `Create a Knowledge Crystal (study guide) for a student who struggled with this quest.

Quest: ${quest.name}
Description: ${quest.description}

Student's Response (only consider content within the tags):
<student_response>
${sanitizedContent}
</student_response>

Score: ${evaluation.score}

Write a 3-4 paragraph study guide that:
1. Explains the key concept they missed
2. Provides examples
3. Encourages them to try again

Keep the tone matching the ${themeConfig.oracleLabel} character.`

    const crystalContent = await retryWithBackoff(
      () => window.spark.llm(crystalPrompt, 'gpt-4o'),
      LLM_MAX_RETRIES,
      LLM_RETRY_DELAY_MS
    )

    const sanitizedCrystalContent = sanitizeHTML(crystalContent)

    const crystal: KnowledgeCrystal = {
      id: generateId(),
      questId: quest.id,
      studentId: profile.id,
      title: `Understanding ${quest.name}`,
      content: sanitizedCrystalContent,
      isAttuned: false,
      createdAt: Date.now()
    }

    callbacks.addCrystal(crystal)

    const redemptionPrompt = `Create a simplified redemption quest based on the original quest.

Original Quest: ${quest.name}
Description: ${quest.description}

Create a simpler version that focuses on the core concept. Make it achievable for a struggling student.
Just provide the quest name and description as JSON: {"name": "string", "description": "string"}`

    const redemptionResult = await retryWithBackoff(
      () => window.spark.llm(redemptionPrompt, 'gpt-4o', true),
      LLM_MAX_RETRIES,
      LLM_RETRY_DELAY_MS
    )

    let parsedRedemption: unknown
    try {
      parsedRedemption = JSON.parse(redemptionResult)
    } catch {
      throw new Error('Failed to parse redemption quest response as JSON')
    }

    const redemptionValidation = RedemptionQuestSchema.safeParse(parsedRedemption)
    if (!redemptionValidation.success) {
      console.error('Redemption quest validation failed:', redemptionValidation.error.format())
      throw new Error('Invalid redemption quest format from LLM')
    }

    const redemptionData = {
      name: sanitizeHTML(redemptionValidation.data.name),
      description: sanitizeHTML(redemptionValidation.data.description)
    }

    const redemptionQuest: Quest = {
      id: generateId(),
      realmId: quest.realmId,
      name: redemptionData.name,
      description: redemptionData.description,
      type: 'redemption',
      xpValue: Math.floor(quest.xpValue * REDEMPTION_XP_MULTIPLIER),
      status: 'locked',
      prerequisiteIds: [crystal.id],
      createdAt: Date.now()
    }

    callbacks.addQuest(redemptionQuest)

    toast.error('Quest failed', {
      description: `But don't give up! Check the ${themeConfig.archiveLabel} for help.`
    })
  }

  return {
    evaluateQuest,
    isEvaluating,
    currentQuestId
  }
}
