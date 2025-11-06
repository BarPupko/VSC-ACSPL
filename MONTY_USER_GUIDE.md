# Monty AI Assistant - User Guide

Welcome to **Monty** 🐎, your intelligent ACS Motion Control assistant!

## Quick Start

### Opening Monty

1. Open the Command Palette:
   - **Windows/Linux**: `Ctrl+Shift+P`
   - **Mac**: `Cmd+Shift+P`

2. Type: `ACSPL+: Ask For Monty's help`

3. Press Enter

### First Time Setup

When you open Monty for the first time, you'll see a beautiful authentication screen:

1. Enter your **special access code** (provided by your administrator)
2. Click **"Start Chat"** button
3. Wait for authentication (you'll see a success message)
4. The chat screen will automatically appear

## Using Monty Chat

### Sending Messages

**Method 1: Type and Click**
1. Type your question in the textarea
2. Click the blue "Send Message" button

**Method 2: Keyboard Shortcut**
1. Type your question
2. Press `Enter` (Shift+Enter for new line)

### Example Questions

```
What is the VEL command in ACSPL+?

How do I configure a motion profile?

Explain the difference between PTP and JOG commands

Show me an example of a FOR loop in ACSPL+

How do I handle errors in ACSPL+?
```

### Uploading PDF Documents

Monty can analyze PDF documents to answer specific questions:

1. Click **"Choose File"** button
2. Select your PDF (e.g., user manual, datasheet)
3. Type your question in the textarea
4. Click "Send Message"

Monty will extract text from the PDF and answer based on the content!

## Chat Features

### Clear Chat History

Click the red **"Clear Chat"** button in the header to:
- Delete all messages from the current session
- Reset the conversation
- Clear stored chat history

⚠️ This action cannot be undone!

### Copy Code Blocks

When Monty provides code examples:

1. Hover over the code block
2. Click the **"Copy"** button in the top-right
3. The code is copied to your clipboard
4. Paste it into your editor

### Renewing Your Access Code

If you need a new access code:

1. Click the orange **"Renew Code"** button in the header
2. Confirm the action in the dialog
3. Your new code will be displayed
4. **Save it securely** - your old code will no longer work!

## UI Overview

### Authentication Screen

```
┌─────────────────────────────────┐
│    🐎 Welcome to Monty          │
│  Your ACS AI Assistant          │
│                                 │
│  Enter Your Special Code:       │
│  [password input]               │
│                                 │
│  [Start Chat Button]            │
└─────────────────────────────────┘
```

### Chat Screen

```
┌───────────────────────────────────────────┐
│ 🐎 Monty AI Chat  [Renew Code][Clear]   │
├───────────────────────────────────────────┤
│ ⚠️ Important Disclaimer                   │
│ AI-generated content - verify important   │
│ information with official documentation   │
├───────────────────────────────────────────┤
│                                           │
│  [User Message] ────────────────────┐    │
│                                      │    │
│  ┌──────────────────────── [AI Reply]    │
│  │                                        │
│  │                                        │
├───────────────────────────────────────────┤
│  [Message textarea]                       │
│  [Choose File: PDF]                       │
│  [Send Message]                           │
└───────────────────────────────────────────┘
```

## Tips and Best Practices

### Getting Better Answers

✅ **DO:**
- Be specific with your questions
- Provide context (e.g., "I'm trying to move axis 0 to position 100")
- Ask follow-up questions for clarification
- Upload relevant PDFs for documentation-specific queries

❌ **DON'T:**
- Ask multiple unrelated questions in one message
- Expect Monty to access external systems or controllers
- Rely solely on AI for safety-critical applications
- Share sensitive information (passwords, proprietary code)

### Example Conversations

**Good Question:**
```
User: How do I set the velocity of axis 0 to 5000 units/sec in ACSPL+?

Monty: To set the velocity of axis 0 to 5000 units per second, use:

VEL(0) = 5000;

This sets the target velocity for axis 0. Make sure the axis
is enabled before setting velocity parameters.
```

**Better Question:**
```
User: I'm getting an error when trying to move axis 0. I've set
VEL(0) = 5000 and used PTP(0, 100). What could be wrong?

Monty: The issue might be that axis 0 isn't enabled yet. Try:

ENABLE(0);  // Enable axis 0 first
VEL(0) = 5000;  // Set velocity
PTP(0, 100);  // Move to position 100

Also check if the controller is in the correct operating mode.
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message | `Enter` |
| New line in message | `Shift + Enter` |
| Authenticate (on auth screen) | `Enter` |

## Understanding AI Responses

### Code Blocks

Monty displays code in formatted blocks with syntax highlighting:

```acspl
! This is an ACSPL+ comment
int axis = 0;
ENABLE(axis);
VEL(axis) = 3000;
PTP(axis, 100);
```

### Formatting

- **Bold text** indicates important terms
- Lists are bullet-pointed
- Step-by-step instructions are numbered

### Disclaimer

Always remember:
- Monty is powered by AI (Google Gemini 2.0 Flash)
- Responses may contain errors or inaccuracies
- **Always verify critical information** with official ACS documentation
- Test code in a safe environment before production use

## Troubleshooting

### Can't Access Chat

**Problem**: "Invalid special code" error

**Solution**:
1. Double-check your code (no typos)
2. Ensure your code is still active
3. Contact your administrator for a new code
4. Try the "Renew Code" feature if you're already logged in

### PDF Upload Fails

**Problem**: "Error reading PDF" message

**Solution**:
1. Ensure the PDF is not password-protected
2. Check if the PDF is corrupted (try opening it elsewhere)
3. Keep PDF files under 10MB for best performance
4. Only upload PDF files (not images or other formats)

### Chat History Lost

**Problem**: Previous conversations disappeared

**Solution**:
- Chat history is stored in browser localStorage
- Clearing browser cache will erase history
- Use "Clear Chat" button only when you want to reset
- Consider copying important responses to a text file

### Slow Responses

**Problem**: Monty takes a long time to respond

**Solution**:
- Check your internet connection
- Large PDFs take longer to process
- Google Gemini API may experience temporary slowdowns
- Try breaking complex questions into smaller parts

## Privacy and Security

### What Data is Stored?

- **Chat history**: Stored locally in your browser (localStorage)
- **Access code**: Verified against Firebase database
- **Timestamps**: Hashed with SHA256 and stored in Firebase
- **Messages**: Sent to Google Gemini API for processing

### What is NOT Stored?

- Your ACSPL+ code or programs
- Controller configurations
- Company proprietary information

### Best Practices

1. **Don't share access codes** with unauthorized users
2. **Clear sensitive chats** using the Clear Chat button
3. **Avoid pasting** confidential information into the chat
4. **Renew codes regularly** for enhanced security

## Getting Help

### Extension Issues

**Developer**: Bar Popko
**Email**: barp@acsmotioncontrol.com

### ACS Motion Control Support

**Website**: https://www.acsmotioncontrol.com/
**Knowledge Center**: Ctrl+F1 (from within VSCode)
**Tutorial Videos**: Use Command Palette → "ACSPL+: Open Update Center"

## What's New in This Version

### 🎨 Enhanced UI
- Modern gradient backgrounds
- Smooth animations and transitions
- Improved message bubble styling
- Custom scrollbars
- Better mobile responsiveness

### 🔐 Authentication System
- Firebase-backed access codes
- Secure SHA256 timestamp hashing
- Code renewal functionality
- Demo mode for non-configured systems

### 💬 Chat Improvements
- Better code block formatting
- Copy code functionality
- PDF upload and analysis
- Persistent chat history
- Enter key to send messages

## Frequently Asked Questions

**Q: How do I get an access code?**
A: Contact your system administrator or the extension developer.

**Q: Can I use Monty offline?**
A: No, Monty requires internet connectivity to authenticate and process requests.

**Q: Does Monty control my ACS controllers?**
A: No, Monty is purely an informational assistant. It doesn't interact with hardware.

**Q: What AI model does Monty use?**
A: Monty uses Google Gemini 2.0 Flash for natural language processing.

**Q: Can Monty debug my code?**
A: Monty can provide suggestions and explain code, but cannot execute or test programs.

**Q: Is my data secure?**
A: Chat history is stored locally. Access codes are verified through Firebase. Always follow security best practices.

---

**Enjoy using Monty! 🐎✨**

*Your intelligent companion for ACSPL+ development*
