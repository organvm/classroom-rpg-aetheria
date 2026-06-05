import { memo } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface NameDialogProps {
  open: boolean
  nameInput: string
  onNameChange: (value: string) => void
  onSubmit: () => void
}

export const NameDialog = memo(function NameDialog({
  open,
  nameInput,
  onNameChange,
  onSubmit
}: NameDialogProps) {
  const handleSubmit = () => {
    if (!nameInput.trim()) {
      toast.error('Please enter a name')
      return
    }
    onSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="glass-panel" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkle size={32} weight="fill" className="text-accent" />
            </motion.div>
            <DialogTitle className="text-2xl">Welcome to Aetheria</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Enter your hero name to begin your journey through the living classroom
          </DialogDescription>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-4 mt-4"
        >
          <div className="space-y-2">
            <Label htmlFor="hero-name">Your Name</Label>
            <Input
              id="hero-name"
              value={nameInput}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter your name..."
              className="glass-panel"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full gap-2" size="lg">
            <Sparkle size={20} weight="fill" />
            Begin Adventure
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
})
