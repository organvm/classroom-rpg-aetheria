import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Quest, Theme, THEME_CONFIGS, ThematicVariant, StudentPreferences, ThematicInterest } from '@/lib/types'
import { PaperPlaneRight, Sparkle, Star, ArrowSquareOut } from '@phosphor-icons/react'
import { LoadingOracle } from '@/components/feedback/LoadingOracle'
import { toast } from 'sonner'
import { QUEST_CONTENT_MAX_LENGTH } from '@/lib/constants'
import { getSubmissionErrorMessage } from '@/lib/error-messages'

const INTEREST_EMOJIS: Record<ThematicInterest, string> = {
  sports: '\u26BD',
  science: '\uD83D\uDD2C',
  arts: '\uD83C\uDFA8',
  technology: '\uD83D\uDCBB',
  nature: '\uD83C\uDF3F',
  'social-justice': '\u270A',
  business: '\uD83D\uDCCA',
  general: '\uD83D\uDCDA'
}

interface QuestDialogProps {
  quest: Quest | null
  theme: Theme
  open: boolean
  onClose: () => void
  onSubmit: (questId: string, content: string) => Promise<void>
  variants?: ThematicVariant[]
  studentPreferences?: StudentPreferences
  recommendedVariant?: ThematicVariant
}

export function QuestDialog({
  quest,
  theme,
  open,
  onClose,
  onSubmit,
  variants,
  studentPreferences,
  recommendedVariant
}: QuestDialogProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  // Determine which variant to show
  const activeVariant = useMemo(() => {
    if (!variants || variants.length === 0) return null

    // If user selected one, use that
    if (selectedVariantId) {
      return variants.find(v => v.id === selectedVariantId) || null
    }

    // Use recommended variant if available
    if (recommendedVariant) {
      return recommendedVariant
    }

    // Default to general or first variant
    return variants.find(v => v.interestArea === 'general') || variants[0]
  }, [variants, selectedVariantId, recommendedVariant])

  // Check if current variant is recommended
  const isRecommendedActive = activeVariant && recommendedVariant && activeVariant.id === recommendedVariant.id

  if (!quest) return null

  const themeConfig = THEME_CONFIGS[theme]

  const handleSubmit = async () => {
    const trimmedContent = content.trim()

    if (!trimmedContent) {
      toast.error('Please enter your submission')
      return
    }

    if (trimmedContent.length > QUEST_CONTENT_MAX_LENGTH) {
      toast.error(`Submission must be no more than ${QUEST_CONTENT_MAX_LENGTH} characters`)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(quest.id, trimmedContent)
      setContent('')
      toast.success('Submission sent to the ' + themeConfig.oracleLabel)
    } catch (error) {
      const errorDetails = getSubmissionErrorMessage(error)
      toast.error(errorDetails.title, {
        description: errorDetails.description
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isContentTooLong = content.length > QUEST_CONTENT_MAX_LENGTH

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
        <DialogHeader>
          <div className="flex items-center gap-2 md:gap-3">
            <Sparkle size={24} weight="fill" className="md:w-8 md:h-8 text-accent flex-shrink-0" />
            <div className="min-w-0">
              <DialogTitle className="text-lg md:text-2xl truncate">{quest.name}</DialogTitle>
              <DialogDescription className="text-sm md:text-base mt-1">
                {quest.type === 'boss' ? 'Boss Battle' : quest.type === 'redemption' ? 'Redemption Quest' : 'Standard Quest'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 mt-4">
          {/* Variant Selector - only show if variants exist */}
          {variants && variants.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs md:text-sm uppercase tracking-wide text-muted-foreground">
                  Choose Your Version
                </h4>
                {isRecommendedActive && (
                  <Badge variant="default" className="gap-1 text-xs">
                    <Star size={12} weight="fill" />
                    Personalized for you
                  </Badge>
                )}
              </div>
              <Tabs
                value={activeVariant?.interestArea || 'general'}
                onValueChange={(value) => {
                  const variant = variants.find(v => v.interestArea === value)
                  if (variant) setSelectedVariantId(variant.id)
                }}
              >
                <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
                  {variants.map(variant => (
                    <TabsTrigger
                      key={variant.id}
                      value={variant.interestArea}
                      className="gap-1 text-xs px-2 py-1"
                    >
                      <span>{INTEREST_EMOJIS[variant.interestArea]}</span>
                      <span className="hidden sm:inline capitalize">
                        {variant.interestArea.replace('-', ' ')}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Quest Briefing - shows variant content if available */}
          <div className="space-y-2">
            <h4 className="font-semibold text-xs md:text-sm uppercase tracking-wide text-muted-foreground">
              {activeVariant ? activeVariant.title : 'Quest Briefing'}
            </h4>
            <div className="glass-panel p-3 md:p-4 bg-muted/20">
              {activeVariant ? (
                <ScrollArea className="max-h-[200px]">
                  <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
                    {activeVariant.content}
                  </p>
                </ScrollArea>
              ) : (
                <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
                  {quest.description}
                </p>
              )}
            </div>

            {/* Variant Resources */}
            {activeVariant && activeVariant.resources && activeVariant.resources.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {activeVariant.resources.map((resource, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => window.open(resource, '_blank')}
                  >
                    <ArrowSquareOut size={12} />
                    Resource {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-4 flex-wrap">
            <Badge variant="secondary" className="text-xs md:text-sm px-3 md:px-4 py-1">
              Reward: {quest.xpValue} {themeConfig.xpLabel}
            </Badge>
            {quest.dueDate && (
              <span className="text-xs md:text-sm text-muted-foreground">
                Due: {new Date(quest.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-xs md:text-sm uppercase tracking-wide text-muted-foreground">Your Response</h4>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your submission here..."
              className="min-h-[150px] md:min-h-[200px] resize-none glass-panel text-sm md:text-base"
              disabled={isSubmitting}
            />
            <p className={`text-xs ${isContentTooLong ? 'text-destructive' : 'text-muted-foreground'}`}>
              {content.length} / {QUEST_CONTENT_MAX_LENGTH} characters
              {isContentTooLong && ' (exceeds limit)'}
            </p>
          </div>

          {isSubmitting && (
            <LoadingOracle theme={theme} />
          )}

          <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting}
              size="lg"
              className="w-full md:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim() || isContentTooLong}
              className="flex-1 gap-2"
              size="lg"
            >
              <PaperPlaneRight size={20} weight="fill" />
              <span className="hidden md:inline">Submit to {themeConfig.oracleLabel}</span>
              <span className="md:hidden">Submit</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
