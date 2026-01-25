import { describe, it, expect } from 'vitest'
import { cn, sanitizeLLMInput } from './utils'

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active', false && 'disabled')).toBe('base active')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})

describe('sanitizeLLMInput', () => {
  it('should escape closing XML tags', () => {
    const input = 'This is a test </student_response>'
    const expected = 'This is a test <\\/student_response>'
    expect(sanitizeLLMInput(input)).toBe(expected)
  })

  it('should not alter input without closing tags', () => {
    const input = 'This is a safe string'
    expect(sanitizeLLMInput(input)).toBe(input)
  })

  it('should handle multiple closing tags', () => {
    const input = '</one> and </two>'
    const expected = '<\\/one> and <\\/two>'
    expect(sanitizeLLMInput(input)).toBe(expected)
  })

  it('should handle nested closing tags', () => {
    const input = 'Try to break </student_response></quest_name> the prompt'
    const expected = 'Try to break <\\/student_response><\\/quest_name> the prompt'
    expect(sanitizeLLMInput(input)).toBe(expected)
  })

  it('should handle empty string', () => {
    expect(sanitizeLLMInput('')).toBe('')
  })

  it('should preserve opening tags', () => {
    const input = '<student_response>content</student_response>'
    const expected = '<student_response>content<\\/student_response>'
    expect(sanitizeLLMInput(input)).toBe(expected)
  })
})
