# Scripts Directory

This directory contains utility scripts for managing the ACSPL+ VSCode extension.

## Available Scripts

### generate-user-code.js

Interactive Node.js script for managing Monty AI Assistant user access codes.

#### Features
- ✅ Generate new user access codes
- 📋 List all users in database
- ❌ Deactivate user codes
- 🔒 SHA256 timestamp hashing
- 💾 Direct Firebase Realtime Database integration

#### Setup

1. **Install Dependencies**
   ```bash
   npm install firebase-admin
   ```

2. **Download Firebase Service Account Key**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file to a secure location

3. **Configure the Script**
   Edit `generate-user-code.js` and update:
   ```javascript
   const SERVICE_ACCOUNT_PATH = './path/to/firebase-service-account.json';
   const DATABASE_URL = 'https://your-project-id.firebaseio.com';
   ```

#### Usage

Run the script from the extension root directory:

```bash
node scripts/generate-user-code.js
```

#### Interactive Menu

```
╔════════════════════════════════════════╗
║   Monty User Code Generator           ║
╚════════════════════════════════════════╝

1. Generate new user code
2. List all users
3. Deactivate user
4. Exit

Select option (1-4):
```

#### Option 1: Generate New User Code

Creates a new user with a random access code.

**Steps:**
1. Select option 1
2. Enter user name (optional)
3. Code is generated and displayed
4. Save the code securely

**Example Output:**
```
✅ User created successfully!

╔════════════════════════════════════════╗
║       SAVE THIS CODE SECURELY          ║
╚════════════════════════════════════════╝

User ID: -NXxXxXxXxXxXxXxXxXx
Name: John Doe

🔑 Special Code: abc123def456789012345678901234567890

Created: 1/6/2025, 10:30:00 AM

⚠️  Share this code only with the authorized user!
```

#### Option 2: List All Users

Displays all users in the database with their codes and status.

**Example Output:**
```
📋 Current Users:
────────────────────────────────────────────────────────────────────────────────

User ID: -NXxXxXxXxXxXxXxXxXx
Name: John Doe
Code: abc123def456789012345678901234567890
Status: ✅ Active
Created: 1/6/2025, 10:30:00 AM
Last Renewed: 1/6/2025, 10:30:00 AM

User ID: -NYyYyYyYyYyYyYyYyYy
Name: Jane Smith
Code: def456789012345678901234567890abc123
Status: ❌ Inactive
Created: 1/5/2025, 9:15:00 AM
Last Renewed: 1/5/2025, 9:15:00 AM

────────────────────────────────────────────────────────────────────────────────
```

#### Option 3: Deactivate User

Disables a user's access code.

**Steps:**
1. Select option 3
2. Enter the code to deactivate
3. User is marked as inactive in database

**Note:** This does NOT delete the user, just sets `isActive: false`

#### Option 4: Exit

Closes the script.

---

## Programmatic Usage

You can also import functions from the script:

```javascript
const { generateCode, createUser, listUsers } = require('./scripts/generate-user-code');

// Generate a code
const code = generateCode();
console.log(code); // "abc123def456..."

// Create a user
const result = await createUser('John Doe');
console.log(result.code);

// List users
await listUsers();
```

## Security Notes

1. **Never commit service account JSON to version control**
   - Add to `.gitignore`
   - Store in secure location
   - Use environment variables for production

2. **Protect generated codes**
   - Share through secure channels only
   - Consider using password managers
   - Implement code rotation policy

3. **Monitor database access**
   - Review Firebase usage regularly
   - Check for unauthorized access attempts
   - Enable Firebase App Check

## Troubleshooting

### Error: Cannot find module 'firebase-admin'

**Solution:**
```bash
npm install firebase-admin
```

### Error: Firebase initialization failed

**Causes:**
- Service account path is incorrect
- Database URL is wrong
- JSON file is corrupted
- No internet connection

**Solution:**
1. Verify `SERVICE_ACCOUNT_PATH` points to valid JSON file
2. Confirm `DATABASE_URL` matches your Firebase project
3. Check Firebase Console for correct database URL
4. Ensure internet connectivity

### Error: Please run this script from the extension root directory

**Solution:**
```bash
# Navigate to extension root
cd c:\Projects\VSC-ACSPL

# Then run script
node scripts/generate-user-code.js
```

### Error: Permission denied

**Causes:**
- Service account lacks database access
- Firebase security rules too restrictive

**Solution:**
1. Verify service account has "Firebase Realtime Database Admin" role
2. Check database security rules in Firebase Console
3. For testing, use test mode rules:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

## Future Enhancements

Potential additions to this script:

- Batch user creation from CSV
- Code expiration management
- Usage statistics per user
- Email notifications for code generation
- Integration with Active Directory/LDAP
- Web-based admin panel
- Automated code rotation
- Audit logging

## Related Documentation

- [MONTY_AUTH_SETUP.md](../MONTY_AUTH_SETUP.md) - Complete Firebase setup guide
- [MONTY_USER_GUIDE.md](../MONTY_USER_GUIDE.md) - End-user documentation
- [MONTY_ENHANCEMENTS_SUMMARY.md](../MONTY_ENHANCEMENTS_SUMMARY.md) - Technical overview

## Support

For issues with this script:
- **Developer**: Bar Popko
- **Email**: barp@acsmotioncontrol.com
- **Company**: ACS Motion Control
