/**
 * Grading Scale Editor
 *
 * Table-based editor for configuring grade levels with validation and preset templates.
 */

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Plus,
  Trash,
  ArrowUp,
  ArrowDown,
  Warning,
  CheckCircle,
  FloppyDisk
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { GradeLevel } from '@/lib/types'

interface GradingScaleEditorProps {
  value: GradeLevel[]
  onChange: (scale: GradeLevel[]) => void
}

// Preset templates
const PRESETS: Record<string, GradeLevel[]> = {
  'standard-af': [
    { grade: 'A', minScore: 90, maxScore: 100 },
    { grade: 'B', minScore: 80, maxScore: 89 },
    { grade: 'C', minScore: 70, maxScore: 79 },
    { grade: 'D', minScore: 60, maxScore: 69 },
    { grade: 'F', minScore: 0, maxScore: 59 }
  ],
  'standard-plus-minus': [
    { grade: 'A+', minScore: 97, maxScore: 100 },
    { grade: 'A', minScore: 93, maxScore: 96 },
    { grade: 'A-', minScore: 90, maxScore: 92 },
    { grade: 'B+', minScore: 87, maxScore: 89 },
    { grade: 'B', minScore: 83, maxScore: 86 },
    { grade: 'B-', minScore: 80, maxScore: 82 },
    { grade: 'C+', minScore: 77, maxScore: 79 },
    { grade: 'C', minScore: 73, maxScore: 76 },
    { grade: 'C-', minScore: 70, maxScore: 72 },
    { grade: 'D+', minScore: 67, maxScore: 69 },
    { grade: 'D', minScore: 63, maxScore: 66 },
    { grade: 'D-', minScore: 60, maxScore: 62 },
    { grade: 'F', minScore: 0, maxScore: 59 }
  ],
  'pass-fail': [
    { grade: 'Pass', minScore: 70, maxScore: 100 },
    { grade: 'Fail', minScore: 0, maxScore: 69 }
  ],
  'standards-based': [
    { grade: 'Exceeds', minScore: 90, maxScore: 100 },
    { grade: 'Meets', minScore: 70, maxScore: 89 },
    { grade: 'Approaching', minScore: 50, maxScore: 69 },
    { grade: 'Beginning', minScore: 0, maxScore: 49 }
  ]
}

export function GradingScaleEditor({ value, onChange }: GradingScaleEditorProps) {
  const [editingScale, setEditingScale] = useState<GradeLevel[]>(
    value.length > 0 ? [...value] : [...PRESETS['standard-af']]
  )
  const [hasChanges, setHasChanges] = useState(false)

  // Validation
  const validation = useMemo(() => {
    const errors: string[] = []
    const warnings: string[] = []

    if (editingScale.length === 0) {
      errors.push('At least one grade level is required')
      return { valid: false, errors, warnings }
    }

    // Check for empty grades
    const hasEmptyGrades = editingScale.some(g => !g.grade.trim())
    if (hasEmptyGrades) {
      errors.push('All grades must have a name')
    }

    // Check for valid score ranges
    const hasInvalidRanges = editingScale.some(g => g.minScore > g.maxScore)
    if (hasInvalidRanges) {
      errors.push('Min score cannot be greater than max score')
    }

    // Check for scores out of 0-100 range
    const hasOutOfRange = editingScale.some(
      g => g.minScore < 0 || g.maxScore > 100
    )
    if (hasOutOfRange) {
      errors.push('Scores must be between 0 and 100')
    }

    // Check for gaps - sort by max score descending
    const sorted = [...editingScale].sort((a, b) => b.maxScore - a.maxScore)
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i]
      const next = sorted[i + 1]
      if (current.minScore - 1 !== next.maxScore) {
        if (current.minScore > next.maxScore + 1) {
          warnings.push(`Gap between ${current.grade} and ${next.grade}`)
        }
      }
    }

    // Check for overlaps
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i]
      const next = sorted[i + 1]
      if (current.minScore <= next.maxScore) {
        errors.push(`Overlap between ${current.grade} and ${next.grade}`)
      }
    }

    // Check if lowest grade starts at 0
    const lowestMax = Math.min(...editingScale.map(g => g.minScore))
    if (lowestMax > 0) {
      warnings.push('Consider starting lowest grade at 0')
    }

    // Check if highest grade ends at 100
    const highestMax = Math.max(...editingScale.map(g => g.maxScore))
    if (highestMax < 100) {
      warnings.push('Consider ending highest grade at 100')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }, [editingScale])

  const handlePresetChange = useCallback((presetKey: string) => {
    if (presetKey && PRESETS[presetKey]) {
      setEditingScale([...PRESETS[presetKey]])
      setHasChanges(true)
    }
  }, [])

  const handleGradeChange = useCallback((index: number, field: keyof GradeLevel, value: string | number) => {
    setEditingScale(prev => {
      const updated = [...prev]
      if (field === 'grade') {
        updated[index] = { ...updated[index], [field]: value as string }
      } else {
        updated[index] = { ...updated[index], [field]: Number(value) || 0 }
      }
      return updated
    })
    setHasChanges(true)
  }, [])

  const handleAddLevel = useCallback(() => {
    // Find a reasonable place for new grade
    const lowestMin = Math.min(...editingScale.map(g => g.minScore), 100)
    const newMin = Math.max(0, lowestMin - 10)
    const newMax = lowestMin > 0 ? lowestMin - 1 : 0

    setEditingScale(prev => [
      ...prev,
      { grade: '', minScore: newMin, maxScore: newMax }
    ])
    setHasChanges(true)
  }, [editingScale])

  const handleRemoveLevel = useCallback((index: number) => {
    if (editingScale.length <= 1) {
      toast.error('At least one grade level is required')
      return
    }
    setEditingScale(prev => prev.filter((_, i) => i !== index))
    setHasChanges(true)
  }, [editingScale.length])

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return
    setEditingScale(prev => {
      const updated = [...prev]
      ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
      return updated
    })
    setHasChanges(true)
  }, [])

  const handleMoveDown = useCallback((index: number) => {
    if (index === editingScale.length - 1) return
    setEditingScale(prev => {
      const updated = [...prev]
      ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
      return updated
    })
    setHasChanges(true)
  }, [editingScale.length])

  const handleSave = useCallback(() => {
    if (!validation.valid) {
      toast.error('Please fix validation errors before saving')
      return
    }
    onChange(editingScale)
    setHasChanges(false)
    toast.success('Grading scale saved')
  }, [editingScale, onChange, validation.valid])

  return (
    <div className="space-y-4">
      {/* Header with preset selector */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <Label>Load Preset</Label>
          <Select onValueChange={handlePresetChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a preset..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard-af">Standard A-F</SelectItem>
              <SelectItem value="standard-plus-minus">A-F with +/-</SelectItem>
              <SelectItem value="pass-fail">Pass/Fail</SelectItem>
              <SelectItem value="standards-based">Standards-Based</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddLevel}
            className="gap-1"
          >
            <Plus size={16} />
            Add Level
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || !validation.valid}
            className="gap-1"
          >
            <FloppyDisk size={16} />
            Save
          </Button>
        </div>
      </div>

      {/* Validation Messages */}
      <AnimatePresence>
        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {validation.errors.map((error, i) => (
              <div key={`error-${i}`} className="flex items-center gap-2 text-sm text-destructive">
                <Warning size={16} />
                {error}
              </div>
            ))}
            {validation.warnings.map((warning, i) => (
              <div key={`warning-${i}`} className="flex items-center gap-2 text-sm text-amber-500">
                <Warning size={16} />
                {warning}
              </div>
            ))}
          </motion.div>
        )}
        {validation.valid && hasChanges && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-accent"
          >
            <CheckCircle size={16} weight="fill" />
            Ready to save
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grade Table */}
      <Card className="glass-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Grade</TableHead>
              <TableHead className="w-24 text-center">Min</TableHead>
              <TableHead className="w-24 text-center">Max</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {editingScale.map((level, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group"
                >
                  <TableCell className="py-2">
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === editingScale.length - 1}
                      >
                        <ArrowDown size={12} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Input
                      value={level.grade}
                      onChange={(e) => handleGradeChange(index, 'grade', e.target.value)}
                      placeholder="Grade name"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <Input
                      type="number"
                      value={level.minScore}
                      onChange={(e) => handleGradeChange(index, 'minScore', e.target.value)}
                      min={0}
                      max={100}
                      className="h-8 text-center"
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <Input
                      type="number"
                      value={level.maxScore}
                      onChange={(e) => handleGradeChange(index, 'maxScore', e.target.value)}
                      min={0}
                      max={100}
                      className="h-8 text-center"
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveLevel(index)}
                    >
                      <Trash size={16} />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </Card>

      {/* Visual Preview */}
      <Card className="glass-panel p-4">
        <Label className="text-muted-foreground text-sm mb-3 block">Preview</Label>
        <div className="flex h-8 rounded-lg overflow-hidden">
          {[...editingScale]
            .sort((a, b) => a.minScore - b.minScore)
            .map((level, index) => {
              const width = level.maxScore - level.minScore + 1
              return (
                <div
                  key={index}
                  className="relative flex items-center justify-center text-xs font-medium text-white"
                  style={{
                    width: `${width}%`,
                    backgroundColor: getGradeColor(level.grade, index, editingScale.length)
                  }}
                  title={`${level.grade}: ${level.minScore}-${level.maxScore}`}
                >
                  {width > 8 && level.grade}
                </div>
              )
            })}
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </Card>
    </div>
  )
}

// Helper to generate colors for grade levels
function getGradeColor(grade: string, index: number, total: number): string {
  // Common grade colors
  const gradeColors: Record<string, string> = {
    'A+': '#10b981', 'A': '#10b981', 'A-': '#34d399',
    'B+': '#3b82f6', 'B': '#3b82f6', 'B-': '#60a5fa',
    'C+': '#f59e0b', 'C': '#f59e0b', 'C-': '#fbbf24',
    'D+': '#f97316', 'D': '#f97316', 'D-': '#fb923c',
    'F': '#ef4444',
    'Pass': '#10b981', 'Fail': '#ef4444',
    'Exceeds': '#10b981', 'Meets': '#3b82f6',
    'Approaching': '#f59e0b', 'Beginning': '#ef4444'
  }

  if (gradeColors[grade]) {
    return gradeColors[grade]
  }

  // Generate color based on position
  const hue = 120 - (index / (total - 1)) * 120 // Green to red
  return `hsl(${hue}, 70%, 50%)`
}
