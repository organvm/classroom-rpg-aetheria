import { useState, useRef } from 'react'
import { Realm, Theme } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FloppyDisk, X, ArrowsOutCardinal } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface RealmEditorProps {
  realms: Realm[]
  theme: Theme
  onUpdateRealms: (realms: Realm[]) => void
  onClose: () => void
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

export function RealmEditor({ realms, theme, onUpdateRealms, onClose }: RealmEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedRealm, setSelectedRealm] = useState<string | null>(null)
  const [isDraggingRealm, setIsDraggingRealm] = useState(false)
  const [dragStartPos, setDragStartPos] = useState<Position2D>({ x: 0, y: 0 })
  const [positions, setPositions] = useState<Map<string, Position2D>>(
    new Map(realms.map((r, index) => {
      const defaultPos = {
        x: 200 + (index * 300) + (index % 2 === 0 ? 50 : -50),
        y: 200 + Math.sin(index) * 150
      }
      return [
        r.id, 
        r.position 
          ? { x: r.position.x * 100 + 500, y: r.position.y * 100 + 400 }
          : defaultPos
      ]
    }))
  )

  const decorations = THEME_DECORATIONS[theme]

  const handleRealmMouseDown = (e: React.MouseEvent, realmId: string) => {
    e.stopPropagation()
    setSelectedRealm(realmId)
    setIsDraggingRealm(true)
    setDragStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRealm || !selectedRealm) return

    const dx = e.clientX - dragStartPos.x
    const dy = e.clientY - dragStartPos.y

    const currentPos = positions.get(selectedRealm)
    if (currentPos) {
      const newPos = {
        x: currentPos.x + dx,
        y: currentPos.y + dy
      }
      setPositions(prev => new Map(prev).set(selectedRealm, newPos))
    }

    setDragStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDraggingRealm(false)
  }

  const handlePositionChange = (realmId: string, axis: 'x' | 'y', value: string) => {
    const numValue = parseFloat(value) || 0
    const currentPos = positions.get(realmId) || { x: 0, y: 0 }
    const newPos = { ...currentPos, [axis]: numValue }
    setPositions(prev => new Map(prev).set(realmId, newPos))
  }

  const handleSave = () => {
    const updatedRealms = realms.map(realm => {
      const pos2D = positions.get(realm.id)
      if (pos2D) {
        return {
          ...realm,
          position: {
            x: (pos2D.x - 500) / 100,
            y: (pos2D.y - 400) / 100,
            z: 0
          }
        }
      }
      return realm
    })
    onUpdateRealms(updatedRealms)
    toast.success('Realm positions saved!')
    onClose()
  }

  const handleReset = () => {
    const newPositions = new Map<string, Position2D>()
    realms.forEach((realm, index) => {
      const defaultPosition = {
        x: 200 + (index * 300) + (index % 2 === 0 ? 50 : -50),
        y: 200 + Math.sin(index) * 150
      }
      newPositions.set(realm.id, defaultPosition)
    })
    setPositions(newPositions)
    toast.success('Positions reset to default layout')
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
    
    const realmArray = Array.from(positions.entries())
    for (let i = 0; i < realmArray.length - 1; i++) {
      const from = realmArray[i][1]
      const to = realmArray[i + 1][1]
      const dots = drawPath(from, to)
      
      dots.forEach((dot) => {
        paths.push(
          <div
            key={dot.key}
            className="absolute w-2 h-2 rounded-full bg-muted-foreground/20"
            style={{
              left: dot.x,
              top: dot.y
            }}
          />
        )
      })
    }
    
    return paths
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border glass-panel">
          <div>
            <h2 className="text-2xl font-bold">Realm Position Editor</h2>
            <p className="text-sm text-muted-foreground">Drag realms to reposition or enter coordinates manually</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <ArrowsOutCardinal size={18} className="mr-2" />
              Reset Layout
            </Button>
            <Button onClick={handleSave}>
              <FloppyDisk size={18} className="mr-2" />
              Save Changes
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={24} />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          <div 
            ref={containerRef} 
            className="flex-1 glass-panel rounded-xl overflow-hidden relative"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, var(--primary) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, var(--secondary) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, var(--accent) 0%, transparent 70%),
                var(--background)
              `
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {renderPaths()}

            {realms.map((realm, index) => {
              const pos = positions.get(realm.id) || { x: 0, y: 0 }
              const isSelected = selectedRealm === realm.id

              return (
                <motion.div
                  key={realm.id}
                  className="absolute cursor-move"
                  style={{
                    left: pos.x,
                    top: pos.y
                  }}
                  onMouseDown={(e) => handleRealmMouseDown(e, realm.id)}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="relative">
                    {isSelected && (
                      <motion.div
                        className="absolute -inset-12 rounded-full border-4 border-primary"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity
                        }}
                      />
                    )}

                    <div
                      className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-4 ${
                        isSelected ? 'border-primary' : 'border-white/50'
                      }`}
                      style={{
                        backgroundColor: realm.color
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
                    </div>

                    <div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg border-2 border-background"
                    >
                      {index + 1}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <Card className="w-80 p-4 overflow-y-auto glass-panel">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ArrowsOutCardinal size={20} />
              Realm Positions
            </h3>
            <div className="space-y-4">
              {realms.map((realm) => {
                const pos = positions.get(realm.id) || { x: 0, y: 0 }
                const isSelected = selectedRealm === realm.id
                
                return (
                  <div
                    key={realm.id}
                    className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-card/50'
                    }`}
                    onClick={() => setSelectedRealm(realm.id)}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: realm.color }}
                      />
                      <p className="font-medium text-sm">{realm.name}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">X</Label>
                          <Input
                            type="number"
                            step="10"
                            value={Math.round(pos.x)}
                            onChange={(e) => handlePositionChange(realm.id, 'x', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Y</Label>
                          <Input
                            type="number"
                            step="10"
                            value={Math.round(pos.y)}
                            onChange={(e) => handlePositionChange(realm.id, 'y', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
