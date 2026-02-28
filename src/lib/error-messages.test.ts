import { describe, it, expect } from 'vitest';
import {
  getLLMErrorMessage,
  getSubmissionErrorMessage,
  getImportErrorMessage,
} from './error-messages';

describe('getLLMErrorMessage', () => {
  it('detects rate limit errors', () => {
    const result = getLLMErrorMessage(new Error('Rate limit exceeded'));
    expect(result.title).toBe('Too Many Requests');
  });

  it('detects 429 status', () => {
    const result = getLLMErrorMessage(new Error('HTTP 429'));
    expect(result.title).toBe('Too Many Requests');
  });

  it('detects "too many" phrasing', () => {
    const result = getLLMErrorMessage(new Error('Too many requests'));
    expect(result.title).toBe('Too Many Requests');
  });

  it('detects network errors', () => {
    const result = getLLMErrorMessage(new Error('Network error'));
    expect(result.title).toBe('Connection Error');
  });

  it('detects fetch errors', () => {
    const result = getLLMErrorMessage(new Error('Fetch failed'));
    expect(result.title).toBe('Connection Error');
  });

  it('detects timeout errors', () => {
    const result = getLLMErrorMessage(new Error('Request timed out'));
    expect(result.title).toBe('Request Timeout');
  });

  it('detects 503 service unavailable', () => {
    const result = getLLMErrorMessage(new Error('503 Service Unavailable'));
    expect(result.title).toBe('Service Unavailable');
  });

  it('detects parse errors', () => {
    const result = getLLMErrorMessage(new Error('Failed to parse JSON'));
    expect(result.title).toBe('Processing Error');
  });

  it('returns default for unknown errors', () => {
    const result = getLLMErrorMessage(new Error('Something weird happened'));
    expect(result.title).toBe('Something Went Wrong');
  });

  it('handles non-Error inputs', () => {
    const result = getLLMErrorMessage('string error');
    expect(result.title).toBeDefined();
  });

  it('always includes action field', () => {
    const errors = [
      new Error('Rate limit'), new Error('Network'),
      new Error('Timeout'), new Error('503'),
      new Error('Parse error'), new Error('Unknown'),
    ];
    errors.forEach(err => {
      const result = getLLMErrorMessage(err);
      expect(result.action).toBeTruthy();
    });
  });
});

describe('getSubmissionErrorMessage', () => {
  it('detects network errors', () => {
    const result = getSubmissionErrorMessage(new Error('Network error'));
    expect(result.title).toBe('Connection Lost');
  });

  it('detects timeout errors', () => {
    const result = getSubmissionErrorMessage(new Error('Request timeout'));
    expect(result.title).toBe('Submission Timeout');
  });

  it('detects too-long errors', () => {
    const result = getSubmissionErrorMessage(new Error('Response too long'));
    expect(result.title).toBe('Submission Too Long');
  });

  it('detects too-large errors', () => {
    const result = getSubmissionErrorMessage(new Error('Payload too large'));
    expect(result.title).toBe('Submission Too Long');
  });

  it('returns default for unknown errors', () => {
    const result = getSubmissionErrorMessage(new Error('Unknown'));
    expect(result.title).toBe('Submission Failed');
  });
});

describe('getImportErrorMessage', () => {
  it('detects JSON parse errors', () => {
    const result = getImportErrorMessage(new Error('Failed to parse JSON'));
    expect(result.title).toBe('Invalid Format');
  });

  it('detects structure/schema errors', () => {
    const result = getImportErrorMessage(new Error('Invalid structure'));
    expect(result.title).toBe('Invalid Data Structure');
  });

  it('detects validation errors', () => {
    const result = getImportErrorMessage(new Error('Validation failed'));
    expect(result.title).toBe('Invalid Data Structure');
  });

  it('detects size errors', () => {
    const result = getImportErrorMessage(new Error('File too large'));
    expect(result.title).toBe('File Too Large');
  });

  it('detects empty data', () => {
    const result = getImportErrorMessage(new Error('Data is empty'));
    expect(result.title).toBe('No Data');
  });

  it('returns default for unknown errors', () => {
    const result = getImportErrorMessage(new Error('Unknown'));
    expect(result.title).toBe('Import Failed');
  });
});
