import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize user input before including in LLM prompts.
 * Escapes closing XML tags to prevent prompt injection attacks
 * where malicious input could break out of XML delimiters.
 */
export function sanitizeLLMInput(input: string): string {
  return input.replace(/<\//g, "<\\/")
}
