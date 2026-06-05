import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Text, Line } from '@react-three/drei'
import * as THREE from 'three'
import { Realm, Theme } from '@/lib/types'
import { SafeCanvasWrapper } from '@/components/fx/SafeCanvas'
import { use3DTouchControls } from '@/hooks/use-3d-touch-controls'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileControlsHint } from '@/components/feedback/MobileControlsHint'
import { Button } from '@/components/ui/button'
import { SquaresFour } from '@phosphor-icons/react'

interface UniverseMapProps {
  realms: Realm[]
  theme: Theme
  onRealmClick: (realmId: string) => void
  onToggleTo2D?: () => void
}

interface PlanetProps {
  realm: Realm
  position: [number, number, number]
  onClick: () => void
  theme: Theme
}

function Planet({ realm, position, onClick, theme }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      setHovered(false)
    }
  }, [])

  useFrame((state) => {
    if (!isMountedRef.current) return
    
    try {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.002
        
        const targetScale = hovered ? 1.2 : 1
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
      }
      
      if (groupRef.current) {
        const time = state.clock.getElapsedTime()
        groupRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.1
      }
    } catch (error) {
      return
    }
  })

  const handleClick = (e: any) => {
    if (e) e.stopPropagation()
    if (!isMountedRef.current) return
    onClick()
  }

  const handlePointerOver = (e: any) => {
    if (e) e.stopPropagation()
    if (isMountedRef.current) {
      setHovered(true)
    }
  }

  const handlePointerOut = (e: any) => {
    if (e) e.stopPropagation()
    if (isMountedRef.current) {
      setHovered(false)
    }
  }

  const color = useMemo(() => {
    try {
      return new THREE.Color(realm.color)
    } catch {
      return new THREE.Color(0x4a90e2)
    }
  }, [realm.color])

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.2}
        />
      </mesh>

      {hovered && (
        <mesh>
          <sphereGeometry args={[1.15, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      <pointLight
        color={color}
        intensity={hovered ? 2 : 1}
        distance={5}
        decay={2}
      />

      <Text
        position={[0, -1.5, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {realm.name}
      </Text>
    </group>
  )
}

function OrbitRing({ radius, color, segments = 128 }: { radius: number; color: string; segments?: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
    }
    return pts
  }, [radius, segments])
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.3}
    />
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
      minDistance={5}
      maxDistance={30}
      autoRotate
      autoRotateSpeed={0.5}
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

interface SceneProps extends Omit<UniverseMapProps, 'theme' | 'onToggleTo2D'> {
  theme: Theme
  onControlsReady?: (controls: any) => void
}

function Scene({ realms, onRealmClick, theme, onControlsReady }: SceneProps) {
  const isMountedRef = useRef(true)
  
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const positions: Array<[number, number, number]> = useMemo(() => 
    realms.map((_, index) => {
      const angle = (index / realms.length) * Math.PI * 2
      const radius = 3 + index * 1.5
      return [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ] as [number, number, number]
    })
  , [realms])

  if (realms.length === 0) {
    return (
      <>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ff8800"
            emissiveIntensity={1}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
        <pointLight position={[0, 0, 0]} intensity={2} distance={50} color="#ffd700" />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </>
    )
  }

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ff8800"
          emissiveIntensity={1}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2} distance={50} color="#ffd700" />

      {realms.map((realm, index) => {
        const radius = Math.sqrt(positions[index][0] ** 2 + positions[index][2] ** 2)
        return (
          <OrbitRing
            key={`orbit-${realm.id}`}
            radius={radius}
            color={realm.color}
          />
        )
      })}

      {realms.map((realm, index) => (
        <Planet
          key={realm.id}
          realm={realm}
          position={positions[index]}
          onClick={() => onRealmClick(realm.id)}
          theme={theme}
        />
      ))}

      <CameraController onControlsReady={onControlsReady} />
    </>
  )
}

export function UniverseMap({ realms, theme, onRealmClick, onToggleTo2D }: UniverseMapProps) {
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const mountedRef = useRef(true)
  const canvasKey = useRef(`canvas-${Date.now()}`)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<any>(null)
  const isMobile = useIsMobile()

  // Connect 3D touch controls for mobile pinch-to-zoom and double-tap gestures
  use3DTouchControls(containerRef, {
    onPinchZoom: (delta: number) => {
      if (controlsRef.current) {
        const camera = controlsRef.current.object
        const direction = new THREE.Vector3()
        camera.getWorldDirection(direction)
        // Invert delta for natural zoom direction (pinch out = zoom in)
        camera.position.addScaledVector(direction, delta * 2)
        controlsRef.current.update()
      }
    },
    onDoubleTap: () => {
      if (controlsRef.current) {
        controlsRef.current.reset()
      }
    }
  })

  const handleZoomIn = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object
      const target = controlsRef.current.target
      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      camera.position.addScaledVector(direction, 2)
      controlsRef.current.update()
    }
  }

  const handleZoomOut = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object
      const target = controlsRef.current.target
      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      camera.position.addScaledVector(direction, -2)
      controlsRef.current.update()
    }
  }

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  useEffect(() => {
    mountedRef.current = true
    canvasKey.current = `canvas-${Date.now()}`
    setHasError(false)
    
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setIsReady(true)
      }
    }, 100)
    
    return () => {
      mountedRef.current = false
      setIsReady(false)
      clearTimeout(timer)
    }
  }, [])

  if (hasError) {
    return (
      <div className="w-full h-full relative flex items-center justify-center">
        <div className="glass-panel p-8 text-center space-y-4">
          <p className="text-muted-foreground">Unable to load 3D universe</p>
          <button 
            onClick={() => {
              mountedRef.current = true
              canvasKey.current = `canvas-${Date.now()}`
              setHasError(false)
              setIsReady(false)
              setTimeout(() => {
                if (mountedRef.current) {
                  setIsReady(true)
                }
              }, 100)
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="w-full h-full relative flex items-center justify-center">
        <div className="text-muted-foreground">Loading universe...</div>
      </div>
    )
  }

  return (
    <SafeCanvasWrapper>
      <div ref={containerRef} className="w-full h-full relative">
        <Canvas
          key={canvasKey.current}
          camera={{ position: [0, 8, 15], fov: 60 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false
          }}
          frameloop="always"
          dpr={[1, 2]}
          onCreated={(state) => {
            try {
              if (mountedRef.current) {
                state.gl.setClearColor(0x000000, 0)
              }
            } catch (error) {
              console.error('Error setting up Canvas:', error)
            }
          }}
          onError={(error) => {
            console.error('Canvas error:', error)
            setHasError(true)
          }}
        >
          <Scene 
            realms={realms} 
            onRealmClick={onRealmClick} 
            theme={theme}
            onControlsReady={(controls) => {
              controlsRef.current = controls
            }}
          />
        </Canvas>
        
        <div className="absolute bottom-8 right-8 glass-panel px-4 py-2 text-xs text-muted-foreground pointer-events-none hidden md:block">
          Drag to rotate • Scroll to zoom • Click planets to explore
        </div>

        {onToggleTo2D && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleTo2D}
              className="gap-2 glass-panel"
              title="Switch to 2D Map"
            >
              <SquaresFour size={18} />
              <span className="hidden sm:inline">2D Map</span>
            </Button>
          </div>
        )}

        {isMobile && (
          <MobileControlsHint
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleResetView}
            showZoomButtons={true}
          />
        )}
      </div>
    </SafeCanvasWrapper>
  )
}
