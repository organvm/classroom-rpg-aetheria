# 🎬 Classroom RPG Aetheria - Investor/Employer Presentation Video

## Overview

A professionally-generated portfolio video presentation of the **Classroom RPG: Aetheria** educational platform, designed for potential investors and employers. This video demonstrates the application's features, business value, and strategic thinking through a 25-minute comprehensive narration with visual accompaniment.

## Video Details

### Technical Specifications
- **Format**: MP4 (H.264 video, AAC audio)
- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 fps
- **Duration**: 25 minutes 42 seconds (1542 seconds)
- **File Size**: 29 MB
- **Audio**: Computer-generated narration using espeak TTS
- **Visuals**: 45 title cards with scene-by-scene presentation

### Content Structure

The video follows a strategic presentation framework designed for non-technical decision-makers:

1. **Executive Hook (0:00 - 0:30)**
   - Opens with compelling problem statement
   - Establishes market need and business opportunity

2. **Act 1: The Problem (0:30 - 1:15)**
   - Identifies pain points in traditional learning platforms
   - Quantifies the business impact and stakes

3. **Act 2: The Insight (1:15 - 2:00)**
   - Reveals key strategic insight behind the solution
   - Demonstrates systems thinking approach

4. **Act 3: The Solution (2:00 - 3:00)**
   - Explains platform architecture and features
   - Shows practical implementation and user experience

5. **Act 4: Impact & Tradeoffs (3:00 - 3:45)**
   - Presents measurable outcomes and benefits
   - Demonstrates mature decision-making through tradeoff analysis

6. **Act 5: Why Me (3:45 - 4:30)**
   - Highlights key competencies demonstrated
   - Positions the creator as strategic thinker

7. **Supporting Content (4:30 onwards)**
   - Visual planning and production details
   - B-roll metaphor concepts
   - Credibility signals and best practices

## Generated Files

The video production process creates the following artifacts:

```
video_output/
├── PORTFOLIO_VIDEO_SCRIPT_video.mp4          # Main video file (29 MB)
├── PORTFOLIO_VIDEO_SCRIPT_video.log.txt      # Production log with scene details
├── audio/
│   ├── PORTFOLIO_VIDEO_SCRIPT_video_audio.wav     # Generated audio (94 MB)
│   └── PORTFOLIO_VIDEO_SCRIPT_video_narration.txt # Script text
└── visuals/
    └── PORTFOLIO_VIDEO_SCRIPT_video_scene_*.png   # 45 scene title cards
```

## How to Access the Video

### Option 1: Quick Start (Recommended)

Use the automated generation script that handles all dependencies and configuration:

```bash
# Make the script executable (first time only)
chmod +x generate_video.sh

# Generate the video
./generate_video.sh
```

The script will:
- Check for required dependencies (FFmpeg, espeak, Python)
- Set up environment variables automatically
- Validate file locations
- Generate the video with clear progress reporting
- Handle errors with helpful messages

### Option 2: Manual Generation (Advanced)

For custom configurations or troubleshooting, you can run the steps manually:

```bash
# Install dependencies (Linux/Ubuntu)
sudo apt-get update
sudo apt-get install -y ffmpeg espeak espeak-data fonts-dejavu-core

# Navigate to repository
cd classroom-rpg-aetheria

# Set environment variables
export REPO_ROOT="$(pwd)"
export SCRIPT_DIR="$(pwd)/satellites/portfolio"
export SCRIPT_PATTERN="*SCRIPT*.md"
export VIDEO_OUT_DIR="$(pwd)/video_output"

# Run the video production agent
python3 satellites/video-production/video_production_agent.py
```

The video will be generated in the `video_output/` directory.

**Tip**: For videos with live app demos, set `DEMO_URL` to the sandbox environment:
```bash
export DEMO_URL="https://ivviiviivvi.github.io/classroom-rpg-aetheria/?sandbox=true"
```
This ensures consistent demo data for professional presentations.

### Option 3: GitHub Actions Workflow

The repository includes an automated workflow that generates videos on-demand:

1. Go to the **Actions** tab in the GitHub repository
2. Select the **"Generate Portfolio Videos"** workflow
3. Click **"Run workflow"**
4. Wait for the workflow to complete (~5-10 minutes)
5. Download the video from the workflow artifacts

### Option 4: Download from Release

If a release has been created, the video may be available as a release asset:

1. Navigate to the **Releases** section
2. Find the latest release with video assets
3. Download `PORTFOLIO_VIDEO_SCRIPT_video.mp4`

## Viewing the Video

### Desktop
- **VLC Media Player** (recommended): Free, cross-platform video player
- **Windows Media Player**: Built-in on Windows
- **QuickTime Player**: Built-in on macOS
- **mpv**: Lightweight, command-line player

### Online Platforms
The video can be uploaded to:
- **YouTube**: As an unlisted or public video
- **Vimeo**: For professional portfolio hosting
- **LinkedIn**: For direct sharing with potential employers
- **Google Drive/Dropbox**: For private sharing

## Customization

To create a customized version with your own information:

1. Edit the script at `satellites/portfolio/PORTFOLIO_VIDEO_SCRIPT.md`
2. Replace placeholder text:
   - `[Your Name]` → Your actual name
   - `CANDIDATE_ROLE_TARGET` → Your target position
   - `CTA_URL` → Your website/contact link
3. Regenerate the video using one of the methods above

For detailed customization options, see:
- `satellites/portfolio/PORTFOLIO_VIDEO_README.md`
- `satellites/portfolio/PORTFOLIO_VIDEO_CONFIG.env.example`
- `satellites/portfolio/PORTFOLIO_VIDEO_QUICKSTART.md`

## Usage Recommendations

### For Job Applications
- **Best Used For**:
  - Product Manager/Strategy roles
  - Technical leadership positions
  - Educational technology positions
  - Startup/entrepreneurial roles

- **When to Include**:
  - Portfolio website featured content
  - LinkedIn profile showcase
  - Cold outreach to hiring managers
  - Follow-up after initial contact

- **When to Skip**:
  - Applications requiring specific formats
  - Roles explicitly stating "no video submissions"
  - First contact with recruiters (save for follow-up)

### For Investor Pitches
- Use the first 4:30 (executive summary) for initial presentations
- Full video provides comprehensive technical background
- Demonstrates product thinking and strategic capability
- Shows attention to detail in project documentation

### Distribution Tips

**Email Template:**
```
Subject: Classroom RPG Aetheria - Portfolio Video

Hi [Name],

I've created a comprehensive video presentation of my educational 
platform project. Rather than just listing features, this 4-minute 
overview demonstrates the strategic thinking and problem-solving 
approach behind the solution.

Video: [Link to video]

The project combines gamification psychology with AI-powered learning 
systems to address the 40% dropout rate in online education. I'd love 
to discuss how this approach could be valuable for [Company/Role].

Best regards,
[Your Name]
```

**LinkedIn Post Template:**
```
After [X months] building an educational RPG platform, I created this 
deep-dive video showcasing the strategic thinking behind it.

🎯 The challenge: 40% of students drop out of online courses
💡 The insight: Apply game design psychology to learning systems
✨ The solution: AI-powered quest system with immediate feedback

No jargon. Just clear thinking about complex problems.

Currently exploring [Role Type] opportunities where systems thinking 
and user-centered design matter.

#OpenToWork #EdTech #ProductStrategy #PortfolioShowcase
```

## Technical Details

### Production Pipeline

The video was generated using an autonomous production pipeline:

1. **Script Parsing**: Extracts scenes and timecodes from Markdown script
2. **Audio Generation**: Converts text to speech using espeak TTS engine
3. **Visual Generation**: Creates title cards with FFmpeg
4. **Video Rendering**: Combines audio and visuals into final MP4
5. **Quality Assurance**: Generates detailed production log

### Audio Quality

The current version uses **espeak**, a free, open-source TTS engine. For improved audio quality:

- Replace with professional voiceover recording
- Use commercial TTS services (Amazon Polly, Google Text-to-Speech)
- Edit the generated audio file and re-render

### Visual Enhancement

The current version uses simple title cards. To enhance:

- Add actual application screenshots
- Include animated transitions
- Add B-roll footage (concepts are documented in the script)
- Create custom graphics for key concepts

See `satellites/portfolio/PORTFOLIO_VIDEO_STORYBOARD.md` for detailed visual specifications.

## Performance Metrics

Track these metrics when using the video:

### Immediate (48 hours)
- View completion rate (target: >60%)
- Engagement drop-off points
- Social shares and comments

### Short-term (2 weeks)
- Total views on primary platform
- Connection requests from target audience
- Meeting/interview requests generated

### Long-term (2 months)
- Job offers directly attributed to video
- Speaking/consulting opportunities
- Industry recognition and networking

## Troubleshooting

### Video Won't Play
- **Issue**: Codec not supported
- **Solution**: Install VLC Media Player or convert to different format

### Audio Quality Issues
- **Issue**: Robotic or difficult to understand
- **Solution**: See customization section for professional voiceover options

### File Size Too Large
- **Issue**: 29MB file difficult to email
- **Solution**: Upload to YouTube/Vimeo and share link instead

### Generation Fails
- **Issue**: FFmpeg or espeak errors
- **Solution**: Check `video_production.log` for detailed error messages
- **Solution**: Ensure all system dependencies are installed

## Additional Resources

- **Full Script**: `satellites/portfolio/PORTFOLIO_VIDEO_SCRIPT.md`
- **Production Agent**: `satellites/video-production/video_production_agent.py`
- **Quick Start Guide**: `satellites/portfolio/PORTFOLIO_VIDEO_QUICKSTART.md`
- **Storyboard**: `satellites/portfolio/PORTFOLIO_VIDEO_STORYBOARD.md`
- **README**: `satellites/portfolio/PORTFOLIO_VIDEO_README.md`

## Support

For questions or issues:

1. Check the production log: `video_output/PORTFOLIO_VIDEO_SCRIPT_video.log.txt`
2. Review documentation in `satellites/portfolio/` directory
3. File an issue on GitHub
4. Consult the main README.md for general project information

## License

This video is part of the Classroom RPG: Aetheria project and is subject to the same MIT License. You are free to:

- Use the video for personal portfolio purposes
- Customize the script for your own projects
- Share the approach with others

Please maintain attribution to the original project when sharing the framework.

---

**Generated**: December 28, 2025  
**Production Tool**: Autonomous Video Production Agent  
**Source Script**: satellites/portfolio/PORTFOLIO_VIDEO_SCRIPT.md  
**Duration**: 25 minutes (1542 seconds)  
**Quality**: HD 1080p @ 30fps

🎬 **Ready to present!**
