#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
  echo -e "${YELLOW}No changes to deploy${NC}"
  exit 0
fi

# Get commit message (default or from argument)
MESSAGE="${1:-Auto deploy}"

echo -e "${CYAN}Staging changes...${NC}"
git add -A

echo -e "${CYAN}Committing: ${MESSAGE}${NC}"
git commit -m "$MESSAGE

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

echo -e "${CYAN}Pushing to GitHub...${NC}"
git push

# Get the run ID of the workflow we just triggered
sleep 2
RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')

echo -e "${CYAN}Waiting for deploy (run $RUN_ID)...${NC}"

# Poll for completion
while true; do
  STATUS=$(gh run view "$RUN_ID" --json status,conclusion --jq '.status')

  if [ "$STATUS" = "completed" ]; then
    CONCLUSION=$(gh run view "$RUN_ID" --json conclusion --jq '.conclusion')
    if [ "$CONCLUSION" = "success" ]; then
      echo ""
      echo -e "${GREEN}✓ Deployed successfully!${NC}"
      echo -e "${GREEN}→ https://themonicah.github.io/dutch900/${NC}"

      # macOS notification
      if command -v osascript &> /dev/null; then
        osascript -e 'display notification "Site is live!" with title "Deploy Complete" sound name "Glass"'
      fi
      exit 0
    else
      echo -e "\n${YELLOW}Deploy failed with: $CONCLUSION${NC}"
      exit 1
    fi
  fi

  printf "."
  sleep 3
done
