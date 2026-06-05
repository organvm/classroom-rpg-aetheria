# Aetheria: Technical Implementation Roadmap

**Document Type**: Engineering Guide  
**Audience**: Development Team, Technical Leadership  
**Purpose**: Translate analysis findings into actionable implementation tasks  
**Version**: 1.0

---

## Critical Path: 30-Day Production Hardening Sprint

### Week 1: Security & Error Handling

#### Task 1.1: XSS Mitigation (Priority: CRITICAL)
**Owner**: Security Lead / Senior Frontend Engineer  
**Effort**: 3 days  
**Dependencies**: None

**Implementation Steps**:
1. Install DOMPurify: `npm install dompurify @types/dompurify`
2. Create sanitization utility:
```typescript
// src/lib/sanitize.ts
import DOMPurify from 'dompurify'

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  })
}

export function sanitizePlainText(input: string): string {
  return input.replace(/[<>]/g, '')
}
```

3. Apply to all AI-generated content:
```typescript
// In App.tsx, handleQuestSubmit
const evaluation = JSON.parse(result)
evaluation.feedback = sanitizeHTML(evaluation.feedback)

// In crystal generation
const crystalContent = sanitizeHTML(await window.spark.llm(...))
```

4. Add Content Security Policy headers:
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'csp-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
          )
          next()
        })
      }
    }
  ]
})
```

5. Test with malicious payloads:
```typescript
// Test cases
const maliciousInputs = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror="alert(1)">',
  'javascript:alert(1)',
  '<iframe src="evil.com"></iframe>'
]
```

**Acceptance Criteria**:
- All AI outputs sanitized before rendering
- CSP headers block inline scripts
- Manual penetration test passes
- No XSS vulnerabilities in Lighthouse/OWASP ZAP scan

---

#### Task 1.2: AI Failure Handling (Priority: CRITICAL)
**Owner**: Backend Lead  
**Effort**: 4 days  
**Dependencies**: None

**Implementation Steps**:
1. Create retry utility with exponential backoff:
```typescript
// src/lib/api-retry.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      const delay = baseDelay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Max retries exceeded')
}
```

2. Wrap LLM calls:
```typescript
// In App.tsx
try {
  const result = await retryWithBackoff(
    () => window.spark.llm(submissionPrompt, 'gpt-4o', true),
    3,
    2000
  )
  // ... rest of logic
} catch (error) {
  // Fallback to manual grading
  handleManualGradingFallback(questId, content)
}
```

3. Implement manual grading queue:
```typescript
// src/lib/types.ts
export interface PendingSubmission {
  id: string
  questId: string
  studentId: string
  content: string
  status: 'pending' | 'manual_review' | 'completed'
  submittedAt: number
}

// Add to App state
const [pendingSubmissions, setPendingSubmissions] = useKV<PendingSubmission[]>(
  'aetheria-pending-submissions',
  []
)
```

4. Create teacher manual grading UI:
```typescript
// src/components/ManualGradingQueue.tsx
export function ManualGradingQueue({ 
  pending, 
  onGrade 
}: {
  pending: PendingSubmission[]
  onGrade: (id: string, score: number, feedback: string) => void
}) {
  // List pending submissions
  // Provide grading form for teachers
}
```

5. Add status indicators in UI:
```typescript
// In QuestDialog after submission
toast.loading('Evaluating submission...', { id: submissionId })

// On success
toast.success('Evaluated!', { id: submissionId })

// On failure
toast.error('Evaluation delayed - teacher will grade manually', { 
  id: submissionId,
  duration: 5000
})
```

**Acceptance Criteria**:
- Simulated API failures retry automatically
- After 3 failures, submissions enter manual queue
- Teachers see pending submissions in dashboard
- Students notified of evaluation status
- No lost submissions during outages

---

#### Task 1.3: Error Monitoring Setup (Priority: HIGH)
**Owner**: DevOps Engineer  
**Effort**: 1 day  
**Dependencies**: None

**Implementation Steps**:
1. Create Sentry account and project
2. Install SDK: `npm install @sentry/react`
3. Initialize in main.tsx:
```typescript
// src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})
```

4. Wrap app with ErrorBoundary:
```typescript
// Already exists in App.tsx, enhance it
<Sentry.ErrorBoundary fallback={ErrorFallback}>
  <App />
</Sentry.ErrorBoundary>
```

5. Add custom error tracking:
```typescript
// src/lib/error-tracker.ts
import * as Sentry from '@sentry/react'

export function trackError(error: Error, context?: Record<string, any>) {
  console.error(error)
  Sentry.captureException(error, {
    contexts: { custom: context }
  })
}

// Usage in App.tsx
try {
  const result = await window.spark.llm(...)
} catch (error) {
  trackError(error, {
    questId,
    studentId: currentProfile.id,
    operation: 'quest-evaluation'
  })
  throw error
}
```

**Acceptance Criteria**:
- Errors appear in Sentry dashboard
- Stack traces include source maps
- User context attached (profile ID, quest ID)
- Alerts configured for critical errors

---

### Week 2: Data Persistence & Backup

#### Task 2.1: Data Export Functionality (Priority: HIGH)
**Owner**: Full-Stack Engineer  
**Effort**: 3 days  
**Dependencies**: None

**Implementation Steps**:
1. Create export utility:
```typescript
// src/lib/data-export.ts
export interface AetheriaExport {
  version: string
  exportedAt: number
  profile: UserProfile
  realms: Realm[]
  quests: Quest[]
  submissions: Submission[]
  crystals: KnowledgeCrystal[]
}

export function exportAllData(
  profile: UserProfile,
  realms: Realm[],
  quests: Quest[],
  submissions: Submission[],
  crystals: KnowledgeCrystal[]
): AetheriaExport {
  return {
    version: '1.0',
    exportedAt: Date.now(),
    profile,
    realms,
    quests,
    submissions,
    crystals
  }
}

export function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

2. Add export button in HUDSidebar:
```typescript
// src/components/HUDSidebar.tsx
<Button
  variant="ghost"
  className="w-full justify-start gap-3"
  onClick={() => {
    const data = exportAllData(profile, realms, quests, submissions, crystals)
    downloadJSON(data, `aetheria-backup-${Date.now()}.json`)
    toast.success('Data exported successfully')
  }}
>
  <Download size={20} />
  Export All Data
</Button>
```

3. Implement import functionality:
```typescript
// src/lib/data-import.ts
export async function importData(file: File): Promise<AetheriaExport> {
  const text = await file.text()
  const data = JSON.parse(text) as AetheriaExport
  
  // Validate schema
  if (!data.version || !data.profile) {
    throw new Error('Invalid backup file')
  }
  
  return data
}

// Add import button
<input
  type="file"
  accept=".json"
  onChange={async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      const data = await importData(file)
      // Merge with existing data or replace
      setProfile(data.profile)
      setRealms(data.realms)
      // ... etc
      toast.success('Data imported successfully')
    } catch (error) {
      toast.error('Import failed: ' + error.message)
    }
  }}
/>
```

4. Add automatic periodic backup:
```typescript
// In App.tsx
useEffect(() => {
  const interval = setInterval(() => {
    const data = exportAllData(profile, realms, quests, submissions, crystals)
    localStorage.setItem('aetheria-auto-backup', JSON.stringify(data))
  }, 5 * 60 * 1000) // Every 5 minutes
  
  return () => clearInterval(interval)
}, [profile, realms, quests, submissions, crystals])
```

**Acceptance Criteria**:
- Users can download complete data as JSON
- Import restores all data correctly
- Auto-backup runs every 5 minutes
- Backup recovery tested with simulated data loss

---

#### Task 2.2: Database Schema Design (Priority: CRITICAL)
**Owner**: Backend Lead  
**Effort**: 2 days  
**Dependencies**: None

**Implementation Steps**:
1. Design PostgreSQL schema:
```sql
-- schema.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_customization JSONB,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE realms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  position JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  realm_id UUID REFERENCES realms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('standard', 'boss', 'redemption')),
  xp_value INTEGER NOT NULL,
  due_date TIMESTAMP,
  status TEXT NOT NULL,
  prerequisite_ids UUID[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  score INTEGER,
  feedback TEXT,
  rubric_scores JSONB,
  submitted_at TIMESTAMP DEFAULT NOW(),
  evaluated_at TIMESTAMP
);

CREATE TABLE knowledge_crystals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_attuned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  quest_id UUID REFERENCES quests(id),
  earned_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_quest ON submissions(quest_id);
CREATE INDEX idx_quests_realm ON quests(realm_id);
CREATE INDEX idx_artifacts_user ON artifacts(user_id);
```

2. Set up Prisma ORM:
```bash
npm install prisma @prisma/client
npx prisma init
```

3. Create Prisma schema:
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   String             @id @default(uuid())
  name                 String
  avatarCustomization  Json?
  role                 Role
  xp                   Int                @default(0)
  level                Int                @default(1)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  realms               Realm[]
  submissions          Submission[]
  crystals             KnowledgeCrystal[]
  artifacts            Artifact[]
}

enum Role {
  TEACHER
  STUDENT
}

// ... rest of models
```

**Acceptance Criteria**:
- Schema supports all current features
- Indexes on frequently queried fields
- Foreign keys enforce referential integrity
- Migrations runnable on fresh database

---

### Week 3: Testing Infrastructure

#### Task 3.1: Unit Testing Setup (Priority: HIGH)
**Owner**: QA Engineer / Senior Developer  
**Effort**: 5 days  
**Dependencies**: None

**Implementation Steps**:
1. Install testing tools:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom
```

2. Configure Vitest:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'src/test/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

3. Create test utilities:
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// Mock GitHub Spark
global.window.spark = {
  llm: vi.fn().mockResolvedValue('{"score": 85, "feedback": "Good work!"}')
}
```

4. Write tests for critical functions:
```typescript
// src/lib/game-utils.test.ts
import { describe, it, expect } from 'vitest'
import { calculateLevel, getXpForNextLevel, getRarityFromScore } from './game-utils'

describe('calculateLevel', () => {
  it('returns level 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1)
  })
  
  it('returns level 2 for 100 XP', () => {
    expect(calculateLevel(100)).toBe(2)
  })
  
  it('returns level 3 for 250 XP', () => {
    expect(calculateLevel(250)).toBe(3)
  })
  
  it('returns correct level for edge cases', () => {
    expect(calculateLevel(99)).toBe(1)
    expect(calculateLevel(249)).toBe(2)
  })
})

describe('getRarityFromScore', () => {
  it('returns legendary for 98+', () => {
    expect(getRarityFromScore(98)).toBe('legendary')
    expect(getRarityFromScore(100)).toBe('legendary')
  })
  
  it('returns epic for 95-97', () => {
    expect(getRarityFromScore(95)).toBe('epic')
    expect(getRarityFromScore(97)).toBe('epic')
  })
  
  it('returns rare for 90-94', () => {
    expect(getRarityFromScore(90)).toBe('rare')
    expect(getRarityFromScore(94)).toBe('rare')
  })
  
  it('returns common for <90', () => {
    expect(getRarityFromScore(89)).toBe('common')
    expect(getRarityFromScore(0)).toBe('common')
  })
})
```

5. Component tests:
```typescript
// src/components/QuestCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuestCard } from './QuestCard'

describe('QuestCard', () => {
  const mockQuest = {
    id: '1',
    name: 'Test Quest',
    description: 'A test quest',
    type: 'standard' as const,
    xpValue: 100,
    status: 'available' as const,
    realmId: 'realm-1',
    createdAt: Date.now()
  }
  
  it('renders quest name', () => {
    render(<QuestCard quest={mockQuest} theme="fantasy" onClick={() => {}} />)
    expect(screen.getByText('Test Quest')).toBeInTheDocument()
  })
  
  it('displays XP value', () => {
    render(<QuestCard quest={mockQuest} theme="fantasy" onClick={() => {}} />)
    expect(screen.getByText(/100/)).toBeInTheDocument()
  })
})
```

6. Add test scripts to package.json:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Acceptance Criteria**:
- All utility functions have tests
- Critical components have tests
- Coverage >50% on core logic
- CI runs tests on every PR

---

### Week 4: Performance & Mobile Optimization

#### Task 4.1: Mobile Performance Audit (Priority: MEDIUM)
**Owner**: Frontend Lead  
**Effort**: 3 days  
**Dependencies**: None

**Implementation Steps**:
1. Install performance monitoring:
```bash
npm install web-vitals
```

2. Add Web Vitals tracking:
```typescript
// src/main.tsx
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  console.log(metric)
  // Send to analytics service
}

onCLS(sendToAnalytics)
onFID(sendToAnalytics)
onFCP(sendToAnalytics)
onLCP(sendToAnalytics)
onTTFB(sendToAnalytics)
```

3. Optimize particle rendering:
```typescript
// src/components/ParticleField.tsx
const isMobile = useIsMobile()
const particleCount = isMobile ? 20 : 50 // Reduce on mobile

// Add requestAnimationFrame throttling
const frameRef = useRef(0)
useEffect(() => {
  const animate = () => {
    frameRef.current++
    if (frameRef.current % 2 === 0) { // Skip every other frame on mobile
      updateParticles()
    }
    requestAnimationFrame(animate)
  }
  animate()
}, [])
```

4. Lazy load heavy components:
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react'

const ConstellationView = lazy(() => import('@/components/ConstellationView'))
const ThemeBackground3D = lazy(() => import('@/components/ThemeBackground3D'))

// Usage
<Suspense fallback={<LoadingSpinner />}>
  {currentView === 'constellation' && <ConstellationView />}
</Suspense>
```

5. Test on real devices:
- iPhone SE (low-end iOS)
- Samsung Galaxy A series (low-end Android)
- Google Pixel (mid-range Android)

**Acceptance Criteria**:
- LCP < 2.5s on 3G network
- FID < 100ms on low-end devices
- No frame drops during animations
- Particle count auto-adjusts based on performance

---

## Medium-Term Roadmap (90 Days)

### Month 2: Database Migration & Authentication

**Tasks**:
1. Set up Supabase or Railway for PostgreSQL hosting
2. Create API layer (tRPC or REST)
3. Migrate KV hooks to database queries
4. Implement authentication (email/password + OAuth)
5. Add row-level security policies

**Deliverables**:
- All data persisted in PostgreSQL
- User authentication required
- Data survives browser clearing
- Multi-device sync working

---

### Month 3: Accessibility & Polish

**Tasks**:
1. WCAG 2.1 AA compliance audit
2. Add reduced-motion mode
3. Keyboard navigation improvements
4. Screen reader testing & fixes
5. High-contrast theme option

**Deliverables**:
- WCAG 2.1 AA certification
- Accessibility statement published
- All major user flows keyboard-navigable
- Screen reader compatible

---

## Long-Term Vision (6-12 Months)

### Q1: Machine Learning & Personalization
- Student performance prediction models
- Adaptive difficulty adjustment
- Content recommendation engine
- Learning style detection

### Q2: Collaboration & Social Features
- Team quests (2-4 students)
- Peer review system
- Study groups with shared progress
- Guild/clan system

### Q3: Integration Ecosystem
- SSO with Google Workspace, Microsoft 365
- LTI 1.3 for Canvas/Moodle/Blackboard
- Grade sync to student information systems
- API for third-party developers

### Q4: Mobile Native Apps
- React Native iOS app
- React Native Android app
- Offline mode with sync
- Push notifications for due dates

---

## Monitoring & Success Metrics

### Technical Health Dashboard
```typescript
interface SystemHealth {
  uptime: number // Target: 99.9%
  avgResponseTime: number // Target: <500ms
  errorRate: number // Target: <0.1%
  aiSuccessRate: number // Target: >95%
  databaseConnections: number
  activeUsers: number
}
```

### Performance Budgets
- **Page Load**: First Contentful Paint < 1.5s
- **Interactivity**: Time to Interactive < 3s
- **Bundle Size**: Main bundle < 300KB gzipped
- **API Latency**: P95 < 1s

### Quality Gates (CI/CD)
1. **Linting**: ESLint passes (0 errors)
2. **Type Check**: TypeScript compiles (0 errors)
3. **Tests**: >50% coverage, all tests pass
4. **Build**: Production build succeeds
5. **Security**: No high/critical vulnerabilities (npm audit)
6. **Performance**: Lighthouse score >90

---

## Risk Mitigation Strategies

### Technical Risks

**Risk**: Database migration causes data loss  
**Mitigation**: 
- Run migration on copy of production data first
- Implement rollback plan
- Keep localStorage as fallback for 30 days

**Risk**: Performance degrades with scale  
**Mitigation**:
- Load testing with 10k concurrent users
- Database query optimization
- CDN for static assets
- Horizontal scaling plan

**Risk**: AI costs spiral out of control  
**Mitigation**:
- Implement per-user quotas
- Batch processing for non-urgent evaluations
- Cache common prompts
- Consider fine-tuned smaller models

---

## Conclusion

This roadmap provides a concrete path from current state (impressive prototype) to production-ready platform. The critical 30-day sprint addresses existential risks (security, data loss, AI brittleness), while the 90-day plan builds foundation for scale.

Success requires disciplined execution and resisting feature creep during the hardening phase. The platform's innovative vision is validated; now comes the unsexy-but-essential work of making it reliable, secure, and performant.

**Recommended First Actions**:
1. Form tiger team for 30-day sprint
2. Set up daily standups with strict scope control
3. Define "done" criteria for each task
4. Schedule mid-sprint checkpoint (Day 15)
5. Plan go/no-go decision meeting (Day 30)

**Next Review**: 30 days from start date for production readiness assessment.

---

**Document End**
