import { useState, useRef } from 'react'
import { Realm, Theme } from '@/lib/types'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Cube } from '@phosphor-icons/react'

interface RealmMapProps {
  realms: Realm[]
  theme: Theme
  onRealmClick: (realmId: string) => void
  onToggleTo3D?: () => void
}

interface Position2D {
  x: number
  y: number
}

const THEME_DECORATIONS = {
  fantasy: ['🏰', '🗻', '🌳', '⛰️', '🏔️'],
  scifi: ['🛸', '🌐', '📡', '🔭', '🌌'],
  medieval: ['🏛️', '⚔️', '🛡️', '👑', '🏰'],
  modern: ['🏢', '🎓', '📚', '💼', '🏫']
}

export function RealmMap({ realms, theme, onRealmClick, onToggleTo3D }: RealmMapProps) {
  const [hoveredRealm, setHoveredRealm] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  const normalizedRealms = realms.map((realm, index) => {
    const defaultPos = {
      x: 200 + (index * 300) + (index % 2 === 0 ? 50 : -50),
      y: 200 + Math.sin(index) * 150
    }
    
    return {
      ...realm,
      position2D: realm.position 
        ? { x: realm.position.x * 100 + 500, y: realm.position.y * 100 + 400 }
        : defaultPos
    }
  })

  const decorations = THEME_DECORATIONS[theme]

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.realm-node')) return
    setIsDragging(true)
    setStartDrag({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setDragOffset({
      x: e.clientX - startDrag.x,
      y: e.clientY - startDrag.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const drawPath = (from: Position2D, to: Position2D) => {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const numDots = Math.floor(distance / 20)
    
    const dots: Array<{ x: number; y: number; key: string }> = []
    for (let i = 0; i < numDots; i++) {
      const t = i / numDots
      const x = from.x + dx * t
      const y = from.y + dy * t
      dots.push({ x, y, key: `${from.x}-${from.y}-${to.x}-${to.y}-${i}` })
    }
    
    return dots
  }

  const renderPaths = () => {
    const paths: React.ReactNode[] = []
    
    for (let i = 0; i < normalizedRealms.length - 1; i++) {
      const from = normalizedRealms[i].position2D
      const to = normalizedRealms[i + 1].position2D
      const dots = drawPath(from, to)
      
      dots.forEach((dot, idx) => {
        paths.push(
          <motion.div
            key={dot.key}
            className="absolute w-2 h-2 rounded-full bg-muted-foreground/30"
            style={{
              left: dot.x + dragOffset.x,
              top: dot.y + dragOffset.y
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.01 }}
          />
        )
      })
    }
    
    return paths
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden select-none"
      style={{
        background: `
          radial-gradient(circle at 20% 30%, var(--primary) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, var(--secondary) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, var(--accent) 0%, transparent 70%),
          var(--background)
        `,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        ref={mapRef}
        className="absolute inset-0"
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`
        }}
      >
        {renderPaths()}

        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`decoration-${i}`}
            className="absolute text-4xl opacity-10 pointer-events-none"
            style={{
              left: Math.random() * 2000,
              top: Math.random() * 1500,
              rotate: Math.random() * 360
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            {decorations[Math.floor(Math.random() * decorations.length)]}
          </motion.div>
        ))}

        {normalizedRealms.map((realm, index) => (
          <motion.div
            key={realm.id}
            className="realm-node absolute cursor-pointer"
            style={{
              left: realm.position2D.x,
              top: realm.position2D.y
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.15, type: 'spring', bounce: 0.5 }}
            whileHover={{ scale: 1.15 }}
            onMouseEnter={() => setHoveredRealm(realm.id)}
            onMouseLeave={() => setHoveredRealm(null)}
            onClick={(e) => {
              e.stopPropagation()
              onRealmClick(realm.id)
            }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-8 rounded-full opacity-30 blur-2xl"
                style={{ backgroundColor: realm.color }}
                animate={{
                  scale: hoveredRealm === realm.id ? [1, 1.3, 1] : 1,
                  opacity: hoveredRealm === realm.id ? [0.3, 0.6, 0.3] : 0.3
                }}
                transition={{
                  duration: 2,
                  repeat: hoveredRealm === realm.id ? Infinity : 0
                }}
              />

              <motion.div
                className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-4"
                style={{
                  backgroundColor: realm.color,
                  borderColor: `color-mix(in oklch, ${realm.color} 80%, white)`
                }}
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
                
                <div className="relative text-center text-white z-10 px-2">
                  <div className="text-4xl mb-1 drop-shadow-lg">
                    {decorations[index % decorations.length]}
                  </div>
                  <div className="text-xs font-bold drop-shadow-md leading-tight">
                    {realm.name.split(' ').slice(0, 2).join(' ')}
                  </div>
                </div>

                <motion.div
                  className="absolute -inset-1 rounded-full border-2 border-white/50"
                  animate={{
                    scale: hoveredRealm === realm.id ? [1, 1.2, 1] : 1,
                    opacity: hoveredRealm === realm.id ? [0.5, 0, 0.5] : 0
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: hoveredRealm === realm.id ? Infinity : 0
                  }}
                />
              </motion.div>

              {hoveredRealm === realm.id && (
                <motion.div
                  className="absolute -bottom-16 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 whitespace-nowrap pointer-events-none z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm font-medium">{realm.name}</p>
                  <p className="text-xs text-muted-foreground">{realm.description}</p>
                </motion.div>
              )}

              <motion.div
                className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg border-2 border-background"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.15 + 0.3, type: 'spring', bounce: 0.6 }}
              >
                {index + 1}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute bottom-8 right-8 glass-panel px-4 py-2 text-xs text-muted-foreground pointer-events-none">
        Drag to pan • Click islands to explore
      </div>

      {onToggleTo3D && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleTo3D}
            className="gap-2 glass-panel"
            title="Switch to 3D Map"
          >
            <Cube size={18} />
            <span className="hidden sm:inline">3D Map</span>
          </Button>
        </div>
      )}
    </div>
  )
}
