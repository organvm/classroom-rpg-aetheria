import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Theme } from '@/lib/types'

interface ThemeBackground3DProps {
  theme: Theme
  realmColor?: string
}

export function ThemeBackground3D({ theme, realmColor }: ThemeBackground3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    objects: THREE.Object3D[]
    frameId: number
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let isMounted = true
    const container = containerRef.current

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    camera.position.z = 5

    const objects: THREE.Object3D[] = []

    const parseColor = (colorStr: string) => {
      if (colorStr.startsWith('oklch')) {
        const match = colorStr.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
        if (match) {
          const l = parseFloat(match[1])
          const c = parseFloat(match[2])
          const h = parseFloat(match[3])
          const a = h * Math.PI / 180
          const a_ = c * Math.cos(a)
          const b_ = c * Math.sin(a)
          const L = l * 100
          const fy = (L + 16) / 116
          const fx = a_ / 500 + fy
          const fz = fy - b_ / 200
          const xn = fx ** 3 > 0.008856 ? fx ** 3 : (116 * fx - 16) / 903.3
          const yn = L > 8 ? fy ** 3 : L / 903.3
          const zn = fz ** 3 > 0.008856 ? fz ** 3 : (116 * fz - 16) / 903.3
          const x = xn * 0.95047
          const y = yn * 1.00000
          const z = zn * 1.08883
          let r = x * 3.2406 + y * -1.5372 + z * -0.4986
          let g = x * -0.9689 + y * 1.8758 + z * 0.0415
          let b = x * 0.0557 + y * -0.2040 + z * 1.0570
          r = r > 0.0031308 ? 1.055 * (r ** (1 / 2.4)) - 0.055 : 12.92 * r
          g = g > 0.0031308 ? 1.055 * (g ** (1 / 2.4)) - 0.055 : 12.92 * g
          b = b > 0.0031308 ? 1.055 * (b ** (1 / 2.4)) - 0.055 : 12.92 * b
          return new THREE.Color(Math.max(0, Math.min(1, r)), Math.max(0, Math.min(1, g)), Math.max(0, Math.min(1, b)))
        }
      }
      return new THREE.Color(0x4a90e2)
    }

    const mainColor = realmColor ? parseColor(realmColor) : new THREE.Color(0x4a90e2)

    if (theme === 'fantasy') {
      const particleCount = 200
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20

        const hsl = { h: 0, s: 0, l: 0 }
        mainColor.getHSL(hsl)
        const color = new THREE.Color().setHSL(hsl.h, 0.8, 0.5 + Math.random() * 0.3)
        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      })

      const particles = new THREE.Points(geometry, material)
      scene.add(particles)
      objects.push(particles)

      for (let i = 0; i < 3; i++) {
        const crystalGeometry = new THREE.OctahedronGeometry(0.5, 0)
        const crystalMaterial = new THREE.MeshPhongMaterial({
          color: mainColor,
          transparent: true,
          opacity: 0.3,
          shininess: 100,
          emissive: mainColor,
          emissiveIntensity: 0.2
        })
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial)
        crystal.position.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4
        )
        scene.add(crystal)
        objects.push(crystal)
      }
    } else if (theme === 'scifi') {
      const gridHelper = new THREE.GridHelper(20, 20, mainColor, new THREE.Color(0x00ffff).multiplyScalar(0.3))
      gridHelper.position.y = -3
      gridHelper.rotation.x = Math.PI / 8
      scene.add(gridHelper)
      objects.push(gridHelper)

      for (let i = 0; i < 5; i++) {
        const geometry = new THREE.IcosahedronGeometry(0.3, 0)
        const material = new THREE.MeshBasicMaterial({
          color: mainColor,
          wireframe: true,
          transparent: true,
          opacity: 0.6
        })
        const wireframe = new THREE.Mesh(geometry, material)
        wireframe.position.set(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 5
        )
        scene.add(wireframe)
        objects.push(wireframe)
      }

      const ringGeometry = new THREE.TorusGeometry(3, 0.05, 16, 100)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x00ffff),
        transparent: true,
        opacity: 0.4
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = Math.PI / 2
      scene.add(ring)
      objects.push(ring)
    } else if (theme === 'medieval') {
      const ambientLight = new THREE.AmbientLight(0xffd700, 0.3)
      scene.add(ambientLight)

      for (let i = 0; i < 8; i++) {
        const geometry = new THREE.DodecahedronGeometry(0.4, 0)
        const material = new THREE.MeshPhongMaterial({
          color: mainColor,
          transparent: true,
          opacity: 0.4,
          shininess: 50
        })
        const gem = new THREE.Mesh(geometry, material)
        gem.position.set(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 6
        )
        scene.add(gem)
        objects.push(gem)
      }

      const torchLight = new THREE.PointLight(0xff6600, 1, 10)
      torchLight.position.set(-4, 2, 2)
      scene.add(torchLight)
    } else {
      const geometry = new THREE.SphereGeometry(0.3, 32, 32)
      
      for (let i = 0; i < 6; i++) {
        const material = new THREE.MeshPhongMaterial({
          color: mainColor,
          transparent: true,
          opacity: 0.5,
          shininess: 100
        })
        const sphere = new THREE.Mesh(geometry, material)
        sphere.position.set(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 5
        )
        scene.add(sphere)
        objects.push(sphere)
      }
    }

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
    scene.add(ambientLight)

    let time = 0
    let frameId = 0
    const animate = () => {
      if (!isMounted) return
      
      time += 0.01

      objects.forEach((obj, index) => {
        obj.rotation.x += 0.001 * (index % 2 === 0 ? 1 : -1)
        obj.rotation.y += 0.002 * (index % 3 === 0 ? 1 : -1)
        
        if (obj.position) {
          obj.position.y += Math.sin(time + index) * 0.001
        }
      })

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!isMounted) return
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    sceneRef.current = { scene, camera, renderer, objects, frameId }

    return () => {
      isMounted = false
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameId)
      
      objects.forEach(obj => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry?.dispose()
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(mat => mat.dispose())
            } else {
              obj.material.dispose()
            }
          }
        }
      })
      
      scene.clear()
      renderer.dispose()
      
      try {
        renderer.forceContextLoss()
      } catch (e) {
      }
      
      if (container && renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
      
      sceneRef.current = null
    }
  }, [theme, realmColor])

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none opacity-30 -z-10"
    />
  )
}
