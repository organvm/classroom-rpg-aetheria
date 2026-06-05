# 🏖️ Sandbox Environment Guide

## Overview

The **Sandbox Environment** provides a safe, isolated space for external users (outsiders) to explore Classroom RPG: Aetheria without affecting real classroom data. This environment is perfect for:

- 🎯 **Demonstrations**: Showcasing the platform to potential users
- 🧪 **Testing**: Trying out features before implementation
- 📚 **Training**: Onboarding new teachers and administrators
- 🔍 **Exploration**: Allowing visitors to experience the platform risk-free

## What is Sandbox Mode?

Sandbox mode is a special operational mode where:

- ✅ All data is isolated from production/classroom data
- ✅ Demo content is pre-populated automatically
- ✅ Changes can be reset to defaults at any time
- ✅ Clear visual indicators show you're in sandbox mode
- ✅ No risk of affecting real classroom progress

### Key Features

1. **Isolated Storage**: Sandbox data is stored separately using the `sandbox-` prefix
2. **Demo Content**: Pre-populated realms, quests, and sample submissions
3. **Visual Indicators**: Prominent banner showing sandbox status
4. **Easy Reset**: One-click restore to default demo state
5. **Safe Exploration**: Experiment freely without consequences

## Accessing Sandbox Mode

### Option 1: Online Sandbox (Recommended)

Access the live sandbox environment:

```
https://ivviiviivvi.github.io/classroom-rpg-aetheria/?sandbox=true
```

This is automatically deployed via GitHub Actions and always reflects the latest main branch.

### Option 2: URL Parameter

Add `?sandbox=true` or `?demo=true` to any instance URL:

```
http://localhost:5173?sandbox=true
https://your-domain.com?demo=true
```

### Option 3: Developer Toggle

When running locally, enable sandbox mode programmatically:

```javascript
// In browser console
localStorage.setItem('aetheria-sandbox-mode', 'true')
location.reload()
```

## Using the Sandbox

### First Visit

When you first access sandbox mode:

1. **Banner Appears**: Yellow/orange banner at the top indicates sandbox mode
2. **Demo Data Loads**: Application auto-populates with sample content:
   - 3 demo realms (Mathematics, Science, Literature)
   - 4 demo quests with varying difficulty levels
   - Sample user profile with 125 XP
   - Completed submission examples
   - Earned knowledge crystal

3. **Start Exploring**: Navigate freely, complete quests, earn XP

### Navigation

The sandbox includes all standard features:

- **World Map**: See all demo realms
- **Quest System**: Try completing sample quests
- **Character Sheet**: View demo profile and artifacts
- **Archives**: Explore earned knowledge crystals
- **Leaderboard**: See sample rankings

### Making Changes

All changes in sandbox mode:

- ✅ Are saved to browser localStorage with `sandbox-` prefix
- ✅ Persist across page reloads (same browser)
- ✅ Do NOT affect any production or classroom data
- ✅ Can be reset to defaults anytime

## Sandbox Controls

### Banner Controls

The sandbox banner (top of screen) provides quick actions:

| Button | Action | Description |
|--------|--------|-------------|
| **Reset Demo** | Restores defaults | Clears all sandbox data and reloads demo content |
| **Exit Sandbox** | Returns to normal mode | Disables sandbox mode and reloads |
| **Dismiss (X)** | Hides banner | Temporarily hides banner (sandbox still active) |

### Reset Demo Data

To restore the sandbox to its original state:

1. Click **Reset Demo** in the banner
2. Confirm the action
3. Page reloads with fresh demo data

**Note**: This only affects sandbox data, never production data.

### Exit Sandbox Mode

To return to normal mode:

1. Click **Exit Sandbox** in the banner
2. Confirm the action
3. Page reloads in normal mode

Alternatively, remove URL parameter or clear localStorage:

```javascript
localStorage.removeItem('aetheria-sandbox-mode')
```

## Demo Content

### Realms

The sandbox includes three demo realms:

#### 1. Mathematics Archipelago 🏝️
- **Difficulty**: Beginner
- **XP Reward**: 100
- **Quests**: 2 (Equation Enigma, Geometric Guardians)
- **Theme**: Numbers and equations come alive

#### 2. Science Citadel 🔬
- **Difficulty**: Intermediate
- **XP Reward**: 200
- **Quests**: 1 (Chemistry Conundrum)
- **Theme**: Physics, chemistry, and biology

#### 3. Literature Labyrinth 📚
- **Difficulty**: Advanced
- **XP Reward**: 300
- **Quests**: 1 (Tale of Two Poets)
- **Theme**: Classic and modern literature

### Sample Quests

#### The Equation Enigma (Beginner)
- Solve quadratic equations
- Calculate slopes and areas
- **Reward**: 50 XP

#### Geometric Guardians (Beginner)
- Interior angles of polygons
- Geometric transformations
- Volume calculations
- **Reward**: 75 XP

#### Chemistry Conundrum (Intermediate)
- Balance chemical equations
- Identify compounds
- Explain photosynthesis
- **Reward**: 100 XP

#### Tale of Two Poets (Advanced)
- Analyze poetic structure
- Compare themes and eras
- Literary analysis
- **Reward**: 150 XP

### Demo User Profile

The sandbox starts with a sample student profile:

- **Name**: Explorer
- **Role**: Student
- **Level**: 2
- **XP**: 125
- **Artifacts**: Beginner's Compass (Common)
- **Progress**: One quest completed

## Technical Details

### Storage Isolation

Sandbox mode uses localStorage with key prefixing:

```typescript
// Normal mode
'aetheria-realms' -> production data

// Sandbox mode
'sandbox-aetheria-realms' -> demo data
```

This ensures complete isolation between modes.

### Auto-initialization

On first sandbox access, the system:

1. Detects sandbox mode (URL param or localStorage)
2. Checks for existing sandbox data
3. If none found, initializes with demo content
4. Renders UI with visual indicators

### Data Persistence

- **Within Session**: Changes persist in browser localStorage
- **Across Sessions**: Data remains until reset or browser cache cleared
- **Between Modes**: Normal and sandbox data never mix

## Development & Deployment

### Local Development

Run sandbox mode locally:

```bash
# Start dev server
npm run dev

# Open with sandbox mode
open http://localhost:5173?sandbox=true
```

### Building for Deployment

Build with sandbox mode enabled:

```bash
# Set environment variable
export VITE_SANDBOX_MODE=true

# Build application
npm run build

# Preview build
npm run preview
```

### Automated Deployment

The sandbox environment auto-deploys via GitHub Actions:

**Trigger**: Push to `main` branch or manual workflow dispatch

**Workflow**: `.github/workflows/deploy-sandbox.yml`

**Result**: Deploys to GitHub Pages at:
```
https://ivviiviivvi.github.io/classroom-rpg-aetheria/
```

Access sandbox mode by adding `?sandbox=true` parameter.

### Workflow Features

The deployment workflow:

- ✅ Builds the application
- ✅ Runs tests
- ✅ Creates sandbox indicator file
- ✅ Deploys to GitHub Pages
- ✅ Comments on PRs with preview URLs
- ✅ Generates deployment summaries

## Use Cases

### 1. Product Demonstrations

**Scenario**: Showing the platform to potential schools or investors

**Steps**:
1. Share sandbox URL with stakeholders
2. They explore pre-populated content
3. Demonstrate key features risk-free
4. Reset if needed for multiple demos

### 2. Teacher Training

**Scenario**: Onboarding new teachers to the platform

**Steps**:
1. Teachers access sandbox mode
2. Experience student perspective
3. Complete sample quests
4. Learn platform mechanics
5. Reset and try teacher view

### 3. Feature Testing

**Scenario**: Testing new features before classroom deployment

**Steps**:
1. Deploy PR to sandbox
2. Test changes with demo data
3. Verify functionality
4. Merge when confident

### 4. User Research

**Scenario**: Gathering feedback from potential users

**Steps**:
1. Share sandbox with test users
2. Observe how they interact
3. Collect feedback
4. No risk to real classrooms

### 5. Video Production

**Scenario**: Creating demo videos for portfolio or marketing

**Steps**:
1. Access sandbox mode
2. Record screen with consistent demo data
3. Showcase features systematically
4. Reset as needed for retakes

## Security & Privacy

### Data Safety

✅ **Sandbox data never affects production**
- Separate storage keys
- Isolated from real classroom data
- No database connections in sandbox mode

✅ **No personal information required**
- Demo profiles are fictional
- No authentication needed
- No data collection

✅ **Safe for public access**
- Read-only from external perspective
- Changes only in user's browser
- No server-side persistence

### Best Practices

1. **Share Freely**: Sandbox links are safe to share publicly
2. **Regular Resets**: Reset demo data between important demos
3. **No Sensitive Data**: Never use real student information in sandbox
4. **Clear Indicators**: Banner always shows sandbox status

## Troubleshooting

### Sandbox Mode Not Activating

**Problem**: Banner doesn't appear

**Solutions**:
1. Check URL has `?sandbox=true` or `?demo=true`
2. Verify localStorage: `localStorage.getItem('aetheria-sandbox-mode')`
3. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
4. Clear browser cache

### Demo Data Not Loading

**Problem**: No realms or quests appear

**Solutions**:
1. Click "Reset Demo" in banner
2. Check browser console for errors
3. Clear localStorage and reload
4. Try different browser

### Changes Not Persisting

**Problem**: Resets on every page load

**Solutions**:
1. Verify localStorage is enabled in browser
2. Check for incognito/private mode
3. Browser security settings may block localStorage
4. Try different browser

### Banner Won't Dismiss

**Problem**: Banner reappears after dismissing

**Solutions**:
1. This is intentional - banner returns on reload
2. To permanently hide, modify component
3. Or exit sandbox mode entirely

## API Reference

### Core Functions

```typescript
// Check if sandbox mode is active
isSandboxMode(): boolean

// Enable sandbox mode
enableSandboxMode(): void

// Disable sandbox mode
disableSandboxMode(): void

// Toggle sandbox mode
toggleSandboxMode(): boolean

// Get sandbox-aware storage key
getSandboxKey(key: string): string

// Reset sandbox data to defaults
resetSandboxData(): void

// Get demo content
getDemoRealms(): Realm[]
getDemoQuests(): Quest[]
getDemoProfile(): UserProfile
getDemoSubmissions(): Submission[]
getDemoCrystals(): KnowledgeCrystal[]

// Initialize all sandbox data
initializeSandboxData(): SandboxData

// Check if initialization needed
needsSandboxInitialization(): boolean
```

### Usage Examples

```typescript
import { 
  isSandboxMode, 
  enableSandboxMode,
  getSandboxKey,
  initializeSandboxData 
} from '@/lib/sandbox-mode'

// Check mode
if (isSandboxMode()) {
  console.log('Running in sandbox mode')
}

// Enable programmatically
enableSandboxMode()

// Use sandbox-aware keys
const key = getSandboxKey('aetheria-realms')
// Returns: 'sandbox-aetheria-realms' in sandbox mode
//          'aetheria-realms' in normal mode

// Initialize demo data
const demoData = initializeSandboxData()
console.log(`Loaded ${demoData.realms.length} demo realms`)
```

## FAQ

### Q: Will sandbox mode affect my classroom data?

**A**: No. Sandbox data is completely isolated using separate storage keys. Your classroom data remains untouched.

### Q: Can I customize the demo content?

**A**: Yes. Edit `src/lib/sandbox-mode.ts` and modify the `getDemo*` functions to customize realms, quests, and profiles.

### Q: How long does sandbox data persist?

**A**: Until you reset it, clear browser cache, or switch browsers. It persists across page reloads in the same browser.

### Q: Can I share my sandbox progress?

**A**: No. Sandbox data is stored in your browser's localStorage and cannot be shared. Each user has their own isolated sandbox.

### Q: Is sandbox mode suitable for production demos?

**A**: Yes! It's designed specifically for demonstrations, training, and exploration without risk.

### Q: Can I run multiple sandboxes?

**A**: Each browser/device has its own sandbox. Use different browsers or devices for independent sandboxes.

### Q: Does sandbox mode require authentication?

**A**: No. Sandbox mode is open and doesn't require login or authentication.

### Q: Can I deploy my own sandbox instance?

**A**: Yes. Build with `VITE_SANDBOX_MODE=true` and deploy to any static hosting service.

## Support

### Getting Help

- 📖 **Documentation**: See this guide and README.md
- 🐛 **Issues**: Report bugs on GitHub Issues
- 💬 **Discussions**: Ask questions in GitHub Discussions
- 📧 **Contact**: See SUPPORT.md for contact information

### Contributing

To improve the sandbox environment:

1. Fork the repository
2. Make changes to sandbox mode
3. Test thoroughly
4. Submit pull request
5. See CONTRIBUTING.md for guidelines

## Changelog

### Version 1.0.0 (2025-12-30)

- ✨ Initial sandbox mode implementation
- ✨ Demo data generation
- ✨ Sandbox banner component
- ✨ GitHub Pages deployment workflow
- ✨ Comprehensive documentation
- ✨ Test coverage for sandbox utilities

---

**Last Updated**: 2025-12-30  
**Version**: 1.0.0  
**Status**: ✅ Active

🏖️ **Ready to explore? Visit the sandbox now!**
```
https://ivviiviivvi.github.io/classroom-rpg-aetheria/?sandbox=true
```
