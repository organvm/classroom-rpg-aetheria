import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { StudentDetailView } from '@/components/student/StudentDetailView'
import { 
  TrendUp, 
  TrendDown, 
  Clock, 
  Target, 
  Trophy,
  ChartBar,
  Users,
  CheckCircle,
  XCircle,
  Star,
  Eye
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Quest, Submission, UserProfile, Theme } from '@/lib/types'
import { THEME_CONFIGS } from '@/lib/types'
import { calculateLevel } from '@/lib/game-utils'

interface AnalyticsDashboardProps {
  quests: Quest[]
  submissions: Submission[]
  profiles: UserProfile[]
  theme: Theme
}

interface QuestAnalytics {
  questId: string
  questName: string
  totalSubmissions: number
  avgScore: number
  completionRate: number
  avgTimeToComplete: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

interface StudentAnalytics {
  profile: UserProfile
  completedQuests: number
  avgScore: number
  totalSubmissions: number
  streak: number
  recentActivity: number
}

export function AnalyticsDashboard({ quests, submissions, profiles, theme }: AnalyticsDashboardProps) {
  const themeConfig = THEME_CONFIGS[theme]
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null)

  const questAnalytics = useMemo(() => {
    return quests.map(quest => {
      const questSubmissions = submissions.filter(s => s.questId === quest.id)
      const scoredSubmissions = questSubmissions.filter(s => s.score !== undefined)
      
      const totalSubmissions = questSubmissions.length
      const avgScore = scoredSubmissions.length > 0
        ? scoredSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / scoredSubmissions.length
        : 0
      
      const completionRate = totalSubmissions > 0
        ? (scoredSubmissions.filter(s => (s.score || 0) >= 70).length / totalSubmissions) * 100
        : 0

      const timesToComplete = questSubmissions
        .filter(s => s.submittedAt && quest.createdAt)
        .map(s => s.submittedAt - quest.createdAt)
      
      const avgTimeToComplete = timesToComplete.length > 0
        ? timesToComplete.reduce((sum, t) => sum + t, 0) / timesToComplete.length
        : 0

      let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'
      if (completionRate >= 80 && avgScore >= 85) difficulty = 'Easy'
      else if (completionRate < 50 || avgScore < 70) difficulty = 'Hard'

      return {
        questId: quest.id,
        questName: quest.name,
        totalSubmissions,
        avgScore,
        completionRate,
        avgTimeToComplete,
        difficulty
      }
    })
  }, [quests, submissions])

  const studentAnalytics = useMemo(() => {
    return profiles.filter(p => p.role === 'student').map(profile => {
      const studentSubmissions = submissions.filter(s => s.studentId === profile.id)
      const scoredSubmissions = studentSubmissions.filter(s => s.score !== undefined && s.score >= 70)
      
      const completedQuests = scoredSubmissions.length
      const avgScore = scoredSubmissions.length > 0
        ? scoredSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / scoredSubmissions.length
        : 0
      
      const sortedSubmissions = [...studentSubmissions].sort((a, b) => b.submittedAt - a.submittedAt)
      const recentActivity = sortedSubmissions.length > 0
        ? Date.now() - sortedSubmissions[0].submittedAt
        : Infinity

      let streak = 0
      const oneDay = 24 * 60 * 60 * 1000
      for (let i = 0; i < sortedSubmissions.length - 1; i++) {
        const timeDiff = sortedSubmissions[i].submittedAt - sortedSubmissions[i + 1].submittedAt
        if (timeDiff <= oneDay * 2) {
          streak++
        } else {
          break
        }
      }

      return {
        profile,
        completedQuests,
        avgScore,
        totalSubmissions: studentSubmissions.length,
        streak,
        recentActivity
      }
    })
  }, [profiles, submissions])

  const overallStats = useMemo(() => {
    const totalStudents = profiles.filter(p => p.role === 'student').length
    const activeStudents = studentAnalytics.filter(s => s.recentActivity < 7 * 24 * 60 * 60 * 1000).length
    const totalSubmissions = submissions.length
    const avgCompletionRate = questAnalytics.length > 0
      ? questAnalytics.reduce((sum, q) => sum + q.completionRate, 0) / questAnalytics.length
      : 0
    
    return {
      totalStudents,
      activeStudents,
      totalSubmissions,
      avgCompletionRate,
      totalQuests: quests.length
    }
  }, [profiles, submissions, questAnalytics, quests.length])

  const formatTime = (ms: number) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000))
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h`
    return '< 1h'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/50'
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    }
  }

  return (
    <div className="p-8 space-y-6">
      <AnimatePresence>
        {selectedStudent && (
          <StudentDetailView
            student={selectedStudent}
            quests={quests}
            submissions={submissions}
            theme={theme}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Insights into student performance and engagement</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overallStats.activeStudents} active this week
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target size={18} className="text-accent" />
              {themeConfig.questLabel}s
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallStats.totalQuests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overallStats.totalSubmissions} submissions
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle size={18} className="text-green-400" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallStats.avgCompletionRate.toFixed(1)}%</div>
            <Progress value={overallStats.avgCompletionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy size={18} className="text-accent" />
              Avg Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {studentAnalytics.length > 0
                ? (studentAnalytics.reduce((sum, s) => sum + s.avgScore, 0) / studentAnalytics.length).toFixed(1)
                : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all students
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="quests" className="space-y-4">
        <TabsList className="glass-panel">
          <TabsTrigger value="quests" className="gap-2">
            <ChartBar size={18} />
            {themeConfig.questLabel} Analytics
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users size={18} />
            Student Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quests" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>{themeConfig.questLabel} Performance Analysis</CardTitle>
                <CardDescription>
                  Detailed metrics for each {themeConfig.questLabel.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {questAnalytics.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        No {themeConfig.questLabel.toLowerCase()} data available
                      </div>
                    ) : (
                      questAnalytics.map((analytics, index) => (
                        <motion.div
                          key={analytics.questId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="glass-panel p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold">{analytics.questName}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {analytics.totalSubmissions} submission{analytics.totalSubmissions !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <Badge className={getDifficultyColor(analytics.difficulty)}>
                              {analytics.difficulty}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Avg Score</div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">{analytics.avgScore.toFixed(1)}</span>
                                {analytics.avgScore >= 85 ? (
                                  <TrendUp size={16} className="text-green-400" />
                                ) : analytics.avgScore < 70 ? (
                                  <TrendDown size={16} className="text-red-400" />
                                ) : null}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Pass Rate</div>
                              <div className="text-lg font-bold">{analytics.completionRate.toFixed(0)}%</div>
                            </div>

                            <div>
                              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Clock size={12} />
                                Avg Time
                              </div>
                              <div className="text-lg font-bold">
                                {analytics.avgTimeToComplete > 0
                                  ? formatTime(analytics.avgTimeToComplete)
                                  : 'N/A'}
                              </div>
                            </div>
                          </div>

                          <Progress value={analytics.completionRate} className="h-1.5" />
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Student Performance Overview</CardTitle>
                <CardDescription>
                  Individual progress and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {studentAnalytics.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        No student data available
                      </div>
                    ) : (
                      [...studentAnalytics]
                        .sort((a, b) => b.avgScore - a.avgScore)
                        .map((analytics, index) => (
                          <motion.div
                            key={analytics.profile.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-panel p-4 space-y-3"
                          >
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12 border-2 border-primary/50">
                                <AvatarImage src={analytics.profile.avatarUrl} />
                                <AvatarFallback>{analytics.profile.name[0]}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{analytics.profile.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    Level {calculateLevel(analytics.profile.xp)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {analytics.profile.xp} {themeConfig.xpLabel}
                                </p>
                              </div>

                              {index < 3 && (
                                <div className="text-2xl">
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  <CheckCircle size={12} />
                                  Completed
                                </div>
                                <div className="text-lg font-bold">{analytics.completedQuests}</div>
                              </div>

                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Avg Score</div>
                                <div className="text-lg font-bold flex items-center gap-1">
                                  {analytics.avgScore.toFixed(1)}
                                  {analytics.avgScore >= 90 && (
                                    <Star size={14} weight="fill" className="text-accent" />
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Streak</div>
                                <div className="text-lg font-bold">{analytics.streak}</div>
                              </div>

                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Activity</div>
                                <div className="text-sm font-bold">
                                  {analytics.recentActivity < 24 * 60 * 60 * 1000
                                    ? 'Today'
                                    : analytics.recentActivity < 7 * 24 * 60 * 60 * 1000
                                    ? formatTime(analytics.recentActivity)
                                    : 'Inactive'}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">
                                  {analytics.totalSubmissions > 0
                                    ? ((analytics.completedQuests / analytics.totalSubmissions) * 100).toFixed(0)
                                    : 0}%
                                </span>
                              </div>
                              <Progress 
                                value={analytics.totalSubmissions > 0
                                  ? (analytics.completedQuests / analytics.totalSubmissions) * 100
                                  : 0
                                } 
                                className="h-1.5" 
                              />
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2"
                              onClick={() => setSelectedStudent(analytics.profile)}
                            >
                              <Eye size={16} />
                              View Details
                            </Button>
                          </motion.div>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
