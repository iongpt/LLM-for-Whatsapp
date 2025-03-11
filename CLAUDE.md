# CLAUDE.md - Guide for LLM-for-Whatsapp

## Build Commands
- Development: `yarn run dev`
- Build (Windows): `yarn run build:win`
- Build (Mac Intel): `yarn run build:osx`
- Build (Mac M1): `yarn run build:osxm1`
- Build (Linux): `yarn run build:linux`
- Clean: `yarn run clean`

## Project Structure
- `app/js/` - Core JavaScript logic files
- `app/html/` - HTML templates
- `app/css/` - Styling
- `app/assets/` - Images and icons

## Code Style Guidelines
- Package manager: Yarn (preferred over npm)
- Module system: CommonJS (require/module.exports)
- Indentation: 4 spaces
- Strings: Single quotes preferred
- Semicolons: Required
- Function style: `function name()` traditional syntax
- Error handling: Try/catch blocks for async operations
- Naming: Descriptive, camelCase for variables/functions
- Comments: Use for complex logic explanation

## Application Notes
- WhatsApp integration via unofficial whatsapp.js (not Meta-supported)
- Requires valid WhatsApp session (at least one contact)
- OpenAI API or custom LLM (Oobabooga) for response generation