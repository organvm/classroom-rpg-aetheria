import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from '@/components/feedback/ErrorFallback'
import { ThemeProvider, useThemeContext, GameStateProvider, useGameState, FirebaseProvider } from '@/contexts'
import { useIsMobile } from '@/hooks/use-mobile'
import { useTouchSwipe } from '@/hooks/use-touch-gestures'
import { useDialogs } from '@/hooks/use-dialogs'
import { useQuestEvaluation } from '@/hooks/use-quest-evaluation'
import { useThematicVariants } from '@/hooks/use-thematic-variants'
import { useVoting } from '@/hooks/use-voting'
import { useParentLinking } from '@/hooks/use-parent-linking'
import { useNotifications } from '@/hooks/use-notifications'
import { useAIConsent, type AIFeature } from '@/hooks/use-ai-consent'
import { SandboxBanner } from '@/components/layout/SandboxBanner'
import { AIConsentModal } from '@/components/dialogs/AIConsentModal'
import { HUDSidebar } from '@/components/layout/HUDSidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { RealmEditor } from '@/components/realm/RealmEditor'
import { RealmCreator } from '@/components/realm/RealmCreator'
import { QuestCreator } from '@/components/quest/QuestCreator'
import { QuestDialog } from '@/components/dialogs/QuestDialog'
import { ParticleField } from '@/components/fx/ParticleField'
import { LevelUpCelebration } from '@/components/feedback/LevelUpCelebration'
import { GenerativeMusic } from '@/components/fx/GenerativeMusic'
import { ThemeBackground3D } from '@/components/fx/ThemeBackground3D'
import { ViewRouter } from '@/components/layout/ViewRouter'
import { NameDialog } from '@/components/dialogs/NameDialog'
import { Toaster } from '@/components/ui/sonner'
import { isSandboxMode } from '@/lib/sandbox-mode'
import { soundEffects } from '@/lib/sound-effects'
import type { Realm, Quest, ThematicInterest, LearningStyle, RealmExtended } from '@/lib/types'

function AppContent() {
  const { theme, role, themeConfig, cycleTheme, toggleRole, setRole } = useThemeContext()
  const {
    realms,
    quests,
    submissions,
    crystals,
    profile,
    allProfiles,
    setRealms,
    addRealm,
    deleteRealm,
    addQuest,
    deleteQuest,
    updateQuestStatus,
    addSubmission,
    updateSubmission,
    addCrystal,
    attuneCrystal,
    updateProfileXp,
    addArtifact,
    updateAvatar,
    setProfileName,
    setProfileRole,
    importRealms,
    importQuests
  } = useGameState()

  const {
    state: dialogState,
    openNameDialog,
    closeNameDialog,
    setNameInput,
    showLevelUpCelebration,
    hideLevelUpCelebration,
    openRealmEditor,
    closeRealmEditor,
    openRealmCreator,
    closeRealmCreator,
    openQuestCreator,
    closeQuestCreator,
    selectQuest,
    deselectQuest
  } = useDialogs()

  // Thematic variants for personalization
  const { getPreferences, setPreferences, getVariantsForQuest, getRecommendedVariant } = useThematicVariants()

  // Voting system for parent portal
  const { votes, castVote, getPendingVotes, getVotesByStudent } = useVoting()

  // Parent linking system
  const {
    linkRequests,
    linkedStudents: linkedStudentIds,
    requestLink,
    removeLink,
    getLinkedStudentsForParent
  } = useParentLinking(profile?.id)

  // Notifications system
  const { addNotification } = useNotifications()

  // AI consent management
  const { hasConsented, checkFeatureConsent } = useAIConsent()
  const [showAIConsentModal, setShowAIConsentModal] = useState(false)
  const [pendingQuestSubmission, setPendingQuestSubmission] = useState<{
    questId: string
    content: string
  } | null>(null)
  const [requestedAIFeatures, setRequestedAIFeatures] = useState<AIFeature[]>([])

  // Get current user's preferences
  const currentPreferences = useMemo(() => {
    if (profile?.id) {
      return getPreferences(profile.id)
    }
    return undefined
  }, [profile?.id, getPreferences])

  // Handle updating preferences
  const handleUpdatePreferences = useCallback((
    primaryInterest: ThematicInterest,
    secondaryInterest?: ThematicInterest,
    learningStyle?: LearningStyle
  ) => {
    if (profile?.id) {
      setPreferences(profile.id, primaryInterest, secondaryInterest, learningStyle)
    }
  }, [profile?.id, setPreferences])

  // State for selected linked student
  const [selectedLinkedStudentId, setSelectedLinkedStudentId] = useState<string | null>(null)

  // Get linked student profiles for parent role
  const linkedStudentProfiles = useMemo(() => {
    if (role === 'parent' && profile?.id) {
      const linkedIds = getLinkedStudentsForParent(profile.id)
      return allProfiles.filter(p => linkedIds.includes(p.id))
    }
    return []
  }, [role, profile?.id, allProfiles, getLinkedStudentsForParent])

  // Selected or first linked student for parent role
  const linkedStudent = useMemo(() => {
    if (role === 'parent') {
      // If a specific student is selected, use that
      if (selectedLinkedStudentId) {
        const selected = linkedStudentProfiles.find(p => p.id === selectedLinkedStudentId)
        if (selected) return selected
      }
      // Otherwise use first linked student
      if (linkedStudentProfiles.length > 0) {
        return linkedStudentProfiles[0]
      }
      // Fallback: in sandbox mode, use first student-like profile
      const studentProfile = allProfiles.find(p => p.role === 'student')
      return studentProfile || profile
    }
    return undefined
  }, [role, selectedLinkedStudentId, linkedStudentProfiles, allProfiles, profile])

  // Handle selecting a linked student
  const handleSelectLinkedStudent = useCallback((studentId: string) => {
    setSelectedLinkedStudentId(studentId)
  }, [])

  // Handle requesting a parent link
  const handleRequestParentLink = useCallback((studentId: string) => {
    if (profile?.id) {
      requestLink(studentId, profile.id)
    }
  }, [profile?.id, requestLink])

  // Handle removing a parent link
  const handleRemoveParentLink = useCallback((studentId: string) => {
    if (profile?.id) {
      removeLink(profile.id, studentId)
    }
  }, [profile?.id, removeLink])

  // Votes for parent portal
  const pendingVotesForParent = useMemo(() => {
    if (role === 'parent' && linkedStudent) {
      return getPendingVotes('parent', linkedStudent.id)
    }
    return []
  }, [role, linkedStudent, getPendingVotes])

  const voteHistoryForParent = useMemo(() => {
    if (role === 'parent' && linkedStudent) {
      return getVotesByStudent(linkedStudent.id).filter(v => v.status !== 'pending')
    }
    return []
  }, [role, linkedStudent, getVotesByStudent])

  const handleCastParentVote = useCallback((voteId: string, optionId: string) => {
    castVote(voteId, 'parent', optionId)
    addNotification({
      type: 'vote-cast',
      title: 'Vote Recorded',
      message: 'Your vote has been recorded successfully'
    })
  }, [castVote, addNotification])

  const [currentView, setCurrentView] = useState('world-map')
  const [selectedRealmId, setSelectedRealmId] = useState<string | null>(null)
  const [mapMode, setMapMode] = useState<'3d' | '2d'>('3d')

  const handleToggleMapMode = useCallback(() => {
    setMapMode(prev => prev === '3d' ? '2d' : '3d')
  }, [])
  const mainRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const isInSandboxMode = useMemo(() => isSandboxMode(), [])

  // Wrapped callbacks with notifications
  const handleAddSubmissionWithNotification = useCallback((submission: Parameters<typeof addSubmission>[0]) => {
    addSubmission(submission)
    if (submission.score !== undefined) {
      addNotification({
        type: 'quest-graded',
        title: 'Quest Graded',
        message: `Your submission received a score of ${submission.score}%`,
        questId: submission.questId
      })
    }
  }, [addSubmission, addNotification])

  const handleAddArtifactWithNotification = useCallback((artifact: Parameters<typeof addArtifact>[0]) => {
    addArtifact(artifact)
    addNotification({
      type: 'achievement-earned',
      title: 'Artifact Earned!',
      message: `You earned the ${artifact.name} artifact!`,
      achievementId: artifact.id
    })
  }, [addArtifact, addNotification])

  const handleLevelUpWithNotification = useCallback((level: number) => {
    showLevelUpCelebration(level, profile.role)
    addNotification({
      type: 'level-up',
      title: 'Level Up!',
      message: `Congratulations! You reached level ${level}!`
    })
  }, [showLevelUpCelebration, profile.role, addNotification])

  // Quest evaluation with callbacks
  const { evaluateQuest } = useQuestEvaluation({
    themeConfig,
    theme,
    profile,
    callbacks: {
      addSubmission: handleAddSubmissionWithNotification,
      addCrystal,
      addQuest,
      updateQuestStatus,
      updateProfileXp,
      addArtifact: handleAddArtifactWithNotification,
      onLevelUp: handleLevelUpWithNotification
    }
  })

  // Show name dialog if profile has no name
  useEffect(() => {
    if (!profile?.name || profile.name === '') {
      openNameDialog()
    }
  }, [profile?.name, openNameDialog])

  // Sync role to profile when role changes
  useEffect(() => {
    if (role && profile && profile.role !== role) {
      setProfileRole(role)
    }
  }, [role])

  const handleRealmClick = useCallback((realmId: string) => {
    soundEffects.play('planet-click')
    setSelectedRealmId(realmId)
    setCurrentView('realm-detail')
  }, [])

  const handleQuestClick = useCallback((questId: string) => {
    selectQuest(questId)
  }, [selectQuest])

  const handleQuestSubmit = useCallback(async (questId: string, content: string) => {
    const quest = quests.find(q => q.id === questId)
    if (!quest) return

    // Check if user has consented to required AI features
    const requiredFeatures: AIFeature[] = ['quest-evaluation', 'knowledge-crystals', 'redemption-quests']
    const missingConsent = requiredFeatures.filter(f => !checkFeatureConsent(f))

    if (missingConsent.length > 0) {
      // Store the pending submission and show consent modal
      setPendingQuestSubmission({ questId, content })
      setRequestedAIFeatures(requiredFeatures)
      setShowAIConsentModal(true)
      return
    }

    await evaluateQuest(quest, content)
    deselectQuest()
  }, [quests, evaluateQuest, deselectQuest, checkFeatureConsent])

  // Handle consent acceptance - process pending submission
  const handleAIConsentAccept = useCallback(async () => {
    setShowAIConsentModal(false)

    // If there's a pending quest submission, process it now
    if (pendingQuestSubmission) {
      const quest = quests.find(q => q.id === pendingQuestSubmission.questId)
      if (quest) {
        await evaluateQuest(quest, pendingQuestSubmission.content)
        deselectQuest()
      }
      setPendingQuestSubmission(null)
    }

    setRequestedAIFeatures([])
  }, [pendingQuestSubmission, quests, evaluateQuest, deselectQuest])

  // Handle consent decline
  const handleAIConsentDecline = useCallback(() => {
    setShowAIConsentModal(false)
    setPendingQuestSubmission(null)
    setRequestedAIFeatures([])
  }, [])

  const handleCreateRealm = useCallback((realm: Realm) => {
    addRealm(realm)
    closeRealmCreator()
  }, [addRealm, closeRealmCreator])

  const handleUpdateRealm = useCallback((updatedRealm: RealmExtended) => {
    setRealms(realms.map(r => r.id === updatedRealm.id ? updatedRealm : r))
  }, [realms, setRealms])

  const handleCreateQuest = useCallback((quest: Quest) => {
    addQuest(quest)
    closeQuestCreator()
  }, [addQuest, closeQuestCreator])

  const handleSetName = useCallback(() => {
    if (!dialogState.nameInput.trim()) {
      return
    }
    setProfileName(dialogState.nameInput.trim())
    closeNameDialog()
  }, [dialogState.nameInput, setProfileName, closeNameDialog])

  // Computed values
  const selectedRealm = useMemo(
    () => realms.find(r => r.id === selectedRealmId) || null,
    [realms, selectedRealmId]
  )
  const realmQuests = useMemo(
    () => quests.filter(q => q.realmId === selectedRealmId),
    [quests, selectedRealmId]
  )
  const selectedQuest = useMemo(
    () => quests.find(q => q.id === dialogState.selectedQuestId) || null,
    [quests, dialogState.selectedQuestId]
  )

  // Get variants for selected quest
  const selectedQuestVariants = useMemo(() => {
    if (!selectedQuest) return []
    return getVariantsForQuest(selectedQuest.id)
  }, [selectedQuest, getVariantsForQuest])

  // Get recommended variant for selected quest based on student preferences
  const recommendedQuestVariant = useMemo(() => {
    if (!selectedQuest || !profile?.id) return undefined
    return getRecommendedVariant(selectedQuest.id, profile.id)
  }, [selectedQuest, profile?.id, getRecommendedVariant])

  // Touch swipe navigation
  const viewOrder = ['world-map', 'quests', 'archives', 'character', 'leaderboard', 'voting']
  useTouchSwipe(mainRef.current, {
    onSwipeLeft: () => {
      if (!isMobile) return
      const currentIndex = viewOrder.indexOf(currentView)
      if (currentIndex < viewOrder.length - 1) {
        setCurrentView(viewOrder[currentIndex + 1])
      }
    },
    onSwipeRight: () => {
      if (!isMobile) return
      const currentIndex = viewOrder.indexOf(currentView)
      if (currentIndex > 0) {
        setCurrentView(viewOrder[currentIndex - 1])
      } else if (currentView === 'realm-detail') {
        setCurrentView('world-map')
      }
    }
  })

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      {/* Skip Navigation Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {isInSandboxMode && <SandboxBanner />}
      <ParticleField count={isMobile ? 20 : 40} speed={0.2} />

      {(currentView === 'realm-detail' || currentView === 'constellation') && selectedRealm && (
        <ErrorBoundary
          fallback={<div className="hidden" />}
          onError={(error) => console.error('3D Background error:', error)}
        >
          <ThemeBackground3D theme={theme} realmColor={selectedRealm.color} />
        </ErrorBoundary>
      )}

      <NameDialog
        open={dialogState.showNameDialog}
        nameInput={dialogState.nameInput}
        onNameChange={setNameInput}
        onSubmit={handleSetName}
      />

      <MobileNav
        profile={profile}
        theme={theme}
        role={role}
        currentView={currentView}
        onNavigate={setCurrentView}
        onThemeChange={cycleTheme}
        onRoleToggle={toggleRole}
      />

      <HUDSidebar
        profile={profile}
        theme={theme}
        role={role}
        currentView={currentView}
        onNavigate={setCurrentView}
        onThemeChange={cycleTheme}
        onRoleToggle={toggleRole}
      />

      <div className="fixed bottom-4 left-4 z-40 md:z-50">
        <ErrorBoundary fallback={<div className="hidden" />}>
          <GenerativeMusic />
        </ErrorBoundary>
      </div>

      <main ref={mainRef} id="main-content" className="flex-1 overflow-auto pt-[60px] pb-[60px] md:pt-0 md:pb-0" role="main">
        <ViewRouter
          currentView={currentView}
          setCurrentView={setCurrentView}
          theme={theme}
          role={role}
          themeConfig={themeConfig}
          realms={realms}
          quests={quests}
          submissions={submissions}
          crystals={crystals}
          profile={profile}
          allProfiles={allProfiles}
          selectedRealmId={selectedRealmId}
          selectedRealm={selectedRealm}
          realmQuests={realmQuests}
          onRealmClick={handleRealmClick}
          onQuestClick={handleQuestClick}
          onAttuneCrystal={attuneCrystal}
          onUpdateAvatar={updateAvatar}
          onDeleteQuest={deleteQuest}
          onDeleteRealm={deleteRealm}
          onUpdateSubmission={updateSubmission}
          onImportRealms={importRealms}
          onImportQuests={importQuests}
          onCreateRealm={openRealmCreator}
          onCreateQuest={openQuestCreator}
          onUpdateRealm={handleUpdateRealm}
          currentPreferences={currentPreferences}
          onUpdatePreferences={handleUpdatePreferences}
          linkedStudent={linkedStudent}
          linkedStudents={linkedStudentProfiles}
          parentId={profile?.id}
          linkRequests={linkRequests}
          pendingVotes={pendingVotesForParent}
          voteHistory={voteHistoryForParent}
          onCastParentVote={handleCastParentVote}
          onRequestParentLink={handleRequestParentLink}
          onRemoveParentLink={handleRemoveParentLink}
          onSelectLinkedStudent={handleSelectLinkedStudent}
          mapMode={mapMode}
          onToggleMapMode={handleToggleMapMode}
        />
      </main>

      <QuestDialog
        quest={selectedQuest}
        theme={theme}
        open={!!dialogState.selectedQuestId}
        onClose={deselectQuest}
        onSubmit={handleQuestSubmit}
        variants={selectedQuestVariants}
        studentPreferences={currentPreferences}
        recommendedVariant={recommendedQuestVariant}
      />

      {dialogState.isEditingRealms && (
        <RealmEditor
          realms={realms}
          theme={theme}
          onUpdateRealms={setRealms}
          onClose={closeRealmEditor}
        />
      )}

      <RealmCreator
        open={dialogState.isCreatingRealm}
        theme={theme}
        onClose={closeRealmCreator}
        onCreate={handleCreateRealm}
      />

      <QuestCreator
        open={dialogState.isCreatingQuest}
        theme={theme}
        realmId={selectedRealmId || ''}
        realm={selectedRealm ?? undefined}
        onClose={closeQuestCreator}
        onCreate={handleCreateQuest}
      />

      <Toaster position="top-right" />

      <LevelUpCelebration
        show={dialogState.showLevelUp}
        level={dialogState.levelUpData.level}
        role={dialogState.levelUpData.role}
        theme={theme}
        onComplete={hideLevelUpCelebration}
      />

      <AIConsentModal
        open={showAIConsentModal}
        theme={theme}
        requestedFeatures={requestedAIFeatures.length > 0 ? requestedAIFeatures : undefined}
        onAccept={handleAIConsentAccept}
        onDecline={handleAIConsentDecline}
      />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <FirebaseProvider>
        <ThemeProvider>
          <GameStateProvider>
            <AppContent />
          </GameStateProvider>
        </ThemeProvider>
      </FirebaseProvider>
    </ErrorBoundary>
  )
}

export default App
