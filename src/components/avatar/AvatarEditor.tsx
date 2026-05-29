import { useState } from 'react'
import type { AvatarCustomization, Theme } from '@/lib/types'
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  SKIN_TONES, 
  HAIR_STYLES, 
  HAIR_COLORS, 
  EYE_COLORS, 
  BODY_TYPES, 
  OUTFITS, 
  OUTFIT_COLORS,
  ACCESSORIES,
  DEFAULT_AVATAR
} from '@/lib/avatar-options'
import { User, Palette, TShirt, Sparkle, Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface AvatarEditorProps {
  open: boolean
  avatar: AvatarCustomization
  theme: Theme
  onClose: () => void
  onSave: (avatar: AvatarCustomization) => void
}

export function AvatarEditor({ open, avatar, theme, onClose, onSave }: AvatarEditorProps) {
  const [editingAvatar, setEditingAvatar] = useState<AvatarCustomization>(avatar)

  const handleSave = () => {
    onSave(editingAvatar)
    onClose()
  }

  const handleReset = () => {
    setEditingAvatar(DEFAULT_AVATAR)
  }

  const toggleAccessory = (accessoryId: string) => {
    setEditingAvatar(prev => ({
      ...prev,
      accessories: prev.accessories.includes(accessoryId)
        ? prev.accessories.filter(a => a !== accessoryId)
        : [...prev.accessories, accessoryId]
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <User size={32} weight="fill" className="text-primary" />
            <div>
              <DialogTitle className="text-3xl">Customize Avatar</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Create your unique character appearance
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
          <div className="flex flex-col items-center gap-4 glass-panel p-6 rounded-lg">
            <h3 className="text-xl font-bold">Preview</h3>
            <AvatarDisplay avatar={editingAvatar} size="xl" />
            <div className="flex gap-2 w-full">
              <Button onClick={handleReset} variant="outline" className="flex-1" size="sm">
                Reset
              </Button>
              <Button onClick={handleSave} className="flex-1 gap-2" size="sm">
                <Check size={18} weight="bold" />
                Save Avatar
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="appearance" className="gap-2">
                  <Palette size={18} />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="outfit" className="gap-2">
                  <TShirt size={18} />
                  Outfit
                </TabsTrigger>
                <TabsTrigger value="accessories" className="gap-2">
                  <Sparkle size={18} />
                  Extras
                </TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Skin Tone</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {SKIN_TONES.map(tone => (
                      <button
                        key={tone.id}
                        onClick={() => setEditingAvatar(prev => ({ ...prev, skinTone: tone.id }))}
                        className={cn(
                          "h-12 rounded-lg border-2 transition-all",
                          editingAvatar.skinTone === tone.id
                            ? "border-primary scale-105 shadow-lg ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        )}
                        style={{ backgroundColor: tone.color }}
                      >
                        {editingAvatar.skinTone === tone.id && (
                          <Check size={20} weight="bold" className="mx-auto text-foreground drop-shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Hair Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {HAIR_STYLES.map(style => (
                      <Button
                        key={style.id}
                        onClick={() => setEditingAvatar(prev => ({ ...prev, hairStyle: style.id }))}
                        variant={editingAvatar.hairStyle === style.id ? "default" : "outline"}
                        className="justify-start gap-2"
                        size="sm"
                      >
                        {editingAvatar.hairStyle === style.id && <Check size={16} weight="bold" />}
                        {style.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Hair Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {HAIR_COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setEditingAvatar(prev => ({ ...prev, hairColor: color.id }))}
                        className={cn(
                          "h-10 rounded-lg border-2 transition-all",
                          editingAvatar.hairColor === color.id
                            ? "border-primary scale-105 shadow-lg ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        )}
                        style={{ backgroundColor: color.color }}
                      >
                        {editingAvatar.hairColor === color.id && (
                          <Check size={16} weight="bold" className="mx-auto text-foreground drop-shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Eye Color</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {EYE_COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setEditingAvatar(prev => ({ ...prev, eyeColor: color.id }))}
                        className={cn(
                          "h-10 rounded-lg border-2 transition-all",
                          editingAvatar.eyeColor === color.id
                            ? "border-primary scale-105 shadow-lg ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        )}
                        style={{ backgroundColor: color.color }}
                      >
                        {editingAvatar.eyeColor === color.id && (
                          <Check size={16} weight="bold" className="mx-auto text-foreground drop-shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Body Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {BODY_TYPES.map(type => (
                      <Button
                        key={type.id}
                        onClick={() => setEditingAvatar(prev => ({ ...prev, bodyType: type.id }))}
                        variant={editingAvatar.bodyType === type.id ? "default" : "outline"}
                        className="justify-start gap-2"
                        size="sm"
                      >
                        {editingAvatar.bodyType === type.id && <Check size={16} weight="bold" />}
                        {type.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="outfit" className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Outfit Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {OUTFITS.map(outfit => (
                      <Button
                        key={outfit.id}
                        onClick={() => setEditingAvatar(prev => ({ ...prev, outfit: outfit.id }))}
                        variant={editingAvatar.outfit === outfit.id ? "default" : "outline"}
                        className="justify-start gap-2"
                        size="sm"
                      >
                        {editingAvatar.outfit === outfit.id && <Check size={16} weight="bold" />}
                        {outfit.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Outfit Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {OUTFIT_COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setEditingAvatar(prev => ({ ...prev, outfitColor: color.id }))}
                        className={cn(
                          "h-12 rounded-lg border-2 transition-all",
                          editingAvatar.outfitColor === color.id
                            ? "border-primary scale-105 shadow-lg ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        )}
                        style={{ backgroundColor: color.color }}
                      >
                        {editingAvatar.outfitColor === color.id && (
                          <Check size={20} weight="bold" className="mx-auto text-foreground drop-shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="accessories" className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Accessories
                    <Badge variant="secondary" className="ml-2">{editingAvatar.accessories.length} selected</Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Click to add or remove accessories
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCESSORIES.map(accessory => {
                      const isSelected = editingAvatar.accessories.includes(accessory.id)
                      return (
                        <Button
                          key={accessory.id}
                          onClick={() => toggleAccessory(accessory.id)}
                          variant={isSelected ? "default" : "outline"}
                          className="justify-start gap-2"
                          size="sm"
                        >
                          {isSelected && <Check size={16} weight="bold" />}
                          {accessory.name}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </div>

        <div className="p-6 pt-4 flex justify-end gap-2">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Check size={20} weight="bold" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
