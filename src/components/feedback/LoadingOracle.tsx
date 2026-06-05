import { motion } from 'framer-motion'
import { Theme, THEME_CONFIGS } from '@/lib/types'
import { Brain, Sparkle, CircleNotch, Lightning } from '@phosphor-icons/react'

interface LoadingOracleProps {
  theme: Theme
}

export function LoadingOracle({ theme }: LoadingOracleProps) {
  const themeConfig = THEME_CONFIGS[theme]

  const OracleIcon = theme === 'scifi' ? Brain : 
                      theme === 'fantasy' ? Sparkle :
                      theme === 'medieval' ? Lightning :
                      CircleNotch

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 space-y-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`Loading: Consulting the ${themeConfig.oracleLabel}, evaluating your submission`}
    >
      <motion.div
        className="relative"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear'
        }}
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <OracleIcon size={64} weight="fill" className="text-primary relative z-10" />
      </motion.div>

      <motion.div
        className="text-center space-y-2"
        animate={{
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <p className="text-lg font-semibold">Consulting the {themeConfig.oracleLabel}</p>
        <p className="text-sm text-muted-foreground">Evaluating your submission...</p>
      </motion.div>

      <motion.div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-primary"
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
