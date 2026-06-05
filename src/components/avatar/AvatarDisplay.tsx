import type { AvatarCustomization } from '@/lib/types'
import { 
  SKIN_TONES, 
  HAIR_COLORS, 
  EYE_COLORS, 
  OUTFIT_COLORS 
} from '@/lib/avatar-options'

interface AvatarDisplayProps {
  avatar: AvatarCustomization
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  sm: 'w-12 h-12',
  md: 'w-24 h-24',
  lg: 'w-40 h-40',
  xl: 'w-64 h-64'
}

export function AvatarDisplay({ avatar, size = 'md', className = '' }: AvatarDisplayProps) {
  const skinColor = SKIN_TONES.find(s => s.id === avatar.skinTone)?.color || SKIN_TONES[0].color
  const hairColor = HAIR_COLORS.find(h => h.id === avatar.hairColor)?.color || HAIR_COLORS[0].color
  const eyeColor = EYE_COLORS.find(e => e.id === avatar.eyeColor)?.color || EYE_COLORS[0].color
  const outfitColor = OUTFIT_COLORS.find(o => o.id === avatar.outfitColor)?.color || OUTFIT_COLORS[0].color

  const bodyWidthMap = {
    slim: '55%',
    average: '65%',
    athletic: '70%',
    stocky: '75%'
  }

  const hairStylePaths: Record<string, string> = {
    short: 'M20,15 Q20,8 30,8 Q40,8 40,15 L20,15',
    medium: 'M18,15 Q18,5 30,5 Q42,5 42,15 L18,15',
    long: 'M16,15 Q16,5 30,5 Q44,5 44,25 L16,25 L16,15',
    braided: 'M18,15 Q18,5 30,5 Q42,5 42,18 L38,22 Q30,20 22,22 L18,18 L18,15',
    bun: 'M20,15 Q20,8 30,8 Q40,8 40,15 M28,5 Q30,3 32,5 Q34,8 32,10 Q30,12 28,10 Q26,8 28,5',
    ponytail: 'M20,15 Q20,8 30,8 Q40,8 40,15 M35,12 Q38,14 38,20 Q36,24 35,22',
    mohawk: 'M25,15 Q25,5 30,3 Q35,5 35,15',
    bald: '',
    wavy: 'M18,15 Q18,5 30,5 Q42,5 42,15 Q40,10 38,12 Q36,14 34,12 Q32,10 30,12 Q28,14 26,12 Q24,10 22,12 Q20,10 18,15',
    curly: 'M18,15 Q18,8 22,6 Q24,8 22,10 Q24,12 26,10 Q28,8 30,10 Q32,12 34,10 Q36,8 38,10 Q40,12 38,14 Q40,16 42,15 L18,15'
  }

  const outfitPaths: Record<string, React.ReactElement> = {
    casual: (
      <path
        d="M20,35 L20,55 L40,55 L40,35 Q40,32 38,30 L35,27 L25,27 L22,30 Q20,32 20,35"
        fill={outfitColor}
        stroke="currentColor"
        strokeWidth="0.5"
      />
    ),
    formal: (
      <>
        <path
          d="M20,35 L20,55 L40,55 L40,35 Q40,32 38,30 L35,27 L25,27 L22,30 Q20,32 20,35"
          fill={outfitColor}
          stroke="currentColor"
          strokeWidth="0.5"
        />
        <path
          d="M28,30 L28,45 L32,45 L32,30"
          fill="oklch(0.95 0 0)"
          stroke="currentColor"
          strokeWidth="0.3"
        />
        <path
          d="M28,32 L25,35 L28,35 M32,32 L35,35 L32,35"
          fill={outfitColor}
          stroke="none"
        />
      </>
    ),
    armor: (
      <>
        <path
          d="M20,35 L20,55 L40,55 L40,35 Q40,32 38,30 L35,27 L25,27 L22,30 Q20,32 20,35"
          fill={outfitColor}
          stroke="currentColor"
          strokeWidth="0.8"
        />
        <circle cx="25" cy="40" r="2" fill="oklch(0.7 0 0)" />
        <circle cx="30" cy="40" r="2" fill="oklch(0.7 0 0)" />
        <circle cx="35" cy="40" r="2" fill="oklch(0.7 0 0)" />
      </>
    ),
    robe: (
      <path
        d="M18,35 L18,58 Q18,60 25,60 L35,60 Q42,60 42,58 L42,35 Q42,32 38,30 L35,27 L25,27 L22,30 Q18,32 18,35"
        fill={outfitColor}
        stroke="currentColor"
        strokeWidth="0.5"
      />
    ),
    'tech-suit': (
      <>
        <path
          d="M20,35 L20,55 L40,55 L40,35 Q40,32 38,30 L35,27 L25,27 L22,30 Q20,32 20,35"
          fill={outfitColor}
          stroke="currentColor"
          strokeWidth="0.5"
        />
        <path
          d="M22,30 L22,50 M24,30 L24,50 M36,30 L36,50 M38,30 L38,50"
          stroke="oklch(0.7 0.2 200)"
          strokeWidth="0.3"
          opacity="0.6"
        />
        <circle cx="30" cy="32" r="1.5" fill="oklch(0.7 0.2 200)" />
      </>
    ),
    leather: (
      <path
        d="M20,35 L20,55 L40,55 L40,35 Q40,32 38,30 L35,27 L25,27 L22,30 Q20,32 20,35"
        fill={outfitColor}
        stroke="oklch(0.3 0.05 50)"
        strokeWidth="0.6"
      />
    ),
    tunic: (
      <path
        d="M19,35 L19,54 Q19,56 22,56 L38,56 Q41,56 41,54 L41,35 Q41,32 38,30 L35,27 L25,27 L22,30 Q19,32 19,35"
        fill={outfitColor}
        stroke="currentColor"
        strokeWidth="0.5"
      />
    ),
    cloak: (
      <>
        <path
          d="M15,30 Q15,45 20,55 L20,35 L22,30 L25,27 L35,27 L38,30 L40,35 L40,55 Q45,45 45,30 L40,28 L35,27 L25,27 L20,28 Z"
          fill={outfitColor}
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.8"
        />
        <path
          d="M20,35 L20,50 L40,50 L40,35 Q40,32 38,30 L35,27 L25,27 L22,30 Q20,32 20,35"
          fill="oklch(0.3 0.02 240)"
          stroke="currentColor"
          strokeWidth="0.3"
        />
      </>
    )
  }

  const accessoryElements = avatar.accessories.map((acc, idx) => {
    switch (acc) {
      case 'glasses':
        return (
          <g key={idx}>
            <circle cx="24" cy="22" r="3" fill="none" stroke="oklch(0.3 0 0)" strokeWidth="0.5" />
            <circle cx="36" cy="22" r="3" fill="none" stroke="oklch(0.3 0 0)" strokeWidth="0.5" />
            <path d="M27,22 L33,22" stroke="oklch(0.3 0 0)" strokeWidth="0.5" />
          </g>
        )
      case 'hat':
        return (
          <path
            key={idx}
            d="M15,12 L20,8 L40,8 L45,12 L40,10 L20,10 Z"
            fill="oklch(0.4 0.08 50)"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        )
      case 'scarf':
        return (
          <path
            key={idx}
            d="M20,27 Q18,30 20,33 L25,35 L22,40 L24,42 L28,38 L32,38 L36,42 L38,40 L35,35 L40,33 Q42,30 40,27"
            fill="oklch(0.65 0.20 340)"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        )
      case 'necklace':
        return (
          <g key={idx}>
            <path
              d="M24,32 Q30,34 36,32"
              fill="none"
              stroke="oklch(0.7 0.15 80)"
              strokeWidth="0.5"
            />
            <circle cx="30" cy="35" r="1.5" fill="oklch(0.7 0.15 80)" />
          </g>
        )
      case 'earrings':
        return (
          <g key={idx}>
            <circle cx="18" cy="22" r="1.5" fill="oklch(0.7 0.15 80)" />
            <circle cx="42" cy="22" r="1.5" fill="oklch(0.7 0.15 80)" />
          </g>
        )
      case 'crown':
        return (
          <path
            key={idx}
            d="M16,10 L20,14 L24,10 L28,14 L30,10 L32,14 L36,10 L40,14 L44,10 L44,16 L16,16 Z"
            fill="oklch(0.7 0.15 80)"
            stroke="oklch(0.6 0.12 70)"
            strokeWidth="0.5"
          />
        )
      case 'helmet':
        return (
          <path
            key={idx}
            d="M18,14 Q18,8 30,8 Q42,8 42,14 L42,20 L38,18 L38,14 Q38,12 30,12 Q22,12 22,14 L22,18 L18,20 Z"
            fill="oklch(0.5 0 0)"
            stroke="currentColor"
            strokeWidth="0.6"
          />
        )
      case 'cape':
        return (
          <path
            key={idx}
            d="M22,30 Q15,35 15,50 L20,55 L20,35 M38,30 Q45,35 45,50 L40,55 L40,35"
            fill="oklch(0.5 0.20 0)"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.7"
          />
        )
      case 'wings':
        return (
          <g key={idx}>
            <path
              d="M20,35 Q10,30 8,38 Q10,42 15,40 Q18,38 20,40"
              fill="oklch(0.9 0 0)"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.8"
            />
            <path
              d="M40,35 Q50,30 52,38 Q50,42 45,40 Q42,38 40,40"
              fill="oklch(0.9 0 0)"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.8"
            />
          </g>
        )
      case 'mask':
        return (
          <path
            key={idx}
            d="M18,18 Q18,24 24,24 L36,24 Q42,24 42,18 L42,20 Q42,16 38,16 L22,16 Q18,16 18,20 Z"
            fill="oklch(0.2 0 0)"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.9"
          />
        )
      default:
        return null
    }
  })

  return (
    <div className={`${SIZES[size]} ${className} flex items-center justify-center`}>
      <svg viewBox="0 0 60 60" className="w-full h-full">
        {avatar.accessories.includes('cape') && accessoryElements[avatar.accessories.indexOf('cape')]}
        {avatar.accessories.includes('wings') && accessoryElements[avatar.accessories.indexOf('wings')]}
        
        <circle cx="30" cy="30" r="12" fill={skinColor} stroke="currentColor" strokeWidth="0.5" />
        
        {avatar.hairStyle !== 'bald' && (
          <path
            d={hairStylePaths[avatar.hairStyle] || hairStylePaths.short}
            fill={hairColor}
            stroke="currentColor"
            strokeWidth="0.5"
          />
        )}
        
        <circle cx="24" cy="22" r="2" fill={eyeColor} />
        <circle cx="36" cy="22" r="2" fill={eyeColor} />
        <circle cx="24.5" cy="21.5" r="0.8" fill="oklch(0.95 0 0)" />
        <circle cx="36.5" cy="21.5" r="0.8" fill="oklch(0.95 0 0)" />
        
        <path
          d="M26,26 Q30,28 34,26"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
        
        <ellipse
          cx="30"
          cy="42"
          rx={bodyWidthMap[avatar.bodyType as keyof typeof bodyWidthMap] ? 
            (parseFloat(bodyWidthMap[avatar.bodyType as keyof typeof bodyWidthMap]) / 100) * 20 : 13}
          ry="13"
          fill={skinColor}
          stroke="currentColor"
          strokeWidth="0.5"
        />
        
        {outfitPaths[avatar.outfit] || outfitPaths.casual}
        
        {accessoryElements.filter((_, idx) => 
          !['cape', 'wings'].includes(avatar.accessories[idx])
        )}
      </svg>
    </div>
  )
}
