# Monty Chat Firebase Authentication Setup Guide

This guide explains how to set up Firebase authentication for the Monty AI Assistant in the ACSPL+ VSCode extension.

## Overview

The Monty chat now includes:
- 🔐 **Firebase Authentication** with special access codes
- 🎨 **Enhanced Modern UI** with gradient backgrounds and animations
- 🔄 **Code Renewal System** allowing users to refresh their access codes
- 🔒 **SHA256 Timestamp Hashing** for secure time-based tracking
- 💾 **Firebase Realtime Database** integration for user management

## Features

### 1. Authentication Screen
- Beautiful welcome screen with animated Monty icon
- Secure password input for special codes
- Real-time authentication feedback
- Automatic transition to chat after successful login

### 2. Enhanced Chat UI
- Modern gradient design with smooth animations
- Improved message bubbles with shadows and borders
- Better code block formatting with syntax highlighting
- Responsive layout with custom scrollbars
- Header with Monty branding and action buttons

### 3. Code Management
- **Renew Code**: Users can generate new access codes
- **SHA256 Hashing**: Timestamps are hashed for security
- **Firebase Storage**: All codes stored in Firebase Realtime Database

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "acspl-monty-chat")
4. Follow the setup wizard

### Step 2: Enable Realtime Database

1. In Firebase Console, navigate to "Build" → "Realtime Database"
2. Click "Create Database"
3. Choose location (e.g., us-central1)
4. Start in **test mode** (or configure security rules)

### Step 3: Generate Service Account Key

1. Go to Project Settings (⚙️ icon) → "Service accounts"
2. Click "Generate new private key"
3. Save the JSON file to a secure location (e.g., `C:\secure\firebase-service-account.json`)

⚠️ **IMPORTANT**: Never commit this file to version control!

### Step 4: Configure VSCode Extension

1. Open VSCode Settings (File → Preferences → Settings)
2. Search for "ACSPL"
3. Configure the following settings:

```json
{
  "acspl.firebaseServiceAccountPath": "C:\\secure\\firebase-service-account.json",
  "acspl.firebaseDatabaseURL": "https://your-project-id.firebaseio.com"
}
```

Replace `your-project-id` with your actual Firebase project ID.

## Database Structure

The extension uses the following Firebase Realtime Database structure:

```
users/
  {userId}/
    specialCode: "abc123def456..."      // 32-character hex code
    createdAt: 1735689600000            // Unix timestamp
    lastRenewed: 1735689600000          // Unix timestamp
    timestampHash: "sha256hash..."      // SHA256 of timestamp
    isActive: true                      // Boolean flag
```

### Firebase Security Rules (Optional)

For production, add these security rules to your Realtime Database:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

## Creating User Access Codes

### Method 1: Using the Extension (Admin)

You can add an admin command to generate codes. Add this function to `extension.ts`:

```typescript
async function generateNewUserCode(): Promise<void> {
    const newCode = await createUserWithCode();
    if (newCode) {
        vscode.window.showInformationMessage(
            `New access code created: ${newCode}`,
            'Copy Code'
        ).then(selection => {
            if (selection === 'Copy Code') {
                vscode.env.clipboard.writeText(newCode);
            }
        });
    } else {
        vscode.window.showErrorMessage('Failed to create access code. Check Firebase configuration.');
    }
}
```

### Method 2: Firebase Console

1. Go to Firebase Console → Realtime Database
2. Click the "+" button next to "users"
3. Add a new entry:
   ```json
   {
     "specialCode": "your-custom-code-here",
     "createdAt": 1735689600000,
     "lastRenewed": 1735689600000,
     "timestampHash": "generate-using-sha256",
     "isActive": true
   }
   ```

### Method 3: Node.js Script

Create a script `generate-code.js`:

```javascript
const admin = require('firebase-admin');
const crypto = require('crypto');

// Initialize Firebase Admin
const serviceAccount = require('./path/to/service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project.firebaseio.com"
});

// Generate code
function generateCode() {
  return crypto.randomBytes(16).toString('hex');
}

function hashTimestamp(timestamp) {
  return crypto.createHash('sha256').update(timestamp.toString()).digest('hex');
}

async function createUser() {
  const db = admin.database();
  const code = generateCode();
  const timestamp = Date.now();

  await db.ref('users').push({
    specialCode: code,
    createdAt: timestamp,
    lastRenewed: timestamp,
    timestampHash: hashTimestamp(timestamp),
    isActive: true
  });

  console.log(`✅ Access code created: ${code}`);
  process.exit(0);
}

createUser();
```

Run with: `node generate-code.js`

## User Workflow

### First Time Use

1. User opens Monty chat (Command Palette → "ACSPL+: Ask For Monty's help")
2. Authentication screen appears
3. User enters their special access code
4. Click "Start Chat" button
5. Upon successful authentication, chat screen loads

### Using the Chat

1. **Send Messages**: Type in the textarea and press Enter or click "Send Message"
2. **Upload PDFs**: Use the file picker to upload PDF documents for analysis
3. **Clear Chat**: Click the red "Clear Chat" button to reset conversation history
4. **Renew Code**: Click "Renew Code" to generate a new access code

### Renewing Access Code

1. Click the "Renew Code" button in the header
2. Confirm the action (old code will be invalidated)
3. New code is displayed in an alert
4. Save the new code securely

## Demo Mode (No Firebase)

If Firebase is not configured, the extension runs in **demo mode**:
- No authentication required
- Users can access chat immediately
- Code renewal features are disabled
- A message indicates "running in demo mode"

This is useful for development and testing.

## Security Considerations

1. **Service Account Security**
   - Store service account JSON in a secure location
   - Never commit to version control
   - Use environment variables or secure vaults in production

2. **Access Code Distribution**
   - Distribute codes through secure channels (encrypted email, password managers)
   - Implement code expiration if needed
   - Monitor active users in Firebase Console

3. **Database Security**
   - Use proper Firebase security rules
   - Limit read/write access
   - Enable Firebase App Check for additional security

4. **Rate Limiting**
   - Consider adding rate limiting to prevent abuse
   - Monitor Firebase usage to detect anomalies

## Troubleshooting

### Authentication Fails

- **Check service account path**: Ensure the path in settings is correct
- **Verify database URL**: Confirm it matches your Firebase project
- **Check code validity**: Ensure the code exists in Firebase and `isActive` is true
- **Firebase permissions**: Verify service account has database access

### Extension Doesn't Load

- **Compile errors**: Run `npm run compile` to check for TypeScript errors
- **Missing dependencies**: Run `npm install` to install Firebase Admin SDK
- **Check console**: Open Developer Tools (Help → Toggle Developer Tools) for errors

### Firebase Connection Issues

- **Network**: Check internet connectivity
- **Firewall**: Ensure Firebase domains aren't blocked
- **Service account**: Verify JSON file is valid and not corrupted

## UI Customization

The chat UI uses CSS custom properties. To customize colors, modify the `getWebviewContent()` function in [src/extension.ts](src/extension.ts):

```css
/* Primary color (buttons, borders, highlights) */
#00d4ff → your-color

/* Background gradients */
linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)

/* Message bubbles */
.user { background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); }
.ai { background: rgba(68, 68, 85, 0.9); }
```

## Future Enhancements

Potential additions:
- Multi-factor authentication (MFA)
- User roles (admin, user, viewer)
- Usage analytics and quotas
- Session management
- Audit logging
- Code expiration policies

## Support

For issues or questions:
- **Developer**: Bar Popko
- **Email**: barp@acsmotioncontrol.com
- **Company**: ACS Motion Control

## License

MIT License - Same as the ACSPL+ extension
