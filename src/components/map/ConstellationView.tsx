import { useEffect, useRef, useState } from 'react'
import { ConstellationNode, Quest } from '@/lib/types'

interface ConstellationViewProps {
  quests: Quest[]
}

export function ConstellationView({ quests }: ConstellationViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [nodes, setNodes] = useState<ConstellationNode[]>([])
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (quests.length === 0) {
      setNodes([])
      return
    }

    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2
    const baseRadius = Math.min(dimensions.width, dimensions.height) * 0.28

    const generatedNodes: ConstellationNode[] = quests.map((quest, index) => {
      const totalQuests = quests.length
      const angle = (index / totalQuests) * Math.PI * 2 - Math.PI / 2
      const radiusVariation = baseRadius + (index % 3) * 30
      const x = centerX + Math.cos(angle) * radiusVariation
      const y = centerY + Math.sin(angle) * radiusVariation
      
      return {
        id: quest.id,
        questId: quest.id,
        x,
        y,
        status: quest.status === 'completed' ? 'lit' : 'unlit',
        connections: index > 0 ? [quests[index - 1].id] : []
      }
    })

    if (generatedNodes.length > 1) {
      generatedNodes[0].connections = [quests[quests.length - 1].id]
    }

    setNodes(generatedNodes)
  }, [quests, dimensions])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      nodes.forEach((node) => {
        node.connections.forEach((connId) => {
          const connNode = nodes.find(n => n.questId === connId)
          if (!connNode) return

          const bothLit = node.status === 'lit' && connNode.status === 'lit'
          
          if (bothLit) {
            const gradient = ctx.createLinearGradient(node.x, node.y, connNode.x, connNode.y)
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)')
            gradient.addColorStop(0.5, 'rgba(255, 235, 100, 0.8)')
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0.6)')
            ctx.strokeStyle = gradient
            ctx.lineWidth = 3
            ctx.shadowBlur = 10
            ctx.shadowColor = 'rgba(255, 215, 0, 0.5)'
          } else {
            ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)'
            ctx.lineWidth = 2
            ctx.shadowBlur = 0
          }

          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(connNode.x, connNode.y)
          ctx.stroke()
        })
      })

      ctx.shadowBlur = 0

      nodes.forEach((node) => {
        const isHovered = hoveredNode === node.questId
        const isLit = node.status === 'lit'
        const radius = isHovered ? 14 : 10

        if (isLit) {
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 4)
          gradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)')
          gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.2)')
          gradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius * 4, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.fillStyle = isLit ? '#FFD700' : '#444444'
        ctx.strokeStyle = isLit ? '#FFFFFF' : '#666666'
        ctx.lineWidth = isHovered ? 3 : 2
        ctx.shadowBlur = isLit ? 15 : 0
        ctx.shadowColor = isLit ? 'rgba(255, 215, 0, 0.8)' : 'transparent'
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.shadowBlur = 0

        if (isLit) {
          const time = Date.now() * 0.001
          const numRays = 6
          for (let i = 0; i < numRays; i++) {
            const angle = (Math.PI * 2 / numRays) * i + time
            const rayLength = 20
            const pulseIntensity = 0.4 + Math.sin(time * 2 + i) * 0.3
            ctx.strokeStyle = `rgba(255, 215, 0, ${pulseIntensity})`
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(node.x + Math.cos(angle) * (radius + 2), node.y + Math.sin(angle) * (radius + 2))
            ctx.lineTo(node.x + Math.cos(angle) * (radius + rayLength), node.y + Math.sin(angle) * (radius + rayLength))
            ctx.stroke()
          }
        }

        if (isHovered) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2)
          ctx.stroke()
        }
      })
    }

    const animate = () => {
      draw()
      animationId = requestAnimationFrame(animate)
    }
    
    animate()

    return () => cancelAnimationFrame(animationId)
  }, [nodes, hoveredNode, dimensions])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    let foundNode: string | null = null
    for (const node of nodes) {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      if (distance < 15) {
        foundNode = node.questId
        break
      }
    }

    setHoveredNode(foundNode)
    canvas.style.cursor = foundNode ? 'pointer' : 'default'
  }

  const hoveredQuest = hoveredNode ? quests.find(q => q.id === hoveredNode) : null
  const completedCount = quests.filter(q => q.status === 'completed').length
  const totalCount = quests.length
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div ref={containerRef} className="relative w-full h-full bg-background">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
      />
      
      <div className="absolute top-8 left-8 glass-panel px-6 py-4 space-y-2">
        <div className="text-sm font-medium text-muted-foreground">Constellation Progress</div>
        <div className="text-4xl font-bold glow-text">{completionPercent}%</div>
        <div className="text-xs text-muted-foreground">
          {completedCount} of {totalCount} stars lit
        </div>
      </div>

      {hoveredQuest && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 pointer-events-none min-w-64">
          <p className="font-bold text-base mb-1">{hoveredQuest.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {hoveredQuest.description}
          </p>
          <div className="flex items-center gap-3 text-xs">
            <span className={hoveredQuest.status === 'completed' ? 'text-accent font-semibold' : 'text-muted-foreground'}>
              {hoveredQuest.status === 'completed' ? '✓ Completed' : '○ Incomplete'}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-primary font-medium">{hoveredQuest.xpValue} XP</span>
          </div>
        </div>
      )}

      {quests.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-panel px-8 py-6 text-center space-y-2">
            <div className="text-4xl mb-2">✨</div>
            <p className="font-semibold">No quests yet</p>
            <p className="text-sm text-muted-foreground">
              Complete quests to light up your constellation
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
