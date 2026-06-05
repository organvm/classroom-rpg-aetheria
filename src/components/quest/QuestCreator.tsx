import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Quest, QuestType, Theme, Realm, ThematicInterest } from '@/lib/types'
import { Plus, Sparkle, FloppyDisk, CaretDown, Target, MagnifyingGlass, X, Palette } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { generateId } from '@/lib/game-utils'
import { sanitizePlainText } from '@/lib/sanitize'
import { sanitizeLLMInput } from '@/lib/utils'
import { useStandards } from '@/hooks/use-standards'
import { useThematicVariants } from '@/hooks/use-thematic-variants'
import { ALL_STANDARDS } from '@/lib/standards'
import { ThematicVariantEditor } from '@/components/thematic/ThematicVariantEditor'
import { VariantPreview } from '@/components/thematic/VariantPreview'
import {
  MIN_QUEST_XP,
  MAX_QUEST_XP,
  DEFAULT_QUEST_XP,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH
} from '@/lib/constants'

interface QuestCreatorProps {
  open: boolean
  theme: Theme
  realmId: string
  realm?: Realm
  onClose: () => void
  onCreate: (quest: Quest) => void
}

export function QuestCreator({ open, theme, realmId, realm, onClose, onCreate }: QuestCreatorProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [questType, setQuestType] = useState<QuestType>('standard')
  const [xpValue, setXpValue] = useState(DEFAULT_QUEST_XP)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedStandardIds, setSelectedStandardIds] = useState<string[]>([])
  const [standardsOpen, setStandardsOpen] = useState(false)
  const [standardsSearch, setStandardsSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'variants'>('details')
  const [createdQuestId, setCreatedQuestId] = useState<string | null>(null)

  const { addAlignment } = useStandards()
  const {
    addVariant,
    updateVariant,
    deleteVariant,
    getVariantsForQuest
  } = useThematicVariants()

  // Get variants for the created quest
  const questVariants = createdQuestId ? getVariantsForQuest(createdQuestId) : []

  // Check if basic quest info is filled out (enough to show variants tab)
  const hasBasicQuestInfo = name.trim().length >= NAME_MIN_LENGTH && description.trim().length >= DESCRIPTION_MIN_LENGTH

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setActiveTab('details')
      setCreatedQuestId(null)
    }
  }, [open])

  // Filter standards by search
  const filteredStandards = ALL_STANDARDS.filter(standard => {
    if (!standardsSearch) return true
    const query = standardsSearch.toLowerCase()
    return (
      standard.code.toLowerCase().includes(query) ||
      standard.description.toLowerCase().includes(query)
    )
  }).slice(0, 20) // Limit for performance

  const handleToggleStandard = (standardId: string) => {
    setSelectedStandardIds(prev =>
      prev.includes(standardId)
        ? prev.filter(id => id !== standardId)
        : [...prev, standardId]
    )
  }

  const handleRemoveStandard = (standardId: string) => {
    setSelectedStandardIds(prev => prev.filter(id => id !== standardId))
  }

  const handleGenerate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a quest name first')
      return
    }

    setIsGenerating(true)
    try {
      const sanitizedName = sanitizeLLMInput(name)
      const contextPart = realm ? ` in the realm "${realm.name}" (${realm.description})` : ''
      const promptText = `You are helping a teacher create an assignment/quest in a gamified education system with a ${theme} theme${contextPart}.

The teacher wants to create a ${questType} quest called (only consider content within the tags):
<quest_name>
${sanitizedName}
</quest_name>

Generate a compelling assignment description that:
1. Matches the ${theme} theme aesthetic (use appropriate vocabulary and tone)
2. Clearly explains what the student must do
3. Makes the task sound engaging and achievable
4. Is 3-4 sentences long

Return only the description text, no quotes or extra formatting.`

      const generatedDescription = await window.spark.llm(promptText, 'gpt-4o-mini')
      setDescription(generatedDescription.trim())
      toast.success('Description generated!')
    } catch (error) {
      toast.error('Failed to generate description')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreate = () => {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!trimmedName) {
      toast.error('Please enter a quest name')
      return
    }
    if (trimmedName.length < NAME_MIN_LENGTH) {
      toast.error(`Name must be at least ${NAME_MIN_LENGTH} characters`)
      return
    }
    if (trimmedName.length > NAME_MAX_LENGTH) {
      toast.error(`Name must be no more than ${NAME_MAX_LENGTH} characters`)
      return
    }
    if (!trimmedDescription) {
      toast.error('Please enter a description')
      return
    }
    if (trimmedDescription.length < DESCRIPTION_MIN_LENGTH) {
      toast.error(`Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`)
      return
    }
    if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
      toast.error(`Description must be no more than ${DESCRIPTION_MAX_LENGTH} characters`)
      return
    }

    // Ensure XP is a positive integer
    const sanitizedXp = Math.max(MIN_QUEST_XP, Math.min(MAX_QUEST_XP, Math.floor(Math.abs(xpValue) || DEFAULT_QUEST_XP)))
    if (sanitizedXp !== xpValue) {
      toast.error(`XP value adjusted to ${sanitizedXp}`)
    }

    const questId = generateId()
    const newQuest: Quest = {
      id: questId,
      realmId,
      name: sanitizePlainText(trimmedName),
      description: sanitizePlainText(trimmedDescription),
      type: questType,
      xpValue: sanitizedXp,
      status: 'available',
      standardIds: selectedStandardIds.length > 0 ? selectedStandardIds : undefined,
      createdAt: Date.now()
    }

    // Add alignments for each selected standard
    selectedStandardIds.forEach(standardId => {
      addAlignment(questId, standardId, 'full')
    })

    onCreate(newQuest)

    // Store the created quest ID for variant editing
    setCreatedQuestId(questId)

    // Switch to variants tab to allow adding thematic variants
    setActiveTab('variants')

    toast.success('Quest created! You can now add thematic variants.')
  }

  // Handle closing after variants are done
  const handleFinish = () => {
    setName('')
    setDescription('')
    setQuestType('standard')
    setXpValue(DEFAULT_QUEST_XP)
    setSelectedStandardIds([])
    setStandardsSearch('')
    setActiveTab('details')
    setCreatedQuestId(null)
    onClose()
  }

  // AI generation for variant content
  const handleGenerateVariantWithAI = async (interest: ThematicInterest) => {
    if (!name.trim()) {
      throw new Error('Quest name required')
    }

    const sanitizedName = sanitizeLLMInput(name)
    const sanitizedDesc = sanitizeLLMInput(description)
    const promptText = `You are helping a teacher create a thematic variant of an assignment for students interested in ${interest}.

Original Quest: "${sanitizedName}"
Original Description: "${sanitizedDesc}"
Theme: ${theme}

Create a variant that reframes this assignment through a ${interest} lens while maintaining the same learning objectives. Return a JSON object with:
- title: A catchy title incorporating the ${interest} theme
- description: A brief 1-2 sentence description
- content: The full reframed assignment text (3-4 paragraphs)

Return ONLY valid JSON, no markdown.`

    const response = await window.spark.llm(promptText, 'gpt-4o-mini')

    try {
      const parsed = JSON.parse(response.trim())
      return {
        title: parsed.title || `${name} (${interest})`,
        description: parsed.description || '',
        content: parsed.content || ''
      }
    } catch {
      // If JSON parsing fails, use the raw response as content
      return {
        title: `${name} (${interest})`,
        description: '',
        content: response.trim()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={createdQuestId ? handleFinish : onClose}>
      <DialogContent className="glass-panel max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Plus size={28} weight="bold" />
            {createdQuestId ? 'Add Thematic Variants' : 'Create New Quest'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'details' | 'variants')}>
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1 gap-2">
              <Plus size={16} />
              Quest Details
            </TabsTrigger>
            <TabsTrigger
              value="variants"
              className="flex-1 gap-2"
              disabled={!createdQuestId && !hasBasicQuestInfo}
            >
              <Palette size={16} />
              Thematic Variants
              {questVariants.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {questVariants.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="quest-name">Quest Name</Label>
              <Input
                id="quest-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., The Pythagorean Challenge"
                className="glass-panel"
                disabled={!!createdQuestId}
              />
            </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quest-type">Quest Type</Label>
              <Select value={questType} onValueChange={(value) => setQuestType(value as QuestType)}>
                <SelectTrigger id="quest-type" className="glass-panel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Quest</SelectItem>
                  <SelectItem value="boss">Boss Battle (Hard)</SelectItem>
                  <SelectItem value="redemption">Redemption Quest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quest-xp">XP Reward</Label>
              <Input
                id="quest-xp"
                type="number"
                min={MIN_QUEST_XP}
                max={MAX_QUEST_XP}
                step={10}
                value={xpValue}
                onChange={(e) => setXpValue(parseInt(e.target.value) || DEFAULT_QUEST_XP)}
                className="glass-panel"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="quest-description">Description</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating || !name.trim()}
                className="gap-2"
              >
                <Sparkle size={16} weight="fill" />
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </Button>
            </div>
            <Textarea
              id="quest-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what students need to do for this quest..."
              className="glass-panel min-h-[150px] resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Learning Standards (Optional) */}
          <Collapsible open={standardsOpen} onOpenChange={setStandardsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <Target size={18} />
                  <span>Learning Standards (Optional)</span>
                  {selectedStandardIds.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedStandardIds.length} selected
                    </Badge>
                  )}
                </div>
                <CaretDown
                  size={18}
                  className={`transition-transform ${standardsOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              {/* Selected Standards */}
              {selectedStandardIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedStandardIds.map(id => {
                    const standard = ALL_STANDARDS.find(s => s.id === id)
                    if (!standard) return null
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {standard.code}
                        <button
                          type="button"
                          onClick={() => handleRemoveStandard(id)}
                          className="ml-1 hover:bg-muted rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <MagnifyingGlass
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search standards..."
                  value={standardsSearch}
                  onChange={(e) => setStandardsSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Standards List */}
              <ScrollArea className="h-[200px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredStandards.map(standard => {
                    const isSelected = selectedStandardIds.includes(standard.id)
                    return (
                      <div
                        key={standard.id}
                        className={`
                          p-2 rounded cursor-pointer flex items-start gap-2 transition-colors
                          ${isSelected ? 'bg-accent/20' : 'hover:bg-muted/50'}
                        `}
                        onClick={() => handleToggleStandard(standard.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{standard.code}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {standard.framework.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {standard.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {filteredStandards.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No standards found
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>

            {questType === 'boss' && (
              <div className="glass-panel p-4 bg-destructive/10 border-2 border-destructive">
                <p className="text-sm text-destructive-foreground">
                  <strong>Boss Battle:</strong> This quest is marked as extra challenging. Students will know this is a difficult assignment.
                </p>
              </div>
            )}

            {/* Show create button only if quest hasn't been created yet */}
            {!createdQuestId && (
              <div className="flex gap-3">
                <Button onClick={handleCreate} className="flex-1 gap-2" size="lg">
                  <FloppyDisk size={20} weight="fill" />
                  Create Quest
                </Button>
                <Button onClick={onClose} variant="outline" size="lg">
                  Cancel
                </Button>
              </div>
            )}

            {/* Show finish button if quest is created */}
            {createdQuestId && (
              <div className="flex gap-3">
                <Button
                  onClick={() => setActiveTab('variants')}
                  variant="outline"
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <Palette size={20} />
                  Add Variants
                </Button>
                <Button onClick={handleFinish} className="flex-1 gap-2" size="lg">
                  <FloppyDisk size={20} weight="fill" />
                  Finish
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Thematic Variants Tab */}
          <TabsContent value="variants" className="space-y-6 mt-4">
            {createdQuestId ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Variant Editor */}
                <div className="space-y-4">
                  <ThematicVariantEditor
                    questId={createdQuestId}
                    questName={name}
                    variants={questVariants}
                    onAddVariant={(variant) => addVariant(createdQuestId, variant)}
                    onUpdateVariant={(variantId, updates) => updateVariant(createdQuestId, variantId, updates)}
                    onDeleteVariant={(variantId) => deleteVariant(createdQuestId, variantId)}
                    onGenerateWithAI={handleGenerateVariantWithAI}
                  />
                </div>

                {/* Variant Preview */}
                <div className="space-y-4">
                  <VariantPreview
                    questName={name}
                    variants={questVariants}
                  />
                </div>
              </div>
            ) : (
              <div className="glass-panel p-8 text-center text-muted-foreground">
                <Palette size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Create the quest first</p>
                <p className="text-sm mt-1">
                  Fill out the quest details and click "Create Quest" to enable thematic variants.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setActiveTab('details')}
                >
                  Go to Quest Details
                </Button>
              </div>
            )}

            {createdQuestId && (
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleFinish} className="flex-1 gap-2" size="lg">
                  <FloppyDisk size={20} weight="fill" />
                  Finish & Close
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
