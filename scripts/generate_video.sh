#!/bin/bash
# Quick Video Generation Script
# Usage: ./generate_video.sh

set -e

# Verify we're in the repository root
if [ ! -f "package.json" ] || [ ! -d "satellites" ]; then
    echo "❌ Error: This script must be run from the repository root directory"
    echo "   Current directory: $(pwd)"
    echo "   Please cd to the classroom-rpg-aetheria directory and try again"
    exit 1
fi

echo "=================================================================================="
echo "   Classroom RPG Aetheria - Portfolio Video Generator"
echo "=================================================================================="
echo ""

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "⚠️  Warning: This script is optimized for Linux/Ubuntu."
    echo "    For macOS or Windows, please see VIDEO_PRESENTATION_GUIDE.md"
    echo ""
fi

# Check dependencies
echo "Checking dependencies..."
MISSING_DEPS=()

if ! command -v ffmpeg &> /dev/null; then
    MISSING_DEPS+=("ffmpeg")
fi

if ! command -v espeak &> /dev/null; then
    MISSING_DEPS+=("espeak")
fi

if ! command -v python3 &> /dev/null; then
    MISSING_DEPS+=("python3")
fi

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo "❌ Missing dependencies: ${MISSING_DEPS[*]}"
    echo ""
    echo "To install on Ubuntu/Debian:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install -y ffmpeg espeak espeak-data fonts-dejavu-core"
    echo ""
    exit 1
fi

echo "✅ All dependencies found"
echo ""

# Set environment variables
export REPO_ROOT="$(pwd)"
export SCRIPT_DIR="$(pwd)/satellites/portfolio"
export SCRIPT_PATTERN="*SCRIPT*.md"
export VIDEO_OUT_DIR="$(pwd)/video_output"
export VOICE_MODE="local_tts"
export VIDEO_RESOLUTION="1920x1080"
export FPS="30"

echo "Configuration:"
echo "  Repository: $REPO_ROOT"
echo "  Script directory: $SCRIPT_DIR"
echo "  Output directory: $VIDEO_OUT_DIR"
echo "  Resolution: $VIDEO_RESOLUTION"
echo "  FPS: $FPS"
echo ""

# Check if script exists
if [ ! -f "satellites/video-production/video_production_agent.py" ]; then
    echo "❌ Video production agent not found!"
    echo "   Expected: satellites/video-production/video_production_agent.py"
    exit 1
fi

# Check if portfolio script exists
if [ ! -f "satellites/portfolio/PORTFOLIO_VIDEO_SCRIPT.md" ]; then
    echo "❌ Portfolio script not found!"
    echo "   Expected: satellites/portfolio/PORTFOLIO_VIDEO_SCRIPT.md"
    exit 1
fi

echo "Starting video generation..."
echo "This will take approximately 5-10 minutes depending on your system."
echo ""
echo "=================================================================================="
echo ""

# Run video production agent
python3 satellites/video-production/video_production_agent.py

echo ""
echo "=================================================================================="
echo "                    VIDEO GENERATION COMPLETE!"
echo "=================================================================================="
echo ""

# Check if video was created
if [ -f "video_output/PORTFOLIO_VIDEO_SCRIPT_video.mp4" ]; then
    VIDEO_SIZE=$(du -h "video_output/PORTFOLIO_VIDEO_SCRIPT_video.mp4" | cut -f1)
    echo "✅ Video successfully generated!"
    echo ""
    echo "Output file: video_output/PORTFOLIO_VIDEO_SCRIPT_video.mp4"
    echo "File size: $VIDEO_SIZE"
    echo ""
    echo "To view the video:"
    echo "  - Open with VLC Media Player (recommended)"
    echo "  - Or any video player that supports MP4"
    echo ""
    echo "To share the video:"
    echo "  - Upload to YouTube (unlisted) or Vimeo"
    echo "  - Share link on LinkedIn or portfolio website"
    echo "  - Include in job applications"
    echo ""
    echo "For more information, see: VIDEO_PRESENTATION_GUIDE.md"
else
    echo "❌ Video generation failed!"
    echo ""
    echo "Check the logs:"
    echo "  - video_production.log"
    echo "  - video_output/PORTFOLIO_VIDEO_SCRIPT_video.log.txt (if it exists)"
    echo ""
    exit 1
fi

echo "=================================================================================="
