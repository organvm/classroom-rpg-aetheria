import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'
import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'
import type { Theme } from '@/lib/types'

const THEME_SCALES = {
  fantasy: {
    scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88],
    baseOctave: 4,
    tempo: 90,
    complexity: 'flowing'
  },
  scifi: {
    scale: [261.63, 277.18, 311.13, 369.99, 415.30, 466.16],
    baseOctave: 3,
    tempo: 120,
    complexity: 'rhythmic'
  },
  medieval: {
    scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00],
    baseOctave: 4,
    tempo: 70,
    complexity: 'simple'
  },
  modern: {
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    baseOctave: 4,
    tempo: 100,
    complexity: 'steady'
  }
}

export function GenerativeMusic() {
  const [theme] = useTheme()
  const [isPlaying, setIsPlaying] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const intervalRef = useRef<number | null>(null)
  const currentTheme = theme || 'fantasy'

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      masterGainRef.current = audioContextRef.current.createGain()
      masterGainRef.current.connect(audioContextRef.current.destination)
      masterGainRef.current.gain.value = 0.15
    }
  }

  const playNote = (frequency: number, duration: number, gain: number = 0.3) => {
    if (!audioContextRef.current || !masterGainRef.current) return

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    oscillator.type = currentTheme === 'scifi' ? 'square' : 
                      currentTheme === 'medieval' ? 'triangle' : 'sine'
    oscillator.frequency.value = frequency

    filter.type = 'lowpass'
    filter.frequency.value = 2000
    filter.Q.value = 1

    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(masterGainRef.current)

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  }

  const generateMelody = () => {
    const config = THEME_SCALES[currentTheme]
    const scaleLength = config.scale.length
    
    const noteIndex = Math.floor(Math.random() * scaleLength)
    const frequency = config.scale[noteIndex]
    const octaveShift = Math.random() > 0.7 ? 2 : Math.random() > 0.3 ? 1 : 0.5
    const finalFreq = frequency * octaveShift
    
    const duration = Math.random() > 0.6 ? 1.5 : 0.8
    const gain = 0.15 + Math.random() * 0.1
    
    playNote(finalFreq, duration, gain)

    if (Math.random() > 0.7) {
      const harmonyIndex = (noteIndex + 2) % scaleLength
      const harmonyFreq = config.scale[harmonyIndex] * octaveShift * 0.5
      setTimeout(() => playNote(harmonyFreq, duration * 0.8, gain * 0.5), 100)
    }
  }

  const startMusic = () => {
    initAudio()
    setIsPlaying(true)

    const config = THEME_SCALES[currentTheme]
    const interval = (60 / config.tempo) * 1000

    generateMelody()
    intervalRef.current = window.setInterval(() => {
      if (Math.random() > 0.3) {
        generateMelody()
      }
    }, interval)
  }

  const stopMusic = () => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic()
    } else {
      startMusic()
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMusic}
      className="glass-button"
    >
      {isPlaying ? (
        <SpeakerHigh size={20} weight="fill" className="text-primary" />
      ) : (
        <SpeakerSlash size={20} weight="fill" />
      )}
    </Button>
  )
}
