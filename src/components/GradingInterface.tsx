import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { CheckCircle, XCircle, PaperPlaneRight, Sparkle, ChatText } from '@phosphor-icons/react'
import type { Submission, Quest, Theme } from '@/lib/types'
import type { Rubric } from './RubricManager'
import { THEME_CONFIGS } from '@/lib/types'
import { sanitizeLLMInput } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { FeedbackSnippetBrowser } from './educator/FeedbackSnippetBrowser'

interface GradingInterfaceProps {
  submission: Submission
  quest: Quest
  rubric?: Rubric
  theme: Theme
  open: boolean
  onClose: () => void
  onGrade: (submissionId: string, score: number, feedback: string, rubricScores?: Record<string, number>) => void
}

export function GradingInterface({
  submission,
  quest,
  rubric,
  theme,
  open,
  onClose,
  onGrade
}: GradingInterfaceProps) {
  const [feedback, setFeedback] = useState(submission.feedback || '')
  const [manualScore, setManualScore] = useState(submission.score || 0)
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [snippetSidebarOpen, setSnippetSidebarOpen] = useState(false)

  const themeConfig = THEME_CONFIGS[theme]

  const handleSnippetInsert = (content: string) => {
    // Append snippet to feedback, adding newline if feedback already has content
    setFeedback(prev => {
      if (prev.trim()) {
        return prev + '\n\n' + content
      }
      return content
    })
    toast.success('Snippet inserted')
  }

  const calculateRubricTotal = () => {
    if (!rubric) return 0
    return Object.values(rubricScores).reduce((sum, score) => sum + score, 0)
  }

  const handleGenerateFeedback = async () => {
    setIsGenerating(true)
    try {
      const sanitizedContent = sanitizeLLMInput(submission.content)
      const promptText = `You are evaluating a student submission.
Quest: ${quest.name}
Description: ${quest.description}

Student Response (only consider content within the tags):
<student_response>
${sanitizedContent}
</student_response>

Provide constructive feedback in 2-3 sentences as the ${themeConfig.oracleLabel}.`

      const result = await window.spark.llm(promptText, 'gpt-4o')
      setFeedback(result)
      toast.success('Feedback generated!')
    } catch (error) {
      toast.error('Failed to generate feedback')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmitGrade = () => {
    const finalScore = rubric ? (calculateRubricTotal() / rubric.totalPoints) * 100 : manualScore
    
    if (!feedback.trim()) {
      toast.error('Please provide feedback')
      return
    }

    onGrade(submission.id, Math.round(finalScore), feedback, rubric ? rubricScores : undefined)
    toast.success('Grade submitted!')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Grade Submission</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <Card className="glass-panel p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{quest.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Submitted {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
              <Badge variant="outline">
                {quest.xpValue} {themeConfig.xpLabel}
              </Badge>
            </div>
            <Separator />
            <div>
              <Label className="text-muted-foreground">Student Response:</Label>
              <div className="mt-2 p-3 glass-panel rounded-lg text-sm">
                {submission.content}
              </div>
            </div>
          </Card>

          {rubric ? (
            <Card className="glass-panel p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Rubric: {rubric.name}</h3>
                <div className="text-2xl font-bold text-primary">
                  {calculateRubricTotal()} / {rubric.totalPoints}
                </div>
              </div>
              <Separator />
              {rubric.criteria.map((criterion, index) => (
                <motion.div
                  key={criterion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="font-semibold">{criterion.name}</Label>
                      <span className="text-sm font-bold">
                        {rubricScores[criterion.id] || 0} / {criterion.maxPoints}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {criterion.description}
                    </p>
                    <Slider
                      value={[rubricScores[criterion.id] || 0]}
                      onValueChange={([value]) => setRubricScores({ ...rubricScores, [criterion.id]: value })}
                      min={0}
                      max={criterion.maxPoints}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  {index < rubric.criteria.length - 1 && <Separator />}
                </motion.div>
              ))}
            </Card>
          ) : (
            <Card className="glass-panel p-4 space-y-3">
              <Label>Manual Score (0-100)</Label>
              <div className="space-y-2">
                <Slider
                  value={[manualScore]}
                  onValueChange={([value]) => setManualScore(value)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <Input
                    type="number"
                    value={manualScore}
                    onChange={(e) => setManualScore(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="w-24 glass-panel"
                    min={0}
                    max={100}
                  />
                  <div className="text-2xl font-bold text-primary">{manualScore}%</div>
                </div>
              </div>
            </Card>
          )}

          <Card className="glass-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label>Feedback</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSnippetSidebarOpen(true)}
                  className="gap-2"
                >
                  <ChatText size={16} weight="fill" />
                  Browse Snippets
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateFeedback}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <Sparkle size={16} weight="fill" />
                  {isGenerating ? 'Generating...' : 'AI Generate'}
                </Button>
              </div>
            </div>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback..."
              className="glass-panel min-h-[120px]"
              rows={5}
            />
          </Card>

          {/* Feedback Snippet Sidebar */}
          <Sheet open={snippetSidebarOpen} onOpenChange={setSnippetSidebarOpen}>
            <SheetContent side="right" className="w-[360px] sm:w-[420px]">
              <SheetHeader>
                <SheetTitle>Feedback Snippets</SheetTitle>
                <SheetDescription>
                  Click a snippet to insert it into your feedback
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 h-[calc(100vh-140px)]">
                <FeedbackSnippetBrowser onInsert={handleSnippetInsert} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {(rubric ? calculateRubricTotal() / rubric.totalPoints * 100 : manualScore) >= 70 ? (
                <Badge className="gap-2 bg-primary/20 text-primary">
                  <CheckCircle size={16} weight="fill" />
                  Passing
                </Badge>
              ) : (
                <Badge className="gap-2 bg-destructive/20 text-destructive">
                  <XCircle size={16} weight="fill" />
                  Needs Improvement
                </Badge>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmitGrade} className="gap-2">
                <PaperPlaneRight size={20} weight="fill" />
                Submit Grade
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
