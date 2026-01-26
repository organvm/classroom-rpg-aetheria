/**
 * Voting View Component
 *
 * Main view for the three-way voting system between teacher, student, and parent.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { VotingPanel } from '@/components/voting/VotingPanel'
import { VotingHistory } from '@/components/voting/VotingHistory'
import { useVoting } from '@/hooks/use-voting'
import type { Theme, Role, ThreeWayVote, Quest } from '@/lib/types'
import { THEME_CONFIGS } from '@/lib/types'
import { Plus, Handshake } from '@phosphor-icons/react'

interface VotingViewProps {
  theme: Theme
  role: Role
  profileId: string
  quests: Quest[]
}

export function VotingView({ theme, role, profileId, quests }: VotingViewProps) {
  const themeConfig = THEME_CONFIGS[theme]
  const {
    votes,
    createVote,
    castVote,
    getPendingVotes,
    overrideVote
  } = useVoting()

  const [selectedVote, setSelectedVote] = useState<ThreeWayVote | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Get the voter ID based on role
  const voterId = role === 'teacher' ? 'teacher' : 'student'

  // Get pending votes for the current user
  const pendingVotes = getPendingVotes(voterId, profileId)

  // Get all votes relevant to this user
  const relevantVotes = role === 'teacher'
    ? votes
    : votes.filter(v => v.studentId === profileId)

  const handleVote = (optionId: string) => {
    if (selectedVote) {
      castVote(selectedVote.id, voterId, optionId)
      setSelectedVote(null)
    }
  }

  const handleOverride = (optionId: string) => {
    if (selectedVote && role === 'teacher') {
      overrideVote(selectedVote.id, optionId)
      setSelectedVote(null)
    }
  }

  const handleCreateVote = (questId: string, topic: string) => {
    const quest = quests.find(q => q.id === questId)
    if (!quest) return

    createVote(questId, profileId, topic, [
      { label: 'Option A', description: 'First approach' },
      { label: 'Option B', description: 'Second approach' },
      { label: 'Option C', description: 'Third approach' }
    ])
    setShowCreateDialog(false)
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <Handshake size={32} weight="fill" className="text-primary" />
              Voting Center
            </h1>
            <p className="text-muted-foreground">
              {role === 'teacher'
                ? 'Create and manage collaborative decisions with students and parents'
                : 'Participate in decisions about your learning path'}
            </p>
          </div>
          {role === 'teacher' && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
            >
              <Plus size={20} weight="bold" />
              New Vote
            </Button>
          )}
        </div>
      </motion.div>

      {/* Pending Votes Section */}
      {pendingVotes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold">Your Pending Votes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingVotes.map(vote => (
              <VotingPanel
                key={vote.id}
                vote={vote}
                voterId={voterId}
                onVote={(optionId) => castVote(vote.id, voterId, optionId)}
                onOverride={role === 'teacher' ? (optionId) => overrideVote(vote.id, optionId) : undefined}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State for No Pending Votes */}
      {pendingVotes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-panel p-8 text-center">
            <Handshake size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Pending Votes</h3>
            <p className="text-muted-foreground">
              {role === 'teacher'
                ? 'Create a new vote to start a collaborative decision process.'
                : 'You\'re all caught up! No votes need your input right now.'}
            </p>
          </Card>
        </motion.div>
      )}

      {/* Voting History */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <VotingHistory
          votes={relevantVotes}
          onSelectVote={setSelectedVote}
        />
      </motion.div>

      {/* Selected Vote Detail Dialog */}
      <Dialog open={!!selectedVote} onOpenChange={() => setSelectedVote(null)}>
        <DialogContent className="glass-panel max-w-lg">
          {selectedVote && (
            <>
              <DialogHeader>
                <DialogTitle>Vote Details</DialogTitle>
              </DialogHeader>
              <VotingPanel
                vote={selectedVote}
                voterId={voterId}
                onVote={handleVote}
                onOverride={role === 'teacher' ? handleOverride : undefined}
                showResults
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Vote Dialog (Teacher Only) */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="glass-panel">
          <DialogHeader>
            <DialogTitle>Create New Vote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Select a {themeConfig.questLabel.toLowerCase()} and topic to create a new collaborative vote.
            </p>
            <p className="text-sm text-muted-foreground">
              (Vote creation form would go here - requires quest selection and topic input)
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button disabled>
                Create Vote
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
