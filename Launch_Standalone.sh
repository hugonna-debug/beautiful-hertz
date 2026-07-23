#!/bin/bash
# MIN-MAXXED Standalone Client Launcher for macOS & Linux

# ANSI Color codes
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear
echo -e "${CYAN}========================================================${NC}"
echo -e "${CYAN}      MIN-MAXXED: STANDALONE DESKTOP GAME CLIENT        ${NC}"
echo -e "${CYAN}========================================================${NC}"
echo ""

# 1. Ask user if they want to update the game to match the main branch
read -p "Do you want to check for and apply updates from the main branch? [y/N]: " choice

if [[ "$choice" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${CYAN}[INFO] Checking for updates from main branch...${NC}"

    # Check if git command exists
    if ! command -v git &> /dev/null; then
        echo -e "${YELLOW}[WARNING] Git is not installed or not in PATH! Skipping git update.${NC}"
    else
        echo -e "${CYAN}[INFO] Running Git Pull...${NC}"
        git fetch origin
        git pull origin main
        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}[WARNING] Git pull failed. Continuing with local files...${NC}"
        else
            echo -e "${GREEN}[SUCCESS] Pulled latest changes from main branch!${NC}"
        fi
    fi

    echo ""
    echo -e "${CYAN}[INFO] Checking dependencies (npm install)...${NC}"
    npm install

    echo ""
    echo -e "${CYAN}[INFO] Compiling game client (npm run build)...${NC}"
    npm run build
else
    echo ""
    echo -e "${CYAN}[INFO] Skipping updates. Preparing local game client...${NC}"
fi

# 2. Check if game is built
if [ ! -f "dist/index.html" ]; then
    echo ""
    echo -e "${CYAN}[INFO] First-time build required...${NC}"
    echo -e "${CYAN}[INFO] Compiling game client (npm run build)...${NC}"
    npm run build
fi

echo ""
echo -e "${GREEN}[INFO] Launching standalone desktop client...${NC}"
npm run electron:start
