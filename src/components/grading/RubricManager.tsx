import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash, FloppyDisk, Pencil } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { generateId } from '@/lib/game-utils'
import { motion, AnimatePresence } from 'framer-motion'

export interface RubricCriterion {
  id: string
  name: string
  description: string
  maxPoints: number
}

export interface Rubric {
  id: string
  name: string
  description: string
  criteria: RubricCriterion[]
  totalPoints: number
  createdAt: number
}

interface RubricEditorProps {
  open: boolean
  onClose: () => void
  onSave: (rubric: Rubric) => void
  existingRubric?: Rubric
}

export function RubricEditor({ open, onClose, onSave, existingRubric }: RubricEditorProps) {
  const [name, setName] = useState(existingRubric?.name || '')
  const [description, setDescription] = useState(existingRubric?.description || '')
  const [criteria, setCriteria] = useState<RubricCriterion[]>(
    existingRubric?.criteria || []
  )

  const addCriterion = () => {
    setCriteria([
      ...criteria,
      {
        id: generateId(),
        name: '',
        description: '',
        maxPoints: 10
      }
    ])
  }

  const updateCriterion = (id: string, field: keyof RubricCriterion, value: string | number) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id))
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Rubric name is required')
      return
    }

    if (criteria.length === 0) {
      toast.error('Add at least one criterion')
      return
    }

    const totalPoints = criteria.reduce((sum, c) => sum + c.maxPoints, 0)

    const rubric: Rubric = {
      id: existingRubric?.id || generateId(),
      name: name.trim(),
      description: description.trim(),
      criteria,
      totalPoints,
      createdAt: existingRubric?.createdAt || Date.now()
    }

    onSave(rubric)
    toast.success('Rubric saved!')
    onClose()
  }

  const handleGenerateRubric = async () => {
    if (!name.trim()) {
      toast.error('Enter a rubric name first')
      return
    }

    try {
      const promptText = `Generate a grading rubric for an assignment called "${name}". Create 4-5 specific evaluation criteria with clear descriptions and point values. Return as JSON: {"criteria": [{"name": "string", "description": "string", "maxPoints": number}]}`

      const result = await window.spark.llm(promptText, 'gpt-4o', true)
      const generated = JSON.parse(result)

      const newCriteria: RubricCriterion[] = generated.criteria.map((c: any) => ({
        id: generateId(),
        name: c.name,
        description: c.description,
        maxPoints: c.maxPoints
      }))

      setCriteria(newCriteria)
      toast.success('Rubric criteria generated!')
    } catch (error) {
      toast.error('Failed to generate rubric')
      console.error(error)
    }
  }

  const totalPoints = criteria.reduce((sum, c) => sum + c.maxPoints, 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Grading Rubric</DialogTitle>
          <DialogDescription>
            Define evaluation criteria for consistent and transparent grading
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="rubric-name">Rubric Name</Label>
            <Input
              id="rubric-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Essay Rubric, Lab Report Grading"
              className="glass-panel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rubric-description">Description (Optional)</Label>
            <Textarea
              id="rubric-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this rubric..."
              className="glass-panel"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <Button onClick={handleGenerateRubric} variant="outline" className="gap-2">
              <Plus size={16} weight="bold" />
              AI Generate Criteria
            </Button>
            <div className="text-sm text-muted-foreground">
              Total Points: <span className="font-bold text-lg text-primary">{totalPoints}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Criteria</h3>
              <Button onClick={addCriterion} size="sm" className="gap-2">
                <Plus size={16} weight="bold" />
                Add Criterion
              </Button>
            </div>

            <AnimatePresence mode="popLayout">
              {criteria.map((criterion, index) => (
                <motion.div
                  key={criterion.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="glass-panel p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">
                        Criterion {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCriterion(criterion.id)}
                      >
                        <Trash size={16} weight="bold" className="text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={criterion.name}
                        onChange={(e) => updateCriterion(criterion.id, 'name', e.target.value)}
                        placeholder="e.g., Clarity of Argument"
                        className="glass-panel"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={criterion.description}
                        onChange={(e) => updateCriterion(criterion.id, 'description', e.target.value)}
                        placeholder="What does excellent performance look like?"
                        className="glass-panel"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum Points: {criterion.maxPoints}</Label>
                      <Slider
                        value={[criterion.maxPoints]}
                        onValueChange={([value]) => updateCriterion(criterion.id, 'maxPoints', value)}
                        min={1}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {criteria.length === 0 && (
              <Card className="glass-panel p-8 text-center">
                <p className="text-muted-foreground">
                  No criteria added yet. Click "Add Criterion" or "AI Generate" to get started.
                </p>
              </Card>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <FloppyDisk size={20} weight="fill" />
              Save Rubric
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface RubricManagerProps {
  rubrics: Rubric[]
  onUpdate: (rubrics: Rubric[]) => void
}

export function RubricManager({ rubrics, onUpdate }: RubricManagerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedRubric, setSelectedRubric] = useState<Rubric | undefined>()

  const handleSave = (rubric: Rubric) => {
    const existingIndex = rubrics.findIndex(r => r.id === rubric.id)
    if (existingIndex >= 0) {
      const updated = [...rubrics]
      updated[existingIndex] = rubric
      onUpdate(updated)
    } else {
      onUpdate([...rubrics, rubric])
    }
    setSelectedRubric(undefined)
  }

  const handleDelete = (id: string) => {
    onUpdate(rubrics.filter(r => r.id !== id))
    toast.success('Rubric deleted')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Grading Rubrics</h2>
        <Button onClick={() => setIsEditing(true)} className="gap-2">
          <Plus size={20} weight="bold" />
          Create Rubric
        </Button>
      </div>

      {rubrics.length === 0 ? (
        <Card className="glass-panel p-8 text-center">
          <p className="text-muted-foreground">
            No rubrics created yet. Create one to standardize your grading.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rubrics.map((rubric) => (
            <motion.div
              key={rubric.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="glass-panel p-4 space-y-3 hover:scale-105 transition-transform">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{rubric.name}</h3>
                    {rubric.description && (
                      <p className="text-sm text-muted-foreground">{rubric.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedRubric(rubric)
                        setIsEditing(true)
                      }}
                    >
                      <Pencil size={16} weight="bold" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(rubric.id)}
                    >
                      <Trash size={16} weight="bold" className="text-destructive" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Criteria:</span>
                    <span className="font-semibold">{rubric.criteria.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Points:</span>
                    <span className="font-bold text-lg text-primary">{rubric.totalPoints}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Created {new Date(rubric.createdAt).toLocaleDateString()}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <RubricEditor
        open={isEditing}
        onClose={() => {
          setIsEditing(false)
          setSelectedRubric(undefined)
        }}
        onSave={handleSave}
        existingRubric={selectedRubric}
      />
    </div>
  )
}
