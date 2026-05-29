import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Realm, Theme } from '@/lib/types'
import { Plus, Sparkle, FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { generateId } from '@/lib/game-utils'
import { sanitizePlainText } from '@/lib/sanitize'
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH
} from '@/lib/constants'
import { getLLMErrorMessage } from '@/lib/error-messages'

interface RealmCreatorProps {
  open: boolean
  theme: Theme
  onClose: () => void
  onCreate: (realm: Realm) => void
}

const PRESET_COLORS = [
  'oklch(0.65 0.20 0)',
  'oklch(0.60 0.20 30)',
  'oklch(0.70 0.18 60)',
  'oklch(0.65 0.15 120)',
  'oklch(0.60 0.18 180)',
  'oklch(0.65 0.20 240)',
  'oklch(0.60 0.22 280)',
  'oklch(0.65 0.20 320)'
]

export function RealmCreator({ open, theme, onClose, onCreate }: RealmCreatorProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a realm name first')
      return
    }

    setIsGenerating(true)
    try {
      const promptText = `You are helping a teacher create a learning module in a gamified education system with a ${theme} theme. 

The teacher wants to create a realm/course called: "${name}"

Generate a compelling 2-3 sentence description that:
1. Matches the ${theme} theme aesthetic and vocabulary
2. Makes the subject matter sound exciting and adventurous
3. Clearly explains what students will learn

Return only the description text, no quotes or extra formatting.`

      const generatedDescription = await window.spark.llm(promptText, 'gpt-4o-mini')
      setDescription(generatedDescription.trim())
      toast.success('Description generated!')
    } catch (error) {
      const errorDetails = getLLMErrorMessage(error)
      toast.error(errorDetails.title, {
        description: errorDetails.description
      })
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreate = () => {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!trimmedName) {
      toast.error('Please enter a realm name')
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

    const newRealm: Realm = {
      id: generateId(),
      name: sanitizePlainText(trimmedName),
      description: sanitizePlainText(trimmedDescription),
      color: selectedColor,
      createdAt: Date.now()
    }

    onCreate(newRealm)
    setName('')
    setDescription('')
    setSelectedColor(PRESET_COLORS[0])
    toast.success('Realm created!')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Plus size={28} weight="bold" />
            Create New Realm
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="realm-name">Realm Name</Label>
            <Input
              id="realm-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., The Ancient Mathematics Temple"
              className="glass-panel"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="realm-description">Description</Label>
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
              id="realm-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A compelling description of what students will learn in this realm..."
              className="glass-panel min-h-[120px] resize-none"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label>Realm Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                    selectedColor === color ? 'border-primary scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCreate} className="flex-1 gap-2" size="lg">
              <FloppyDisk size={20} weight="fill" />
              Create Realm
            </Button>
            <Button onClick={onClose} variant="outline" size="lg">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
