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

**Organ:** ORGAN-III (Commerce) | **Tier:** standard | **Status:** GRADUATED
**Org:** `organvm-iii-ergon` | **Repo:** `classroom-rpg-aetheria`

### Edges
- **Produces** → `unspecified`: product
- **Produces** → `organvm-vi-koinonia/community-hub`: community_signal
- **Produces** → `organvm-vii-kerygma/social-automation`: distribution_signal

### Siblings in Commerce
`gamified-coach-interface`, `trade-perpetual-future`, `fetch-familiar-friends`, `sovereign-ecosystem--real-estate-luxury`, `public-record-data-scrapper`, `search-local--happy-hour`, `multi-camera--livestream--framework`, `universal-mail--automation`, `mirror-mirror`, `the-invisible-ledger`, `enterprise-plugin`, `virgil-training-overlay`, `tab-bookmark-manager`, `a-i-chat--exporter`, `.github` ... and 13 more

### Governance
- Strictly unidirectional flow: I→II→III. No dependencies on Theory (I).

*Last synced: 2026-03-20T10:58:27Z*

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
| system | any | phase-closing-and-forward-plan | METADOC: Phase-Closing Commemoration & Forward Attack Plan |
| system | any | research-standards | METADOC: Architectural Typology & Research Standards |
| system | any | sop-ecosystem | METADOC: SOP Ecosystem — Taxonomy, Inventory & Coverage |
| system | any | autonomous-content-syndication | SOP: Autonomous Content Syndication (The Broadcast Protocol) |
| system | any | autopoietic-systems-diagnostics | SOP: Autopoietic Systems Diagnostics (The Mirror of Eternity) |
| system | any | background-task-resilience | background-task-resilience |
| system | any | cicd-resilience-and-recovery | SOP: CI/CD Pipeline Resilience & Recovery |
| system | any | community-event-facilitation | SOP: Community Event Facilitation (The Dialectic Crucible) |
| system | any | context-window-conservation | context-window-conservation |
| system | any | conversation-to-content-pipeline | SOP — Conversation-to-Content Pipeline |
| system | any | cross-agent-handoff | SOP: Cross-Agent Session Handoff |
| system | any | cross-channel-publishing-metrics | SOP: Cross-Channel Publishing Metrics (The Echo Protocol) |
| system | any | data-migration-and-backup | SOP: Data Migration and Backup Protocol (The Memory Vault) |
| system | any | document-audit-feature-extraction | SOP: Document Audit & Feature Extraction |
| system | any | dynamic-lens-assembly | SOP: Dynamic Lens Assembly |
| system | any | essay-publishing-and-distribution | SOP: Essay Publishing & Distribution |
| system | any | formal-methods-applied-protocols | SOP: Formal Methods Applied Protocols |
| system | any | formal-methods-master-taxonomy | SOP: Formal Methods Master Taxonomy (The Blueprint of Proof) |
| system | any | formal-methods-tla-pluscal | SOP: Formal Methods — TLA+ and PlusCal Verification (The Blueprint Verifier) |
| system | any | generative-art-deployment | SOP: Generative Art Deployment (The Gallery Protocol) |
| system | any | market-gap-analysis | SOP: Full-Breath Market-Gap Analysis & Defensive Parrying |
| system | any | mcp-server-fleet-management | SOP: MCP Server Fleet Management (The Server Protocol) |
| system | any | multi-agent-swarm-orchestration | SOP: Multi-Agent Swarm Orchestration (The Polymorphic Swarm) |
| system | any | network-testament-protocol | SOP: Network Testament Protocol (The Mirror Protocol) |
| system | any | open-source-licensing-and-ip | SOP: Open Source Licensing and IP (The Commons Protocol) |
| system | any | performance-interface-design | SOP: Performance Interface Design (The Stage Protocol) |
| system | any | pitch-deck-rollout | SOP: Pitch Deck Generation & Rollout |
| system | any | polymorphic-agent-testing | SOP: Polymorphic Agent Testing (The Adversarial Protocol) |
| system | any | promotion-and-state-transitions | SOP: Promotion & State Transitions |
| system | any | recursive-study-feedback | SOP: Recursive Study & Feedback Loop (The Ouroboros) |
| system | any | repo-onboarding-and-habitat-creation | SOP: Repo Onboarding & Habitat Creation |
| system | any | research-to-implementation-pipeline | SOP: Research-to-Implementation Pipeline (The Gold Path) |
| system | any | security-and-accessibility-audit | SOP: Security & Accessibility Audit |
| system | any | session-self-critique | session-self-critique |
| system | any | smart-contract-audit-and-legal-wrap | SOP: Smart Contract Audit and Legal Wrap (The Ledger Protocol) |
| system | any | source-evaluation-and-bibliography | SOP: Source Evaluation & Annotated Bibliography (The Refinery) |
| system | any | stranger-test-protocol | SOP: Stranger Test Protocol |
| system | any | strategic-foresight-and-futures | SOP: Strategic Foresight & Futures (The Telescope) |
| system | any | styx-pipeline-traversal | SOP: Styx Pipeline Traversal (The 7-Organ Transmutation) |
| system | any | system-dashboard-telemetry | SOP: System Dashboard Telemetry (The Panopticon Protocol) |
| system | any | the-descent-protocol | the-descent-protocol |
| system | any | the-membrane-protocol | the-membrane-protocol |
| system | any | theoretical-concept-versioning | SOP: Theoretical Concept Versioning (The Epistemic Protocol) |
| system | any | theory-to-concrete-gate | theory-to-concrete-gate |
| system | any | typological-hermeneutic-analysis | SOP: Typological & Hermeneutic Analysis (The Archaeology) |

Linked skills: cicd-resilience-and-recovery, continuous-learning-agent, evaluation-to-growth, genesis-dna, multi-agent-workforce-planner, promotion-and-state-transitions, quality-gate-baseline-calibration, repo-onboarding-and-habitat-creation, structural-integrity-audit


**Prompting (Anthropic)**: context 200K tokens, format: XML tags, thinking: extended thinking (budget_tokens)


## Ecosystem Status

- **delivery**: 1/1 live, 0 planned
- **revenue**: 0/1 live, 1 planned
- **marketing**: 0/3 live, 0 planned
- **community**: 0/1 live, 0 planned
- **content**: 0/2 live, 0 planned
- **listings**: 0/1 live, 1 planned

Run: `organvm ecosystem show classroom-rpg-aetheria` | `organvm ecosystem validate --organ III`


## Entity Identity (Ontologia)

**UID:** `ent_repo_01KKKX3RVMXGH60ZZS978KASQM` | **Matched by:** primary_name

Resolve: `organvm ontologia resolve classroom-rpg-aetheria` | History: `organvm ontologia history ent_repo_01KKKX3RVMXGH60ZZS978KASQM`


## Live System Variables (Ontologia)

| Variable | Value | Scope | Updated |
|----------|-------|-------|---------|
| `active_repos` | 1 | global | 2026-03-20 |
| `archived_repos` | 0 | global | 2026-03-20 |
| `ci_workflows` | 1 | global | 2026-03-20 |
| `code_files` | 0 | global | 2026-03-20 |
| `dependency_edges` | 0 | global | 2026-03-20 |
| `operational_organs` | 1 | global | 2026-03-20 |
| `published_essays` | 0 | global | 2026-03-20 |
| `repos_with_tests` | 0 | global | 2026-03-20 |
| `sprints_completed` | 0 | global | 2026-03-20 |
| `test_files` | 0 | global | 2026-03-20 |
| `total_organs` | 1 | global | 2026-03-20 |
| `total_repos` | 1 | global | 2026-03-20 |
| `total_words_formatted` | 0 | global | 2026-03-20 |
| `total_words_numeric` | 0 | global | 2026-03-20 |
| `total_words_short` | 0K+ | global | 2026-03-20 |

Metrics: 9 registered | Observations: 7184 recorded
Resolve: `organvm ontologia status` | Refresh: `organvm refresh`


## System Density (auto-generated)

AMMOI: 54% | Edges: 28 | Tensions: 33 | Clusters: 5 | Adv: 3 | Events(24h): 12929
Structure: 8 organs / 117 repos / 1654 components (depth 17) | Inference: 98% | Organs: META-ORGANVM:66%, ORGAN-I:55%, ORGAN-II:47%, ORGAN-III:56% +4 more
Last pulse: 2026-03-20T10:58:23 | Δ24h: -3.7% | Δ7d: n/a

<!-- ORGANVM:AUTO:END -->


## ⚡ Conductor OS Integration
This repository is a managed component of the ORGANVM meta-workspace.
- **Orchestration:** Use `conductor patch` for system status and work queue.
- **Lifecycle:** Follow the `FRAME -> SHAPE -> BUILD -> PROVE` workflow.
- **Governance:** Promotions are managed via `conductor wip promote`.
- **Intelligence:** Conductor MCP tools are available for routing and mission synthesis.
