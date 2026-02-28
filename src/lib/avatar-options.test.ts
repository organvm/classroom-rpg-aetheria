import { describe, it, expect } from 'vitest';
import {
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  EYE_COLORS,
  BODY_TYPES,
  OUTFITS,
  OUTFIT_COLORS,
  ACCESSORIES,
  DEFAULT_AVATAR,
} from './avatar-options';

describe('avatar option arrays', () => {
  const optionSets = [
    { name: 'SKIN_TONES', data: SKIN_TONES, min: 5 },
    { name: 'HAIR_STYLES', data: HAIR_STYLES, min: 5 },
    { name: 'HAIR_COLORS', data: HAIR_COLORS, min: 5 },
    { name: 'EYE_COLORS', data: EYE_COLORS, min: 5 },
    { name: 'BODY_TYPES', data: BODY_TYPES, min: 3 },
    { name: 'OUTFITS', data: OUTFITS, min: 5 },
    { name: 'OUTFIT_COLORS', data: OUTFIT_COLORS, min: 5 },
    { name: 'ACCESSORIES', data: ACCESSORIES, min: 5 },
  ];

  optionSets.forEach(({ name, data, min }) => {
    it(`${name} has at least ${min} options`, () => {
      expect(data.length).toBeGreaterThanOrEqual(min);
    });

    it(`${name} has unique IDs`, () => {
      const ids = data.map(d => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});

describe('SKIN_TONES', () => {
  it('includes natural and fantasy tones', () => {
    const ids = SKIN_TONES.map(t => t.id);
    expect(ids).toContain('medium');
    expect(ids).toContain('fantasy-blue');
  });

  it('all entries have color values', () => {
    SKIN_TONES.forEach(tone => {
      expect(tone.color).toBeTruthy();
    });
  });
});

describe('DEFAULT_AVATAR', () => {
  it('has valid skin tone', () => {
    expect(SKIN_TONES.map(t => t.id)).toContain(DEFAULT_AVATAR.skinTone);
  });

  it('has valid hair style', () => {
    expect(HAIR_STYLES.map(s => s.id)).toContain(DEFAULT_AVATAR.hairStyle);
  });

  it('has valid hair color', () => {
    expect(HAIR_COLORS.map(c => c.id)).toContain(DEFAULT_AVATAR.hairColor);
  });

  it('has valid eye color', () => {
    expect(EYE_COLORS.map(c => c.id)).toContain(DEFAULT_AVATAR.eyeColor);
  });

  it('has valid body type', () => {
    expect(BODY_TYPES.map(b => b.id)).toContain(DEFAULT_AVATAR.bodyType);
  });

  it('has valid outfit', () => {
    expect(OUTFITS.map(o => o.id)).toContain(DEFAULT_AVATAR.outfit);
  });

  it('has valid outfit color', () => {
    expect(OUTFIT_COLORS.map(c => c.id)).toContain(DEFAULT_AVATAR.outfitColor);
  });

  it('starts with empty accessories', () => {
    expect(DEFAULT_AVATAR.accessories).toEqual([]);
  });
});
