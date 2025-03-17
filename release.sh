#!/bin/bash

# Script to create a GitHub release for WhatsApp LLM Assistant

# Check if GH CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI is not installed. Please install it first."
    echo "Visit: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "You need to authenticate with GitHub CLI first."
    echo "Run: gh auth login"
    exit 1
fi

# Get version from package.json
VERSION=$(node -e "console.log(require('./package.json').version)")

# Clean and build the release
echo "Cleaning and building release for version $VERSION..."
npm run package:release

# Prepare release notes
NOTES_FILE=$(mktemp)
cat .github/release-template.md | sed "s/\${version}/$VERSION/g" > $NOTES_FILE

echo "Creating GitHub release v$VERSION..."
gh release create "v$VERSION" \
    --title "WhatsApp LLM Assistant v$VERSION" \
    --notes-file $NOTES_FILE \
    release/WhatsApp*.* 

# Clean up temporary files
rm $NOTES_FILE

echo "Release v$VERSION created successfully!"
echo "Don't forget to update the release notes with actual changes."