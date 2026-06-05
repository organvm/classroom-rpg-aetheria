/**
 * Sandbox Mode Banner Component
 * 
 * Displays a prominent banner when the application is in sandbox/demo mode,
 * informing users that they are exploring with demo data.
 */

import { Warning, X, ArrowsClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { isSandboxMode, resetSandboxData, disableSandboxMode } from '@/lib/sandbox-mode'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function SandboxBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    setIsVisible(isSandboxMode())
  }, [])

  if (!isVisible || isDismissed) {
    return null
  }

  const handleReset = () => {
    if (confirm('Reset sandbox data? This will restore all demo content to defaults.')) {
      resetSandboxData()
      // Full page reload is intentional here to re-initialize all KV storage and state
      // This ensures a completely clean slate with fresh demo data
      window.location.reload()
    }
  }

  const handleExit = () => {
    if (confirm('Exit sandbox mode? You will return to normal mode.')) {
      disableSandboxMode()
      // Full page reload is necessary to switch between storage contexts
      // (sandbox- prefixed keys vs normal keys)
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Warning className="h-6 w-6 flex-shrink-0" weight="fill" />
              <div className="flex-1">
                <p className="font-semibold text-sm md:text-base">
                  🏖️ Sandbox Mode Active
                </p>
                <p className="text-xs md:text-sm opacity-90">
                  You're exploring with demo data. Changes won't affect real classrooms.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleReset}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 hidden sm:flex"
              >
                <ArrowsClockwise className="h-4 w-4 mr-1" />
                Reset Demo
              </Button>

              <Button
                onClick={handleExit}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                Exit Sandbox
              </Button>

              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
