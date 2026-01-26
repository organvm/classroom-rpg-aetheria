import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from '@/components/ErrorFallback'
import { ThemeProvider, useThemeContext, GameStateProvider, useGameState, FirebaseProvider } from '@/contexts'
import { useIsMobile } from '@/hooks/use-mobile'
import { useTouchSwipe } from '@/hooks/use-touch-gestures'
import { useDialogs } from '@/hooks/use-dialogs'
import { useQuestEvaluation } from '@/hooks/use-quest-evaluation'
import { SandboxBanner } from '@/components/SandboxBanner'
import { HUDSidebar } from '@/components/HUDSidebar'
import { MobileNav } from '@/components/MobileNav'
import { RealmEditor } from '@/components/RealmEditor'
import { RealmCreator } from '@/components/RealmCreator'
import { QuestCreator } from '@/components/QuestCreator'
import { QuestDialog } from '@/components/QuestDialog'
import { ParticleField } from '@/components/ParticleField'
import { LevelUpCelebration } from '@/components/LevelUpCelebration'
import { GenerativeMusic } from '@/components/GenerativeMusic'
import { ThemeBackground3D } from '@/components/ThemeBackground3D'
import { ViewRouter } from '@/components/ViewRouter'
import { NameDialog } from '@/components/NameDialog'
import { Toaster } from '@/components/ui/sonner'
import { isSandboxMode } from '@/lib/sandbox-mode'
import { soundEffects } from '@/lib/sound-effects'
import type { Realm, Quest } from '@/lib/types'

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

  const [currentView, setCurrentView] = useState('world-map')
  const [selectedRealmId, setSelectedRealmId] = useState<string | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const isInSandboxMode = useMemo(() => isSandboxMode(), [])

  // Quest evaluation with callbacks
  const { evaluateQuest } = useQuestEvaluation({
    themeConfig,
    theme,
    profile,
    callbacks: {
      addSubmission,
      addCrystal,
      addQuest,
      updateQuestStatus,
      updateProfileXp,
      addArtifact,
      onLevelUp: (level) => showLevelUpCelebration(level, profile.role)
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
    await evaluateQuest(quest, content)
    deselectQuest()
  }, [quests, evaluateQuest, deselectQuest])

  const handleCreateRealm = useCallback((realm: Realm) => {
    addRealm(realm)
    closeRealmCreator()
  }, [addRealm, closeRealmCreator])

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
        />
      </main>

      <QuestDialog
        quest={selectedQuest}
        theme={theme}
        open={!!dialogState.selectedQuestId}
        onClose={deselectQuest}
        onSubmit={handleQuestSubmit}
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
