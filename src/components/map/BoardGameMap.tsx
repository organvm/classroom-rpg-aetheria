import { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sphere, Cylinder, Text, Plane, Line } from '@react-three/drei'
import * as THREE from 'three'
import { Quest, Theme } from '@/lib/types'
import { motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileControlsHint } from '@/components/feedback/MobileControlsHint'

interface BoardGameMapProps {
  quests: Quest[]
  theme: Theme
  onQuestClick: (questId: string) => void
  onBack: () => void
  realmColor: string
  realmName: string
  role?: 'teacher' | 'student'
  onCreateQuest?: () => void
}

interface PathNodeProps {
  quest: Quest
  position: [number, number, number]
  onClick: () => void
  color: string
  isLocked: boolean
  index: number
}

function PathNode({ quest, position, onClick, color, isLocked, index }: PathNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      if (hovered && !isLocked) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1)
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
    }
    
    if (groupRef.current) {
      const time = state.clock.getElapsedTime()
      groupRef.current.position.y = position[1] + Math.sin(time * 2 + index) * 0.05
    }
  })

  const nodeColor = isLocked 
    ? '#666666' 
    : quest.status === 'completed' 
      ? '#4ade80' 
      : quest.status === 'failed'
        ? '#ef4444'
        : color

  const emissiveIntensity = isLocked ? 0.1 : hovered ? 0.8 : 0.4

  return (
    <group ref={groupRef} position={position}>
      <Sphere
        ref={meshRef}
        args={[0.3, 32, 32]}
        onClick={isLocked ? undefined : onClick}
        onPointerOver={() => !isLocked && setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={nodeColor}
          roughness={0.4}
          metalness={0.6}
          emissive={nodeColor}
          emissiveIntensity={emissiveIntensity}
        />
      </Sphere>

      {!isLocked && hovered && (
        <Sphere args={[0.35, 32, 32]}>
          <meshBasicMaterial
            color={nodeColor}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </Sphere>
      )}

      <pointLight
        color={nodeColor}
        intensity={isLocked ? 0.3 : hovered ? 2 : 1}
        distance={3}
        decay={2}
      />

      {quest.type === 'boss' && !isLocked && (
        <Sphere args={[0.4, 8, 8]}>
          <meshBasicMaterial
            color={color}
            wireframe
            transparent
            opacity={0.5}
          />
        </Sphere>
      )}

      {isLocked && (
        <Text
          position={[0, 0, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          🔒
        </Text>
      )}

      <Text
        position={[0, -0.6, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
        textAlign="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {quest.name}
      </Text>

      <Cylinder
        args={[0.05, 0.05, 0.5]}
        position={[0, -0.95, 0]}
      >
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={0.3}
        />
      </Cylinder>
    </group>
  )
}

function PathSegment({ from, to, color }: { from: [number, number, number]; to: [number, number, number]; color: string }) {
  const points = useMemo(() => {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    const midHeight = Math.max(from[1], to[1]) + 0.3
    
    const curve = new THREE.QuadraticBezierCurve3(
      start,
      new THREE.Vector3(
        (from[0] + to[0]) / 2,
        midHeight,
        (from[2] + to[2]) / 2
      ),
      end
    )
    
    return curve.getPoints(50)
  }, [from, to])

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  )
}

function GroundPlane({ color }: { color: string }) {
  return (
    <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
      />
    </Plane>
  )
}

interface CameraControllerProps {
  onControlsReady?: (controls: any) => void
}

function CameraController({ onControlsReady }: CameraControllerProps) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    if (controlsRef.current && onControlsReady) {
      onControlsReady(controlsRef.current)
    }
  }, [onControlsReady])

  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
    }
  }, [])

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={20}
      maxPolarAngle={Math.PI / 2}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      }}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={1.2}
    />
  )
}

interface SceneProps {
  quests: Quest[]
  onQuestClick: (id: string) => void
  color: string
  onControlsReady?: (controls: any) => void
}

function Scene({ quests, onQuestClick, color, onControlsReady }: SceneProps) {
  const positions = useMemo(() => {
    return quests.map((_, index) => {
      const progress = index / Math.max(quests.length - 1, 1)
      const spiralRadius = 1 + progress * 2
      const angle = progress * Math.PI * 4
      const height = progress * 3
      
      return [
        Math.cos(angle) * spiralRadius,
        height,
        Math.sin(angle) * spiralRadius
      ] as [number, number, number]
    })
  }, [quests.length])

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 10, 5]} intensity={1.5} />
      <pointLight position={[-5, 10, -5]} intensity={1} color={color} />
      
      <GroundPlane color={color} />

      {quests.map((quest, index) => {
        if (index < quests.length - 1) {
          return (
            <PathSegment
              key={`segment-${quest.id}`}
              from={positions[index]}
              to={positions[index + 1]}
              color={color}
            />
          )
        }
        return null
      })}

      {quests.map((quest, index) => (
        <PathNode
          key={quest.id}
          quest={quest}
          position={positions[index]}
          onClick={() => onQuestClick(quest.id)}
          color={color}
          isLocked={quest.status === 'locked'}
          index={index}
        />
      ))}

      <CameraController onControlsReady={onControlsReady} />
    </>
  )
}

export function BoardGameMap({ quests, theme, onQuestClick, onBack, realmColor, realmName, role, onCreateQuest }: BoardGameMapProps) {
  const isMobile = useIsMobile()
  const controlsRef = useRef<any>(null)

  const handleZoomIn = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object
      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      camera.position.addScaledVector(direction, 1.5)
      controlsRef.current.update()
    }
  }

  const handleZoomOut = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object
      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      camera.position.addScaledVector(direction, -1.5)
      controlsRef.current.update()
    }
  }

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [4, 6, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        frameloop="always"
        dpr={[1, 2]}
      >
        <Scene 
          quests={quests} 
          onQuestClick={onQuestClick} 
          color={realmColor}
          onControlsReady={(controls) => {
            controlsRef.current = controls
          }}
        />
      </Canvas>

      <motion.div
        className="absolute top-8 left-8 space-y-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <button
          onClick={onBack}
          className="glass-panel px-4 py-2 text-sm font-medium hover:bg-card/80 transition-colors"
        >
          ← Back to Universe
        </button>
        <div className="glass-panel px-4 py-3">
          <h2 className="text-xl font-bold mb-1">{realmName}</h2>
          <p className="text-sm text-muted-foreground">
            {quests.filter(q => q.status === 'completed').length} / {quests.length} completed
          </p>
        </div>
        {role === 'teacher' && onCreateQuest && (
          <button
            onClick={onCreateQuest}
            className="glass-panel px-4 py-2 text-sm font-medium hover:bg-card/80 transition-colors w-full flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            Add Quest
          </button>
        )}
      </motion.div>

      <div className="absolute bottom-8 right-8 glass-panel px-4 py-2 text-xs text-muted-foreground pointer-events-none hidden md:block">
        Drag to rotate • Scroll to zoom • Click nodes to start quest
      </div>

      {isMobile && (
        <MobileControlsHint
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          showZoomButtons={true}
        />
      )}

      <div className="absolute bottom-8 left-8 glass-panel px-4 py-3 space-y-2 hidden md:block">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <span className="text-xs">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
          <span className="text-xs">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
          <span className="text-xs">Failed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#666666]" />
          <span className="text-xs">Locked</span>
        </div>
      </div>
    </div>
  )
}
