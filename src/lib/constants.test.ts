import { describe, it, expect } from 'vitest';
import {
  QUEST_PASS_THRESHOLD,
  ARTIFACT_THRESHOLD,
  RARITY_THRESHOLDS,
  XP_LEVEL_THRESHOLDS,
  REDEMPTION_XP_MULTIPLIER,
  MIN_QUEST_XP,
  MAX_QUEST_XP,
  DEFAULT_QUEST_XP,
  LLM_MAX_RETRIES,
  LLM_RETRY_DELAY_MS,
  LLM_TIMEOUT_MS,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  QUEST_CONTENT_MAX_LENGTH,
  IMPORT_FILE_MAX_SIZE,
} from './constants';

describe('quest scoring constants', () => {
  it('quest pass threshold is less than artifact threshold', () => {
    expect(QUEST_PASS_THRESHOLD).toBeLessThan(ARTIFACT_THRESHOLD);
  });

  it('rarity thresholds are in descending order', () => {
    expect(RARITY_THRESHOLDS.legendary).toBeGreaterThan(RARITY_THRESHOLDS.epic);
    expect(RARITY_THRESHOLDS.epic).toBeGreaterThan(RARITY_THRESHOLDS.rare);
  });

  it('rarity thresholds are at or above artifact threshold', () => {
    expect(RARITY_THRESHOLDS.rare).toBeGreaterThanOrEqual(ARTIFACT_THRESHOLD);
  });
});

describe('XP level thresholds', () => {
  it('starts at 0', () => {
    expect(XP_LEVEL_THRESHOLDS[0]).toBe(0);
  });

  it('is strictly increasing', () => {
    for (let i = 1; i < XP_LEVEL_THRESHOLDS.length; i++) {
      expect(XP_LEVEL_THRESHOLDS[i]).toBeGreaterThan(XP_LEVEL_THRESHOLDS[i - 1]);
    }
  });
});

describe('quest XP constraints', () => {
  it('min is less than max', () => {
    expect(MIN_QUEST_XP).toBeLessThan(MAX_QUEST_XP);
  });

  it('default is between min and max', () => {
    expect(DEFAULT_QUEST_XP).toBeGreaterThanOrEqual(MIN_QUEST_XP);
    expect(DEFAULT_QUEST_XP).toBeLessThanOrEqual(MAX_QUEST_XP);
  });

  it('redemption multiplier is between 0 and 1', () => {
    expect(REDEMPTION_XP_MULTIPLIER).toBeGreaterThan(0);
    expect(REDEMPTION_XP_MULTIPLIER).toBeLessThan(1);
  });
});

describe('LLM configuration', () => {
  it('retries are reasonable', () => {
    expect(LLM_MAX_RETRIES).toBeGreaterThan(0);
    expect(LLM_MAX_RETRIES).toBeLessThanOrEqual(10);
  });

  it('timeout is longer than retry delay', () => {
    expect(LLM_TIMEOUT_MS).toBeGreaterThan(LLM_RETRY_DELAY_MS);
  });
});

describe('input validation constraints', () => {
  it('name min is less than max', () => {
    expect(NAME_MIN_LENGTH).toBeLessThan(NAME_MAX_LENGTH);
  });

  it('description min is less than max', () => {
    expect(DESCRIPTION_MIN_LENGTH).toBeLessThan(DESCRIPTION_MAX_LENGTH);
  });

  it('import file max size is 1MB', () => {
    expect(IMPORT_FILE_MAX_SIZE).toBe(1024 * 1024);
  });

  it('quest content max is positive', () => {
    expect(QUEST_CONTENT_MAX_LENGTH).toBeGreaterThan(0);
  });
});
