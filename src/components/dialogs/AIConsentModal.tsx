/**
 * AI Consent Modal
 *
 * Displays AI feature consent information and collects user acceptance.
 * Required before using AI-powered features like feedback generation.
 * Integrates with useAIConsent hook for persistent consent management.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Brain, ShieldCheck, Eye, Flag, Lightning, BookOpen, Lightbulb, ArrowsClockwise, Sparkle } from '@phosphor-icons/react'
import { useAIConsent, AI_FEATURES, type AIFeature } from '@/hooks/use-ai-consent'
import type { Theme } from '@/lib/types'
import { useMotionConfig } from '@/hooks/use-reduced-motion'

interface AIConsentModalProps {
  open: boolean
  theme?: Theme
  onAccept?: () => void
  onDecline?: () => void
  /** Specific features to request consent for (defaults to all) */
  requestedFeatures?: AIFeature[]
}

/** Map feature values to icons */
const FEATURE_ICONS: Record<AIFeature, typeof Lightning> = {
  'quest-evaluation': Lightning,
  'knowledge-crystals': BookOpen,
  'feedback-generation': Lightbulb,
  'redemption-quests': ArrowsClockwise,
  'content-suggestions': Sparkle
}

export function AIConsentModal({
  open,
  theme = 'fantasy',
  onAccept,
  onDecline,
  requestedFeatures
}: AIConsentModalProps) {
  const { grantConsent } = useAIConsent()
  const [hasReadTerms, setHasReadTerms] = useState(false)
  const [selectedFeatures, setSelectedFeatures] = useState<AIFeature[]>(
    requestedFeatures || AI_FEATURES.map(f => f.value)
  )
  const { shouldAnimate } = useMotionConfig()

  // Privacy and data handling information
  const privacyInfo = [
    {
      icon: ShieldCheck,
      title: 'Data Anonymization',
      description: 'Your data is always anonymized. Personal information is never used for AI training.'
    },
    {
      icon: Eye,
      title: 'Improved Suggestions',
      description: 'This helps us understand which suggestions are helpful and refine our AI models.'
    },
    {
      icon: Flag,
      title: 'User Control',
      description: 'You are always in control and can flag any inaccurate AI suggestions.'
    }
  ]

  // Available features for consent
  const availableFeatures = requestedFeatures
    ? AI_FEATURES.filter(f => requestedFeatures.includes(f.value))
    : AI_FEATURES

  const handleFeatureToggle = (feature: AIFeature, checked: boolean) => {
    if (checked) {
      setSelectedFeatures(prev => [...prev, feature])
    } else {
      setSelectedFeatures(prev => prev.filter(f => f !== feature))
    }
  }

  const handleSelectAll = () => {
    setSelectedFeatures(availableFeatures.map(f => f.value))
  }

  const handleAccept = () => {
    if (hasReadTerms && selectedFeatures.length > 0) {
      grantConsent(selectedFeatures)
      onAccept?.()
    }
  }

  const handleDecline = () => {
    onDecline?.()
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="glass-panel max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Brain size={28} className="text-primary" weight="fill" />
            </div>
            <DialogTitle className="text-2xl">AI Feature Consent</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            To improve our AI-powered features like feedback generation and content
            suggestions, we need your consent to use anonymized data from your
            interactions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Privacy Information */}
          <AnimatePresence>
            {privacyInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={shouldAnimate ? { opacity: 0, x: -20 } : false}
                animate={shouldAnimate ? { opacity: 1, x: 0 } : false}
                transition={shouldAnimate ? { delay: index * 0.1 } : { duration: 0 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <info.icon
                  size={20}
                  className="text-primary flex-shrink-0 mt-0.5"
                  weight="fill"
                />
                <div>
                  <p className="font-medium text-sm">{info.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {info.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Feature Selection */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">Select AI Features to Enable:</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs h-7"
              >
                Select All
              </Button>
            </div>

            <AnimatePresence>
              {availableFeatures.map((feature, index) => {
                const Icon = FEATURE_ICONS[feature.value]
                const isSelected = selectedFeatures.includes(feature.value)

                return (
                  <motion.div
                    key={feature.value}
                    initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                    animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
                    transition={shouldAnimate ? { delay: 0.3 + index * 0.05 } : { duration: 0 }}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${shouldAnimate ? 'transition-colors' : ''} cursor-pointer ${
                      isSelected
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    }`}
                    onClick={() => handleFeatureToggle(feature.value, !isSelected)}
                  >
                    <Checkbox
                      id={`feature-${feature.value}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleFeatureToggle(feature.value, checked === true)}
                      className="mt-0.5"
                    />
                    <Icon
                      size={18}
                      className={`flex-shrink-0 mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                      weight={isSelected ? 'fill' : 'regular'}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`feature-${feature.value}`}
                        className="font-medium text-sm cursor-pointer"
                      >
                        {feature.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Terms Acknowledgement */}
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="consent-checkbox"
              checked={hasReadTerms}
              onCheckedChange={(checked) => setHasReadTerms(checked === true)}
            />
            <Label
              htmlFor="consent-checkbox"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              I have read and understand the above information
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onDecline && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDecline}
              >
                Decline
              </Button>
            )}
            <Button
              className="flex-1"
              disabled={!hasReadTerms || selectedFeatures.length === 0}
              onClick={handleAccept}
            >
              {selectedFeatures.length === 0
                ? 'Select Features to Continue'
                : `Enable ${selectedFeatures.length} Feature${selectedFeatures.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
