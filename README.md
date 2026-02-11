[![ORGAN-III: Ergon](https://img.shields.io/badge/ORGAN--III-Ergon-1b5e20?style=flat-square)](https://github.com/organvm-iii-ergon)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](https://opensource.org/licenses/MIT)

# Classroom RPG: Aetheria

[![CI](https://github.com/organvm-iii-ergon/classroom-rpg-aetheria/actions/workflows/ci.yml/badge.svg)](https://github.com/organvm-iii-ergon/classroom-rpg-aetheria/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-pending-lightgrey)](https://github.com/organvm-iii-ergon/classroom-rpg-aetheria)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/organvm-iii-ergon/classroom-rpg-aetheria/blob/main/LICENSE)
[![Organ III](https://img.shields.io/badge/Organ-III%20Ergon-F59E0B)](https://github.com/organvm-iii-ergon)
[![Status](https://img.shields.io/badge/status-active-brightgreen)](https://github.com/organvm-iii-ergon/classroom-rpg-aetheria)
[![TypeScript](https://img.shields.io/badge/lang-TypeScript-informational)](https://github.com/organvm-iii-ergon/classroom-rpg-aetheria)


**A gamified education platform that transforms classroom learning into immersive role-playing experiences, mapping curriculum objectives to quest mechanics, XP progression, and AI-powered evaluation.**

Aetheria addresses the 40% dropout rate observed across online learning platforms by applying game-design psychology to structured education. Students do not simply complete assignments — they embark on quests within themed realms, earn artifacts graded by rarity, accumulate experience points that unlock progression tiers, and receive AI-generated feedback calibrated to curriculum standards. Teachers operate as Game Masters with full analytics dashboards, rubric management, and standards-alignment tracking across CCSS ELA and AP Literature frameworks.

The platform ships a four-year English Literature curriculum out of the box, supports four complete thematic skins (High Fantasy, Cyberpunk, Royal Court, Glass Classroom), and includes a three-way voting system where teachers, students, and parents collaboratively shape personalized learning paths. A sandbox mode with pre-populated demo data allows risk-free exploration without touching real classroom state.

---

## Table of Contents

- [Product Overview](#product-overview)
- [Why Gamification in Education](#why-gamification-in-education)
- [Technical Architecture](#technical-architecture)
- [Installation and Quick Start](#installation-and-quick-start)
- [Game Mechanics and Features](#game-mechanics-and-features)
- [Educator Dashboard](#educator-dashboard)
- [Standards Alignment](#standards-alignment)
- [Personalization System](#personalization-system)
- [Sandbox Environment](#sandbox-environment)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Related Work and Market Context](#related-work-and-market-context)
- [Cross-Organ Context](#cross-organ-context)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Product Overview

Aetheria is a React-based single-page application built with TypeScript, Vite, and Tailwind CSS. It targets the $8B+ EdTech gamification market by combining three capabilities that existing platforms offer only in isolation:

1. **Deep RPG mechanics** — not surface-level badges, but a complete game loop with realms, quests, prerequisites, artifacts, knowledge crystals, constellation maps, and level-gated progression.
2. **AI-powered evaluation** — instant feedback on student submissions using LLM integration, with automatic remediation content generation, structured rubric scoring, and DOMPurify-sanitized output.
3. **Curriculum-first design** — every quest maps to specific CCSS ELA or AP Literature standards, every rubric aligns to institutional expectations, and every analytics view rolls up to mastery-level reporting by standard.

The platform serves three distinct user roles — students, teachers, and parents — each with tailored interfaces, permissions, and interaction patterns. Teachers create realms (courses), populate them with quests (assignments), and monitor student progress through analytics dashboards. Students navigate a spatial quest map, submit work, receive AI feedback, and collect artifacts as tangible representations of their learning. Parents participate through a three-way voting system that shapes personalized content variants.

### Key Metrics from Internal Analysis

- **13/13 core features** implemented in the current prototype
- **35% production readiness** (active hardening underway — see Roadmap)
- **9/10 innovation score** per internal nine-dimensional analysis
- **4 complete thematic skins** with consistent vocabulary, geometry, and visual identity
- **4 years of English Literature curriculum** pre-built with quests, rubrics, and standards mappings

---

## Why Gamification in Education

Traditional classroom software treats assignments as isolated transactions: submit, grade, return. This model fails to build intrinsic motivation, ignores the psychology of progression and mastery, and provides no narrative continuity between learning activities.

Aetheria's design rests on three evidence-based principles:

**Progression loops create sustained engagement.** Students accumulate XP across an eight-tier level system (Novice through Legend), with each tier requiring progressively more effort. The XP-to-level mapping uses a threshold curve defined in `src/lib/constants.ts`, and the level calculation in `src/lib/game-utils.ts` ensures that every submission contributes meaningfully to visible progress.

**Artifact scarcity drives quality.** When a student scores above the `legendary` threshold (defined in `RARITY_THRESHOLDS`), they receive a legendary-rarity artifact with a procedurally generated name drawn from the active theme's vocabulary (e.g., "Enchanted Tome of Rhetoric" in fantasy mode, "Quantum Core of Rhetoric" in cyberpunk mode). The `generateArtifactName()` function in `game-utils.ts` combines theme-specific prefixes and suffixes with concept words extracted from the quest name, ensuring artifacts feel narratively connected to the learning material.

**Theming transforms identity.** A student submitting a "Quest" in "The Realm of American Gothic" is psychologically situated differently than one completing "Assignment 4" in "English Lit 101." Aetheria's `ThemeConfig` system remaps every UI label — teacher becomes Game Master or Admin or Lord; student becomes Adventurer or Operative or Vassal; XP becomes Glory or Data or Honor — creating a complete alternative reality for the classroom experience. Each theme also specifies a Three.js geometry (`octahedron`, `icosahedron`, `dodecahedron`, or `sphere`) used in the 3D constellation visualization.

---

## Technical Architecture

### Stack Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 19 | Component-based rendering with concurrent features |
| **Language** | TypeScript 5.9 (strict) | End-to-end type safety across all domain models |
| **Build** | Vite 7.3 | Sub-second HMR, optimized production bundles |
| **Styling** | Tailwind CSS 4.1 + Radix UI | Utility-first CSS with accessible component primitives |
| **3D Rendering** | Three.js + React Three Fiber | Constellation maps, themed 3D geometries |
| **Animation** | Framer Motion | Page transitions, quest state animations |
| **Charts** | Recharts + D3 | Analytics dashboards, progress visualizations |
| **Forms** | React Hook Form + Zod 4 | Schema-validated form handling |
| **State** | React Context + GitHub Spark KV | Client-side state with persistent key-value storage |
| **Backend** | Firebase (Auth, Firestore, Storage) | Authentication, data persistence, file uploads |
| **AI** | GitHub Spark LLM integration | Quest evaluation, feedback generation, remediation |
| **Testing** | Vitest + Testing Library | Unit and component tests |
| **CI/CD** | GitHub Actions (6 workflows) | CI, CodeQL, dependency review, deploy, video gen, stale |

### Application Architecture

The application follows a context-provider pattern with three primary React contexts:

- **`GameStateContext`** — Central state manager for realms, quests, submissions, crystals, profiles, and artifacts. Uses `useSandboxKV` for isolated demo state or `useKV` (GitHub Spark) for persistent storage. All mutations flow through typed action functions (`addRealm`, `updateQuestStatus`, `addSubmission`, etc.) that enforce domain invariants before updating state.

- **`FirebaseContext`** — Wraps Firebase Auth, Firestore, and Storage SDKs. Provides authentication state, document read/write operations for educator features (syllabi, student samples, rubric data), and file upload/download for submission attachments.

- **`ThemeContext`** — Manages the active thematic skin. Consumes `THEME_CONFIGS` to remap all UI labels, colors, and 3D geometry selections based on the current theme choice.

### Domain Model

The type system in `src/lib/types.ts` defines over 30 interfaces organized into five layers:

1. **Core game types** — `Realm`, `Quest`, `Submission`, `KnowledgeCrystal`, `Artifact`, `UserProfile`, `ConstellationNode`
2. **Educator extensions** — `FeedbackSnippet`, `Syllabus`, `StudentSample`, `RubricData`, `ReportConfig`
3. **Personalization types** — `ThematicVariant`, `StudentPreferences`, `ThreeWayVote`, `ParentAccount`
4. **Standards alignment** — `LearningStandardRef`, `QuestStandardAlignment`, `StandardMastery`, `StandardsReport`
5. **System types** — `Notification`, `AIConsentState`, `VoteOption`, `ParentStudentLink`

Quest types include `standard`, `boss`, `redemption`, `learning`, `challenge`, and `essay`, each with distinct XP values, difficulty tiers (`beginner` / `intermediate` / `advanced`), prerequisite chains, and evaluation criteria. The quest status machine follows: `locked` -> `available` -> `in_progress` -> `completed` | `failed`.

### Resilience Patterns

The codebase implements several production-hardening patterns:

- **Circuit breaker** (`src/lib/circuit-breaker.ts`) — Prevents cascading failures from repeated LLM API calls when the AI service is degraded.
- **API retry with exponential backoff** (`src/lib/api-retry.ts`) — Retries transient failures with configurable max attempts and delay curves.
- **Rate limiter** (`src/lib/rate-limiter.ts`) — Throttles AI evaluation requests to manage API cost and prevent abuse.
- **Input sanitization** (`src/lib/sanitize.ts`) — DOMPurify-based XSS prevention for all AI-generated content rendered in the UI.
- **Error boundary** (`src/ErrorFallback.tsx`) — React error boundary with graceful recovery UI.
- **Error tracking** (`src/lib/error-tracker.ts`) — Centralized error logging with Sentry integration.

---

## Installation and Quick Start

### Prerequisites

- Node.js v18 or higher
- npm (included with Node.js)
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/organvm-iii-ergon/classroom-rpg-aetheria.git
cd classroom-rpg-aetheria

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Sandbox Mode

To explore the platform with pre-populated demo data (3 realms, sample quests, example student progress), append `?sandbox=true` to any URL:

```
http://localhost:5173/?sandbox=true
```

Sandbox mode provides complete isolation — all state changes are stored separately and can be reset with a single click. This is the recommended entry point for first-time exploration.

### Available Commands

```bash
npm run dev              # Start dev server with hot module replacement
npm run build            # TypeScript check + Vite production build
npm run preview          # Preview the production build locally
npm run lint             # Run ESLint across all source files
npm run test             # Run Vitest test suite
npm run test:ui          # Run tests with Vitest UI
npm run test:coverage    # Run tests with coverage reporting
npm run optimize         # Optimize Vite dependency pre-bundling
```

---

## Game Mechanics and Features

### Realm System

Realms are the top-level organizational unit, analogous to courses or subject areas. Each realm has a name, description, color, optional 3D position (for constellation visualization), and an icon. Teachers create realms to represent their courses; the pre-built curriculum provides four English Literature realms spanning Years 1 through 4.

### Quest System

Quests are the atomic unit of student work. Each quest belongs to a realm and carries:

- **Type** — `standard` (regular assignments), `boss` (high-stakes assessments), `redemption` (recovery opportunities for failed quests), `learning` (low-stakes practice), `challenge` (optional enrichment), `essay` (extended writing)
- **Difficulty** — `beginner`, `intermediate`, `advanced`
- **XP value** — Points awarded upon completion, scaled by difficulty and type
- **Prerequisites** — Quest IDs that must be completed before this quest unlocks
- **Standard alignments** — CCSS or AP Literature standards that this quest assesses
- **Objectives** — Specific learning objectives listed on the quest card

The quest status machine (`locked` -> `available` -> `in_progress` -> `completed` | `failed`) gates access based on prerequisite chains, ensuring students cannot skip foundational material.

### XP and Level Progression

Experience points accumulate from quest completions and feed into an eight-tier level system. The `calculateLevel()` function maps cumulative XP to level thresholds, and `getLevelTitle()` returns a role-appropriate title: students progress from Novice through Legend, while teachers progress from Initiate through Transcendent. Level-ups trigger sound effects and toast notifications via the Sonner library.

### Artifact and Crystal System

High-scoring submissions generate artifacts with procedurally generated names and rarity tiers (`common`, `rare`, `epic`, `legendary`). The rarity-from-score mapping uses thresholds defined in `RARITY_THRESHOLDS`, making legendary artifacts genuinely scarce. Knowledge Crystals are separate collectibles tied to quest completions that students can "attune" to demonstrate mastery retention.

### Constellation Visualization

The constellation map renders realms and quests as 3D nodes using React Three Fiber, with connections representing prerequisite relationships. Each node's geometry reflects the active theme (`octahedron` for fantasy, `icosahedron` for cyberpunk, etc.), and node states (`unlit` / `lit`) indicate quest completion. Touch controls (`use-3d-touch-controls.ts`) enable mobile interaction with the 3D scene.

### Theming Engine

Four complete themes remap all user-facing vocabulary, visual identity, and 3D geometry:

| Theme | Teacher Title | Student Title | Quest Label | XP Label | Geometry |
|-------|--------------|---------------|-------------|----------|----------|
| High Fantasy | Game Master | Adventurer | Quest | Glory | Octahedron |
| Cyberpunk | Admin | Operative | Mission | Data | Icosahedron |
| Royal Court | Lord | Vassal | Decree | Honor | Dodecahedron |
| Glass Classroom | Teacher | Student | Assignment | Points | Sphere |

Theme selection persists per user and propagates through `ThemeContext` to every component.

---

## Educator Dashboard

The educator dashboard provides teachers with comprehensive tools for course management and student assessment:

- **Feedback Snippets** — Reusable feedback comments organized by category (grammar, thesis, evidence, organization, clarity, citations, analysis, mechanics, positive). Snippets track usage count and can be rapidly inserted during grading. The category system is defined in `FEEDBACK_CATEGORIES` with 10 distinct categories.

- **Rubric Management** — Structured rubrics with weighted criteria, scoring levels, and total-point calculations. Rubrics can be attached to quests and used for consistent, standards-aligned evaluation.

- **Syllabus Upload** — File upload support for course syllabi via Firebase Storage, with metadata tracking (file name, size, upload date).

- **Student Sample Library** — Collection of anonymized student work with attached feedback and grades, useful for calibration and exemplar sets.

- **Report Generation** — Configurable reports (transcript, mastery, progress) exportable as PDF, CSV, or JSON. Reports can be scoped by realm, student, and date range.

---

## Standards Alignment

Aetheria ships with three complete standards frameworks:

- **CCSS ELA Grades 9-10** — Reading Literature, Reading Informational Text, Writing, Speaking & Listening, Language
- **CCSS ELA Grades 11-12** — Reading Literature, Writing, Speaking & Listening, Language
- **AP Literature** — Character, Setting, Structure, Narration, Figurative Language, Argumentation, Interpretation (organized by College Board Big Ideas)

Every quest can be tagged with specific standards via `QuestStandardAlignment`, specifying coverage level (`full`, `partial`, `introduced`). Student mastery is tracked per standard across five levels (`not-started`, `beginning`, `developing`, `proficient`, `mastered`), with evidence references linking mastery assessments to specific submissions. The `StandardsReport` type aggregates mastery data for institutional reporting.

Standards utility functions (`getStandardById`, `getStandardsByCategory`, `getStandardsByGrade`, `searchStandards`) enable dynamic standards browsing and quest-to-standard mapping throughout the interface.

---

## Personalization System

The personalization layer enables content adaptation based on student interests and collaborative decision-making:

### Thematic Interests

Students select primary and secondary interest areas from eight options: Sports, Science, Arts, Technology, Nature, Social Justice, Business, and General. Quests can include `ThematicVariant` entries that reframe the same learning objective through different lenses — a writing assignment on persuasive rhetoric might use sports journalism framing for one student and social justice advocacy framing for another.

### Three-Way Voting

The `ThreeWayVote` system allows teachers, students, and parents to vote on personalization decisions for individual quests. Each vote presents labeled options with optional thematic-interest tags. The vote status machine (`pending` -> `decided` | `override`) tracks resolution, with teachers retaining override authority. This mechanism ensures personalization is collaborative rather than algorithmically imposed.

### Parent Accounts

Parents link to student accounts through a request-approval flow (`ParentStudentLink` with `pending` / `approved` / `rejected` states). Linked parents can participate in votes and configure notification preferences (email, in-app, vote reminders).

---

## Sandbox Environment

Sandbox mode provides a complete demo environment activated by URL parameter (`?sandbox=true` or `?demo=true`). Key properties:

- **Isolated storage** — All sandbox state is stored separately from production data via `useSandboxKV`, preventing demo activity from contaminating real classrooms.
- **Pre-populated content** — Three demo realms, four sample quests, and example student progress data are seeded on activation.
- **Visual indicator** — A persistent banner indicates sandbox mode is active, preventing confusion about data context.
- **One-click reset** — Restore all sandbox state to defaults without affecting production data.

The sandbox is designed for product demonstrations, teacher training, user research, and video production (the repository includes a complete autonomous video production pipeline in `satellites/video-production/`).

---

## Project Structure

```
classroom-rpg-aetheria/
├── src/
│   ├── components/          # React components
│   │   ├── dashboard/       # Educator analytics panels
│   │   ├── educator/        # Teacher management tools
│   │   ├── game/            # Quest, realm, and RPG UI
│   │   ├── navigation/      # App navigation and routing
│   │   ├── sandbox/         # Sandbox mode components
│   │   ├── settings/        # User preference panels
│   │   ├── standards/       # Standards alignment UI
│   │   ├── ui/              # Radix-based design system (~30 primitives)
│   │   └── voting/          # Three-way vote interface
│   ├── contexts/            # React context providers
│   ├── hooks/               # Custom hooks (20+ hooks)
│   ├── lib/                 # Core logic
│   │   ├── curriculum/      # 4-year English Lit curriculum data
│   │   ├── firebase/        # Firebase SDK wrappers
│   │   ├── standards/       # CCSS + AP Literature standards
│   │   └── storage/         # Storage adapter pattern
│   ├── styles/              # Theme CSS and global styles
│   └── test/                # Test setup and utilities
├── research/                # 9-dimensional analysis documents
├── drafts/                  # PRD and implementation iterations
├── satellites/              # Auxiliary tooling
│   ├── portfolio/           # Portfolio video scripts and config
│   └── video-production/    # Autonomous video generation agent
├── docs/                    # Architecture and development guides
├── intake/                  # Source material (PDFs, prototypes)
└── .github/                 # CI workflows, issue/PR templates
```

---

## Development Workflow

### Branching and Commits

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and run `npm run lint` to verify code quality
3. Run `npm run build` to ensure the TypeScript compiler and Vite bundler pass
4. Run `npm run test` to verify existing tests pass
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/) format
6. Push and open a pull request using the appropriate PR template (feature, bug fix, or documentation)

### Code Quality Tooling

- **ESLint** — TypeScript-aware linting with React Hooks and React Refresh plugins
- **TypeScript strict mode** — Full type checking across all source files
- **Pre-commit hooks** — Automated quality checks before every commit
- **EditorConfig** — Consistent indentation and formatting across editors
- **Dependabot** — Automated dependency update PRs
- **CodeQL** — Static analysis for security vulnerabilities
- **Dependency Review** — PR-level dependency audit for new packages

### Testing

Tests use Vitest with React Testing Library and jsdom. Test files follow the co-location pattern (`*.test.ts` adjacent to source files). Current test coverage includes hooks (`use-ai-consent`, `use-dialogs`, `use-feedback-snippets`, `use-navigation-items`, `use-parent-linking`, `use-player-stats`, `use-reduced-motion`), library utilities (`api-retry`, `circuit-breaker`, `game-utils`, `network`, `rate-limiter`, `sandbox-mode`, `sanitize`, `schemas`, `utils`), and core type validation.

---

## Related Work and Market Context

Aetheria occupies a specific niche within the EdTech gamification landscape. Understanding where it sits relative to existing products clarifies its value proposition:

**Classcraft** — The most direct competitor, offering RPG mechanics for classrooms. Classcraft focuses on behavior management (HP loss for disruptions, XP for good behavior) rather than curriculum-aligned assessment. Aetheria differs by tying game mechanics directly to learning outcomes: XP comes from demonstrated mastery, not behavioral compliance. Aetheria's standards alignment layer (CCSS, AP Lit) has no equivalent in Classcraft.

**Kahoot!** — A quiz-based engagement platform built around synchronous, time-pressured question formats. Kahoot excels at formative assessment moments but provides no persistent progression, no narrative continuity between sessions, and no support for extended work like essays or projects. Aetheria targets the opposite end: sustained, asynchronous engagement with deep assessment.

**Duolingo** — The gold standard for gamified learning in language education. Duolingo's streak mechanics, spaced repetition, and adaptive difficulty are well-studied. Aetheria borrows the principle of visible progression but applies it to teacher-directed curriculum rather than algorithmic content sequencing, preserving instructor autonomy.

**Google Classroom / Canvas** — LMS platforms that handle assignment distribution and grading but treat gamification as an afterthought (if at all). Aetheria is not an LMS replacement but a complementary engagement layer that could integrate with institutional LMS infrastructure.

**Gimkit / Blooket** — Game-show-style platforms popular with younger students. These tools optimize for short-burst entertainment rather than sustained academic rigor. Aetheria targets secondary and post-secondary education where assessment depth matters.

Aetheria's differentiation: the combination of deep RPG mechanics, AI-powered evaluation, multi-stakeholder personalization (teacher + student + parent voting), and rigorous standards alignment in a single platform. No existing product offers all four.

---

## Cross-Organ Context

This repository is part of **ORGAN-III (Ergon)**, the commerce and product organ of the [organvm system](https://github.com/organvm-iii-ergon). Within the eight-organ architecture:

- **ORGAN-I (Theoria)** provides the epistemological and recursive-systems theory that informs Aetheria's approach to knowledge representation. The constellation map's node-and-edge model of prerequisite relationships reflects ORGAN-I's work on recursive dependency structures. See [organvm-i-theoria](https://github.com/organvm-i-theoria) for the theoretical foundation.

- **ORGAN-IV (Taxis)** provides the orchestration and governance infrastructure that coordinates cross-organ workflows. Aetheria's CI/CD pipelines, dependency review workflows, and quality gates follow ORGAN-IV governance standards. See [organvm-iv-taxis](https://github.com/organvm-iv-taxis) for orchestration tooling.

- **ORGAN-V (Logos)** will feature Aetheria as a case study in the public-process essay series on building educational technology in public. See [organvm-v-logos](https://github.com/organvm-v-logos) for the essay corpus.

- **ORGAN-II (Poiesis)** contributes the generative-art and experiential-design principles that shape Aetheria's theming engine and constellation visualization. The procedural artifact naming system and themed 3D geometries draw from ORGAN-II's work on generative aesthetics.

---

## Roadmap

The internal nine-dimensional analysis identifies the following priority areas for production readiness:

### Near-Term (Active)

- **Testing infrastructure** — Expand coverage from current hook/utility tests to component-level and integration tests, targeting 50%+ coverage
- **Firebase migration** — Move from client-side Spark KV to Firebase Firestore for production data persistence, eliminating localStorage limitations
- **FERPA/COPPA compliance** — Implement required data handling, consent flows, and audit logging for institutional deployment
- **Accessibility (WCAG 2.1 AA)** — Reduced-motion support, screen reader optimization, keyboard navigation, color-contrast compliance

### Medium-Term

- **Offline mode** — Service worker with IndexedDB sync for unreliable school network environments
- **LTI integration** — Learning Tools Interoperability standard for Canvas/Blackboard/Moodle embedding
- **Multi-language support** — i18n framework for non-English classrooms
- **Advanced analytics** — Cohort comparison, learning-path visualization, predictive at-risk identification

### Long-Term

- **Curriculum marketplace** — Teacher-created curriculum packs shareable across institutions
- **API layer** — RESTful API for third-party integrations and data export
- **Mobile native** — React Native companion app for push notifications and offline access

See [TECHNICAL_ROADMAP.md](TECHNICAL_ROADMAP.md) for the detailed 30-day production hardening sprint plan.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the full guidelines, including:

- Development environment setup
- Coding standards and TypeScript conventions
- Commit message format (Conventional Commits)
- Pull request templates and review process
- Code of Conduct

Good starting points for new contributors:

- Issues labeled `good first issue` for newcomers
- Issues labeled `help wanted` for areas needing attention
- Issues labeled `documentation` for non-code contributions

---

## License

MIT License. See [LICENSE](LICENSE) for the full text.

---

## Author

**[@4444j99](https://github.com/4444j99)**

Aetheria is part of the ORGAN-III (Ergon) portfolio within the [organvm](https://github.com/meta-organvm) creative-institutional system — an eight-organ architecture coordinating theory, art, commerce, orchestration, public process, community, and marketing across 79 repositories and 8 GitHub organizations.
