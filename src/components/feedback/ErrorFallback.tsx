import { Button } from '@/components/ui/button'
import { ArrowClockwise, Cube, MusicNotes, ChartLine, Warning } from '@phosphor-icons/react'

type ErrorVariant = 'default' | '3d' | 'audio' | 'chart' | 'inline' | 'minimal'

interface ErrorFallbackProps {
  error?: Error
  resetErrorBoundary?: () => void
  variant?: ErrorVariant
  title?: string
  description?: string
}

const variantConfig = {
  default: {
    icon: Warning,
    title: 'Something went wrong',
    description: 'An unexpected error occurred'
  },
  '3d': {
    icon: Cube,
    title: '3D View Unavailable',
    description: 'Unable to load the 3D visualization'
  },
  audio: {
    icon: MusicNotes,
    title: 'Audio Unavailable',
    description: 'Unable to initialize audio system'
  },
  chart: {
    icon: ChartLine,
    title: 'Chart Error',
    description: 'Unable to render the visualization'
  },
  inline: {
    icon: Warning,
    title: 'Error',
    description: 'Something went wrong'
  },
  minimal: {
    icon: Warning,
    title: 'Error',
    description: ''
  }
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  variant = 'default',
  title,
  description
}: ErrorFallbackProps) {
  const config = variantConfig[variant]
  const Icon = config.icon
  const displayTitle = title || config.title
  const displayDescription = description || error?.message || config.description

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground">
        <Icon size={16} className="mr-2" />
        <span className="text-sm">{displayTitle}</span>
        {resetErrorBoundary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetErrorBoundary}
            className="ml-2"
          >
            Retry
          </Button>
        )}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="glass-panel p-4 flex items-center gap-4">
        <Icon size={24} className="text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium">{displayTitle}</p>
          {displayDescription && (
            <p className="text-sm text-muted-foreground truncate">{displayDescription}</p>
          )}
        </div>
        {resetErrorBoundary && (
          <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
            <ArrowClockwise size={16} />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="h-full w-full flex items-center justify-center p-8">
      <div className="glass-panel p-8 text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <Icon size={48} className="text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">{displayTitle}</h2>
        {displayDescription && (
          <p className="text-sm text-muted-foreground">{displayDescription}</p>
        )}
        {resetErrorBoundary && (
          <Button onClick={resetErrorBoundary} className="gap-2">
            <ArrowClockwise size={20} />
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Specific error fallback for 3D components
 */
export function Error3DFallback(props: Omit<ErrorFallbackProps, 'variant'>) {
  return <ErrorFallback {...props} variant="3d" />
}

/**
 * Specific error fallback for audio components
 */
export function ErrorAudioFallback(props: Omit<ErrorFallbackProps, 'variant'>) {
  return <ErrorFallback {...props} variant="audio" />
}

/**
 * Specific error fallback for chart components
 */
export function ErrorChartFallback(props: Omit<ErrorFallbackProps, 'variant'>) {
  return <ErrorFallback {...props} variant="chart" />
}

/**
 * Inline error fallback for smaller UI sections
 */
export function ErrorInlineFallback(props: Omit<ErrorFallbackProps, 'variant'>) {
  return <ErrorFallback {...props} variant="inline" />
}

/**
 * Minimal error fallback for tight spaces
 */
export function ErrorMinimalFallback(props: Omit<ErrorFallbackProps, 'variant'>) {
  return <ErrorFallback {...props} variant="minimal" />
}
