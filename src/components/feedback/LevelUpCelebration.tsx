import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkle, TrendUp } from '@phosphor-icons/react'
import { Theme, THEME_CONFIGS } from '@/lib/types'
import { getLevelTitle } from '@/lib/game-utils'
import { useMotionConfig } from '@/hooks/use-reduced-motion'

interface LevelUpCelebrationProps {
  show: boolean
  level: number
  role: 'teacher' | 'student'
  theme: Theme
  onComplete: () => void
}

export function LevelUpCelebration({ show, level, role, theme, onComplete }: LevelUpCelebrationProps) {
  const themeConfig = THEME_CONFIGS[theme]
  const levelTitle = getLevelTitle(level, role)
  const { shouldAnimate, animationProps } = useMotionConfig()

  useEffect(() => {
    if (show) {
      // Shorter display time when animations are disabled
      const timer = setTimeout(() => {
        onComplete()
      }, shouldAnimate ? 4000 : 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete, shouldAnimate])

  // Static version for reduced motion preference
  if (!shouldAnimate) {
    return (
      <AnimatePresence>
        {show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-accent/10 backdrop-blur-sm" />
            <div className="relative glass-panel p-12 text-center space-y-6 border-4 border-accent shadow-2xl shadow-accent/50">
              <TrendUp size={80} weight="bold" className="text-accent mx-auto" />
              <div className="space-y-2">
                <h2 className="text-5xl font-bold glow-text">LEVEL UP!</h2>
                <p className="text-3xl font-bold text-accent">Level {level}</p>
                <p className="text-xl text-muted-foreground">{levelTitle}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Sparkle size={16} weight="fill" className="text-accent" />
                <span>Your power grows stronger</span>
                <Sparkle size={16} weight="fill" className="text-accent" />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-accent/10 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                x: '50vw',
                y: '50vh',
                scale: 0,
                opacity: 1
              }}
              animate={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                scale: [0, 1, 0],
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: Math.random() * 0.5,
                ease: 'easeOut'
              }}
            >
              <Sparkle
                size={20 + Math.random() * 20}
                weight="fill"
                className="text-accent"
              />
            </motion.div>
          ))}

          <motion.div
            className="relative glass-panel p-12 text-center space-y-6 border-4 border-accent shadow-2xl shadow-accent/50"
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: [0, 1.2, 1],
              rotate: [- 180, 20, 0]
            }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20
            }}
          >
            <motion.div
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <TrendUp size={80} weight="bold" className="text-accent mx-auto" />
            </motion.div>

            <div className="space-y-2">
              <motion.h2
                className="text-5xl font-bold glow-text"
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                LEVEL UP!
              </motion.h2>
              <p className="text-3xl font-bold text-accent">Level {level}</p>
              <p className="text-xl text-muted-foreground">{levelTitle}</p>
            </div>

            <motion.div
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Sparkle size={16} weight="fill" className="text-accent" />
              <span>Your power grows stronger</span>
              <Sparkle size={16} weight="fill" className="text-accent" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
