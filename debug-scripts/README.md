# Debug and Utility Scripts

This directory contains utility scripts that are used for troubleshooting and modifying application settings outside of the normal user interface. 

## ⚠️ WARNING

These scripts should **ONLY** be used by developers who understand what they are doing and when specific modifications are needed. Improper use of these scripts can lead to unexpected application behavior.

## Scripts and Their Purpose

### `apply-settings.js`
- **Purpose**: Ensures all necessary settings are properly initialized for delay settings functionality.
- **Usage**: `node apply-settings.js`
- **When to use**: When the delay settings are missing or need to be reset to default values.

### `debug-settings.js`
- **Purpose**: Helps debug settings-related issues by printing the current settings and creating a debug window.
- **Usage**: `electron debug-settings.js`
- **When to use**: When you need to verify the current state of settings or troubleshoot settings-related problems.

### `fix-settings.js`
- **Purpose**: Fixes settings by adding missing properties and correcting values.
- **Usage**: `electron fix-settings.js`
- **When to use**: When the application settings appear corrupted or are missing expected properties.

### `inspect-settings.js`
- **Purpose**: More advanced troubleshooting script that displays the current settings, modifies them, and creates CSS overrides for visual debugging.
- **Usage**: `node inspect-settings.js`
- **When to use**: For advanced debugging of settings and UI/CSS related issues.

## How to Use

1. Make sure you have Node.js installed on your system.
2. Close the application before running any of these scripts.
3. Run the script using the appropriate command (node or electron) from the project root directory.
4. Restart the application after running the script to see the changes take effect.

## Best Practices

- Always make a backup of your settings before running these scripts
- Only run one script at a time
- Document any changes you make to settings
- Consider creating a pull request if you make improvements to these scripts