/**
 * Mastery Report
 *
 * Standards-based progress report showing mastery levels across realms and skills.
 */

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Printer, FileCsv, FileJs, Star, Trophy, Target } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Quest, Submission, Realm, Theme } from '@/lib/types'
import { THEME_CONFIGS } from '@/lib/types'
import { QUEST_PASS_THRESHOLD } from '@/lib/constants'

interface MasteryReportProps {
  studentId: string
  studentName: string
  quests: Quest[]
  submissions: Submission[]
  realms: Realm[]
  theme: Theme
}

type MasteryLevel = 'exceeds' | 'meets' | 'approaching' | 'beginning' | 'not-started'

interface RealmMastery {
  realm: Realm
  totalQuests: number
  attemptedQuests: number
  masteredQuests: number
  averageScore: number
  masteryLevel: MasteryLevel
  questBreakdown: Array<{
    quest: Quest
    submission?: Submission
    masteryLevel: MasteryLevel
  }>
}

export function MasteryReport({
  studentId,
  studentName,
  quests,
  submissions,
  realms,
  theme
}: MasteryReportProps) {
  const themeConfig = THEME_CONFIGS[theme]

  // Calculate mastery for each realm
  const realmMasteries = useMemo(() => {
    return realms.map(realm => {
      const realmQuests = quests.filter(q => q.realmId === realm.id)
      const studentSubs = submissions.filter(s => s.studentId === studentId)

      const questBreakdown = realmQuests.map(quest => {
        const submission = studentSubs.find(s => s.questId === quest.id)
        return {
          quest,
          submission,
          masteryLevel: getMasteryLevel(submission?.score)
        }
      })

      const attemptedQuests = questBreakdown.filter(q => q.submission).length
      const masteredQuests = questBreakdown.filter(
        q => q.submission && (q.submission.score || 0) >= QUEST_PASS_THRESHOLD
      ).length

      const scores = questBreakdown
        .filter(q => q.submission?.score !== undefined)
        .map(q => q.submission!.score!)
      const averageScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0

      const masteryLevel = getMasteryLevel(attemptedQuests > 0 ? averageScore : undefined)

      return {
        realm,
        totalQuests: realmQuests.length,
        attemptedQuests,
        masteredQuests,
        averageScore: Math.round(averageScore * 10) / 10,
        masteryLevel,
        questBreakdown
      } as RealmMastery
    })
  }, [realms, quests, submissions, studentId])

  // Overall mastery stats
  const overallStats = useMemo(() => {
    const allScores = submissions
      .filter(s => s.studentId === studentId && s.score !== undefined)
      .map(s => s.score!)
    const avgScore = allScores.length > 0
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length
      : 0

    const totalQuests = quests.length
    const attemptedQuests = new Set(
      submissions.filter(s => s.studentId === studentId).map(s => s.questId)
    ).size
    const masteredQuests = submissions.filter(
      s => s.studentId === studentId && (s.score || 0) >= QUEST_PASS_THRESHOLD
    ).length

    return {
      avgScore: Math.round(avgScore * 10) / 10,
      masteryLevel: getMasteryLevel(attemptedQuests > 0 ? avgScore : undefined),
      totalQuests,
      attemptedQuests,
      masteredQuests,
      completionRate: totalQuests > 0 ? Math.round(attemptedQuests / totalQuests * 100) : 0,
      masteryRate: attemptedQuests > 0 ? Math.round(masteredQuests / attemptedQuests * 100) : 0
    }
  }, [quests, submissions, studentId])

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    const headers = ['Realm', 'Quest', 'Type', 'Mastery Level', 'Score', 'Status']
    const rows: string[][] = []

    realmMasteries.forEach(({ realm, questBreakdown }) => {
      questBreakdown.forEach(({ quest, submission, masteryLevel }) => {
        rows.push([
          realm.name,
          quest.name,
          quest.type,
          getMasteryLabel(masteryLevel),
          submission?.score !== undefined ? `${submission.score}%` : 'N/A',
          submission ? 'Attempted' : 'Not Started'
        ])
      })
    })

    const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n')
    downloadFile(csv, `mastery-${studentName.replace(/\s+/g, '-')}.csv`, 'text/csv')
    toast.success('CSV exported')
  }

  const handleExportJSON = () => {
    const data = {
      student: { id: studentId, name: studentName },
      generatedAt: new Date().toISOString(),
      summary: overallStats,
      realms: realmMasteries.map(rm => ({
        id: rm.realm.id,
        name: rm.realm.name,
        masteryLevel: rm.masteryLevel,
        averageScore: rm.averageScore,
        progress: {
          total: rm.totalQuests,
          attempted: rm.attemptedQuests,
          mastered: rm.masteredQuests
        },
        quests: rm.questBreakdown.map(({ quest, submission, masteryLevel }) => ({
          id: quest.id,
          name: quest.name,
          type: quest.type,
          masteryLevel,
          score: submission?.score,
          attempted: !!submission
        }))
      }))
    }

    const json = JSON.stringify(data, null, 2)
    downloadFile(json, `mastery-${studentName.replace(/\s+/g, '-')}.json`, 'application/json')
    toast.success('JSON exported')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-2xl font-bold">Mastery Report</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer size={16} />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <FileCsv size={16} />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJSON} className="gap-2">
            <FileJs size={16} />
            JSON
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <Card className="glass-panel p-6 print:shadow-none print:border-2 print:border-black">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Standards-Based Mastery Report</h1>
          <p className="text-lg mt-2">{studentName}</p>
        </div>

        <Separator className="my-4" />

        {/* Overall Progress */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-primary" />
            Overall Progress
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className={`text-xl font-bold ${getMasteryColor(overallStats.masteryLevel)}`}>
                {getMasteryLabel(overallStats.masteryLevel)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Overall Mastery</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold">{overallStats.avgScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">Average Score</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold">{overallStats.completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Completion Rate</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold">{overallStats.masteryRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Mastery Rate</p>
            </Card>
          </div>
        </div>

        {/* Realm Breakdown */}
        <div className="space-y-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Target size={20} className="text-primary" />
            {themeConfig.realmLabel} Mastery
          </h3>

          {realmMasteries.map(rm => (
            <Card key={rm.realm.id} className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: rm.realm.color }}
                  />
                  <h4 className="font-semibold">{rm.realm.name}</h4>
                </div>
                <Badge className={getMasteryBadgeClass(rm.masteryLevel)}>
                  {getMasteryLabel(rm.masteryLevel)}
                </Badge>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {rm.masteredQuests} of {rm.totalQuests} mastered
                  </span>
                  <span className="font-medium">{rm.averageScore}% avg</span>
                </div>
                <Progress
                  value={rm.totalQuests > 0 ? (rm.masteredQuests / rm.totalQuests) * 100 : 0}
                  className="h-2"
                />
              </div>

              {/* Quest breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {rm.questBreakdown.map(({ quest, submission, masteryLevel }) => (
                  <div
                    key={quest.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                  >
                    <MasteryIcon level={masteryLevel} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{quest.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {submission?.score !== undefined ? `${submission.score}%` : 'Not started'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {realmMasteries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No realms available
            </div>
          )}
        </div>

        {/* Legend */}
        <Separator className="my-6" />
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MasteryIcon level="exceeds" />
            <span>Exceeds (90%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <MasteryIcon level="meets" />
            <span>Meets (70-89%)</span>
          </div>
          <div className="flex items-center gap-2">
            <MasteryIcon level="approaching" />
            <span>Approaching (50-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <MasteryIcon level="beginning" />
            <span>Beginning (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <MasteryIcon level="not-started" />
            <span>Not Started</span>
          </div>
        </div>

        {/* Footer */}
        <Separator className="my-4" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <p>Generated: {new Date().toLocaleString()}</p>
          <p>Aetheria Learning Platform</p>
        </div>
      </Card>
    </div>
  )
}

// Helper: Get mastery level from score
function getMasteryLevel(score?: number): MasteryLevel {
  if (score === undefined) return 'not-started'
  if (score >= 90) return 'exceeds'
  if (score >= 70) return 'meets'
  if (score >= 50) return 'approaching'
  return 'beginning'
}

// Helper: Get mastery label
function getMasteryLabel(level: MasteryLevel): string {
  const labels: Record<MasteryLevel, string> = {
    'exceeds': 'Exceeds',
    'meets': 'Meets',
    'approaching': 'Approaching',
    'beginning': 'Beginning',
    'not-started': 'Not Started'
  }
  return labels[level]
}

// Helper: Get mastery color class
function getMasteryColor(level: MasteryLevel): string {
  const colors: Record<MasteryLevel, string> = {
    'exceeds': 'text-emerald-600',
    'meets': 'text-blue-600',
    'approaching': 'text-amber-600',
    'beginning': 'text-red-600',
    'not-started': 'text-gray-400'
  }
  return colors[level]
}

// Helper: Get mastery badge class
function getMasteryBadgeClass(level: MasteryLevel): string {
  const classes: Record<MasteryLevel, string> = {
    'exceeds': 'bg-emerald-500/20 text-emerald-600',
    'meets': 'bg-blue-500/20 text-blue-600',
    'approaching': 'bg-amber-500/20 text-amber-600',
    'beginning': 'bg-red-500/20 text-red-600',
    'not-started': 'bg-gray-500/20 text-gray-400'
  }
  return classes[level]
}

// Mastery icon component
function MasteryIcon({ level }: { level: MasteryLevel }) {
  const colors: Record<MasteryLevel, string> = {
    'exceeds': '#10b981',
    'meets': '#3b82f6',
    'approaching': '#f59e0b',
    'beginning': '#ef4444',
    'not-started': '#9ca3af'
  }

  return (
    <div
      className="w-3 h-3 rounded-full"
      style={{ backgroundColor: colors[level] }}
    />
  )
}

// Helper: Download file
function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
