# Repository Organization Guide

This document explains how the Classroom RPG: Aetheria repository is organized and where different types of content should be placed.

## 📁 Directory Structure

```
classroom-rpg-aetheria/
├── 📂 .github/              # GitHub configuration and workflows
│   ├── ISSUE_TEMPLATE/      # Issue templates
│   ├── PULL_REQUEST_TEMPLATE/  # PR templates
│   └── workflows/           # CI/CD automation
│
├── 📂 src/                  # 💻 Production source code
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── styles/              # Global styles
│   └── assets/              # Static assets
│
├── 📂 docs/                 # 📚 Technical documentation
│   ├── architecture/        # Architecture documentation
│   └── guides/              # Development guides
│       ├── DEVELOPMENT_WORKFLOW.md  # Ingestion → Digestion → Implementation
│       └── RESEARCH_GUIDELINES.md   # How to contribute research
│
├── 📂 research/             # 🔬 Research, analysis, evaluations
│   ├── README.md            # Research contribution guidelines
│   ├── COMPREHENSIVE_ANALYSIS.md
│   ├── ANALYSIS_INDEX.md
│   └── ...                  # Other research documents
│
├── 📂 drafts/               # 📝 Work in progress, iterations
│   ├── README.md            # Draft management guidelines
│   ├── PRD.md               # Product requirements (draft)
│   └── ...                  # Other drafts and iterations
│
├── 📂 satellites/           # 🛰️ Auxiliary tools and utilities
│   ├── README.md            # Satellites overview
│   ├── video-production/    # Video generation system
│   │   ├── README.md
│   │   ├── video_production_agent.py
│   │   └── ...
│   └── portfolio/           # Portfolio video generator
│       ├── README.md
│       ├── PORTFOLIO_VIDEO_SCRIPT.md
│       └── ...
│
├── 📄 README.md             # Project overview (you are here)
├── 📄 CONTRIBUTING.md       # Contribution guidelines
├── 📄 CODE_OF_CONDUCT.md    # Community standards
├── 📄 SECURITY.md           # Security policies
├── 📄 CHANGELOG.md          # Version history
└── 📄 ...                   # Other root-level docs

```

## 🎯 Where Should My Content Go?

### I have... → Put it in...

| Content Type | Location | Description |
|-------------|----------|-------------|
| **Research findings** | `/research/` | Analysis, studies, benchmarks, audits |
| **Draft documents** | `/drafts/` | PRDs, specs, prototypes, iterations |
| **Production code** | `/src/` | React components, hooks, utilities |
| **Documentation** | `/docs/` | Technical docs, guides, API references |
| **Auxiliary tools** | `/satellites/` | Independent tools and utilities |
| **Community docs** | Root `/` | README, CONTRIBUTING, CODE_OF_CONDUCT |

## 🔄 Content Lifecycle

### From Idea to Production

```
1. 💡 Idea/Research
   ↓
   📥 Ingestion: Upload to /research/ or create draft in /drafts/
   
2. 🧠 Review & Planning
   ↓
   🗣️ Digestion: Team discusses in GitHub Discussions
   📋 Create issues and plan implementation
   
3. 🛠️ Implementation
   ↓
   💻 Implementation: Develop in /src/, test, review
   ✅ Merge to main
   
4. 📦 Documentation
   ↓
   📚 Update /docs/ with new features
   🎉 Add to CHANGELOG.md
```

See [docs/guides/DEVELOPMENT_WORKFLOW.md](docs/guides/DEVELOPMENT_WORKFLOW.md) for complete details.

## 📂 Section Details

### 🔬 Research (`/research/`)

**Purpose**: Evidence-based decision making

**Contains**:
- Comprehensive project analysis
- User research and studies
- Performance benchmarks
- Design evaluations
- Competitive analysis
- Accessibility audits

**Guidelines**: See [research/README.md](research/README.md)

### 📝 Drafts (`/drafts/`)

**Purpose**: Iterative development and exploration

**Contains**:
- Draft specifications and PRDs
- Feature prototypes
- Alternative implementations
- Historical versions
- Brainstorming materials

**Guidelines**: See [drafts/README.md](drafts/README.md)

### 🛰️ Satellites (`/satellites/`)

**Purpose**: Supporting tools that enhance the ecosystem

**Contains**:
- [Video Production](satellites/video-production/) - Autonomous video generation
- [Portfolio](satellites/portfolio/) - Portfolio presentation generator
- Other auxiliary tools and utilities

**Guidelines**: See [satellites/README.md](satellites/README.md)

### 💻 Source (`/src/`)

**Purpose**: Production application code

**Contains**:
- React components
- Custom hooks
- Utility functions
- Styles and themes
- Assets and icons

**Guidelines**: See [CONTRIBUTING.md](CONTRIBUTING.md)

### 📚 Documentation (`/docs/`)

**Purpose**: Technical documentation and guides

**Contains**:
- Architecture documentation
- Development guides
- API references
- Best practices

**Guidelines**: See [docs/README.md](docs/README.md)

## 🚀 Quick Navigation

### For Contributors

- **New to the project?** Start with [README.md](README.md)
- **Want to contribute?** Read [CONTRIBUTING.md](CONTRIBUTING.md)
- **Have research to share?** See [docs/guides/RESEARCH_GUIDELINES.md](docs/guides/RESEARCH_GUIDELINES.md)
- **Working on a feature?** Follow [docs/guides/DEVELOPMENT_WORKFLOW.md](docs/guides/DEVELOPMENT_WORKFLOW.md)

### For Developers

- **Source code**: `/src/`
- **Build and run**: See [README.md](README.md#getting-started)
- **Testing**: See [CONTRIBUTING.md](CONTRIBUTING.md#testing)
- **CI/CD**: `.github/workflows/`

### For Researchers

- **Upload research**: `/research/`
- **Contribution guide**: [docs/guides/RESEARCH_GUIDELINES.md](docs/guides/RESEARCH_GUIDELINES.md)
- **Existing analysis**: [research/](research/)

### For Product/Design

- **Drafts and specs**: `/drafts/`
- **Product roadmap**: [TECHNICAL_ROADMAP.md](TECHNICAL_ROADMAP.md)
- **Design research**: `/research/`

## 🔍 Finding Files

### Search by Type

```bash
# Find all research documents
find research/ -name "*.md"

# Find all draft specifications
find drafts/ -name "*.md"

# Find satellite tools
ls satellites/*/README.md

# Find all documentation
find docs/ -name "*.md"
```

### Common Files

| File | Location | Purpose |
|------|----------|---------|
| Main README | `/README.md` | Project overview |
| Contributing guide | `/CONTRIBUTING.md` | How to contribute |
| Development workflow | `/docs/guides/DEVELOPMENT_WORKFLOW.md` | Dev process |
| Research guidelines | `/docs/guides/RESEARCH_GUIDELINES.md` | Research contributions |
| Comprehensive analysis | `/research/COMPREHENSIVE_ANALYSIS.md` | Full project analysis |
| Product requirements | `/drafts/PRD.md` | PRD (draft) |
| Video production | `/satellites/video-production/` | Video generation tool |

## 📝 Best Practices

### File Naming

- Use descriptive, lowercase, hyphenated names: `user-research-findings.md`
- Include dates for time-sensitive content: `performance-benchmark-2025-12.md`
- Use category prefixes: `ANALYSIS_`, `STUDY_`, `REPORT_`

### Documentation

- Keep README files updated in each directory
- Link to related documents
- Include creation/update dates
- Reference issues and PRs

### Organization

- ✅ Keep related files together
- ✅ Use subdirectories for large features
- ✅ Archive obsolete content
- ✅ Update indexes when adding files
- ✅ Follow the contribution guidelines

## 🤝 Questions?

- Check [SUPPORT.md](SUPPORT.md) for help resources
- Open a [GitHub Discussion](https://github.com/ivviiviivvi/classroom-rpg-aetheria/discussions)
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines

---

**Last Updated**: 2025-12-23  
**Maintained by**: Classroom RPG: Aetheria Team
