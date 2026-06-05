import { useMemo, memo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Theme, THEME_CONFIGS, UserProfile, Role, Quest, Submission, Artifact } from '@/lib/types'
import { Trophy, Medal, Star, Crown, Sparkle } from '@phosphor-icons/react'
import { calculateLevel, getLevelTitle } from '@/lib/game-utils'
import { motion, AnimatePresence } from 'framer-motion'
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay'
import { DEFAULT_AVATAR } from '@/lib/avatar-options'
import { StudentDetailView } from '@/components/student/StudentDetailView'
import { ArtifactDetailModal } from '@/components/dialogs/ArtifactDetailModal'
import { useMotionConfig } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

// Rarity sort order for displaying top artifacts
// Note: Artifact rarity type is 'common' | 'rare' | 'epic' | 'legendary'
const RARITY_ORDER: Record<string, number> = {
  legendary: 4,
  epic: 3,
  rare: 2,
  common: 0
}

// Get rarity-based styling for mini artifact icons
function getArtifactRarityClass(rarity: string): string {
  switch (rarity) {
    case 'legendary': return 'border-accent bg-accent/20 text-accent'
    case 'epic': return 'border-secondary bg-secondary/20 text-secondary'
    case 'rare': return 'border-primary bg-primary/20 text-primary'
    default: return 'border-muted bg-muted/20 text-muted-foreground'
  }
}

interface LeaderboardProps {
  profiles: UserProfile[]
  theme: Theme
  currentUserId: string
  role?: Role
  quests?: Quest[]
  submissions?: Submission[]
}

export const Leaderboard = memo(function Leaderboard({
  profiles,
  theme,
  currentUserId,
  role = 'student',
  quests = [],
  submissions = []
}: LeaderboardProps) {
  const themeConfig = THEME_CONFIGS[theme]
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null)
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
  const { shouldAnimate } = useMotionConfig()

  // Find the quest that awarded the selected artifact
  const selectedQuest = useMemo(() => {
    if (!selectedArtifact || !quests) return undefined
    return quests.find(q => q.id === selectedArtifact.questId)
  }, [selectedArtifact, quests])

  // Get top 3 artifacts for a profile sorted by rarity (highest first)
  const getTopArtifacts = (profile: UserProfile): Artifact[] => {
    return [...profile.artifacts]
      .sort((a, b) => (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0))
      .slice(0, 3)
  }

  // Memoize sorted profiles to prevent re-sorting on every render
  const sortedProfiles = useMemo(
    () => [...profiles].sort((a, b) => b.xp - a.xp),
    [profiles]
  )

  // Handle click on student entry (teachers only)
  const handleStudentClick = (profile: UserProfile) => {
    if (role === 'teacher' && profile.role === 'student') {
      setSelectedStudent(profile)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={28} weight="fill" className="text-accent" />
    if (rank === 2) return <Medal size={24} weight="fill" className="text-muted-foreground" />
    if (rank === 3) return <Medal size={24} weight="fill" className="text-destructive" />
    return <Star size={20} className="text-muted-foreground" />
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
    if (rank === 2) return 'border-muted-foreground/50 bg-muted-foreground/5'
    if (rank === 3) return 'border-destructive/50 bg-destructive/5'
    return 'border-border'
  }

  return (
    <div className="space-y-6 p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Trophy size={32} weight="fill" className="text-accent" />
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Top heroes ranked by {themeConfig.xpLabel}</p>
        </div>
      </div>

      {sortedProfiles.length === 0 ? (
        <Card className="glass-panel p-12 text-center">
          <Trophy size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No heroes yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedProfiles.map((profile, index) => {
            const rank = index + 1
            const level = calculateLevel(profile.xp)
            const levelTitle = getLevelTitle(level, profile.role)
            const isCurrentUser = profile.id === currentUserId

            const isClickable = role === 'teacher' && profile.role === 'student'

            return (
              <motion.div
                key={profile.id}
                initial={shouldAnimate ? { opacity: 0, x: -20 } : false}
                animate={shouldAnimate ? { opacity: 1, x: 0 } : false}
                transition={shouldAnimate ? { delay: index * 0.05, type: 'spring', stiffness: 100 } : { duration: 0 }}
              >
                <Card
                  className={`glass-panel p-6 border-2 ${shouldAnimate ? 'transition-all hover:scale-[1.02]' : ''} ${getRankColor(rank)} ${
                    isCurrentUser ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                  } ${isClickable ? 'cursor-pointer hover:border-primary/50' : ''}`}
                  onClick={() => handleStudentClick(profile)}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center justify-center w-12">
                      {rank <= 3 ? (
                        shouldAnimate ? (
                          <motion.div
                            animate={rank === 1 ? {
                              rotate: [0, -10, 10, -10, 0],
                              scale: [1, 1.1, 1]
                            } : {}}
                            transition={{
                              duration: 2,
                              repeat: rank === 1 ? Infinity : 0,
                              repeatDelay: 3
                            }}
                          >
                            {getRankIcon(rank)}
                          </motion.div>
                        ) : (
                          <div>{getRankIcon(rank)}</div>
                        )
                      ) : (
                        <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>
                      )}
                    </div>

                    <motion.div
                      whileHover={shouldAnimate ? { scale: 1.05, rotate: [0, -5, 5, 0] } : undefined}
                      transition={shouldAnimate ? { duration: 0.3 } : { duration: 0 }}
                    >
                      <div className="w-16 h-16 border-2 border-primary rounded-full overflow-hidden bg-card">
                        <AvatarDisplay
                          avatar={profile.avatar || DEFAULT_AVATAR}
                          size="md"
                        />
                      </div>
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg truncate">{profile.name}</h3>
                        {isCurrentUser && (
                          <Badge variant="default" className="text-xs gap-1">
                            <Sparkle size={12} weight="fill" />
                            You
                          </Badge>
                        )}
                        {rank === 1 && (
                          shouldAnimate ? (
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Badge className="bg-accent text-accent-foreground text-xs">
                                Champion
                              </Badge>
                            </motion.div>
                          ) : (
                            <Badge className="bg-accent text-accent-foreground text-xs">
                              Champion
                            </Badge>
                          )
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Level {level}</span>
                        <span>•</span>
                        <span>{levelTitle}</span>
                        {profile.artifacts.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Sparkle size={12} weight="fill" className="text-accent" />
                              {profile.artifacts.length}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Top 3 Artifacts Display */}
                      {profile.artifacts.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {getTopArtifacts(profile).map((artifact) => (
                            <button
                              key={artifact.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedArtifact(artifact)
                              }}
                              className={cn(
                                "w-7 h-7 rounded-full border flex items-center justify-center",
                                "hover:scale-110 transition-all cursor-pointer",
                                getArtifactRarityClass(artifact.rarity)
                              )}
                              title={`${artifact.name} (${artifact.rarity})`}
                            >
                              <Sparkle size={14} weight="fill" />
                            </button>
                          ))}
                          {profile.artifacts.length > 3 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              +{profile.artifacts.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-accent">{profile.xp}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {themeConfig.xpLabel}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Student Detail View Modal (Teachers only) */}
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

      {/* Artifact Detail Modal */}
      <ArtifactDetailModal
        artifact={selectedArtifact}
        quest={selectedQuest}
        open={!!selectedArtifact}
        onOpenChange={(open) => !open && setSelectedArtifact(null)}
        theme={themeConfig}
      />
    </div>
  )
})
