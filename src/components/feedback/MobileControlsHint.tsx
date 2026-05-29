import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HandSwipeRight, MagnifyingGlassPlus, MagnifyingGlassMinus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface MobileControlsHintProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onResetView?: () => void
  showZoomButtons?: boolean
}

export function MobileControlsHint({ 
  onZoomIn, 
  onZoomOut, 
  onResetView,
  showZoomButtons = true 
}: MobileControlsHintProps) {
  const [showHint, setShowHint] = useState(false)
  const [hasSeenHint, setHasSeenHint] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('aetheria-mobile-3d-hint-seen')
    if (!seen) {
      setShowHint(true)
      setHasSeenHint(false)
    } else {
      setHasSeenHint(true)
    }
  }, [])

  const handleDismiss = () => {
    setShowHint(false)
    setHasSeenHint(true)
    localStorage.setItem('aetheria-mobile-3d-hint-seen', 'true')
  }

  return (
    <>
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-20 z-50 mx-auto max-w-sm"
          >
            <div className="glass-panel p-4 space-y-3 relative">
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/20 transition-colors"
              >
                <X size={20} weight="bold" />
              </button>
              
              <div className="flex items-center gap-2 text-primary">
                <HandSwipeRight size={24} weight="duotone" />
                <h3 className="font-semibold">3D Controls</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>One finger:</strong> Rotate the view</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>Two fingers:</strong> Pinch to zoom in/out</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>Two fingers drag:</strong> Pan the camera</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>Double tap:</strong> Reset view</span>
                </div>
              </div>

              <Button 
                onClick={handleDismiss}
                size="sm"
                className="w-full"
              >
                Got it!
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showZoomButtons && hasSeenHint && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2"
        >
          {onZoomIn && (
            <button
              onClick={onZoomIn}
              className="glass-panel p-3 rounded-full hover:bg-card/80 active:scale-95 transition-all"
              aria-label="Zoom in"
            >
              <MagnifyingGlassPlus size={24} weight="bold" />
            </button>
          )}
          
          {onZoomOut && (
            <button
              onClick={onZoomOut}
              className="glass-panel p-3 rounded-full hover:bg-card/80 active:scale-95 transition-all"
              aria-label="Zoom out"
            >
              <MagnifyingGlassMinus size={24} weight="bold" />
            </button>
          )}

          {onResetView && (
            <button
              onClick={onResetView}
              className="glass-panel p-3 rounded-full hover:bg-card/80 active:scale-95 transition-all text-xs font-bold"
              aria-label="Reset view"
            >
              ⟲
            </button>
          )}
        </motion.div>
      )}

      {!showHint && hasSeenHint && (
        <button
          onClick={() => setShowHint(true)}
          className="fixed bottom-20 md:bottom-4 right-4 z-40 glass-panel p-2 rounded-full hover:bg-card/80 active:scale-95 transition-all"
          aria-label="Show controls hint"
        >
          <HandSwipeRight size={20} weight="bold" />
        </button>
      )}
    </>
  )
}
