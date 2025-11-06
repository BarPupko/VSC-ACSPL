# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Visual Studio Code extension** for the **ACSPL+ programming language**, used in ACS Motion Control systems. The extension provides syntax highlighting, IntelliSense, code snippets, and integration with ACS tooling for `.prg` files.

Key components:
- **Language Server**: Custom language support for ACSPL+ (`.prg` files)
- **Syntax Highlighting**: TextMate grammar-based definitions
- **AI Assistant (Monty)**: Built-in chatbot using Google Gemini 2.0 Flash API
- **ACS Tooling Integration**: Commands to launch MMI, User Mode Driver, Knowledge Center, etc.

## Development Commands

### Build and Compilation
```bash
# Compile TypeScript to JavaScript (output to ./out/)
npm run compile

# Watch mode - auto-recompile on file changes
npm run watch

# Prepare for publishing (runs compile)
npm run vscode:prepublish
```

### Testing
```bash
# Run linter only
npm run lint

# Compile, lint, and run tests
npm run pretest

# Execute test suite (Mocha with @vscode/test-electron)
npm test
```

### Debugging
- Use **"Run Extension"** launch configuration to open Extension Development Host
- Use **"Extension Tests"** launch configuration to run test suite
- Breakpoints work in TypeScript files (source maps enabled)

## Architecture

### Entry Point
- **Main file**: [src/extension.ts](src/extension.ts)
- **Compiled to**: `./out/extension.js`
- **Entry function**: `activate()` - registers all commands, providers, and language features

### Key Files
- **[src/extension.ts](src/extension.ts)** (664 lines): Core extension logic
  - Command handlers for 10 VSCode commands
  - AI chatbot (Monty) with webview interface
  - Variable completion provider
  - Hover provider for function documentation
  - Message passing between extension host and webview

- **[syntaxes/acsplext.tmLanguage.json](syntaxes/acsplext.tmLanguage.json)**: TextMate grammar for syntax highlighting
  - Language scope: `source.prg`
  - Defines tokens for keywords, functions, variables, strings, comments

- **[syntaxes/acspl.code-snippets](syntaxes/acspl.code-snippets)**: Pre-defined code snippets for common ACSPL+ patterns

- **[syntaxes/language-configuration.json](syntaxes/language-configuration.json)**: Language settings
  - Comments: `!` for line comments, `/* */` for block comments
  - Bracket pairs and auto-closing behavior

### Test Structure
- **Test runner**: [src/test/runTest.ts](src/test/runTest.ts)
- **Test suite setup**: [src/test/suite/index.ts](src/test/suite/index.ts) (Mocha TDD interface)
- **Tests**: [src/test/suite/extension.test.ts](src/test/suite/extension.test.ts)

## Important Technical Details

### Language ID
- The extension registers language ID `acsplext` for files with `.prg` extension
- Syntax scope: `source.prg`

### Hardcoded Paths
The extension assumes ACS software is installed at:
```
C:\Program Files (x86)\ACS Motion Control\
```
Commands (OpenMMI, OpenKnowledgeCenter, etc.) will fail if software isn't at default location.

### Security Consideration
**FIXED**: API key now stored in `.env` file (not committed to Git)
- Claude API key: `CLAUDE_API_KEY` environment variable
- Firebase credentials: Stored separately and excluded from Git
- `.gitignore` configured to protect sensitive files
- **Authentication required**: Demo mode removed for security

### AI Assistant (Monty)
- **NEW**: Uses Claude 3.5 Sonnet (Anthropic API)
- Model: `claude-3-5-sonnet-20241022`
- **Firebase Authentication System**:
  - Special access codes stored in Firebase Realtime Database
  - SHA256 timestamp hashing for security
  - Code renewal functionality
  - User management with creation/renewal dates
  - **Authentication required** (demo mode removed for security)
- **Enhanced Modern UI**:
  - Gradient backgrounds with animations
  - Authentication screen with password input
  - Improved message bubbles with shadows
  - Custom scrollbars and transitions
  - Code block copy functionality
- Implements webview-based chat interface with:
  - PDF upload and parsing (pdf-parse library)
  - Chat history persistence (localStorage)
  - Code block formatting with copy buttons
  - Markdown rendering
- Message passing architecture between extension and webview
- **Configuration**:
  - `acspl.firebaseServiceAccountPath`: Path to Firebase service account JSON
  - `acspl.firebaseDatabaseURL`: Firebase Realtime Database URL
- **Documentation**:
  - [MONTY_AUTH_SETUP.md](MONTY_AUTH_SETUP.md) - Firebase setup guide
  - [MONTY_USER_GUIDE.md](MONTY_USER_GUIDE.md) - End-user documentation

### Registered Commands (10)
All commands prefixed with `acspl.`:
- `OpenMMI` (Ctrl+9) - Launch MMI Application
- `OpenUserModeDrive` - Open User Mode Driver
- `OpenUpdateCenter` - Open Update Center
- `OpenSoftwareGuides` - Browse software guides
- `OpenKnowledgeCenter` (Ctrl+F1) - Open Knowledge Center HTML
- `OpenTutorialVideos` - Open tutorial videos URL
- `JoinUs` - View career opportunities
- `OpenLinkedIn` - Open company LinkedIn
- `DeveloperEmail` - Contact developer
- `askAI` - Open Monty AI Assistant

### Language Features
1. **Completion Provider**: Suggests variables found in the current document
2. **Hover Provider**: Shows documentation for ACSPL+ functions (e.g., VEL)
3. **Snippets**: Pre-defined templates for loops, conditionals, motion commands
4. **Syntax Highlighting**: TextMate grammar for keywords, functions, operators, strings, comments

## Dependencies

### Runtime Dependencies
- `@anthropic-ai/sdk` - Anthropic Claude API client
- `dotenv` - Environment variable management
- `firebase-admin` - Firebase Admin SDK for authentication and database
- `pdf-parse` - PDF text extraction for AI assistant
- `pdf-lib` - PDF manipulation
- `ps-node` - Process management
- `crypto` (built-in) - SHA256 hashing for timestamps

### Dev Dependencies
- TypeScript 5.8.2
- ESLint with TypeScript plugin
- Mocha test framework
- @vscode/test-electron
- VSCode types ^1.69.0

## Project Structure
```
src/
├── extension.ts              # Main extension logic
└── test/
    ├── runTest.ts            # Test runner configuration
    └── suite/
        ├── index.ts          # Mocha setup
        └── extension.test.ts # Extension tests

syntaxes/
├── acsplext.tmLanguage.json  # TextMate grammar
├── acspl.code-snippets       # Code snippets
└── language-configuration.json # Language config

out/                          # Compiled JavaScript (generated)
images/                       # Extension assets
.vscode/                      # VSCode configuration
```

## TypeScript Configuration
- Target: ES6
- Module: CommonJS
- Strict mode: enabled
- Libraries: ES6, DOM
- ESModule interop: enabled

## Extension Metadata
- **Display Name**: ACS-Motion-Control
- **Publisher**: ACSPL
- **Version**: 0.29.4
- **Engine**: VSCode ^1.75.0
- **License**: MIT

## Contact
- Developer: Bar Popko
- Email: barp@acsmotioncontrol.com
- Company: ACS Motion Control
