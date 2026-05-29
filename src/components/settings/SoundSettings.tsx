import { useState } from 'react'
import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { soundEffects } from '@/lib/sound-effects'
import { useKV } from '@github/spark/hooks'

export function SoundSettings() {
  const [volume, setVolume] = useKV<number>('aetheria-sound-volume', 0.3)
  const [isMuted, setIsMuted] = useKV<boolean>('aetheria-sound-muted', false)

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0]
    setVolume(newVolume)
    soundEffects.setVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
      soundEffects.setEnabled(true)
    }
  }

  const handleToggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    soundEffects.setEnabled(!newMuted)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="glass-button"
          aria-label="Sound settings"
        >
          {isMuted || (volume ?? 0.3) === 0 ? (
            <SpeakerSlash size={20} weight="fill" />
          ) : (
            <SpeakerHigh size={20} weight="fill" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="glass-panel w-64" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sound Effects</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleMute}
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? (
                <SpeakerSlash size={20} weight="fill" />
              ) : (
                <SpeakerHigh size={20} weight="fill" />
              )}
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Volume</span>
              <span>{Math.round((volume ?? 0.3) * 100)}%</span>
            </div>
            <Slider
              value={[volume ?? 0.3]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.01}
              disabled={isMuted ?? false}
              className="w-full"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

