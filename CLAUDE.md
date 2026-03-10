# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # TypeScript compile + Vite production build
npm run lint         # ESLint for TypeScript/JavaScript
npm test             # Run Vitest tests
npm run test:ui      # Vitest with interactive UI
npm run test:coverage # Generate coverage reports
```

## Architecture Overview

This is a classroom gamification platform built with React 19, TypeScript, Vite, and Tailwind CSS v4. It uses GitHub Spark for LLM-powered features and Radix UI for accessible components.

### Core Data Model

- **Realm**: Course/subject container with quests
- **Quest**: Assignment with status (locked → available → in_progress → completed/failed)
- **UserProfile**: Student or teacher with XP, level, artifacts
- **Submission**: Quest answer with scores and AI-generated feedback
- **KnowledgeCrystal**: AI-generated study guide for failed quests
- **Artifact**: Collectible reward for high-scoring quests

### State Management

- React hooks + `useSandboxKV<T>(key, defaultValue)` for persistent storage
- `useSandboxKV` wraps GitHub Spark's `useKV` with sandbox isolation
- Local component state for UI (dialogs, view selection)

### Theme System

Four themes with different terminology via `THEME_CONFIGS`:
- Fantasy: Game Master/Adventurer, Quest, Glory
- Cyberpunk: Admin/Operative, Mission, Data
- Medieval: Lord/Vassal, Decree, Honor
- Modern: Teacher/Student, Assignment, Points

All UI labels switch based on theme prop passed through components.

### Sandbox Mode

Demo/testing mode activated via `?sandbox=true` or `?demo=true` URL parameter:
- Data stored with `sandbox-` prefix, isolated from production
- Pre-populated demo data via `initializeSandboxData()`
- See `src/lib/sandbox-mode.ts`

### Key Patterns

- **Path aliases**: `@/*` resolves to `src/*`
- **GitHub Spark LLM**: `window.spark.llm()` for AI content generation with `retryWithBackoff` utility
- **Sound effects**: `soundEffects` module with mute toggle via `useKV`
- **Mobile support**: `useIsMobile()`, `useTouchSwipe()` hooks
- **Input sanitization**: DOMPurify for HTML in Knowledge Crystals

### Testing

Tests in `src/lib/*.test.ts` using Vitest with jsdom environment. Run single test:
```bash
npm test -- src/lib/game-utils.test.ts
```

## Project Structure

```
src/
├── components/     # React components (UI primitives in ui/)
├── hooks/          # Custom hooks (sandbox-kv, theme, mobile, touch)
├── lib/            # Utilities, types, and tests
├── assets/         # Static files
└── styles/         # Global CSS

docs/architecture/  # System design documentation
```

## Git Workflow

Uses Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

Pre-commit hooks enforce formatting, linting, and secrets detection.

## Deployment

Live at **https://classroom-rpg-aetheria.netlify.app** (Netlify, `main` branch auto-deploys).

<!-- ORGANVM:AUTO:START -->
## System Context (auto-generated — do not edit)

**Organ:** ORGAN-III (Commerce) | **Tier:** standard | **Status:** PUBLIC_PROCESS
**Org:** `organvm-iii-ergon` | **Repo:** `classroom-rpg-aetheria`

### Edges
- **Produces** → `unspecified`: product
- **Produces** → `organvm-vi-koinonia/community-hub`: community_signal
- **Produces** → `organvm-vii-kerygma/social-automation`: distribution_signal

### Siblings in Commerce
`gamified-coach-interface`, `trade-perpetual-future`, `fetch-familiar-friends`, `sovereign-ecosystem--real-estate-luxury`, `public-record-data-scrapper`, `search-local--happy-hour`, `multi-camera--livestream--framework`, `universal-mail--automation`, `mirror-mirror`, `the-invisible-ledger`, `enterprise-plugin`, `virgil-training-overlay`, `tab-bookmark-manager`, `a-i-chat--exporter`, `.github` ... and 12 more

### Governance
- Strictly unidirectional flow: I→II→III. No dependencies on Theory (I).

*Last synced: 2026-03-08T20:11:34Z*

## Session Review Protocol

At the end of each session that produces or modifies files:
1. Run `organvm session review --latest` to get a session summary
2. Check for unimplemented plans: `organvm session plans --project .`
3. Export significant sessions: `organvm session export <id> --slug <slug>`
4. Run `organvm prompts distill --dry-run` to detect uncovered operational patterns

Transcripts are on-demand (never committed):
- `organvm session transcript <id>` — conversation summary
- `organvm session transcript <id> --unabridged` — full audit trail
- `organvm session prompts <id>` — human prompts only


## Active Directives

| Scope | Phase | Name | Description |
|-------|-------|------|-------------|
| system | any | prompting-standards | Prompting Standards |
| system | any | research-standards-bibliography | APPENDIX: Research Standards Bibliography |
| system | any | research-standards | METADOC: Architectural Typology & Research Standards |
| system | any | sop-ecosystem | METADOC: SOP Ecosystem — Taxonomy, Inventory & Coverage |
| system | any | autopoietic-systems-diagnostics | SOP: Autopoietic Systems Diagnostics (The Mirror of Eternity) |
| system | any | cicd-resilience-and-recovery | SOP: CI/CD Pipeline Resilience & Recovery |
| system | any | cross-agent-handoff | SOP: Cross-Agent Session Handoff |
| system | any | document-audit-feature-extraction | SOP: Document Audit & Feature Extraction |
| system | any | essay-publishing-and-distribution | SOP: Essay Publishing & Distribution |
| system | any | market-gap-analysis | SOP: Full-Breath Market-Gap Analysis & Defensive Parrying |
| system | any | pitch-deck-rollout | SOP: Pitch Deck Generation & Rollout |
| system | any | promotion-and-state-transitions | SOP: Promotion & State Transitions |
| system | any | repo-onboarding-and-habitat-creation | SOP: Repo Onboarding & Habitat Creation |
| system | any | research-to-implementation-pipeline | SOP: Research-to-Implementation Pipeline (The Gold Path) |
| system | any | security-and-accessibility-audit | SOP: Security & Accessibility Audit |
| system | any | session-self-critique | session-self-critique |
| system | any | source-evaluation-and-bibliography | SOP: Source Evaluation & Annotated Bibliography (The Refinery) |
| system | any | stranger-test-protocol | SOP: Stranger Test Protocol |
| system | any | strategic-foresight-and-futures | SOP: Strategic Foresight & Futures (The Telescope) |
| system | any | typological-hermeneutic-analysis | SOP: Typological & Hermeneutic Analysis (The Archaeology) |
| unknown | any | gpt-to-os | SOP_GPT_TO_OS.md |
| unknown | any | index | SOP_INDEX.md |
| unknown | any | obsidian-sync | SOP_OBSIDIAN_SYNC.md |

Linked skills: evaluation-to-growth


**Prompting (Anthropic)**: context 200K tokens, format: XML tags, thinking: extended thinking (budget_tokens)

<!-- ORGANVM:AUTO:END -->


## ⚡ Conductor OS Integration
This repository is a managed component of the ORGANVM meta-workspace.
- **Orchestration:** Use `conductor patch` for system status and work queue.
- **Lifecycle:** Follow the `FRAME -> SHAPE -> BUILD -> PROVE` workflow.
- **Governance:** Promotions are managed via `conductor wip promote`.
- **Intelligence:** Conductor MCP tools are available for routing and mission synthesis.
