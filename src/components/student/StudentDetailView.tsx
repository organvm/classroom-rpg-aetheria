import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  X, 
  Trophy, 
  Target,
  CheckCircle,
  XCircle,
  Clock,
  TrendUp,
  TrendDown,
  Minus,
  Star,
  Fire
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { UserProfile, Quest, Submission, Theme } from '@/lib/types'
import { THEME_CONFIGS } from '@/lib/types'
import { calculateLevel } from '@/lib/game-utils'

interface StudentDetailViewProps {
  student: UserProfile
  quests: Quest[]
  submissions: Submission[]
  theme: Theme
  onClose: () => void
}

export function StudentDetailView({ 
  student, 
  quests, 
  submissions, 
  theme, 
  onClose 
}: StudentDetailViewProps) {
  const themeConfig = THEME_CONFIGS[theme]

  const studentSubmissions = useMemo(() => {
    return submissions.filter(s => s.studentId === student.id)
  }, [submissions, student.id])

  const questPerformance = useMemo(() => {
    return quests.map(quest => {
      const submission = studentSubmissions.find(s => s.questId === quest.id)
      return {
        quest,
        submission,
        status: submission
          ? (submission.score || 0) >= 70 
            ? 'passed' 
            : 'failed'
          : 'not-attempted'
      }
    })
  }, [quests, studentSubmissions])

  const stats = useMemo(() => {
    const attempted = studentSubmissions.length
    const passed = studentSubmissions.filter(s => (s.score || 0) >= 70).length
    const failed = studentSubmissions.filter(s => (s.score || 0) < 70).length
    const avgScore = attempted > 0
      ? studentSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / attempted
      : 0

    const sortedSubmissions = [...studentSubmissions].sort((a, b) => b.submittedAt - a.submittedAt)
    const recentSubmissions = sortedSubmissions.slice(0, 5)
    
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (recentSubmissions.length >= 3) {
      const recentAvg = recentSubmissions.slice(0, 3).reduce((sum, s) => sum + (s.score || 0), 0) / 3
      const olderAvg = sortedSubmissions.slice(3, 6).length > 0
        ? sortedSubmissions.slice(3, 6).reduce((sum, s) => sum + (s.score || 0), 0) / sortedSubmissions.slice(3, 6).length
        : recentAvg
      
      if (recentAvg > olderAvg + 5) trend = 'up'
      else if (recentAvg < olderAvg - 5) trend = 'down'
    }

    const oneDay = 24 * 60 * 60 * 1000
    let streak = 0
    for (let i = 0; i < sortedSubmissions.length - 1; i++) {
      const timeDiff = sortedSubmissions[i].submittedAt - sortedSubmissions[i + 1].submittedAt
      if (timeDiff <= oneDay * 2) {
        streak++
      } else {
        break
      }
    }

    return { attempted, passed, failed, avgScore, trend, streak, recentSubmissions }
  }, [studentSubmissions])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const getTrendIcon = () => {
    if (stats.trend === 'up') return <TrendUp size={20} className="text-green-400" />
    if (stats.trend === 'down') return <TrendDown size={20} className="text-red-400" />
    return <Minus size={20} className="text-muted-foreground" />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/50">
                <AvatarImage src={student.avatarUrl} />
                <AvatarFallback>{student.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">Level {calculateLevel(student.xp)}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {student.xp} {themeConfig.xpLabel}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={24} />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass-panel">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Target size={16} />
                    Attempted
                  </div>
                  <div className="text-3xl font-bold">{stats.attempted}</div>
                </CardContent>
              </Card>

              <Card className="glass-panel">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <CheckCircle size={16} className="text-green-400" />
                    Passed
                  </div>
                  <div className="text-3xl font-bold text-green-400">{stats.passed}</div>
                </CardContent>
              </Card>

              <Card className="glass-panel">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <XCircle size={16} className="text-red-400" />
                    Failed
                  </div>
                  <div className="text-3xl font-bold text-red-400">{stats.failed}</div>
                </CardContent>
              </Card>

              <Card className="glass-panel">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Fire size={16} className="text-accent" />
                    Streak
                  </div>
                  <div className="text-3xl font-bold">{stats.streak}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-panel">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Performance Overview</CardTitle>
                  <div className="flex items-center gap-2">
                    {getTrendIcon()}
                    <span className="text-sm text-muted-foreground">
                      {stats.trend === 'up' ? 'Improving' : stats.trend === 'down' ? 'Declining' : 'Stable'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className="font-bold">{stats.avgScore.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.avgScore} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-bold">
                      {quests.length > 0 ? ((stats.passed / quests.length) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={quests.length > 0 ? (stats.passed / quests.length) * 100 : 0} 
                    className="h-3" 
                  />
                </div>

                {student.artifacts.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy size={16} className="text-accent" />
                    <span className="text-muted-foreground">
                      {student.artifacts.length} artifact{student.artifacts.length !== 1 ? 's' : ''} earned
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Last 5 activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentSubmissions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No submissions yet</p>
                  ) : (
                    stats.recentSubmissions.map((submission, index) => {
                      const quest = quests.find(q => q.id === submission.questId)
                      const passed = (submission.score || 0) >= 70
                      
                      return (
                        <motion.div
                          key={submission.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-3 rounded-lg bg-card/50 border border-border"
                        >
                          <div className={`p-2 rounded-full ${passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {passed ? (
                              <CheckCircle size={20} className="text-green-400" />
                            ) : (
                              <XCircle size={20} className="text-red-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{quest?.name || 'Unknown Quest'}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock size={12} />
                              {formatDate(submission.submittedAt)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-2xl font-bold">{submission.score || 0}</div>
                              <div className="text-xs text-muted-foreground">score</div>
                            </div>
                            {(submission.score || 0) >= 90 && (
                              <Star size={20} weight="fill" className="text-accent" />
                            )}
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>All {themeConfig.questLabel}s</CardTitle>
                <CardDescription>Complete activity history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questPerformance.map((item) => (
                    <div
                      key={item.quest.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        {item.status === 'passed' && (
                          <CheckCircle size={20} className="text-green-400" weight="fill" />
                        )}
                        {item.status === 'failed' && (
                          <XCircle size={20} className="text-red-400" weight="fill" />
                        )}
                        {item.status === 'not-attempted' && (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/50" />
                        )}
                        <span className={item.status === 'not-attempted' ? 'text-muted-foreground' : ''}>
                          {item.quest.name}
                        </span>
                      </div>
                      
                      {item.submission && (
                        <Badge variant={item.status === 'passed' ? 'default' : 'destructive'}>
                          {item.submission.score}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  )
}
