/**
 * Transcript Report
 *
 * Traditional grade transcript with print-friendly layout and export options.
 */

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Printer, Export, FileText, FileCsv, FileJs } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Quest, Submission, Realm, GradeLevel, Theme } from '@/lib/types'
import { THEME_CONFIGS } from '@/lib/types'
import { QUEST_PASS_THRESHOLD } from '@/lib/constants'

interface TranscriptReportProps {
  studentId: string
  studentName: string
  quests: Quest[]
  submissions: Submission[]
  realms: Realm[]
  gradingScale?: GradeLevel[]
  dateRange?: { start: number; end: number }
  theme: Theme
}

export function TranscriptReport({
  studentId,
  studentName,
  quests,
  submissions,
  realms,
  gradingScale,
  dateRange,
  theme
}: TranscriptReportProps) {
  const themeConfig = THEME_CONFIGS[theme]

  // Filter submissions by student and date range
  const studentSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (s.studentId !== studentId) return false
      if (dateRange) {
        if (s.submittedAt < dateRange.start || s.submittedAt > dateRange.end) {
          return false
        }
      }
      return true
    })
  }, [submissions, studentId, dateRange])

  // Build transcript data grouped by realm
  const transcriptData = useMemo(() => {
    const byRealm: Record<string, {
      realm: Realm
      items: Array<{
        quest: Quest
        submission: Submission
        grade: string
      }>
      totalPoints: number
      earnedPoints: number
    }> = {}

    studentSubmissions.forEach(sub => {
      const quest = quests.find(q => q.id === sub.questId)
      if (!quest) return

      const realm = realms.find(r => r.id === quest.realmId)
      if (!realm) return

      if (!byRealm[realm.id]) {
        byRealm[realm.id] = {
          realm,
          items: [],
          totalPoints: 0,
          earnedPoints: 0
        }
      }

      const grade = getLetterGrade(sub.score || 0, gradingScale)
      byRealm[realm.id].items.push({ quest, submission: sub, grade })
      byRealm[realm.id].totalPoints += quest.xpValue
      byRealm[realm.id].earnedPoints += Math.round((sub.score || 0) / 100 * quest.xpValue)
    })

    return Object.values(byRealm)
  }, [studentSubmissions, quests, realms, gradingScale])

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalPoints = transcriptData.reduce((sum, r) => sum + r.totalPoints, 0)
    const earnedPoints = transcriptData.reduce((sum, r) => sum + r.earnedPoints, 0)
    const avgScore = studentSubmissions.length > 0
      ? studentSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / studentSubmissions.length
      : 0
    const completed = studentSubmissions.filter(s => (s.score || 0) >= QUEST_PASS_THRESHOLD).length
    const failed = studentSubmissions.filter(s => s.score !== undefined && s.score < QUEST_PASS_THRESHOLD).length

    return {
      totalPoints,
      earnedPoints,
      avgScore: Math.round(avgScore * 10) / 10,
      overallGrade: getLetterGrade(avgScore, gradingScale),
      completed,
      failed,
      total: studentSubmissions.length
    }
  }, [transcriptData, studentSubmissions, gradingScale])

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    const headers = ['Realm', 'Quest', 'Type', 'Due Date', 'Submitted', 'Score', 'Grade', 'XP Earned', 'XP Possible']
    const rows: string[][] = []

    transcriptData.forEach(({ realm, items }) => {
      items.forEach(({ quest, submission, grade }) => {
        rows.push([
          realm.name,
          quest.name,
          quest.type,
          quest.dueDate ? new Date(quest.dueDate).toLocaleDateString() : 'N/A',
          new Date(submission.submittedAt).toLocaleDateString(),
          `${submission.score || 0}%`,
          grade,
          String(Math.round((submission.score || 0) / 100 * quest.xpValue)),
          String(quest.xpValue)
        ])
      })
    })

    const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n')
    downloadFile(csv, `transcript-${studentName.replace(/\s+/g, '-')}.csv`, 'text/csv')
    toast.success('CSV exported')
  }

  const handleExportJSON = () => {
    const data = {
      student: { id: studentId, name: studentName },
      generatedAt: new Date().toISOString(),
      dateRange: dateRange ? {
        start: new Date(dateRange.start).toISOString(),
        end: new Date(dateRange.end).toISOString()
      } : null,
      summary: overallStats,
      realms: transcriptData.map(({ realm, items, totalPoints, earnedPoints }) => ({
        id: realm.id,
        name: realm.name,
        totalPoints,
        earnedPoints,
        percentage: Math.round(earnedPoints / totalPoints * 100),
        items: items.map(({ quest, submission, grade }) => ({
          questId: quest.id,
          questName: quest.name,
          questType: quest.type,
          xpValue: quest.xpValue,
          score: submission.score,
          grade,
          submittedAt: new Date(submission.submittedAt).toISOString(),
          feedback: submission.feedback
        }))
      }))
    }

    const json = JSON.stringify(data, null, 2)
    downloadFile(json, `transcript-${studentName.replace(/\s+/g, '-')}.json`, 'application/json')
    toast.success('JSON exported')
  }

  return (
    <div className="space-y-6">
      {/* Header - Hidden in print */}
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-2xl font-bold">Academic Transcript</h2>
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
          <h1 className="text-2xl font-bold">Official Transcript</h1>
          <p className="text-muted-foreground mt-1">
            {dateRange
              ? `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
              : 'All Time'
            }
          </p>
        </div>

        <Separator className="my-4" />

        {/* Student Info */}
        <div className="flex justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Student Name</p>
            <p className="text-lg font-semibold">{studentName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Student ID</p>
            <p className="text-lg font-semibold">{studentId}</p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{overallStats.overallGrade}</p>
            <p className="text-xs text-muted-foreground">Overall Grade</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{overallStats.avgScore}%</p>
            <p className="text-xs text-muted-foreground">Average Score</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{overallStats.earnedPoints}</p>
            <p className="text-xs text-muted-foreground">{themeConfig.xpLabel} Earned</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{overallStats.completed}/{overallStats.total}</p>
            <p className="text-xs text-muted-foreground">Passed</p>
          </div>
        </div>

        {/* Realm Breakdown */}
        {transcriptData.map(({ realm, items, totalPoints, earnedPoints }) => (
          <div key={realm.id} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: realm.color }}
              />
              <h3 className="font-semibold">{realm.name}</h3>
              <Badge variant="outline" className="ml-auto">
                {earnedPoints}/{totalPoints} {themeConfig.xpLabel}
              </Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{themeConfig.questLabel}</TableHead>
                  <TableHead className="w-20 text-center">Type</TableHead>
                  <TableHead className="w-28 text-center">Date</TableHead>
                  <TableHead className="w-20 text-center">Score</TableHead>
                  <TableHead className="w-16 text-center">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(({ quest, submission, grade }) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{quest.name}</TableCell>
                    <TableCell className="text-center capitalize">{quest.type}</TableCell>
                    <TableCell className="text-center">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">{submission.score}%</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={(submission.score || 0) >= QUEST_PASS_THRESHOLD ? 'default' : 'destructive'}
                      >
                        {grade}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}

        {transcriptData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No submissions found for this student
          </div>
        )}

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

// Helper: Get letter grade from score
function getLetterGrade(score: number, scale?: GradeLevel[]): string {
  if (!scale || scale.length === 0) {
    // Default A-F scale
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  const sorted = [...scale].sort((a, b) => b.minScore - a.minScore)
  for (const level of sorted) {
    if (score >= level.minScore && score <= level.maxScore) {
      return level.grade
    }
  }

  return 'N/A'
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
