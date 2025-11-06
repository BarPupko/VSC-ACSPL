/**
 * Firebase User Code Generator
 *
 * This script generates special access codes for Monty AI Assistant users
 * and stores them in Firebase Realtime Database.
 *
 * Setup:
 * 1. Install dependencies: npm install firebase-admin
 * 2. Download Firebase service account JSON from Firebase Console
 * 3. Update the paths below
 * 4. Run: node scripts/generate-user-code.js
 */

const admin = require('firebase-admin');
const crypto = require('crypto');
const readline = require('readline');

// ============================================
// CONFIGURATION - UPDATE THESE PATHS
// ============================================
const SERVICE_ACCOUNT_PATH = 'C:\\Users\\CBSC\\firebase-service-account.json';
const DATABASE_URL = 'https://acspl-monty-chat-default-rtdb.firebaseio.com';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a random special code (32-character hex)
 */
function generateCode() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * Hash a timestamp using SHA256
 */
function hashTimestamp(timestamp) {
    return crypto.createHash('sha256').update(timestamp.toString()).digest('hex');
}

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
    try {
        const serviceAccount = require(SERVICE_ACCOUNT_PATH);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: DATABASE_URL
        });

        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error.message);
        console.error('\nPlease check:');
        console.error('1. Service account JSON path is correct');
        console.error('2. Database URL is correct');
        console.error('3. firebase-admin is installed (npm install firebase-admin)');
        return false;
    }
}

/**
 * Create a new user with special code
 */
async function createUser(userName = '') {
    const db = admin.database();
    const usersRef = db.ref('users');

    const specialCode = generateCode();
    const timestamp = Date.now();

    const userData = {
        specialCode: specialCode,
        createdAt: timestamp,
        lastRenewed: timestamp,
        timestampHash: hashTimestamp(timestamp),
        isActive: true
    };

    // Add optional user name if provided
    if (userName) {
        userData.userName = userName;
    }

    try {
        const newUserRef = await usersRef.push(userData);
        return {
            success: true,
            userId: newUserRef.key,
            code: specialCode,
            userData: userData
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * List all users
 */
async function listUsers() {
    const db = admin.database();
    const usersRef = db.ref('users');

    try {
        const snapshot = await usersRef.once('value');
        const users = snapshot.val();

        if (!users) {
            console.log('\n📋 No users found in database');
            return;
        }

        console.log('\n📋 Current Users:');
        console.log('─'.repeat(80));

        Object.entries(users).forEach(([userId, userData]) => {
            const createdDate = new Date(userData.createdAt).toLocaleString();
            const renewedDate = new Date(userData.lastRenewed).toLocaleString();
            const status = userData.isActive ? '✅ Active' : '❌ Inactive';

            console.log(`\nUser ID: ${userId}`);
            if (userData.userName) {
                console.log(`Name: ${userData.userName}`);
            }
            console.log(`Code: ${userData.specialCode}`);
            console.log(`Status: ${status}`);
            console.log(`Created: ${createdDate}`);
            console.log(`Last Renewed: ${renewedDate}`);
        });

        console.log('\n' + '─'.repeat(80));
    } catch (error) {
        console.error('❌ Error listing users:', error.message);
    }
}

/**
 * Deactivate a user by code
 */
async function deactivateUser(code) {
    const db = admin.database();
    const usersRef = db.ref('users');

    try {
        const snapshot = await usersRef.orderByChild('specialCode').equalTo(code).once('value');

        if (!snapshot.exists()) {
            console.log('❌ User with this code not found');
            return false;
        }

        const userId = Object.keys(snapshot.val())[0];
        await usersRef.child(userId).update({ isActive: false });

        console.log('✅ User deactivated successfully');
        return true;
    } catch (error) {
        console.error('❌ Error deactivating user:', error.message);
        return false;
    }
}

/**
 * Interactive CLI menu
 */
async function showMenu() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => new Promise((resolve) => {
        rl.question(prompt, resolve);
    });

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   Monty User Code Generator           ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('\n1. Generate new user code');
    console.log('2. List all users');
    console.log('3. Deactivate user');
    console.log('4. Exit');

    const choice = await question('\nSelect option (1-4): ');

    switch (choice.trim()) {
        case '1': {
            const userName = await question('Enter user name (optional, press Enter to skip): ');
            console.log('\n🔄 Generating user code...');

            const result = await createUser(userName.trim() || null);

            if (result.success) {
                console.log('\n✅ User created successfully!');
                console.log('\n╔════════════════════════════════════════╗');
                console.log('║       SAVE THIS CODE SECURELY          ║');
                console.log('╚════════════════════════════════════════╝');
                console.log(`\nUser ID: ${result.userId}`);
                if (userName.trim()) {
                    console.log(`Name: ${userName.trim()}`);
                }
                console.log(`\n🔑 Special Code: ${result.code}`);
                console.log(`\nCreated: ${new Date(result.userData.createdAt).toLocaleString()}`);
                console.log('\n⚠️  Share this code only with the authorized user!');
            } else {
                console.error(`\n❌ Failed to create user: ${result.error}`);
            }
            break;
        }

        case '2': {
            await listUsers();
            break;
        }

        case '3': {
            const code = await question('Enter code to deactivate: ');
            await deactivateUser(code.trim());
            break;
        }

        case '4': {
            console.log('\n👋 Goodbye!');
            rl.close();
            process.exit(0);
        }

        default: {
            console.log('\n❌ Invalid option');
        }
    }

    rl.close();

    // Ask if user wants to continue
    const rlContinue = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const continuePrompt = await new Promise((resolve) => {
        rlContinue.question('\nContinue? (y/n): ', resolve);
    });

    rlContinue.close();

    if (continuePrompt.toLowerCase() === 'y') {
        await showMenu();
    } else {
        console.log('\n👋 Goodbye!');
        process.exit(0);
    }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
    console.log('🚀 Starting User Code Generator...\n');

    // Check if running in correct directory
    const fs = require('fs');
    if (!fs.existsSync('./package.json')) {
        console.error('❌ Error: Please run this script from the extension root directory');
        console.error('   Usage: node scripts/generate-user-code.js');
        process.exit(1);
    }

    // Initialize Firebase
    const initialized = initializeFirebase();
    if (!initialized) {
        console.error('\n⚠️  Please update SERVICE_ACCOUNT_PATH and DATABASE_URL in this script');
        process.exit(1);
    }

    // Show interactive menu
    await showMenu();
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = {
    generateCode,
    hashTimestamp,
    createUser,
    listUsers,
    deactivateUser
};
