/**
 * Report Generation Panel
 *
 * Configuration interface for generating various reports.
 */

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  ChartBar,
  CalendarBlank,
  Student,
  Buildings,
  Play,
  ArrowLeft
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { TranscriptReport } from './TranscriptReport'
import { MasteryReport } from './MasteryReport'
import type { Quest, Submission, Realm, Theme, ReportConfig, GradeLevel } from '@/lib/types'
import { THEME_CONFIGS } from '@/lib/types'

interface ReportGenerationPanelProps {
  quests: Quest[]
  submissions: Submission[]
  realms: Realm[]
  theme: Theme
  gradingScale?: GradeLevel[]
}

type ReportType = 'transcript' | 'mastery'

export function ReportGenerationPanel({
  quests,
  submissions,
  realms,
  theme,
  gradingScale
}: ReportGenerationPanelProps) {
  const themeConfig = THEME_CONFIGS[theme]

  // Config state
  const [reportType, setReportType] = useState<ReportType>('transcript')
  const [selectedRealmId, setSelectedRealmId] = useState<string>('all')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [includeComments, setIncludeComments] = useState(true)

  // Report view state
  const [showReport, setShowReport] = useState(false)

  // Get unique students from submissions
  const students = useMemo(() => {
    const studentMap = new Map<string, string>()
    submissions.forEach(s => {
      if (!studentMap.has(s.studentId)) {
        // In real app, would look up student name
        studentMap.set(s.studentId, `Student ${s.studentId.slice(0, 8)}`)
      }
    })
    return Array.from(studentMap.entries()).map(([id, name]) => ({ id, name }))
  }, [submissions])

  // Filter data based on config
  const filteredQuests = useMemo(() => {
    if (selectedRealmId === 'all') return quests
    return quests.filter(q => q.realmId === selectedRealmId)
  }, [quests, selectedRealmId])

  const filteredSubmissions = useMemo(() => {
    let filtered = submissions

    if (selectedRealmId !== 'all') {
      const realmQuestIds = new Set(filteredQuests.map(q => q.id))
      filtered = filtered.filter(s => realmQuestIds.has(s.questId))
    }

    if (dateRange.from) {
      filtered = filtered.filter(s => s.submittedAt >= dateRange.from!.getTime())
    }
    if (dateRange.to) {
      const endOfDay = new Date(dateRange.to)
      endOfDay.setHours(23, 59, 59, 999)
      filtered = filtered.filter(s => s.submittedAt <= endOfDay.getTime())
    }

    return filtered
  }, [submissions, selectedRealmId, filteredQuests, dateRange])

  const handleGenerate = () => {
    if (!selectedStudentId) {
      toast.error('Please select a student')
      return
    }

    setShowReport(true)
  }

  const handleBack = () => {
    setShowReport(false)
  }

  // Show report view
  if (showReport) {
    const student = students.find(s => s.id === selectedStudentId)
    const dateRangeConfig = (dateRange.from && dateRange.to) ? {
      start: dateRange.from.getTime(),
      end: dateRange.to.getTime()
    } : undefined

    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft size={18} />
          Back to Configuration
        </Button>

        {reportType === 'transcript' ? (
          <TranscriptReport
            studentId={selectedStudentId}
            studentName={student?.name || 'Unknown Student'}
            quests={filteredQuests}
            submissions={filteredSubmissions}
            realms={realms}
            gradingScale={gradingScale}
            dateRange={dateRangeConfig}
            theme={theme}
          />
        ) : (
          <MasteryReport
            studentId={selectedStudentId}
            studentName={student?.name || 'Unknown Student'}
            quests={filteredQuests}
            submissions={filteredSubmissions}
            realms={realms}
            theme={theme}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Generate Reports</h2>
        <p className="text-muted-foreground">
          Create student transcripts and mastery reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card className="glass-panel p-6 lg:col-span-2 space-y-6">
          {/* Report Type */}
          <div className="space-y-3">
            <Label>Report Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  reportType === 'transcript'
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setReportType('transcript')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Transcript</h4>
                    <p className="text-sm text-muted-foreground">
                      Traditional grade report
                    </p>
                  </div>
                </div>
              </Card>
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  reportType === 'mastery'
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setReportType('mastery')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <ChartBar size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Mastery</h4>
                    <p className="text-sm text-muted-foreground">
                      Standards-based progress
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Student Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Student size={16} />
              Student
            </Label>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student..." />
              </SelectTrigger>
              <SelectContent>
                {students.length === 0 ? (
                  <SelectItem value="" disabled>No students with submissions</SelectItem>
                ) : (
                  students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Realm Filter */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Buildings size={16} />
              {themeConfig.realmLabel}
            </Label>
            <Select value={selectedRealmId} onValueChange={setSelectedRealmId}>
              <SelectTrigger>
                <SelectValue placeholder="All realms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {themeConfig.realmLabel}s</SelectItem>
                {realms.map(realm => (
                  <SelectItem key={realm.id} value={realm.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: realm.color }}
                      />
                      {realm.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <CalendarBlank size={16} />
              Date Range (Optional)
            </Label>
            <div className="flex gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {dateRange.from
                      ? dateRange.from.toLocaleDateString()
                      : 'Start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {dateRange.to
                      ? dateRange.to.toLocaleDateString()
                      : 'End date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {(dateRange.from || dateRange.to) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateRange({})}
                className="text-muted-foreground"
              >
                Clear dates
              </Button>
            )}
          </div>

          {/* Options */}
          {reportType === 'transcript' && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Include Feedback Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Show instructor feedback in the report
                  </p>
                </div>
                <Switch
                  checked={includeComments}
                  onCheckedChange={setIncludeComments}
                />
              </div>
            </>
          )}
        </Card>

        {/* Preview Panel */}
        <Card className="glass-panel p-6 space-y-4">
          <h3 className="font-semibold">Report Preview</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium capitalize">{reportType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student</span>
              <span className="font-medium">
                {students.find(s => s.id === selectedStudentId)?.name || 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{themeConfig.realmLabel}</span>
              <span className="font-medium">
                {selectedRealmId === 'all'
                  ? `All (${realms.length})`
                  : realms.find(r => r.id === selectedRealmId)?.name
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date Range</span>
              <span className="font-medium">
                {dateRange.from || dateRange.to
                  ? `${dateRange.from?.toLocaleDateString() || 'Start'} - ${dateRange.to?.toLocaleDateString() || 'Now'}`
                  : 'All time'
                }
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">{themeConfig.questLabel}s</span>
              <span className="font-medium">{filteredQuests.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submissions</span>
              <span className="font-medium">
                {filteredSubmissions.filter(s => s.studentId === selectedStudentId).length}
              </span>
            </div>
          </div>

          <Separator />

          <Button
            className="w-full gap-2"
            onClick={handleGenerate}
            disabled={!selectedStudentId}
          >
            <Play size={18} weight="fill" />
            Generate Report
          </Button>
        </Card>
      </div>
    </div>
  )
}
