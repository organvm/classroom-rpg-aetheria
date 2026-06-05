import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { UserProfile, Theme, THEME_CONFIGS, Artifact, Quest, StudentPreferences, ThematicInterest, LearningStyle, THEMATIC_INTERESTS } from '@/lib/types'
import { calculateLevel, getLevelTitle, getXpForNextLevel } from '@/lib/game-utils'
import { Sparkle, Star, TrendUp, Pencil, Sliders, Funnel, SortAscending } from '@phosphor-icons/react'
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay'
import { AvatarEditor } from '@/components/avatar/AvatarEditor'
import { PreferencesModal } from '@/components/dialogs/PreferencesModal'
import { ArtifactDetailModal } from '@/components/dialogs/ArtifactDetailModal'
import { DEFAULT_AVATAR } from '@/lib/avatar-options'
import { useTouchGestures } from '@/hooks/use-touch-gestures'
import type { AvatarCustomization } from '@/lib/types'

// Rarity sort order (legendary is highest)
// Note: Artifact rarity type is 'common' | 'rare' | 'epic' | 'legendary'
const RARITY_ORDER: Record<string, number> = {
  legendary: 4,
  epic: 3,
  rare: 2,
  common: 0
}

type RarityFilter = 'all' | 'common' | 'rare' | 'epic' | 'legendary'
type SortOption = 'date-desc' | 'date-asc' | 'rarity-desc' | 'rarity-asc' | 'name-asc' | 'name-desc'

interface CharacterSheetProps {
  profile: UserProfile
  theme: Theme
  quests?: Quest[] // Optional quests for artifact source lookup
  onUpdateAvatar?: (avatar: AvatarCustomization) => void
  currentPreferences?: StudentPreferences
  onUpdatePreferences?: (
    primaryInterest: ThematicInterest,
    secondaryInterest?: ThematicInterest,
    learningStyle?: LearningStyle
  ) => void
}

// Individual artifact card component with touch support
interface ArtifactCardProps {
  artifact: Artifact
  getRarityColor: (rarity: string) => string
  getRarityBadge: (rarity: string) => React.ReactNode
  onClick: (artifact: Artifact) => void
}

function ArtifactCard({ artifact, getRarityColor, getRarityBadge, onClick }: ArtifactCardProps) {
  const touchGestures = useTouchGestures({
    onLongPress: () => onClick(artifact)
  })

  return (
    <Card
      className={`glass-panel p-6 border-2 hover:scale-105 transition-all cursor-pointer ${getRarityColor(artifact.rarity)}`}
      onTouchStart={touchGestures.onTouchStart}
      onTouchMove={touchGestures.onTouchMove}
      onTouchEnd={touchGestures.onTouchEnd}
      onClick={() => onClick(artifact)}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <Sparkle size={24} weight="fill" className="text-accent" />
          {getRarityBadge(artifact.rarity)}
        </div>
        <div>
          <h3 className="font-bold text-lg mb-1">{artifact.name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {artifact.description}
          </p>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Earned {new Date(artifact.earnedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Card>
  )
}

export function CharacterSheet({ profile, theme, quests, onUpdateAvatar, currentPreferences, onUpdatePreferences }: CharacterSheetProps) {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [isEditingPreferences, setIsEditingPreferences] = useState(false)
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('date-desc')

  const themeConfig = THEME_CONFIGS[theme]
  const level = calculateLevel(profile.xp)
  const levelTitle = getLevelTitle(level, profile.role)
  const nextLevelXp = getXpForNextLevel(profile.xp)
  const xpProgress = ((profile.xp % nextLevelXp) / nextLevelXp) * 100

  // Find the quest that awarded the selected artifact
  const selectedQuest = useMemo(() => {
    if (!selectedArtifact || !quests) return undefined
    return quests.find(q => q.id === selectedArtifact.questId)
  }, [selectedArtifact, quests])

  // Filter and sort artifacts
  const filteredAndSortedArtifacts = useMemo(() => {
    let artifacts = [...profile.artifacts]

    // Apply rarity filter
    if (rarityFilter !== 'all') {
      artifacts = artifacts.filter(a => a.rarity === rarityFilter)
    }

    // Apply sorting
    artifacts.sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return b.earnedAt - a.earnedAt
        case 'date-asc':
          return a.earnedAt - b.earnedAt
        case 'rarity-desc':
          return (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0)
        case 'rarity-asc':
          return (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0)
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })

    return artifacts
  }, [profile.artifacts, rarityFilter, sortOption])

  const handleSaveAvatar = (avatar: AvatarCustomization) => {
    if (onUpdateAvatar) {
      onUpdateAvatar(avatar)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-accent bg-accent/10'
      case 'epic': return 'border-secondary bg-secondary/10'
      case 'rare': return 'border-primary bg-primary/10'
      default: return 'border-muted bg-muted/10'
    }
  }

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Badge className="bg-accent text-accent-foreground">Legendary</Badge>
      case 'epic': return <Badge className="bg-secondary text-secondary-foreground">Epic</Badge>
      case 'rare': return <Badge className="bg-primary text-primary-foreground">Rare</Badge>
      default: return <Badge variant="outline">Common</Badge>
    }
  }

  // Count artifacts by rarity for filter badges
  const rarityCounts = useMemo(() => {
    return profile.artifacts.reduce((acc, artifact) => {
      acc[artifact.rarity] = (acc[artifact.rarity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [profile.artifacts])

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      <div className="glass-panel p-8 space-y-6">
        <div className="flex items-start gap-6">
          <div className="relative group">
            <div className="w-32 h-32">
              <AvatarDisplay
                avatar={profile.avatar || DEFAULT_AVATAR}
                size="lg"
                className="border-4 border-accent rounded-full bg-card"
              />
            </div>
            {onUpdateAvatar && (
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditingAvatar(true)}
              >
                <Pencil size={18} weight="bold" />
              </Button>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-lg px-4 py-1">
                  Level {level}
                </Badge>
                <span className="text-xl text-primary font-semibold">{levelTitle}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{themeConfig.xpLabel} Progress</span>
                <span className="text-sm font-medium">{profile.xp} / {nextLevelXp}</span>
              </div>
              <Progress value={xpProgress} className="h-3" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendUp size={16} />
                <span>{nextLevelXp - profile.xp} {themeConfig.xpLabel} to next level</span>
              </div>
            </div>

            {/* Personalization Settings Button */}
            {onUpdatePreferences && profile.role === 'student' && (
              <div className="pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="gap-2 w-full"
                  onClick={() => setIsEditingPreferences(true)}
                >
                  <Sliders size={18} />
                  Personalization Settings
                </Button>
                {currentPreferences && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {THEMATIC_INTERESTS.find(i => i.value === currentPreferences.primaryInterest)?.label || 'Not set'}
                    {currentPreferences.secondaryInterest && (
                      <> + {THEMATIC_INTERESTS.find(i => i.value === currentPreferences.secondaryInterest)?.label}</>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Sparkle size={28} weight="fill" className="text-accent" />
            <h2 className="text-2xl font-bold">Artifact Collection</h2>
            <Badge variant="secondary">{profile.artifacts.length}</Badge>
          </div>

          {/* Filter and Sort Controls */}
          {profile.artifacts.length > 0 && (
            <div className="flex items-center gap-3">
              {/* Rarity Filter */}
              <div className="flex items-center gap-2">
                <Funnel size={16} className="text-muted-foreground" />
                <Select value={rarityFilter} onValueChange={(v) => setRarityFilter(v as RarityFilter)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rarities</SelectItem>
                    <SelectItem value="legendary">
                      Legendary {rarityCounts.legendary ? `(${rarityCounts.legendary})` : ''}
                    </SelectItem>
                    <SelectItem value="epic">
                      Epic {rarityCounts.epic ? `(${rarityCounts.epic})` : ''}
                    </SelectItem>
                    <SelectItem value="rare">
                      Rare {rarityCounts.rare ? `(${rarityCounts.rare})` : ''}
                    </SelectItem>
                    <SelectItem value="common">
                      Common {rarityCounts.common ? `(${rarityCounts.common})` : ''}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <SortAscending size={16} className="text-muted-foreground" />
                <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="rarity-desc">Rarity (High)</SelectItem>
                    <SelectItem value="rarity-asc">Rarity (Low)</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {profile.artifacts.length === 0 ? (
          <Card className="glass-panel p-12 text-center">
            <Star size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-2">No artifacts yet</p>
            <p className="text-sm text-muted-foreground">
              Complete quests with high scores (90%+) to earn legendary artifacts
            </p>
          </Card>
        ) : filteredAndSortedArtifacts.length === 0 ? (
          <Card className="glass-panel p-12 text-center">
            <Funnel size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-2">No {rarityFilter} artifacts</p>
            <p className="text-sm text-muted-foreground">
              Try a different filter to see your collection
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedArtifacts.map((artifact) => (
              <ArtifactCard
                key={artifact.id}
                artifact={artifact}
                getRarityColor={getRarityColor}
                getRarityBadge={getRarityBadge}
                onClick={setSelectedArtifact}
              />
            ))}
          </div>
        )}
      </div>

      {onUpdateAvatar && (
        <AvatarEditor
          open={isEditingAvatar}
          avatar={profile.avatar || DEFAULT_AVATAR}
          theme={theme}
          onClose={() => setIsEditingAvatar(false)}
          onSave={handleSaveAvatar}
        />
      )}

      {onUpdatePreferences && (
        <PreferencesModal
          open={isEditingPreferences}
          currentPreferences={currentPreferences}
          onClose={() => setIsEditingPreferences(false)}
          onSave={onUpdatePreferences}
        />
      )}

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
}
