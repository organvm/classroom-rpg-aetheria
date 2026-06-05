import { ReactNode, useEffect, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

interface SafeCanvasWrapperProps {
  children: ReactNode
}

function ErrorFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="glass-panel p-8 text-center space-y-4">
        <p className="text-muted-foreground">Unable to load 3D scene</p>
      </div>
    </div>
  )
}

export function SafeCanvasWrapper({ children }: SafeCanvasWrapperProps) {
  const [key, setKey] = useState(0)
  
  useEffect(() => {
    const originalError = console.error
    const originalWarn = console.warn
    
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      const stack = args[0]?.stack?.toString() || ''
      
      if (
        message.includes('R3F: Cannot set') ||
        message.includes('delete child.object.__r3f') ||
        message.includes('data-component-loc-end') ||
        message.includes('component-loc-end') ||
        (message.includes('undefined is not an object') && (
          message.includes('root[key]') ||
          message.includes('__r3f') ||
          stack.includes('react-three')
        ))
      ) {
        return
      }
      
      originalError.apply(console, args)
    }
    
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      
      if (
        message.includes('R3F:') ||
        message.includes('__r3f') ||
        message.includes('component-loc')
      ) {
        return
      }
      
      originalWarn.apply(console, args)
    }
    
    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])
  
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => setKey(prev => prev + 1)}
      resetKeys={[key]}
    >
      {children}
    </ErrorBoundary>
  )
}
