/**
 * Static (GitHub Pages) shim for `@github/spark/spark`.
 *
 * The real side-effect module, on import, unconditionally:
 *   - POSTs to `/_spark/loaded`               → 405 on a static host
 *   - installs `window.spark.kv`  (→ `/_spark/kv/*`   404s)
 *   - installs `window.spark.user` (→ `/_spark/user`  404)
 *   - installs `window.spark.llm`  (→ `/_spark/llm`   405)
 *   - registers a heartbeat error listener that fetches source maps (404)
 *
 * On the static Pages build there is no Spark runtime, so every one of those
 * calls fails and floods the console. This shim installs a fully local,
 * network-free `window.spark`:
 *   - `kv` is backed by `localStorage`
 *   - `user` returns a static anonymous identity
 *   - `llm` / `llmPrompt` degrade gracefully (no backend to call)
 *
 * It is swapped in at build time via `resolve.alias` in `vite.config.ts`,
 * gated on `GITHUB_PAGES`. Normal/dev builds import the real runtime unchanged.
 */

const STORAGE_PREFIX = 'spark-kv:'

function llmPrompt(strings: TemplateStringsArray | string[], ...values: unknown[]): string {
  return (strings as ReadonlyArray<string>).reduce(
    (acc, str, i) => acc + str + (i < values.length ? String(values[i]) : ''),
    ''
  )
}

/**
 * No backend on a static host. Rather than throwing an unhandled 405, return a
 * clear, JSON-safe message so callers (quest evaluation, content generation)
 * degrade gracefully instead of erroring in the console.
 */
async function llm(_prompt: string, _modelName?: string, jsonMode?: boolean): Promise<string> {
  const message =
    'AI features are unavailable on the static demo deployment (no backend). ' +
    'Run the app with a configured Spark or Firebase backend to enable them.'
  if (jsonMode) {
    return JSON.stringify({ error: 'ai_unavailable_static', message })
  }
  return message
}

const kv = {
  keys: async (): Promise<string[]> => {
    const out: string[] = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(STORAGE_PREFIX)) out.push(k.slice(STORAGE_PREFIX.length))
      }
    } catch {
      /* localStorage unavailable */
    }
    return out
  },
  get: async <T>(key: string): Promise<T | undefined> => {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key)
      return raw === null ? undefined : (JSON.parse(raw) as T)
    } catch {
      return undefined
    }
  },
  set: async <T>(key: string, value: T): Promise<void> => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
    } catch {
      /* storage full / disabled */
    }
  },
  delete: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key)
    } catch {
      /* no-op */
    }
  },
}

async function user() {
  return {
    avatarUrl: '',
    email: '',
    id: 'static-anonymous',
    isOwner: false,
    login: 'anonymous',
  }
}

declare global {
  interface Window {
    spark: {
      llmPrompt: typeof llmPrompt
      llm: typeof llm
      user: typeof user
      kv: typeof kv
    }
  }
}

if (typeof window !== 'undefined') {
  window.spark = { llmPrompt, llm, user, kv }
}

export {}
