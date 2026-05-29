import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Quest, Submission, Realm, Theme, THEME_CONFIGS, RealmExtended } from '@/lib/types'
import {
  Trash,
  Eye,
  CheckCircle,
  XCircle,
  CalendarBlank,
  Notepad,
  ChartBar,
  Package,
  ChatText,
  Users,
  Lightbulb,
  Gear,
  FileText,
  Target
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatTimeAgo } from '@/lib/game-utils'
import { QUEST_PASS_THRESHOLD } from '@/lib/constants'
import { RubricManager, type Rubric } from '@/components/grading/RubricManager'
import { CalendarView } from '@/components/schedule/CalendarView'
import { GradingInterface } from '@/components/grading/GradingInterface'
import { ExportImportDialog } from '@/components/dialogs/ExportImportDialog'
import {
  FeedbackSnippetsManager,
  StudentSamplesList,
  FeedbackInsights,
  RealmSettingsModal,
  ReportGenerationPanel
} from '@/components/educator'
import { StandardsProgress } from './standards/StandardsProgress'
import { StandardsReport } from './standards/StandardsReport'
import { useStandards } from '@/hooks/use-standards'
import { ALL_STANDARDS } from '@/lib/standards'
import type { LearningStandardRef } from '@/lib/types'
import { useKV } from '@github/spark/hooks'
import { motion } from 'framer-motion'

interface TeacherDashboardProps {
  quests: Quest[]
  submissions: Submission[]
  realms: Realm[]
  theme: Theme
  onDeleteQuest: (questId: string) => void
  onDeleteRealm: (realmId: string) => void
  onUpdateRealm?: (realm: RealmExtended) => void
  onUpdateSubmission?: (submission: Submission) => void
  onImportRealms?: (realms: Realm[]) => void
  onImportQuests?: (quests: Quest[]) => void
}

export function TeacherDashboard({
  quests,
  submissions,
  realms,
  theme,
  onDeleteQuest,
  onDeleteRealm,
  onUpdateRealm,
  onUpdateSubmission,
  onImportRealms,
  onImportQuests
}: TeacherDashboardProps) {
  const [selectedSubmissions, setSelectedSubmissions] = useState<string | null>(null)
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null)
  const [showExportImport, setShowExportImport] = useState(false)
  const [settingsRealm, setSettingsRealm] = useState<RealmExtended | null>(null)
  const [rubrics, setRubrics] = useKV<Rubric[]>('aetheria-rubrics', [])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  const themeConfig = THEME_CONFIGS[theme]

  // Standards tracking
  const { masteryRecords, getMasteryByStudent } = useStandards()

  // Convert standards to LearningStandardRef format
  const standardsRef: LearningStandardRef[] = ALL_STANDARDS.map(s => ({
    id: s.id,
    framework: s.framework,
    code: s.code,
    description: s.description,
    gradeLevel: s.gradeLevel,
    category: s.category,
    strand: s.strand
  }))

  // Get unique student IDs from submissions
  const studentIds = [...new Set(submissions.map(s => s.studentId))]

  const questSubmissions = submissions.filter(s => s.questId === selectedSubmissions)
  const selectedQuest = quests.find(q => q.id === selectedSubmissions)

  const getQuestStats = (questId: string) => {
    const questSubs = submissions.filter(s => s.questId === questId)
    const completed = questSubs.filter(s => s.score && s.score >= QUEST_PASS_THRESHOLD).length
    const failed = questSubs.filter(s => s.score && s.score < QUEST_PASS_THRESHOLD).length
    const avgScore = questSubs.length > 0
      ? questSubs.reduce((sum, s) => sum + (s.score || 0), 0) / questSubs.length
      : 0
    
    return { total: questSubs.length, completed, failed, avgScore: Math.round(avgScore) }
  }

  const handleDeleteQuest = (questId: string) => {
    if (confirm('Are you sure you want to delete this quest? This action cannot be undone.')) {
      onDeleteQuest(questId)
      toast.success('Quest deleted')
    }
  }

  const handleDeleteRealm = (realmId: string) => {
    const realmQuests = quests.filter(q => q.realmId === realmId)
    if (realmQuests.length > 0) {
      toast.error('Cannot delete realm with existing quests. Delete quests first.')
      return
    }
    
    if (confirm('Are you sure you want to delete this realm? This action cannot be undone.')) {
      onDeleteRealm(realmId)
      toast.success('Realm deleted')
    }
  }

  const handleGrade = (submissionId: string, score: number, feedback: string, rubricScores?: Record<string, number>) => {
    // Find the original submission and verify it still exists
    const original = submissions.find(s => s.id === submissionId)
    if (!original) {
      toast.error('Submission not found. It may have been deleted.')
      setGradingSubmission(null)
      return
    }

    // Verify the submission hasn't been modified since we started grading
    // by checking if the content and submittedAt match what we loaded
    if (gradingSubmission && (
      gradingSubmission.content !== original.content ||
      gradingSubmission.submittedAt !== original.submittedAt
    )) {
      toast.error('Submission was modified. Please reload and try again.')
      setGradingSubmission(null)
      return
    }

    const updatedSubmission: Submission = {
      ...original,
      score,
      feedback,
      rubricScores,
      evaluatedAt: Date.now()
    }

    onUpdateSubmission?.(updatedSubmission)
    toast.success('Grade saved successfully')
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage your realms, quests, and student submissions</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setShowExportImport(true)}
        >
          <Package size={20} />
          Export / Import
        </Button>
      </motion.div>

      <ExportImportDialog
        open={showExportImport}
        realms={realms}
        quests={quests}
        theme={theme}
        onClose={() => setShowExportImport(false)}
        onImportRealms={(newRealms) => {
          onImportRealms?.(newRealms)
        }}
        onImportQuests={(newQuests) => {
          onImportQuests?.(newQuests)
        }}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass-panel flex-wrap">
          <TabsTrigger value="overview" className="gap-2">
            <ChartBar size={18} weight="fill" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarBlank size={18} weight="fill" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="rubrics" className="gap-2">
            <Notepad size={18} weight="fill" />
            Rubrics
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <ChatText size={18} weight="fill" />
            Feedback Library
          </TabsTrigger>
          <TabsTrigger value="samples" className="gap-2">
            <Users size={18} weight="fill" />
            Student Samples
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Lightbulb size={18} weight="fill" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText size={18} weight="fill" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="standards" className="gap-2">
            <Target size={18} weight="fill" />
            Standards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="glass-panel p-6 hover:scale-105 transition-transform">
              <div className="text-sm text-muted-foreground mb-2">Total Realms</div>
              <div className="text-4xl font-bold text-primary">{realms.length}</div>
            </Card>
            <Card className="glass-panel p-6 hover:scale-105 transition-transform">
              <div className="text-sm text-muted-foreground mb-2">Total {themeConfig.questLabel}s</div>
              <div className="text-4xl font-bold text-primary">{quests.length}</div>
            </Card>
            <Card className="glass-panel p-6 hover:scale-105 transition-transform">
              <div className="text-sm text-muted-foreground mb-2">Total Submissions</div>
              <div className="text-4xl font-bold text-primary">{submissions.length}</div>
            </Card>
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Realms</h2>
            {realms.length === 0 ? (
              <Card className="glass-panel p-12 text-center">
                <p className="text-muted-foreground">No realms created yet</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {realms.map((realm, index) => {
                  const realmQuests = quests.filter(q => q.realmId === realm.id)
                  return (
                    <motion.div
                      key={realm.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card className="glass-panel p-6 hover:scale-105 transition-transform">
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 h-12 rounded-full flex-shrink-0 animate-pulse-glow"
                            style={{ backgroundColor: realm.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg mb-1">{realm.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {realm.description}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {realmQuests.length} quests
                            </Badge>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSettingsRealm(realm as RealmExtended)}
                              title="Settings"
                            >
                              <Gear size={18} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRealm(realm.id)}
                              title="Delete"
                            >
                              <Trash size={18} className="text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{themeConfig.questLabel}s</h2>
            {quests.length === 0 ? (
              <Card className="glass-panel p-12 text-center">
                <p className="text-muted-foreground">No quests created yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {quests.map((quest, index) => {
                  const stats = getQuestStats(quest.id)
                  const realm = realms.find(r => r.id === quest.realmId)
                  return (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <Card className="glass-panel p-6 hover:scale-[1.02] transition-transform">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg">{quest.name}</h3>
                              {quest.type === 'boss' && (
                                <Badge variant="destructive" className="text-xs">Boss</Badge>
                              )}
                              {quest.type === 'redemption' && (
                                <Badge variant="outline" className="text-xs">Redemption</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {realm?.name} • {quest.xpValue} {themeConfig.xpLabel}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Submissions:</span>
                                <span className="font-medium">{stats.total}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-accent" weight="fill" />
                                <span>{stats.completed}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <XCircle size={16} className="text-destructive" weight="fill" />
                                <span>{stats.failed}</span>
                              </div>
                              {stats.total > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Avg:</span>
                                  <span className="font-medium">{stats.avgScore}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setSelectedSubmissions(quest.id)}
                              disabled={stats.total === 0}
                            >
                              <Eye size={18} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteQuest(quest.id)}
                            >
                              <Trash size={18} className="text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView
            quests={quests}
            theme={theme}
            onQuestClick={(questId) => setSelectedSubmissions(questId)}
          />
        </TabsContent>

        <TabsContent value="rubrics">
          <RubricManager
            rubrics={rubrics || []}
            onUpdate={(updated) => setRubrics(updated)}
          />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackSnippetsManager theme={theme} />
        </TabsContent>

        <TabsContent value="samples">
          <StudentSamplesList
            quests={quests}
            realms={realms}
            theme={theme}
          />
        </TabsContent>

        <TabsContent value="insights">
          <FeedbackInsights theme={theme} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportGenerationPanel
            quests={quests}
            submissions={submissions}
            realms={realms}
            theme={theme}
          />
        </TabsContent>

        <TabsContent value="standards" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Standards Tracking</h2>
              <p className="text-muted-foreground">
                Track student progress against learning standards
              </p>
            </div>
            {studentIds.length > 0 && (
              <select
                value={selectedStudentId || ''}
                onChange={(e) => setSelectedStudentId(e.target.value || null)}
                className="px-3 py-2 rounded-md border bg-background"
              >
                <option value="">Select a student...</option>
                {studentIds.map(id => (
                  <option key={id} value={id}>
                    {id.slice(0, 8)}...
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedStudentId ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <StandardsProgress
                studentName={`Student ${selectedStudentId.slice(0, 8)}`}
                masteryRecords={getMasteryByStudent(selectedStudentId)}
                standards={standardsRef}
              />
              <StandardsReport
                studentName={`Student ${selectedStudentId.slice(0, 8)}`}
                studentId={selectedStudentId}
                masteryRecords={getMasteryByStudent(selectedStudentId)}
                standards={standardsRef}
                onExport={(format) => {
                  // Export functionality
                  const data = getMasteryByStudent(selectedStudentId)
                  const blob = new Blob(
                    [format === 'json' ? JSON.stringify(data, null, 2) :
                      'Standard ID,Level,Last Assessed\n' +
                      data.map(d => `${d.standardId},${d.level},${d.lastAssessed}`).join('\n')],
                    { type: format === 'json' ? 'application/json' : 'text/csv' }
                  )
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `standards-${selectedStudentId.slice(0, 8)}.${format}`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                onPrint={() => window.print()}
              />
            </div>
          ) : (
            <Card className="glass-panel p-12 text-center">
              <Target size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a Student</h3>
              <p className="text-muted-foreground">
                Choose a student from the dropdown above to view their standards progress.
              </p>
              {studentIds.length === 0 && (
                <p className="text-sm text-muted-foreground mt-4">
                  No students have submitted work yet.
                </p>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Realm Settings Modal */}
      <RealmSettingsModal
        realm={settingsRealm}
        open={!!settingsRealm}
        onClose={() => setSettingsRealm(null)}
        onSave={(updated) => {
          onUpdateRealm?.(updated)
          setSettingsRealm(null)
        }}
        theme={theme}
        rubrics={rubrics || []}
      />

      <Dialog open={!!selectedSubmissions} onOpenChange={() => setSelectedSubmissions(null)}>
        <DialogContent className="glass-panel max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedQuest && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedQuest.name} - Submissions</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {questSubmissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No submissions yet
                  </div>
                ) : (
                  questSubmissions.map((submission, index) => (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="glass-panel p-6 hover:scale-[1.02] transition-transform">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={(submission.score || 0) >= QUEST_PASS_THRESHOLD ? 'default' : 'destructive'}
                                className="text-lg px-3 py-1"
                              >
                                {submission.score}%
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatTimeAgo(submission.submittedAt)}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setGradingSubmission(submission)}
                              className="gap-2"
                            >
                              <Eye size={16} />
                              Re-grade
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Student Response:</h4>
                              <p className="text-sm text-muted-foreground">{submission.content}</p>
                            </div>
                            {submission.feedback && (
                              <div>
                                <h4 className="font-semibold text-sm mb-1">Oracle Feedback:</h4>
                                <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {gradingSubmission && selectedQuest && (
        <GradingInterface
          submission={gradingSubmission}
          quest={selectedQuest}
          rubric={rubrics?.[0]}
          theme={theme}
          open={!!gradingSubmission}
          onClose={() => setGradingSubmission(null)}
          onGrade={handleGrade}
        />
      )}
    </div>
  )
}
