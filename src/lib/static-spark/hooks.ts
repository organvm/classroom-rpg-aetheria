/**
 * Static (GitHub Pages) shim for `@github/spark/hooks`.
 *
 * On the static Pages build there is NO Spark runtime backend, so the real
 * `useKV` — which fetches `/_spark/kv` and `/_spark/kv/<key>` on mount — would
 * produce a 404 for every persisted key (dozens of console errors on load).
 *
 * This shim provides an identical `useKV` surface backed by `localStorage`,
 * so persistence still works for a single visitor and NO network request is
 * ever made. It is swapped in at build time via `resolve.alias` in
 * `vite.config.ts`, gated on `GITHUB_PAGES` — normal/dev builds use the real
 * Spark hooks unchanged.
 */

import { useCallback, useEffect, useState } from 'react'

const STORAGE_PREFIX = 'spark-kv:'

function readStored<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    return raw === null ? undefined : (JSON.parse(raw) as T)
  } catch {
    return undefined
  }
}

/**
 * localStorage-backed drop-in replacement for `@github/spark/hooks`'s `useKV`.
 *
 * Signature matches the real hook exactly:
 *   const [value, setValue, deleteValue] = useKV(key, initialValue)
 */
export function useKV<T = string>(
  key: string,
  initialValue?: T
): readonly [T | undefined, (newValue: T | ((oldValue?: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T | undefined>(() => {
    const stored = readStored<T>(key)
    return stored !== undefined ? stored : initialValue
  })

  // Keep in sync across tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_PREFIX + key) {
        setValue(e.newValue === null ? initialValue : (JSON.parse(e.newValue) as T))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const setKV = useCallback(
    (newValue: T | ((oldValue?: T) => T)) => {
      setValue((prev) => {
        const next =
          typeof newValue === 'function'
            ? (newValue as (oldValue?: T) => T)(prev)
            : newValue
        try {
          localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(next))
        } catch {
          // Storage full / disabled — value still lives in React state.
        }
        return next
      })
    },
    [key]
  )

  const deleteKV = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key)
    } catch {
      /* no-op */
    }
    setValue(initialValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return [value, setKV, deleteKV] as const
}
