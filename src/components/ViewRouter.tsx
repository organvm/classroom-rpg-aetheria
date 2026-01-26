import { memo } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus } from '@phosphor-icons/react'
import { QuestCard } from '@/components/QuestCard'
import { ArchivesView } from '@/components/ArchivesView'
import { CharacterSheet } from '@/components/CharacterSheet'
import { Leaderboard } from '@/components/Leaderboard'
import { QuickStats } from '@/components/QuickStats'
import { UniverseMap } from '@/components/UniverseMap'
import { BoardGameMap } from '@/components/BoardGameMap'
import { ConstellationView } from '@/components/ConstellationView'
import { TeacherDashboard } from '@/components/TeacherDashboard'
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import { VotingView } from '@/components/VotingView'
import { Error3DFallback, ErrorChartFallback } from '@/components/ErrorFallback'
import type {
  Theme,
  Role,
  ThemeConfig,
  Realm,
  Quest,
  Submission,
  KnowledgeCrystal,
  UserProfile,
  AvatarCustomization
} from '@/lib/types'

interface ViewRouterProps {
  currentView: string
  setCurrentView: (view: string) => void
  theme: Theme
  role: Role
  themeConfig: ThemeConfig
  realms: Realm[]
  quests: Quest[]
  submissions: Submission[]
  crystals: KnowledgeCrystal[]
  profile: UserProfile
  allProfiles: UserProfile[]
  selectedRealmId: string | null
  selectedRealm: Realm | null
  realmQuests: Quest[]
  onRealmClick: (realmId: string) => void
  onQuestClick: (questId: string) => void
  onAttuneCrystal: (crystalId: string) => void
  onUpdateAvatar: (avatar: AvatarCustomization) => void
  onDeleteQuest: (questId: string) => void
  onDeleteRealm: (realmId: string) => void
  onUpdateSubmission: (submission: Submission) => void
  onImportRealms: (realms: Realm[]) => void
  onImportQuests: (quests: Quest[]) => void
  onCreateRealm: () => void
  onCreateQuest: () => void
}

const DefaultErrorFallback = ({ resetErrorBoundary }: { resetErrorBoundary: () => void }) => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="glass-panel p-8 text-center space-y-4">
      <p className="text-muted-foreground">Unable to load this view</p>
      <Button onClick={resetErrorBoundary}>Retry</Button>
    </div>
  </div>
)

export const ViewRouter = memo(function ViewRouter({
  currentView,
  setCurrentView,
  theme,
  role,
  themeConfig,
  realms,
  quests,
  submissions,
  crystals,
  profile,
  allProfiles,
  selectedRealmId,
  selectedRealm,
  realmQuests,
  onRealmClick,
  onQuestClick,
  onAttuneCrystal,
  onUpdateAvatar,
  onDeleteQuest,
  onDeleteRealm,
  onUpdateSubmission,
  onImportRealms,
  onImportQuests,
  onCreateRealm,
  onCreateQuest
}: ViewRouterProps) {
  return (
    <AnimatePresence mode="wait">
      {currentView === 'world-map' && (
        <motion.div
          key="world-map"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="h-full relative"
        >
          <ErrorBoundary
            FallbackComponent={Error3DFallback}
            onReset={() => {
              setCurrentView('quests')
              setTimeout(() => setCurrentView('world-map'), 100)
            }}
          >
            <UniverseMap
              realms={realms}
              theme={theme}
              onRealmClick={onRealmClick}
            />
          </ErrorBoundary>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center space-y-2">
            <h1 className="text-5xl font-bold glow-text">Aetheria</h1>
            <p className="text-lg text-muted-foreground">The Living Classroom</p>
          </div>
          {realms.length === 0 && role === 'teacher' && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <Button size="lg" className="gap-2" onClick={onCreateRealm}>
                <Plus size={24} weight="bold" />
                Create Your First {themeConfig.realmLabel}
              </Button>
            </div>
          )}
          {role === 'teacher' && realms.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <Button size="lg" className="gap-2" onClick={onCreateRealm}>
                <Plus size={24} weight="bold" />
                Add {themeConfig.realmLabel}
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {currentView === 'realm-detail' && selectedRealm && (
        <motion.div
          key="realm-detail"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <ErrorBoundary FallbackComponent={Error3DFallback}>
            <BoardGameMap
              quests={realmQuests}
              theme={theme}
              onQuestClick={onQuestClick}
              onBack={() => setCurrentView('world-map')}
              realmColor={selectedRealm.color}
              realmName={selectedRealm.name}
              role={role}
              onCreateQuest={onCreateQuest}
            />
          </ErrorBoundary>
        </motion.div>
      )}

      {currentView === 'constellation' && selectedRealm && (
        <motion.div
          key="constellation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full flex flex-col"
        >
          <div className="p-8 pb-0">
            <Button onClick={() => setCurrentView('realm-detail')} variant="outline" className="mb-4">
              &larr; Back to {themeConfig.realmLabel}
            </Button>
            <h1 className="text-3xl font-bold mb-2">Mastery Constellation</h1>
            <p className="text-muted-foreground">{selectedRealm.name}</p>
          </div>
          <div className="flex-1">
            <ErrorBoundary FallbackComponent={ErrorChartFallback}>
              <ConstellationView quests={realmQuests} />
            </ErrorBoundary>
          </div>
        </motion.div>
      )}

      {currentView === 'quests' && (
        <motion.div
          key="quests"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-8 space-y-4 md:space-y-6"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">All {themeConfig.questLabel}s</h1>
            <p className="text-sm md:text-base text-muted-foreground">Your journey across all realms</p>
          </div>

          <QuickStats
            totalQuests={quests.length}
            completedQuests={quests.filter(q => q.status === 'completed').length}
            failedQuests={quests.filter(q => q.status === 'failed').length}
            totalArtifacts={profile.artifacts.length}
            theme={theme}
          />

          {quests.length === 0 ? (
            <div className="glass-panel p-8 md:p-12 text-center">
              <p className="text-muted-foreground">No quests available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
              {quests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  theme={theme}
                  onClick={() => onQuestClick(quest.id)}
                  isLocked={quest.status === 'locked'}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {currentView === 'archives' && (
        <motion.div
          key="archives"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArchivesView
            crystals={crystals}
            theme={theme}
            onAttune={onAttuneCrystal}
          />
        </motion.div>
      )}

      {currentView === 'character' && (
        <motion.div
          key="character"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CharacterSheet
            profile={profile}
            theme={theme}
            onUpdateAvatar={onUpdateAvatar}
          />
        </motion.div>
      )}

      {currentView === 'leaderboard' && (
        <motion.div
          key="leaderboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Leaderboard
            profiles={allProfiles}
            theme={theme}
            currentUserId={profile.id}
          />
        </motion.div>
      )}

      {currentView === 'teacher-dashboard' && role === 'teacher' && (
        <motion.div
          key="teacher-dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ErrorBoundary FallbackComponent={DefaultErrorFallback}>
            <TeacherDashboard
              quests={quests}
              submissions={submissions}
              realms={realms}
              theme={theme}
              onDeleteQuest={onDeleteQuest}
              onDeleteRealm={onDeleteRealm}
              onUpdateSubmission={onUpdateSubmission}
              onImportRealms={onImportRealms}
              onImportQuests={onImportQuests}
            />
          </ErrorBoundary>
        </motion.div>
      )}

      {currentView === 'analytics' && role === 'teacher' && (
        <motion.div
          key="analytics"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ErrorBoundary FallbackComponent={ErrorChartFallback}>
            <AnalyticsDashboard
              quests={quests}
              submissions={submissions}
              profiles={allProfiles}
              theme={theme}
            />
          </ErrorBoundary>
        </motion.div>
      )}

      {currentView === 'voting' && (
        <motion.div
          key="voting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ErrorBoundary FallbackComponent={DefaultErrorFallback}>
            <VotingView
              theme={theme}
              role={role}
              profileId={profile.id}
              quests={quests}
            />
          </ErrorBoundary>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
