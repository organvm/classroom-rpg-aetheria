/**
 * Voting View Component
 *
 * Main view for the three-way voting system between teacher, student, and parent.
 */

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VotingPanel } from '@/components/voting/VotingPanel'
import { VotingHistory } from '@/components/voting/VotingHistory'
import { useVoting } from '@/hooks/use-voting'
import type { Theme, Role, ThreeWayVote, Quest } from '@/lib/types'
import { THEME_CONFIGS } from '@/lib/types'
import { Plus, Handshake, Trash, PlusCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

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

  // Vote creation form state
  const [selectedQuestId, setSelectedQuestId] = useState<string>('')
  const [voteTopic, setVoteTopic] = useState('')
  const [voteOptions, setVoteOptions] = useState<{ label: string; description: string }[]>([
    { label: '', description: '' },
    { label: '', description: '' }
  ])

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

  // Reset form state
  const resetForm = useCallback(() => {
    setSelectedQuestId('')
    setVoteTopic('')
    setVoteOptions([
      { label: '', description: '' },
      { label: '', description: '' }
    ])
  }, [])

  // Handle adding a new option
  const handleAddOption = useCallback(() => {
    if (voteOptions.length >= 5) {
      toast.error('Maximum 5 options allowed')
      return
    }
    setVoteOptions([...voteOptions, { label: '', description: '' }])
  }, [voteOptions])

  // Handle removing an option
  const handleRemoveOption = useCallback((index: number) => {
    if (voteOptions.length <= 2) {
      toast.error('Minimum 2 options required')
      return
    }
    setVoteOptions(voteOptions.filter((_, i) => i !== index))
  }, [voteOptions])

  // Handle updating an option
  const handleUpdateOption = useCallback((index: number, field: 'label' | 'description', value: string) => {
    setVoteOptions(voteOptions.map((opt, i) =>
      i === index ? { ...opt, [field]: value } : opt
    ))
  }, [voteOptions])

  // Handle form submission
  const handleCreateVote = useCallback(() => {
    // Validation
    if (!selectedQuestId) {
      toast.error('Please select a quest')
      return
    }
    if (!voteTopic.trim()) {
      toast.error('Please enter a topic')
      return
    }
    const validOptions = voteOptions.filter(opt => opt.label.trim())
    if (validOptions.length < 2) {
      toast.error('Please enter at least 2 options')
      return
    }

    const quest = quests.find(q => q.id === selectedQuestId)
    if (!quest) {
      toast.error('Quest not found')
      return
    }

    createVote(selectedQuestId, profileId, voteTopic.trim(), validOptions.map(opt => ({
      label: opt.label.trim(),
      description: opt.description.trim() || `Vote for ${opt.label.trim()}`
    })))

    toast.success('Vote created successfully')
    setShowCreateDialog(false)
    resetForm()
  }, [selectedQuestId, voteTopic, voteOptions, quests, profileId, createVote, resetForm])

  // Handle dialog close
  const handleCloseDialog = useCallback(() => {
    setShowCreateDialog(false)
    resetForm()
  }, [resetForm])

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
      <Dialog open={showCreateDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="glass-panel max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Vote</DialogTitle>
            <DialogDescription>
              Create a collaborative vote for a {themeConfig.questLabel.toLowerCase()}. Students and parents can participate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Quest Selector */}
            <div className="space-y-2">
              <Label htmlFor="quest-select">Select {themeConfig.questLabel}</Label>
              <Select value={selectedQuestId} onValueChange={setSelectedQuestId}>
                <SelectTrigger id="quest-select">
                  <SelectValue placeholder={`Choose a ${themeConfig.questLabel.toLowerCase()}...`} />
                </SelectTrigger>
                <SelectContent>
                  {quests.filter(q => q.status !== 'locked').map(quest => (
                    <SelectItem key={quest.id} value={quest.id}>
                      {quest.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="vote-topic">Vote Topic</Label>
              <Input
                id="vote-topic"
                placeholder="e.g., Which approach should we take for this project?"
                value={voteTopic}
                onChange={(e) => setVoteTopic(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Describe what decision needs to be made
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Options ({voteOptions.length}/5)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={voteOptions.length >= 5}
                  className="gap-1"
                >
                  <PlusCircle size={16} />
                  Add Option
                </Button>
              </div>

              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {voteOptions.map((option, index) => (
                  <Card key={index} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={`Option ${index + 1} label`}
                          value={option.label}
                          onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                          disabled={voteOptions.length <= 2}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                      <Input
                        placeholder="Optional description..."
                        value={option.description}
                        onChange={(e) => handleUpdateOption(index, 'description', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleCreateVote}>
                Create Vote
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
