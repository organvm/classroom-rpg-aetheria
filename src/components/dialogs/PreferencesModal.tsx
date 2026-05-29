/**
 * Preferences Modal Component
 *
 * Allows students to set their personalization preferences.
 */

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { ThematicInterest, LearningStyle, StudentPreferences } from '@/lib/types'
import { THEMATIC_INTERESTS } from '@/lib/types'
import { Sparkle, FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PreferencesModalProps {
  open: boolean
  currentPreferences?: StudentPreferences
  onClose: () => void
  onSave: (
    primaryInterest: ThematicInterest,
    secondaryInterest?: ThematicInterest,
    learningStyle?: LearningStyle
  ) => void
}

const LEARNING_STYLES: { value: LearningStyle; label: string; description: string }[] = [
  { value: 'visual', label: 'Visual', description: 'Learn best through images, diagrams, and charts' },
  { value: 'auditory', label: 'Auditory', description: 'Learn best through listening and discussion' },
  { value: 'kinesthetic', label: 'Kinesthetic', description: 'Learn best through hands-on activities' },
  { value: 'reading', label: 'Reading/Writing', description: 'Learn best through text and written notes' }
]

export function PreferencesModal({
  open,
  currentPreferences,
  onClose,
  onSave
}: PreferencesModalProps) {
  const [primaryInterest, setPrimaryInterest] = useState<ThematicInterest>(
    currentPreferences?.primaryInterest || 'general'
  )
  const [secondaryInterest, setSecondaryInterest] = useState<ThematicInterest | undefined>(
    currentPreferences?.secondaryInterest
  )
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(
    currentPreferences?.learningStyle || 'reading'
  )

  // Reset form when modal opens with new preferences
  useEffect(() => {
    if (open && currentPreferences) {
      setPrimaryInterest(currentPreferences.primaryInterest)
      setSecondaryInterest(currentPreferences.secondaryInterest)
      setLearningStyle(currentPreferences.learningStyle)
    }
  }, [open, currentPreferences])

  const handleSave = () => {
    if (!primaryInterest) {
      toast.error('Please select a primary interest')
      return
    }

    // Don't allow same primary and secondary
    const secondary = secondaryInterest === primaryInterest ? undefined : secondaryInterest

    onSave(primaryInterest, secondary, learningStyle)
    toast.success('Preferences saved!')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Sparkle size={24} weight="fill" className="text-accent" />
            Personalization Settings
          </DialogTitle>
          <DialogDescription>
            Help us personalize your learning experience by sharing your interests.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Primary Interest */}
          <div className="space-y-2">
            <Label htmlFor="primary-interest">
              Primary Interest <span className="text-destructive">*</span>
            </Label>
            <Select
              value={primaryInterest}
              onValueChange={(value) => setPrimaryInterest(value as ThematicInterest)}
            >
              <SelectTrigger id="primary-interest" className="glass-panel">
                <SelectValue placeholder="Select your main interest..." />
              </SelectTrigger>
              <SelectContent>
                {THEMATIC_INTERESTS.map(interest => (
                  <SelectItem key={interest.value} value={interest.value}>
                    <div className="flex flex-col">
                      <span>{interest.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {interest.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Secondary Interest */}
          <div className="space-y-2">
            <Label htmlFor="secondary-interest">
              Secondary Interest <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Select
              value={secondaryInterest || ''}
              onValueChange={(value) =>
                setSecondaryInterest(value ? (value as ThematicInterest) : undefined)
              }
            >
              <SelectTrigger id="secondary-interest" className="glass-panel">
                <SelectValue placeholder="Select a secondary interest..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {THEMATIC_INTERESTS.filter(i => i.value !== primaryInterest).map(interest => (
                  <SelectItem key={interest.value} value={interest.value}>
                    <div className="flex flex-col">
                      <span>{interest.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {interest.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Learning Style */}
          <div className="space-y-3">
            <Label>Learning Style</Label>
            <RadioGroup
              value={learningStyle}
              onValueChange={(value) => setLearningStyle(value as LearningStyle)}
              className="grid grid-cols-2 gap-3"
            >
              {LEARNING_STYLES.map(style => (
                <div key={style.value}>
                  <RadioGroupItem
                    value={style.value}
                    id={`style-${style.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`style-${style.value}`}
                    className="flex flex-col p-3 rounded-lg border cursor-pointer transition-all
                      peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10
                      hover:bg-muted/50"
                  >
                    <span className="font-medium">{style.label}</span>
                    <span className="text-xs text-muted-foreground">{style.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1 gap-2">
              <FloppyDisk size={18} weight="fill" />
              Save Preferences
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
