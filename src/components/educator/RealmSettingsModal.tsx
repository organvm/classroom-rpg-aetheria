/**
 * Realm Settings Modal
 *
 * Tabbed modal for realm configuration including:
 * - Info: Edit name/description
 * - Syllabus: Manage syllabi
 * - Grading: Configure grading scale
 * - Rubrics: Select default rubric
 */

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Info,
  BookOpen,
  ChartBar,
  Notepad,
  FloppyDisk,
  Palette
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { SyllabusManager } from './SyllabusManager'
import { GradingScaleEditor } from './GradingScaleEditor'
import type { Realm, RealmExtended, GradeLevel, Theme, THEME_CONFIGS } from '@/lib/types'
import type { Rubric } from '@/components/RubricManager'

interface RealmSettingsModalProps {
  realm: RealmExtended | null
  open: boolean
  onClose: () => void
  onSave: (realm: RealmExtended) => void
  theme: Theme
  rubrics: Rubric[]
}

// Color presets for realm
const REALM_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e'
]

export function RealmSettingsModal({
  realm,
  open,
  onClose,
  onSave,
  theme,
  rubrics
}: RealmSettingsModalProps) {
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [gradingScale, setGradingScale] = useState<GradeLevel[]>([])
  const [defaultRubricId, setDefaultRubricId] = useState<string>('')
  const [hasChanges, setHasChanges] = useState(false)

  // Reset form when realm changes
  useEffect(() => {
    if (realm) {
      setName(realm.name)
      setDescription(realm.description)
      setColor(realm.color)
      setGradingScale(realm.gradingScale || [])
      setDefaultRubricId(realm.defaultRubricId || '')
      setHasChanges(false)
    }
  }, [realm])

  const handleSave = () => {
    if (!realm) return

    if (!name.trim()) {
      toast.error('Realm name is required')
      return
    }

    const updatedRealm: RealmExtended = {
      ...realm,
      name: name.trim(),
      description: description.trim(),
      color,
      gradingScale: gradingScale.length > 0 ? gradingScale : undefined,
      defaultRubricId: defaultRubricId || undefined
    }

    onSave(updatedRealm)
    setHasChanges(false)
    toast.success('Realm settings saved')
  }

  const handleFieldChange = () => {
    setHasChanges(true)
  }

  if (!realm) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: color }}
            />
            Realm Settings
          </DialogTitle>
          <DialogDescription>
            Configure settings for {realm.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1 gap-2">
              <Info size={16} />
              Info
            </TabsTrigger>
            <TabsTrigger value="syllabus" className="flex-1 gap-2">
              <BookOpen size={16} />
              Syllabus
            </TabsTrigger>
            <TabsTrigger value="grading" className="flex-1 gap-2">
              <ChartBar size={16} />
              Grading
            </TabsTrigger>
            <TabsTrigger value="rubrics" className="flex-1 gap-2">
              <Notepad size={16} />
              Rubrics
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4 pr-4">
            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="realm-name">Name</Label>
                <Input
                  id="realm-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    handleFieldChange()
                  }}
                  placeholder="Realm name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="realm-description">Description</Label>
                <Textarea
                  id="realm-description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    handleFieldChange()
                  }}
                  placeholder="Describe this realm..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette size={16} />
                  Color
                </Label>
                <div className="flex flex-wrap gap-2">
                  {REALM_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColor(c)
                        handleFieldChange()
                      }}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                        color === c ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Label htmlFor="custom-color" className="text-sm text-muted-foreground">
                    Custom:
                  </Label>
                  <Input
                    id="custom-color"
                    type="color"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value)
                      handleFieldChange()
                    }}
                    className="w-12 h-8 p-0 border-0"
                  />
                  <Input
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value)
                      handleFieldChange()
                    }}
                    className="w-24 h-8"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Syllabus Tab */}
            <TabsContent value="syllabus" className="mt-0">
              <SyllabusManager realmId={realm.id} realmName={realm.name} />
            </TabsContent>

            {/* Grading Tab */}
            <TabsContent value="grading" className="mt-0">
              <GradingScaleEditor
                value={gradingScale}
                onChange={(scale) => {
                  setGradingScale(scale)
                  handleFieldChange()
                }}
              />
            </TabsContent>

            {/* Rubrics Tab */}
            <TabsContent value="rubrics" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Default Rubric</Label>
                <p className="text-sm text-muted-foreground">
                  Select a default rubric to use when grading quests in this realm
                </p>
                <Select
                  value={defaultRubricId}
                  onValueChange={(value) => {
                    setDefaultRubricId(value)
                    handleFieldChange()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No default rubric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No default rubric</SelectItem>
                    {rubrics.map((rubric) => (
                      <SelectItem key={rubric.id} value={rubric.id}>
                        {rubric.name} ({rubric.totalPoints} pts)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {rubrics.length === 0 ? (
                <Card className="glass-panel p-6 text-center">
                  <p className="text-muted-foreground">
                    No rubrics available. Create rubrics in the Rubrics tab of the Teacher Dashboard.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  <Label>Available Rubrics</Label>
                  {rubrics.map((rubric) => (
                    <Card
                      key={rubric.id}
                      className={`glass-panel p-3 cursor-pointer transition-all ${
                        defaultRubricId === rubric.id
                          ? 'ring-2 ring-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setDefaultRubricId(rubric.id)
                        handleFieldChange()
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{rubric.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {rubric.criteria.length} criteria • {rubric.totalPoints} total points
                          </p>
                        </div>
                        {defaultRubricId === rubric.id && (
                          <div className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            Default
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="gap-2"
          >
            <FloppyDisk size={18} />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
