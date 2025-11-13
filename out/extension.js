"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const execFile = __importStar(require("child_process"));
const process = __importStar(require("process"));
const fs = __importStar(require("fs")); // Check if file exists in file system.
const path = __importStar(require("path")); // Import path module to handle paths easily
const crypto = __importStar(require("crypto")); // For SHA256 hashing
const admin = __importStar(require("firebase-admin")); // Firebase Admin SDK
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const dotenv = __importStar(require("dotenv"));
const monty_1 = require("./monty");
const acsplSnippetProvider_1 = require("./acsplSnippetProvider");
// Load environment variables - try multiple paths
const envPath1 = path.join(__dirname, '..', '.env');
const envPath2 = path.join(__dirname, '..', '..', '.env');
const envPath3 = 'c:\\Projects\\VSC-ACSPL\\.env'; // Absolute fallback
console.log('=== MONTY DEBUG: Environment Loading ===');
console.log('__dirname:', __dirname);
console.log('Trying env paths:', envPath1, envPath2, envPath3);
if (fs.existsSync(envPath1)) {
    const result = dotenv.config({ path: envPath1 });
    console.log('✅ Loaded .env from:', envPath1);
    console.log('CLAUDE_API_KEY after load:', process.env.CLAUDE_API_KEY ? `Found (${process.env.CLAUDE_API_KEY.substring(0, 20)}...)` : 'NOT FOUND');
    if (result.error) {
        console.error('❌ Error loading .env:', result.error);
    }
}
else if (fs.existsSync(envPath2)) {
    const result = dotenv.config({ path: envPath2 });
    console.log('✅ Loaded .env from:', envPath2);
    console.log('CLAUDE_API_KEY after load:', process.env.CLAUDE_API_KEY ? `Found (${process.env.CLAUDE_API_KEY.substring(0, 20)}...)` : 'NOT FOUND');
    if (result.error) {
        console.error('❌ Error loading .env:', result.error);
    }
}
else if (fs.existsSync(envPath3)) {
    const result = dotenv.config({ path: envPath3 });
    console.log('✅ Loaded .env from:', envPath3, '(fallback)');
    console.log('CLAUDE_API_KEY after load:', process.env.CLAUDE_API_KEY ? `Found (${process.env.CLAUDE_API_KEY.substring(0, 20)}...)` : 'NOT FOUND');
    if (result.error) {
        console.error('❌ Error loading .env:', result.error);
    }
}
else {
    console.error('❌ .env file not found at:', envPath1, 'or', envPath2, 'or', envPath3);
}
console.log('=== END Environment Loading ===');
// Firebase configuration and initialization
let firebaseInitialized = false;
function initializeFirebase(context) {
    console.log('=== initializeFirebase called ===');
    if (firebaseInitialized) {
        console.log('Firebase already initialized, skipping');
        return;
    }
    try {
        // Try to get from VSCode settings first
        const config = vscode.workspace.getConfiguration('acspl');
        let serviceAccountPath = config.get('firebaseServiceAccountPath');
        let databaseURL = config.get('firebaseDatabaseURL');
        // Fallback to environment variables or hardcoded paths
        if (!serviceAccountPath) {
            serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'C:\\Users\\CBSC\\firebase-service-account.json';
            console.log('Using fallback service account path from env/hardcoded');
        }
        if (!databaseURL) {
            databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://acspl-monty-chat-default-rtdb.firebaseio.com';
            console.log('Using fallback database URL from env/hardcoded');
        }
        console.log('Firebase serviceAccountPath:', serviceAccountPath);
        console.log('Firebase databaseURL:', databaseURL);
        console.log('Service account file exists:', serviceAccountPath ? fs.existsSync(serviceAccountPath) : false);
        if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
            console.log('Service account loaded, project_id:', serviceAccount.project_id);
            // Check if Firebase is already initialized
            if (admin.apps.length === 0) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    databaseURL: databaseURL
                });
                console.log('✅ Firebase initialized successfully');
            }
            else {
                console.log('✅ Firebase already initialized (using existing app)');
            }
            firebaseInitialized = true;
        }
        else {
            console.error('❌ Firebase service account not found at:', serviceAccountPath);
            console.warn('Firebase service account not configured. Chat authentication will be disabled.');
        }
    }
    catch (error) {
        console.error('❌ Failed to initialize Firebase:', error);
    }
}
// SHA256 hashing function
function hashTimestamp(timestamp) {
    return crypto.createHash('sha256').update(timestamp.toString()).digest('hex');
}
// Generate a unique special code
function generateSpecialCode() {
    return crypto.randomBytes(16).toString('hex');
}
// Verify special code with Firebase - Updated for users/secretKey structure
function verifySpecialCode(code) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('=== verifySpecialCode called ===');
        console.log('Code to verify:', code);
        console.log('Firebase initialized:', firebaseInitialized);
        if (!firebaseInitialized) {
            console.error('Firebase not initialized, cannot verify code');
            return false;
        }
        try {
            const db = admin.database();
            const usersRef = db.ref('users');
            console.log('Querying Firebase users for secretKey:', code);
            // Try orderByChild query first
            let snapshot = yield usersRef.orderByChild('secretKey').equalTo(code).once('value');
            console.log('Snapshot exists (orderByChild):', snapshot.exists());
            // If not found with orderByChild, try getting all users and searching manually
            if (!snapshot.exists()) {
                console.log('Trying manual search through all users...');
                const allUsersSnapshot = yield usersRef.once('value');
                if (allUsersSnapshot.exists()) {
                    const allUsers = allUsersSnapshot.val();
                    console.log('Total users found:', Object.keys(allUsers).length);
                    // Search for user with matching secretKey
                    for (const [userId, userData] of Object.entries(allUsers)) {
                        const user = userData;
                        console.log(`Checking user ${userId}, secretKey:`, user.secretKey);
                        if (user.secretKey === code) {
                            console.log('Found matching user!');
                            // No isActive field in database - just return true
                            return true;
                        }
                    }
                    console.log('No user found with secretKey after manual search');
                }
                else {
                    console.log('No users collection found in database');
                }
                return false;
            }
            const allUsers = snapshot.val();
            console.log('Found users:', JSON.stringify(allUsers, null, 2));
            const userData = Object.values(allUsers)[0];
            console.log('User data:', JSON.stringify(userData, null, 2));
            // User found with matching secretKey - return true (no isActive check)
            return true;
        }
        catch (error) {
            console.error('Error verifying special code:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return false;
        }
    });
}
// Create new user with special code
function createUserWithCode() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!firebaseInitialized) {
            return null;
        }
        try {
            const db = admin.database();
            const usersRef = db.ref('users');
            const newUserRef = usersRef.push();
            const specialCode = generateSpecialCode();
            const timestamp = Date.now();
            yield newUserRef.set({
                specialCode: specialCode,
                createdAt: timestamp,
                lastRenewed: timestamp,
                timestampHash: hashTimestamp(timestamp),
                isActive: true
            });
            return specialCode;
        }
        catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    });
}
// Renew user code
function renewUserCode(oldCode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!firebaseInitialized) {
            return null;
        }
        try {
            const db = admin.database();
            const usersRef = db.ref('users');
            const snapshot = yield usersRef.orderByChild('specialCode').equalTo(oldCode).once('value');
            if (snapshot.exists()) {
                const userId = Object.keys(snapshot.val())[0];
                const newCode = generateSpecialCode();
                const timestamp = Date.now();
                yield usersRef.child(userId).update({
                    specialCode: newCode,
                    lastRenewed: timestamp,
                    timestampHash: hashTimestamp(timestamp)
                });
                return newCode;
            }
            return null;
        }
        catch (error) {
            console.error('Error renewing code:', error);
            return null;
        }
    });
}
// Get user ID from special code
function getUserIdFromCode(code) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!firebaseInitialized) {
            return null;
        }
        try {
            const db = admin.database();
            const usersRef = db.ref('users');
            const snapshot = yield usersRef.orderByChild('secretKey').equalTo(code).once('value');
            if (snapshot.exists()) {
                return Object.keys(snapshot.val())[0];
            }
            return null;
        }
        catch (error) {
            console.error('Error getting user ID:', error);
            return null;
        }
    });
}
// Create new chat session - Updated to use chats collection
function createChatSession(userId, sessionName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!firebaseInitialized) {
            return null;
        }
        try {
            const db = admin.database();
            const sessionsRef = db.ref(`chats/${userId}`);
            const newSessionRef = sessionsRef.push();
            const sessionId = newSessionRef.key;
            yield newSessionRef.set({
                sessionName: sessionName,
                createdAt: Date.now(),
                lastUpdated: Date.now(),
                messages: []
            });
            return sessionId;
        }
        catch (error) {
            console.error('Error creating chat session:', error);
            return null;
        }
    });
}
// Save message to session
function saveMessageToSession(userId, sessionId, role, content) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!firebaseInitialized) {
            return false;
        }
        try {
            const db = admin.database();
            const messagesRef = db.ref(`chats/${userId}/${sessionId}/messages`);
            yield messagesRef.push({
                role: role,
                content: content,
                timestamp: Date.now()
            });
            // Update last updated timestamp
            yield db.ref(`chats/${userId}/${sessionId}`).update({
                lastUpdated: Date.now()
            });
            return true;
        }
        catch (error) {
            console.error('Error saving message:', error);
            return false;
        }
    });
}
// Get all sessions for a user
function getUserSessions(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!firebaseInitialized) {
            return [];
        }
        try {
            const db = admin.database();
            const sessionsRef = db.ref(`chats/${userId}`);
            const snapshot = yield sessionsRef.orderByChild('lastUpdated').once('value');
            if (snapshot.exists()) {
                const sessions = [];
                snapshot.forEach((childSnapshot) => {
                    sessions.push(Object.assign({ id: childSnapshot.key }, childSnapshot.val()));
                });
                return sessions.reverse(); // Most recent first
            }
            return [];
        }
        catch (error) {
            console.error('Error getting sessions:', error);
            return [];
        }
    });
}
// Get session messages
function getSessionMessages(userId, sessionId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!firebaseInitialized) {
            return [];
        }
        try {
            const db = admin.database();
            const messagesRef = db.ref(`chats/${userId}/${sessionId}/messages`);
            const snapshot = yield messagesRef.orderByChild('timestamp').once('value');
            if (snapshot.exists()) {
                const messages = [];
                snapshot.forEach((childSnapshot) => {
                    messages.push(childSnapshot.val());
                });
                return messages;
            }
            return [];
        }
        catch (error) {
            console.error('Error getting messages:', error);
            return [];
        }
    });
}
// Delete session from Firebase
function deleteSessionFromFirebase(userId, sessionId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!firebaseInitialized) {
            return false;
        }
        try {
            const db = admin.database();
            const sessionRef = db.ref(`chats/${userId}/${sessionId}`);
            yield sessionRef.remove();
            return true;
        }
        catch (error) {
            console.error('Error deleting session:', error);
            return false;
        }
    });
}
// Update session title
function updateSessionTitle(userId, sessionId, newTitle) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!firebaseInitialized) {
            return false;
        }
        try {
            const db = admin.database();
            const sessionRef = db.ref(`chats/${userId}/${sessionId}`);
            yield sessionRef.update({
                sessionName: newTitle,
                lastUpdated: Date.now()
            });
            return true;
        }
        catch (error) {
            console.error('Error updating session title:', error);
            return false;
        }
    });
}
// Generate title from first user message
function generateTitleFromMessage(message) {
    // Take first 50 characters and clean it up
    let title = message.trim().substring(0, 50);
    // Remove any newlines and extra spaces
    title = title.replace(/\s+/g, ' ');
    // Add ellipsis if truncated
    if (message.length > 50) {
        title += '...';
    }
    return title;
}
const legend = new vscode.SemanticTokensLegend(['variable', 'keyword', 'type'], []);
class VariableCompletionProvider {
    provideCompletionItems(document, position, token, context) {
        const text = document.getText();
        const variables = extractVariables(text);
        return variables.map(varName => {
            const item = new vscode.CompletionItem(varName, vscode.CompletionItemKind.Variable);
            item.detail = "Integer Variable";
            return item;
        });
    }
}
let uploadedPdfText = null;
let currntLoop = vscode.commands.registerCommand('acspl.CurrentLoop', () => __awaiter(void 0, void 0, void 0, function* () {
    const panel = vscode.window.createWebviewPanel('CurrentLoop', 'CurrentLoop', vscode.ViewColumn.One, { enableScripts: true });
}));
// OLD COMMAND REMOVED - Use "AI Assistance" instead
/*
let disposable = vscode.commands.registerCommand('acspl.askAI', async () => {
    const panel = vscode.window.createWebviewPanel(
        'montyChat',
        'Monty - ACS AI Assistant',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    let isAuthenticated = false;
    let userCode: string | null = null;

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(async (message) => {
        const systemIntro = `You are Monty, a specialized Learning Coach focused on helping users master ACS Motion Control technologies, products, and concepts through company documentation.

Core Skills:
- Document-Based Learning: Extract and explain key concepts from ACS Motion Control documentation, cross-reference information, identify critical sections
- Technical Concept Breakdown: Simplify motion control concepts (servo systems, motion controllers, programming, fieldbus protocols) into beginner, intermediate, and advanced levels
- Skill Development & Practice: Create hands-on exercises, programming examples, configuration tasks, troubleshooting scenarios
- Learning Process Optimization: Help define learning goals specific to ACS Motion Control (SPiiPlus programming, ACS controller configuration)

ACS Motion Control Context:
- Focus on motion controller products, servo drives, and related software
- Emphasize practical applications in automation and industrial motion
- Reference ACS-specific programming languages (ACSPL+) and tools
- Connect learning to industry standards and best practices in motion control

Interaction Guidelines:
- Maintain a professional, technical yet approachable tone
- Adapt explanations to the user's background
- Provide step-by-step guidance when explaining complex procedures
- Use examples directly from shared documentation whenever possible
- Check understanding regularly with quick knowledge checks
- Never provide external links - focus solely on the documentation provided`;

        // Handle authentication
        if (message.command === 'authenticate') {
            const code = message.code.trim();

            // Check if Firebase is initialized
            if (!firebaseInitialized) {
                panel.webview.postMessage({
                    command: 'authResult',
                    success: false,
                    message: '❌ Firebase authentication is not configured. Please contact your administrator.'
                });
                return;
            }

            // Verify code with Firebase
            const isValid = await verifySpecialCode(code);
            if (isValid) {
                isAuthenticated = true;
                userCode = code;
                panel.webview.postMessage({
                    command: 'authResult',
                    success: true,
                    message: '✅ Authentication successful! Welcome to Monty Chat.'
                });

                // Send welcome message
                panel.webview.postMessage({
                    command: 'receiveMessage',
                    text: `👋 Hello! I'm 🐎Monty - Your ACS AI Assistant.\n\nHow can I help you today?`
                });
            } else {
                panel.webview.postMessage({
                    command: 'authResult',
                    success: false,
                    message: '❌ Invalid special code. Please try again or contact support.'
                });
            }
        }

        // Handle code renewal
        if (message.command === 'renewCode') {
            if (userCode && firebaseInitialized) {
                const newCode = await renewUserCode(userCode);
                if (newCode) {
                    userCode = newCode;
                    panel.webview.postMessage({
                        command: 'codeRenewed',
                        newCode: newCode,
                        message: `✅ Your new special code is: ${newCode}\n\nPlease save it securely!`
                    });
                } else {
                    panel.webview.postMessage({
                        command: 'renewError',
                        message: '❌ Failed to renew code. Please try again later.'
                    });
                }
            } else {
                panel.webview.postMessage({
                    command: 'renewError',
                    message: '❌ Code renewal is not available.'
                });
            }
        }

        // Handle chat messages (only if authenticated)
        if (message.command === 'sendMessage') {
            if (!isAuthenticated) {
                panel.webview.postMessage({
                    command: 'receiveMessage',
                    text: '❌ Please authenticate first to use the chat.'
                });
                return;
            }

            const userInput = message.text.trim();
            let response = "";

            if (uploadedPdfText) {
                response = await queryAIWithPdf(`${systemIntro} ${userInput}`, uploadedPdfText);
            } else {
                response = await getAIResponse(`${systemIntro} ${userInput}`);
            }

            panel.webview.postMessage({ command: 'receiveMessage', text: response });
        }

        // Handle PDF upload (only if authenticated)
        if (message.command === 'uploadPDF') {
            if (!isAuthenticated) {
                panel.webview.postMessage({
                    command: 'receiveMessage',
                    text: '❌ Please authenticate first to upload PDFs.'
                });
                return;
            }

            const pdfBuffer = Buffer.from(message.content.split(',')[1], 'base64');
            try {
                const pdfData = await pdf(pdfBuffer);
                uploadedPdfText = pdfData.text;

                if (message.query.trim()) {
                    const response = await queryAIWithPdf(`${systemIntro} ${message.query}`, uploadedPdfText);
                    panel.webview.postMessage({ command: 'receiveMessage', text: response });
                } else {
                    panel.webview.postMessage({ command: 'receiveMessage', text: '✅ PDF uploaded successfully! Now enter a query.' });
                }
            } catch (error) {
                console.error("Error processing PDF:", error);
                panel.webview.postMessage({ command: 'receiveMessage', text: '❌ Error reading PDF. Please try again.' });
            }
        }
    });
});
*/
function extractVariables(text) {
    const regex = /^\s*(?:unsigned\s+|signed\s+|long\s+|short\s+)?(?:int|REAL|char|void)\s+(\*?\s*\w+)(?:\s*\[.*\])?\s*(?:=.*)?;/gm;
    const matches = [...text.matchAll(regex)];
    return matches.map(match => match[1].replace('*', '').trim());
}
//When hovering over a function or variable, display documentation or usage examples.
vscode.languages.registerHoverProvider('acsplext', {
    provideHover(document, position, token) {
        const word = document.getText(document.getWordRangeAtPosition(position));
        if (word === 'VEL') {
            return new vscode.Hover("`VEL(axis)` sets the velocity of the specified axis.\n\n**Example:**\n```acspl\nVEL(X) = 1000;\n```");
        }
    }
});
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Initialize Firebase
    initializeFirebase(context);
    // Add command to create/update user with custom code
    context.subscriptions.push(vscode.commands.registerCommand('acspl.createFirebaseUser', () => __awaiter(this, void 0, void 0, function* () {
        const code = yield vscode.window.showInputBox({
            prompt: 'Enter the special code for the user (e.g., barp@isthekey.com)',
            placeHolder: 'Special code'
        });
        if (!code) {
            vscode.window.showErrorMessage('No code provided');
            return;
        }
        if (!firebaseInitialized) {
            vscode.window.showErrorMessage('Firebase is not initialized. Check your configuration.');
            return;
        }
        try {
            const db = admin.database();
            const usersRef = db.ref('users');
            // Check if user already exists
            const snapshot = yield usersRef.orderByChild('specialCode').equalTo(code).once('value');
            if (snapshot.exists()) {
                // Update existing user to active
                const userId = Object.keys(snapshot.val())[0];
                yield usersRef.child(userId).update({
                    isActive: true,
                    lastRenewed: Date.now()
                });
                vscode.window.showInformationMessage(`✅ User with code "${code}" updated to active!`);
            }
            else {
                // Create new user
                const newUserRef = usersRef.push();
                const timestamp = Date.now();
                yield newUserRef.set({
                    specialCode: code,
                    createdAt: timestamp,
                    lastRenewed: timestamp,
                    timestampHash: hashTimestamp(timestamp),
                    isActive: true
                });
                vscode.window.showInformationMessage(`✅ New user created with code: ${code}`);
            }
        }
        catch (error) {
            console.error('Error creating user:', error);
            vscode.window.showErrorMessage(`❌ Failed to create user: ${error}`);
        }
    })));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: 'acsplext' }, new VariableCompletionProvider(), ' ', '\t', '=', '(' // Adjust triggers for your syntax
    ));
    // Register ACSPL+ snippet provider with icons
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: 'acsplext' }, new acsplSnippetProvider_1.ACSPLSnippetProvider(), 'L', 'I', 'W', 'F', 'S', 'e', 'G', 'c', 'O', 'N', 'X', 'A', 'f', 'd', '1', '2', '_' // Common triggers for snippet prefixes
    ));
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    context.subscriptions.push(vscode.commands.registerCommand("acspl.askQuestion", () => __awaiter(this, void 0, void 0, function* () {
        const answer = yield vscode.window.showInformationMessage("How's the extension, do you enjoy it?", "Yes", "No");
        if (answer === "No") {
            vscode.window.showInformationMessage("Sorry to hear that, you can address your problem to barp@acsmotioncontrol.com");
        }
        else if (answer === "Yes") {
            vscode.window.showInformationMessage("Great to hear :), Please rate us on the marketplace.");
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand("acspl.OpenMMI", () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const baseDir = "C:\\Program Files (x86)\\ACS Motion Control";
        const basePattern = "SPiiPlus ADK Suite v";
        try {
            // Get a list of all directories in the base directory
            const directories = fs.readdirSync(baseDir).filter(file => {
                return fs.statSync(path.join(baseDir, file)).isDirectory() && file.startsWith(basePattern);
            });
            // Extract version numbers and sort them
            const versions = directories.map(dir => {
                const version = dir.replace(basePattern, ""); // Extract version number
                return {
                    version,
                    fullPath: path.join(baseDir, dir, "SPiiPlus MMI Application Studio\\ACS.Framework.exe")
                };
            }).sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
            if (versions.length === 0) {
                vscode.window.showInformationMessage("No installed versions of MMI found.");
                return;
            }
            // Show a quick pick menu to select a version
            const selectedVersion = yield vscode.window.showQuickPick(versions.map(v => v.version), {
                placeHolder: "Select a version to start",
            });
            if (selectedVersion) {
                const selectedPath = (_a = versions.find(v => v.version === selectedVersion)) === null || _a === void 0 ? void 0 : _a.fullPath;
                if (selectedPath && fs.existsSync(selectedPath)) {
                    vscode.window.showInformationMessage(`Starting MMI version ${selectedVersion}`);
                    execFile.exec(`"${selectedPath}"`, { cwd: path.dirname(selectedPath) }, (error) => {
                        if (error) {
                            vscode.window.showInformationMessage("An error occurred while starting MMI");
                            console.error(error);
                        }
                    });
                }
                else {
                    vscode.window.showInformationMessage("The selected version does not exist or is not properly installed.");
                }
            }
        }
        catch (err) {
            vscode.window.showInformationMessage("An error occurred while trying to switch versions");
            console.error(err);
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand("acspl.OpenUserModeDrive", () => {
        const baseDir = "C:\\Program Files (x86)\\ACS Motion Control\\SPiiPlus Runtime Kit\\User Mode Driver";
        const executableName = "ACSCSRV.exe";
        try {
            const driverPath = path.join(baseDir, executableName);
            if (fs.existsSync(driverPath)) {
                // File exists
                vscode.window.showInformationMessage("Opening User Mode Drive");
                execFile.exec(`"${driverPath}"`, { cwd: baseDir });
            }
            else {
                vscode.window.showInformationMessage("User Mode Drive does not exist");
            }
        }
        catch (err) {
            vscode.window.showInformationMessage("An error occurred while trying to open User Mode Drive");
            console.error(err);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand("acspl.OpenUpdateCenter", () => {
        const baseDir = "C:\\Program Files (x86)\\ACS Motion Control\\SPiiPlus Update Center";
        const executableName = "ACS.UpdateCenter.exe";
        try {
            const updateCenterPath = path.join(baseDir, executableName);
            if (fs.existsSync(updateCenterPath)) {
                // File exists
                vscode.window.showInformationMessage("Opening Update Center");
                execFile.exec(`"${updateCenterPath}"`, { cwd: baseDir });
            }
            else {
                vscode.window.showInformationMessage("Update Center does not exist");
            }
        }
        catch (err) {
            vscode.window.showInformationMessage("An error occurred while trying to open Update Center");
            console.error(err);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand("acspl.OpenKnowledgeCenter", () => {
        const baseDir = "C:\\Program Files (x86)\\ACS Motion Control\\SPiiPlus Documentation Kit\\Knowledge Center";
        const fileName = "KC.htm";
        try {
            const filePath = path.join(baseDir, fileName);
            if (fs.existsSync(filePath)) {
                // File exists
                vscode.window.showInformationMessage("Opening Knowledge Center");
                vscode.env.openExternal(vscode.Uri.file(filePath));
            }
            else {
                vscode.window.showInformationMessage("Knowledge Center file does not exist");
            }
        }
        catch (err) {
            vscode.window.showInformationMessage("An error occurred while trying to open Knowledge Center");
            console.error(err);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand("acspl.OpenSoftwareGuides", () => {
        const baseDir = "C:\\Program Files (x86)\\ACS Motion Control\\SPiiPlus Documentation Kit";
        const folderName = "Software Guides";
        try {
            const folderPath = path.join(baseDir, folderName);
            if (fs.existsSync(folderPath)) {
                // Directory exists
                vscode.window.showInformationMessage("Opening Software Guides");
                vscode.env.openExternal(vscode.Uri.file(folderPath));
            }
            else {
                vscode.window.showInformationMessage("Software Guides folder does not exist");
            }
        }
        catch (err) {
            vscode.window.showInformationMessage("An error occurred while trying to open Software Guides");
            console.error(err);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand("acspl.OpenTutorialVideos", () => {
        const tutorialUrl = "https://www.acsmotioncontrol.com/videos/tutorial-video-series/";
        try {
            vscode.window.showInformationMessage("Opening Tutorial Videos");
            vscode.env.openExternal(vscode.Uri.parse(tutorialUrl));
        }
        catch (err) {
            vscode.window.showInformationMessage("An error occurred while trying to open the Tutorial Videos");
            console.error(err);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand("acspl.JoinUs", () => __awaiter(this, void 0, void 0, function* () {
        const selectedLocation = yield vscode.window.showQuickPick(["ISRAEL", "CHINA", "GERMANY", "USA"], { placeHolder: "Select a location to view career opportunities" });
        let careerUrl = "";
        if (selectedLocation === "ISRAEL") {
            careerUrl = "https://acsmotioncontrol.com/careers/careers-israel/?coref=1.10.r18_C01&t=1741869411841";
        }
        else if (selectedLocation === "CHINA") {
            careerUrl = "https://www.acsmotioncontrol.com/careers/careers-china/";
        }
        else if (selectedLocation === "GERMANY") {
            careerUrl = "https://www.acsmotioncontrol.com/careers/careers-germany/";
        }
        else if (selectedLocation === "USA") {
            careerUrl = "https://www.acsmotioncontrol.com/careers/careers-usa/";
        }
        else {
            vscode.window.showInformationMessage("No location selected.");
            return; // Exit function if no selection is made
        }
        try {
            vscode.window.showInformationMessage(`Opening Career Page - ${selectedLocation}`);
            vscode.env.openExternal(vscode.Uri.parse(careerUrl));
        }
        catch (err) {
            vscode.window.showErrorMessage("An error occurred while trying to open the Career Page.");
            console.error(err);
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand("acspl.OpenLinkedIn", () => {
        const linkedInUrl = "https://www.linkedin.com/company/acs-motion-control/";
        try {
            vscode.window.showInformationMessage("Please Follow us on LinkedIn");
            vscode.env.openExternal(vscode.Uri.parse(linkedInUrl));
        }
        catch (err) {
            vscode.window.showErrorMessage("An error occurred while trying to open the LinkedIn page");
            console.error(err);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand("acspl.DeveloperEmail", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const subject = encodeURIComponent("Support Request: ACSPL+ Extension");
            const body = encodeURIComponent("Hello Bar,\n\nI need assistance with the ACSPL+ extension.\n\nBest regards,\n[Your Name]");
            const mailtoLink = `mailto:barp@acsmotioncontrol.com?subject=${subject}&body=${body}`;
            vscode.env.openExternal(vscode.Uri.parse(mailtoLink));
            vscode.window.showInformationMessage("Opening email client...");
        }
        catch (err) {
            vscode.window.showErrorMessage("An error occurred while trying to open the email client.");
            console.error(err);
        }
    })));
    // Register Monty AI command from separate module
    const claudeApiKey = process.env.CLAUDE_API_KEY || '';
    (0, monty_1.registerMontyAI)(context, firebaseInitialized, claudeApiKey);
} // end of activate function
function queryAIWithPdf(query, pdfContent) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `Answer based on this PDF content: ${pdfContent}\n\nQuestion: ${query}`;
        return yield getAIResponse(prompt);
    });
}
// Function to get AI response from Claude
function getAIResponse(userInput) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('=== MONTY DEBUG: getAIResponse called ===');
        const apiKey = process.env.CLAUDE_API_KEY;
        console.log('API Key check:', apiKey ? `Found (length: ${apiKey.length}, starts with: ${apiKey.substring(0, 20)}...)` : 'NOT FOUND');
        console.log('All env vars with CLAUDE:', Object.keys(process.env).filter(k => k.includes('CLAUDE')));
        console.log('process.env.CLAUDE_API_KEY value:', process.env.CLAUDE_API_KEY ? 'EXISTS' : 'UNDEFINED');
        if (!apiKey) {
            return '❌ **Error:** Claude API key not configured. Please check your .env file.\n\nTried loading from: ' + path.join(__dirname, '..', '.env');
        }
        try {
            const anthropic = new sdk_1.default({
                apiKey: apiKey
            });
            const response = yield anthropic.messages.create({
                model: 'claude-3-haiku-20240307',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                max_tokens: 2048,
                messages: [{
                        role: 'user',
                        content: userInput
                    }]
            });
            let formattedResponse = '';
            // Extract text from Claude's response
            for (const block of response.content) {
                if (block.type === 'text') {
                    formattedResponse += block.text;
                }
            }
            if (!formattedResponse) {
                return "No response received from Claude.";
            }
            // Format response with Markdown-like structure
            formattedResponse = formatAIResponse(formattedResponse);
            return formattedResponse;
        }
        catch (error) {
            const err = error;
            return `❌ **Error:** ${err.status || 'Unknown'} - ${err.message || 'Failed to connect to Claude API'}`;
        }
    });
}
function formatAIResponse(response) {
    return response
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Convert **bold** to <strong>
        .replace(/\/\/.*?!/g, "!") // Replace everything from // to ! with !
        .replace(/\n\s*\n/g, "<br><br>") // Add extra spacing between paragraphs
        .replace(/\n- /g, "<ul><li>") // Convert bullet points to lists
        .replace(/<\/li>\n/g, "</li>") // Ensure bullet points close properly
        .replace(/<ul><br>/g, "<ul>") // Fix bullet point formatting issues
        .replace(/```([\s\S]*?)```/g, (_, code) => {
        const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `
        <div class="code-block">
          <button class="copy-btn" onclick="copyCode(this)">Copy</button>
          <pre><code class="language-acspl">${escaped}</code></pre>
        </div>`;
    })
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Format generic code
        .replace(/\n/g, "<br>"); // Convert new lines to HTML <br> for spacing
}
function copyCode(buttonElement) {
    var _a;
    const codeBlock = (_a = buttonElement.nextElementSibling) === null || _a === void 0 ? void 0 : _a.querySelector("code");
    if (!codeBlock)
        return;
    const textToCopy = codeBlock.textContent || '';
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Copied!");
    }).catch(err => {
        alert("Failed to copy: " + err);
    });
}
function getWebviewContent() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Monty - AI Assistant</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
                color: #e0e0e0;
                padding: 0;
                margin: 0;
                min-height: 100vh;
                overflow: hidden;
            }

            /* Authentication Screen */
            #auth-screen {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 80vh;
                animation: fadeIn 0.5s ease-in;
            }

            #auth-screen.hidden {
                display: none;
            }

            .auth-container {
                background: rgba(45, 45, 68, 0.9);
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                max-width: 500px;
                width: 100%;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .auth-header {
                text-align: center;
                margin-bottom: 30px;
            }

            .auth-header img {
                width: 80px;
                height: 80px;
                margin-bottom: 20px;
                animation: bounce 2s infinite;
            }

            .auth-header h1 {
                font-size: 2em;
                color: #00d4ff;
                margin-bottom: 10px;
            }

            .auth-header p {
                color: #b0b0b0;
                font-size: 0.95em;
            }

            .auth-input-group {
                margin: 25px 0;
            }

            .auth-input-group label {
                display: block;
                margin-bottom: 10px;
                color: #00d4ff;
                font-weight: 600;
            }

            .auth-input-group input {
                width: 100%;
                padding: 15px;
                border-radius: 10px;
                border: 2px solid rgba(0, 212, 255, 0.3);
                background: rgba(30, 30, 46, 0.8);
                color: white;
                font-size: 1em;
                transition: all 0.3s;
            }

            .auth-input-group input:focus {
                outline: none;
                border-color: #00d4ff;
                box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
            }

            .auth-button {
                width: 100%;
                padding: 15px;
                border: none;
                border-radius: 10px;
                background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                color: white;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                margin-top: 10px;
            }

            .auth-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
            }

            .auth-button:active {
                transform: translateY(0);
            }

            .auth-button.secondary {
                background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                font-size: 0.95em;
                margin-top: 15px;
            }

            .auth-button.secondary:hover {
                box-shadow: 0 5px 20px rgba(108, 117, 125, 0.4);
            }

            #auth-message {
                margin-top: 20px;
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                display: none;
            }

            #auth-message.success {
                background: rgba(0, 212, 100, 0.2);
                border: 1px solid #00d464;
                color: #00ff88;
            }

            #auth-message.error {
                background: rgba(255, 82, 82, 0.2);
                border: 1px solid #ff5252;
                color: #ff8888;
            }

            /* Chat Screen */
            #chat-screen {
                display: none;
                animation: fadeIn 0.5s ease-in;
                height: 100vh;
            }

            #chat-screen.active {
                display: flex;
            }

            /* Sidebar */
            #sidebar {
                width: 260px;
                background: rgba(30, 30, 46, 0.95);
                border-right: 1px solid rgba(0, 212, 255, 0.2);
                display: flex;
                flex-direction: column;
                height: 100vh;
                overflow: hidden;
            }

            #sidebar-header {
                padding: 20px;
                background: rgba(45, 45, 68, 0.8);
                border-bottom: 1px solid rgba(0, 212, 255, 0.2);
            }

            #new-chat-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 0.95em;
            }

            #new-chat-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
            }

            #sessions-list {
                flex: 1;
                overflow-y: auto;
                padding: 10px;
            }

            #sessions-list::-webkit-scrollbar {
                width: 6px;
            }

            #sessions-list::-webkit-scrollbar-track {
                background: rgba(30, 30, 46, 0.5);
            }

            #sessions-list::-webkit-scrollbar-thumb {
                background: #00d4ff;
                border-radius: 3px;
            }

            .session-item {
                padding: 12px 15px;
                margin-bottom: 8px;
                background: rgba(45, 45, 68, 0.6);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                border: 1px solid transparent;
            }

            .session-item:hover {
                background: rgba(0, 212, 255, 0.1);
                border-color: rgba(0, 212, 255, 0.3);
            }

            .session-item.active {
                background: rgba(0, 212, 255, 0.2);
                border-color: #00d4ff;
            }

            .session-name {
                font-size: 0.9em;
                font-weight: 500;
                color: #e0e0e0;
                margin-bottom: 5px;
            }

            .session-time {
                font-size: 0.75em;
                color: #888;
            }

            .session-item {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .delete-session-btn {
                background: transparent;
                border: none;
                font-size: 1.2em;
                cursor: pointer;
                opacity: 0;
                transition: all 0.3s;
                padding: 5px;
            }

            .session-item:hover .delete-session-btn {
                opacity: 1;
            }

            .delete-session-btn:hover {
                transform: scale(1.2);
            }

            /* Main Chat Area */
            #main-chat-area {
                flex: 1;
                display: flex;
                flex-direction: column;
                height: 100vh;
                overflow: hidden;
            }

            #header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(45, 45, 68, 0.8);
                padding: 15px 20px;
                border-bottom: 1px solid rgba(0, 212, 255, 0.2);
                flex-shrink: 0;
            }

            .header-left {
                display: flex;
                align-items: center;
            }

            #header img {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                margin-right: 15px;
                border: 3px solid #00d4ff;
            }

            #header h2 {
                color: #00d4ff;
                font-size: 1.5em;
            }

            .header-buttons {
                display: flex;
                gap: 10px;
            }

            .header-button {
                padding: 8px 16px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s;
            }

            #renew-btn {
                background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
                color: white;
            }

            #renew-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(255, 165, 0, 0.4);
            }

            #clear-btn {
                background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
                color: white;
            }

            #clear-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
            }

            #content-wrapper {
                flex: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }

            #disclaimer {
                margin: 15px 20px;
                padding: 15px;
                border-left: 4px solid #00d4ff;
                background: rgba(0, 212, 255, 0.1);
                border-radius: 8px;
                font-size: 0.9em;
                flex-shrink: 0;
            }

            #disclaimer h3 {
                color: #00d4ff;
                margin-bottom: 8px;
                font-size: 1em;
            }

            #chat-container {
                display: flex;
                flex-direction: column;
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: rgba(30, 30, 46, 0.6);
            }

            #chat-container::-webkit-scrollbar {
                width: 8px;
            }

            #chat-container::-webkit-scrollbar-track {
                background: rgba(30, 30, 46, 0.5);
                border-radius: 10px;
            }

            #chat-container::-webkit-scrollbar-thumb {
                background: #00d4ff;
                border-radius: 10px;
            }

            .message {
                margin: 8px 0;
                padding: 15px 20px;
                border-radius: 15px;
                max-width: 80%;
                word-wrap: break-word;
                animation: messageSlideIn 0.3s ease-out;
            }

            @keyframes messageSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .user {
                background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                align-self: flex-end;
                text-align: right;
                color: white;
                box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
            }

            .ai {
                background: rgba(68, 68, 85, 0.9);
                align-self: flex-start;
                text-align: left;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }

            .code-block {
                position: relative;
                background: #1a1a2e;
                color: #dcdcdc;
                border-radius: 10px;
                margin: 1em 0;
                padding: 15px;
                border: 1px solid rgba(0, 212, 255, 0.3);
            }

            .copy-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #00d4ff;
                color: #1e1e2e;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s;
            }

            .copy-btn:hover {
                background: #00ffff;
                transform: scale(1.05);
            }

            pre {
                background: transparent;
                padding: 5px;
                border-radius: 5px;
                overflow-x: auto;
                margin: 0;
            }

            code {
                color: #00ffaa;
                font-family: 'Courier New', monospace;
            }

            .input-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
                background: rgba(45, 45, 68, 0.8);
                padding: 20px;
                border-top: 1px solid rgba(0, 212, 255, 0.2);
                flex-shrink: 0;
            }

            textarea {
                width: 100%;
                padding: 15px;
                border-radius: 10px;
                border: 2px solid rgba(0, 212, 255, 0.3);
                background: rgba(30, 30, 46, 0.8);
                color: white;
                resize: none;
                font-size: 1em;
                min-height: 80px;
                transition: all 0.3s;
            }

            textarea:focus {
                outline: none;
                border-color: #00d4ff;
                box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
            }

            input[type="file"] {
                padding: 10px;
                border-radius: 10px;
                border: 2px solid rgba(0, 212, 255, 0.3);
                background: rgba(30, 30, 46, 0.8);
                color: white;
                cursor: pointer;
            }

            input[type="file"]::file-selector-button {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                background: #00d4ff;
                color: #1e1e2e;
                font-weight: bold;
                cursor: pointer;
                margin-right: 10px;
            }

            input[type="file"]::file-selector-button:hover {
                background: #00ffff;
            }

            .send-btn {
                padding: 15px;
                border: none;
                border-radius: 10px;
                background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                color: white;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            }

            .send-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
            }

            .send-btn:active {
                transform: translateY(0);
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }

            strong {
                color: #00ffaa;
            }
        </style>
    </head>
    <body>
        <!-- Authentication Screen -->
        <div id="auth-screen">
            <div class="auth-container">
                <div class="auth-header">
                    <img src="https://cdn-icons-png.flaticon.com/512/5511/5511666.png" alt="Monty Icon" />
                    <h1>🐎 Welcome to Monty</h1>
                    <p>Your ACS AI Assistant</p>
                </div>
                <div class="auth-input-group">
                    <label for="special-code">Enter Your Special Code</label>
                    <input type="password" id="special-code" placeholder="Enter your access code..." onkeydown="if(event.key === 'Enter') authenticate()" />
                </div>
                <button class="auth-button" onclick="authenticate()">Start Chat</button>
                <button class="auth-button secondary" onclick="requestKey()">Request Access Key</button>
                <div id="auth-message"></div>
            </div>
        </div>

        <!-- Chat Screen -->
        <div id="chat-screen">
            <!-- Sidebar -->
            <div id="sidebar">
                <div id="sidebar-header">
                    <button id="new-chat-btn" onclick="newChat()">+ New Chat</button>
                </div>
                <div id="sessions-list">
                    <!-- Sessions will be loaded here dynamically -->
                </div>
            </div>

            <!-- Main Chat Area -->
            <div id="main-chat-area">
                <div id="header">
                    <div class="header-left">
                        <img src="https://cdn-icons-png.flaticon.com/512/5511/5511666.png" alt="Monty Icon" />
                        <h2>Monty AI Chat</h2>
                    </div>
                    <div class="header-buttons">
                        <button id="renew-btn" class="header-button" onclick="renewCode()">Renew Code</button>
                        <button id="clear-btn" class="header-button" onclick="clearChat()">Clear Chat</button>
                    </div>
                </div>

                <div id="content-wrapper">
                    <div id="disclaimer">
                        <h3>⚠️ Important Disclaimer</h3>
                        <p>The information provided here is AI-generated. While I strive for accuracy, always verify critical information with official documentation.</p>
                    </div>

                    <div id="chat-container"></div>
                </div>

                <div class="input-container">
                    <textarea id="message" placeholder="Ask Monty anything..." onkeydown="handleKeyPress(event)"></textarea>
                    <input type="file" id="fileUpload" accept=".pdf">
                    <button class="send-btn" onclick="sendMessage()">Send Message</button>
                </div>
            </div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            let chatHistory = [];
            let isAuthenticated = false;
            let currentSessionId = null;
            let sessions = [];

            // Authentication
            function authenticate() {
                alert('authenticate() function called!');
                console.log('=== authenticate() called ===');
                const codeInput = document.getElementById('special-code');
                console.log('codeInput element:', codeInput);

                if (!codeInput) {
                    alert('ERROR: Could not find special-code input element!');
                    return;
                }

                const code = codeInput.value.trim();
                console.log('Code value:', code ? 'has value' : 'empty');

                if (!code) {
                    alert('No code entered!');
                    showAuthMessage('Please enter your special code', 'error');
                    return;
                }

                console.log('Sending authenticate message to extension');
                showAuthMessage('Authenticating...', 'success');
                alert('About to send message with code: ' + code);

                vscode.postMessage({
                    command: 'authenticate',
                    code: code
                });
            }

            // Request Access Key
            function requestKey() {
                alert('requestKey() function called!');
                vscode.postMessage({
                    command: 'requestKey'
                });
                showAuthMessage('📧 Access key request sent! Please check your email.', 'success');
            }

            function showAuthMessage(text, type) {
                const msgDiv = document.getElementById('auth-message');
                msgDiv.textContent = text;
                msgDiv.className = type;
                msgDiv.style.display = 'block';
            }

            function showChatScreen() {
                document.getElementById('auth-screen').classList.add('hidden');
                document.getElementById('chat-screen').classList.add('active');
                isAuthenticated = true;
            }

            // Renew Code
            function renewCode() {
                if (!isAuthenticated) {
                    alert('Please authenticate first!');
                    return;
                }
                if (confirm('⚠️ Renew Access Code?\n\nYour current code will be invalidated and a new one will be generated.\n\nContinue?')) {
                    vscode.postMessage({ command: 'renewCode' });
                }
            }

            // Send Message
            function sendMessage() {
                if (!isAuthenticated) {
                    alert('Please authenticate first!');
                    return;
                }

                const messageInput = document.getElementById('message');
                const text = messageInput.value.trim();
                const fileInput = document.getElementById('fileUpload');
                const file = fileInput.files[0];

                if (file && text) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const fileContent = event.target.result;
                        vscode.postMessage({
                            command: 'uploadPDF',
                            filename: file.name,
                            content: fileContent,
                            query: text
                        });
                        appendMessage(text, 'user');
                        messageInput.value = '';
                        fileInput.value = '';
                    };
                    reader.readAsDataURL(file);
                    return;
                }

                if (text) {
                    appendMessage(text, 'user');
                    messageInput.value = '';
                    vscode.postMessage({ command: 'sendMessage', text: text });
                    return;
                }

                if (file) {
                    alert('Please enter a query along with the file.');
                    return;
                }

                alert('Please enter a message or upload a PDF.');
            }

            function appendMessage(text, sender) {
                const chatDiv = document.getElementById('chat-container');
                const msgDiv = document.createElement('div');
                msgDiv.className = sender + ' message';

                if (sender === 'ai') {
                    msgDiv.innerHTML = text;
                } else {
                    msgDiv.textContent = text;
                }

                chatDiv.appendChild(msgDiv);
                chatDiv.scrollTop = chatDiv.scrollHeight;

                chatHistory.push({ sender, text });
                // Messages now saved to Firebase, no need for localStorage
            }

            function copyCode(button) {
                const codeBlock = button.nextElementSibling.querySelector('code');
                if (!codeBlock) return;

                const textToCopy = codeBlock.textContent || '';
                navigator.clipboard.writeText(textToCopy).then(() => {
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = 'Copy';
                    }, 2000);
                }).catch(err => {
                    alert('Failed to copy: ' + err);
                });
            }

            window.addEventListener('message', event => {
                const message = event.data;
                console.log('=== Received message from extension ===', message.command);

                if (message.command === 'authResult') {
                    console.log('authResult received. Success:', message.success);
                    console.log('authResult message:', message.message);
                    if (message.success) {
                        showAuthMessage(message.message, 'success');
                        setTimeout(() => {
                            showChatScreen();
                        }, 1000);
                    } else {
                        showAuthMessage(message.message, 'error');
                    }
                }

                if (message.command === 'receiveMessage') {
                    appendMessage(message.text, 'ai');
                }

                if (message.command === 'codeRenewed') {
                    alert(message.message);
                }

                if (message.command === 'renewError') {
                    alert(message.message);
                }

                // Handle sessions loaded
                if (message.command === 'sessionsLoaded') {
                    sessions = message.sessions;
                    currentSessionId = message.currentSessionId;
                    renderSessions();
                }

                // Handle session loaded
                if (message.command === 'sessionLoaded') {
                    currentSessionId = message.sessionId;
                    document.getElementById('chat-container').innerHTML = '';
                    chatHistory = [];

                    // Load messages
                    message.messages.forEach(msg => {
                        appendMessage(msg.content, msg.role === 'user' ? 'user' : 'ai');
                    });

                    renderSessions();
                }

                // Handle chat cleared
                if (message.command === 'chatCleared') {
                    document.getElementById('chat-container').innerHTML = '';
                    chatHistory = [];
                }

                // Handle session created
                if (message.command === 'sessionCreated') {
                    document.getElementById('chat-container').innerHTML = '';
                    chatHistory = [];
                }

                // Handle session deleted
                if (message.command === 'sessionDeleted') {
                    // Clear chat if deleted session was current
                    const wasCurrentSession = (currentSessionId === message.sessionId);
                    if (wasCurrentSession) {
                        document.getElementById('chat-container').innerHTML = '';
                        chatHistory = [];
                    }
                    // Sessions list will be updated by sessionsLoaded message
                }

                // Handle delete error
                if (message.command === 'deleteError') {
                    alert(message.message);
                }
            });

            // Session Management Functions
            function renderSessions() {
                const sessionsList = document.getElementById('sessions-list');
                sessionsList.innerHTML = '';

                sessions.forEach(session => {
                    const sessionDiv = document.createElement('div');
                    sessionDiv.className = 'session-item' + (session.id === currentSessionId ? ' active' : '');

                    const sessionContent = document.createElement('div');
                    sessionContent.style.flex = '1';
                    sessionContent.onclick = () => loadSession(session.id);

                    const sessionName = document.createElement('div');
                    sessionName.className = 'session-name';
                    sessionName.textContent = session.sessionName || 'Unnamed Chat';

                    const sessionTime = document.createElement('div');
                    sessionTime.className = 'session-time';
                    const date = new Date(session.lastUpdated);
                    sessionTime.textContent = date.toLocaleString();

                    sessionContent.appendChild(sessionName);
                    sessionContent.appendChild(sessionTime);

                    // Delete button
                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '🗑️';
                    deleteBtn.className = 'delete-session-btn';
                    deleteBtn.onclick = (e) => {
                        e.stopPropagation();
                        deleteSession(session.id, session.sessionName);
                    };

                    sessionDiv.appendChild(sessionContent);
                    sessionDiv.appendChild(deleteBtn);
                    sessionsList.appendChild(sessionDiv);
                });
            }

            function newChat() {
                vscode.postMessage({
                    command: 'newSession'
                });
            }

            function loadSession(sessionId) {
                vscode.postMessage({
                    command: 'loadSession',
                    sessionId: sessionId
                });
            }

            function clearChat() {
                if (!isAuthenticated) {
                    alert('Please authenticate first!');
                    return;
                }
                if (confirm('🔄 Start New Chat?\n\nYour current chat will be saved to the sidebar.\n\nContinue?')) {
                    vscode.postMessage({
                        command: 'clearChat'
                    });
                }
            }

            function deleteSession(sessionId, sessionName) {
                if (confirm('Delete "' + sessionName + '"?\\n\\nThis action cannot be undone.\\n\\nContinue?')) {
                    vscode.postMessage({
                        command: 'deleteSession',
                        sessionId: sessionId
                    });
                }
            }

            function handleKeyPress(event) {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                }
            }

            // Allow Enter key in auth screen
            document.getElementById('special-code')?.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    authenticate();
                }
            });
        </script>
    </body>
    </html>
    `;
}
function getMontyWebviewContent() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Monty</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #2b2b2b 0%, #1a1a1a 100%);
                color: #e0e0e0;
                padding: 0;
                margin: 0;
                min-height: 100vh;
                overflow: hidden;
            }

            /* Authentication Screen */
            #auth-screen {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 80vh;
                animation: fadeIn 0.5s ease-in;
            }

            #auth-screen.hidden {
                display: none;
            }

            .auth-container {
                background: rgba(60, 60, 60, 0.9);
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                max-width: 500px;
                width: 100%;
                border: 1px solid rgba(220, 53, 69, 0.3);
            }

            .auth-header {
                text-align: center;
                margin-bottom: 30px;
            }

            .auth-header img {
                width: 80px;
                height: 80px;
                margin-bottom: 20px;
                animation: bounce 2s infinite;
            }

            .auth-header h1 {
                font-size: 2em;
                color: #dc3545;
                margin-bottom: 10px;
            }

            .auth-header p {
                color: #b0b0b0;
                font-size: 0.95em;
            }

            .auth-input-group {
                margin: 25px 0;
            }

            .auth-input-group label {
                display: block;
                margin-bottom: 10px;
                color: #dc3545;
                font-weight: 600;
            }

            .auth-input-group input {
                width: 100%;
                padding: 15px;
                border-radius: 10px;
                border: 2px solid rgba(220, 53, 69, 0.3);
                background: rgba(40, 40, 40, 0.8);
                color: white;
                font-size: 1em;
                transition: all 0.3s;
            }

            .auth-input-group input:focus {
                outline: none;
                border-color: #dc3545;
                box-shadow: 0 0 15px rgba(220, 53, 69, 0.3);
            }

            .auth-button {
                width: 100%;
                padding: 15px;
                border: none;
                border-radius: 10px;
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                color: white;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                margin-top: 10px;
            }

            .auth-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(220, 53, 69, 0.4);
            }

            .auth-button:active {
                transform: translateY(0);
            }

            .auth-button.secondary {
                background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                font-size: 0.95em;
                margin-top: 15px;
            }

            .auth-button.secondary:hover {
                box-shadow: 0 5px 20px rgba(108, 117, 125, 0.4);
            }

            #auth-message {
                margin-top: 20px;
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                display: none;
            }

            #auth-message.success {
                background: rgba(40, 167, 69, 0.2);
                border: 1px solid #28a745;
                color: #5cb85c;
            }

            #auth-message.error {
                background: rgba(220, 53, 69, 0.2);
                border: 1px solid #dc3545;
                color: #ff6b6b;
            }

            /* Chat Screen */
            #chat-screen {
                display: none;
                animation: fadeIn 0.5s ease-in;
                height: 100vh;
            }

            #chat-screen.active {
                display: flex;
            }

            /* Sidebar */
            #sidebar {
                width: 260px;
                background: rgba(40, 40, 40, 0.95);
                border-right: 1px solid rgba(220, 53, 69, 0.2);
                display: flex;
                flex-direction: column;
                height: 100vh;
                overflow: hidden;
            }

            #sidebar-header {
                padding: 20px;
                background: rgba(60, 60, 60, 0.8);
                border-bottom: 1px solid rgba(220, 53, 69, 0.2);
            }

            #new-chat-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 0.95em;
            }

            #new-chat-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
            }

            #sessions-list {
                flex: 1;
                overflow-y: auto;
                padding: 10px;
            }

            #sessions-list::-webkit-scrollbar {
                width: 6px;
            }

            #sessions-list::-webkit-scrollbar-track {
                background: rgba(40, 40, 40, 0.5);
            }

            #sessions-list::-webkit-scrollbar-thumb {
                background: #dc3545;
                border-radius: 3px;
            }

            .session-item {
                padding: 12px 15px;
                margin-bottom: 8px;
                background: rgba(60, 60, 60, 0.6);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                border: 1px solid transparent;
            }

            .session-item:hover {
                background: rgba(220, 53, 69, 0.1);
                border-color: rgba(220, 53, 69, 0.3);
            }

            .session-item.active {
                background: rgba(220, 53, 69, 0.2);
                border-color: #dc3545;
            }

            .session-name {
                font-size: 0.9em;
                font-weight: 500;
                color: #e0e0e0;
                margin-bottom: 5px;
            }

            .session-time {
                font-size: 0.75em;
                color: #888;
            }

            .session-item {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .delete-session-btn {
                background: transparent;
                border: none;
                font-size: 1.2em;
                cursor: pointer;
                opacity: 0;
                transition: all 0.3s;
                padding: 5px;
            }

            .session-item:hover .delete-session-btn {
                opacity: 1;
            }

            .delete-session-btn:hover {
                transform: scale(1.2);
            }

            /* Main Chat Area */
            #main-chat-area {
                flex: 1;
                display: flex;
                flex-direction: column;
                height: 100vh;
                overflow: hidden;
            }

            #header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(60, 60, 60, 0.8);
                padding: 15px 20px;
                border-bottom: 1px solid rgba(220, 53, 69, 0.2);
                flex-shrink: 0;
            }

            .header-left {
                display: flex;
                align-items: center;
            }

            #header img {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                margin-right: 15px;
                border: 3px solid #dc3545;
            }

            #header h2 {
                color: #dc3545;
                font-size: 1.5em;
            }

            .header-buttons {
                display: flex;
                gap: 10px;
            }

            .header-button {
                padding: 8px 16px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s;
            }

            #renew-btn {
                background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
                color: white;
            }

            #renew-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(255, 165, 0, 0.4);
            }

            #clear-btn {
                background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                color: white;
            }

            #clear-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(108, 117, 125, 0.4);
            }

            #content-wrapper {
                flex: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }

            #disclaimer {
                margin: 15px 20px;
                padding: 15px;
                border-left: 4px solid #dc3545;
                background: rgba(220, 53, 69, 0.1);
                border-radius: 8px;
                font-size: 0.9em;
                flex-shrink: 0;
            }

            #disclaimer h3 {
                color: #dc3545;
                margin-bottom: 8px;
                font-size: 1em;
            }

            #chat-container {
                display: flex;
                flex-direction: column;
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: rgba(40, 40, 40, 0.6);
            }

            #chat-container::-webkit-scrollbar {
                width: 8px;
            }

            #chat-container::-webkit-scrollbar-track {
                background: rgba(40, 40, 40, 0.5);
                border-radius: 10px;
            }

            #chat-container::-webkit-scrollbar-thumb {
                background: #dc3545;
                border-radius: 10px;
            }

            .message {
                margin: 8px 0;
                padding: 15px 20px;
                border-radius: 15px;
                max-width: 80%;
                word-wrap: break-word;
                animation: messageSlideIn 0.3s ease-out;
            }

            @keyframes messageSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .user {
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                align-self: flex-end;
                text-align: right;
                color: white;
                box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
            }

            .ai {
                background: rgba(80, 80, 80, 0.9);
                align-self: flex-start;
                text-align: left;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }

            .code-block {
                position: relative;
                background: #1a1a1a;
                color: #dcdcdc;
                border-radius: 10px;
                margin: 1em 0;
                padding: 15px;
                border: 1px solid rgba(220, 53, 69, 0.3);
            }

            .copy-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #dc3545;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s;
            }

            .copy-btn:hover {
                background: #c82333;
                transform: scale(1.05);
            }

            pre {
                background: transparent;
                padding: 5px;
                border-radius: 5px;
                overflow-x: auto;
                margin: 0;
            }

            code {
                color: #ff6b6b;
                font-family: 'Courier New', monospace;
            }

            .input-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
                background: rgba(60, 60, 60, 0.8);
                padding: 20px;
                border-top: 1px solid rgba(220, 53, 69, 0.2);
                flex-shrink: 0;
            }

            textarea {
                width: 100%;
                padding: 15px;
                border-radius: 10px;
                border: 2px solid rgba(220, 53, 69, 0.3);
                background: rgba(40, 40, 40, 0.8);
                color: white;
                resize: none;
                font-size: 1em;
                min-height: 80px;
                transition: all 0.3s;
            }

            textarea:focus {
                outline: none;
                border-color: #dc3545;
                box-shadow: 0 0 15px rgba(220, 53, 69, 0.3);
            }

            input[type="file"] {
                padding: 10px;
                border-radius: 10px;
                border: 2px solid rgba(220, 53, 69, 0.3);
                background: rgba(40, 40, 40, 0.8);
                color: white;
                cursor: pointer;
            }

            input[type="file"]::file-selector-button {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                background: #dc3545;
                color: white;
                font-weight: bold;
                cursor: pointer;
                margin-right: 10px;
            }

            input[type="file"]::file-selector-button:hover {
                background: #c82333;
            }

            .send-btn {
                padding: 15px;
                border: none;
                border-radius: 10px;
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                color: white;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            }

            .send-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(220, 53, 69, 0.4);
            }

            .send-btn:active {
                transform: translateY(0);
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }

            strong {
                color: #ff6b6b;
            }
        </style>
    </head>
    <body>
        <!-- Authentication Screen -->
        <div id="auth-screen">
            <div class="auth-container">
                <div class="auth-header">
                    <img src="https://cdn-icons-png.flaticon.com/512/5511/5511666.png" alt="Monty Icon" />
                    <h1>🐎 Welcome to Monty</h1>
                    <p>Your ACS AI Assistant</p>
                </div>
                <div class="auth-input-group">
                    <label for="special-code">Enter Your Special Code</label>
                    <input type="password" id="special-code" placeholder="Enter your access code..." onkeydown="if(event.key === 'Enter') authenticate()" />
                </div>
                <button class="auth-button" onclick="authenticate()">Start Chat</button>
                <button class="auth-button secondary" onclick="requestKey()">Request Access Key</button>
                <div id="auth-message"></div>
            </div>
        </div>

        <!-- Chat Screen -->
        <div id="chat-screen">
            <!-- Sidebar -->
            <div id="sidebar">
                <div id="sidebar-header">
                    <button id="new-chat-btn" onclick="newChat()">+ New Chat</button>
                </div>
                <div id="sessions-list">
                    <!-- Sessions will be loaded here dynamically -->
                </div>
            </div>

            <!-- Main Chat Area -->
            <div id="main-chat-area">
                <div id="header">
                    <div class="header-left">
                        <img src="https://cdn-icons-png.flaticon.com/512/5511/5511666.png" alt="Monty Icon" />
                        <h2>Monty Chat</h2>
                    </div>
                    <div class="header-buttons">
                        <button id="renew-btn" class="header-button" onclick="renewCode()">Renew Code</button>
                        <button id="clear-btn" class="header-button" onclick="clearChat()">Clear Chat</button>
                    </div>
                </div>

                <div id="content-wrapper">
                    <div id="disclaimer">
                        <h3>⚠️ Important Disclaimer</h3>
                        <p>The information provided here is AI-generated. While I strive for accuracy, always verify critical information with official documentation.</p>
                    </div>

                    <div id="chat-container"></div>
                </div>

                <div class="input-container">
                    <textarea id="message" placeholder="Ask Monty anything..." onkeydown="handleKeyPress(event)"></textarea>
                    <input type="file" id="fileUpload" accept=".pdf">
                    <button class="send-btn" onclick="sendMessage()">Send Message</button>
                </div>
            </div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            let chatHistory = [];
            let isAuthenticated = false;
            let currentSessionId = null;
            let sessions = [];

            // Authentication
            function authenticate() {
                const codeInput = document.getElementById('special-code');
                const code = codeInput.value.trim();

                if (!code) {
                    showAuthMessage('Please enter your special code', 'error');
                    return;
                }

                showAuthMessage('Authenticating...', 'success');

                vscode.postMessage({
                    command: 'authenticate',
                    code: code
                });
            }

            // Request Access Key
            function requestKey() {
                vscode.postMessage({
                    command: 'requestKey'
                });
                showAuthMessage('📧 Access key request sent! Please check your email.', 'success');
            }

            function showAuthMessage(text, type) {
                const msgDiv = document.getElementById('auth-message');
                msgDiv.textContent = text;
                msgDiv.className = type;
                msgDiv.style.display = 'block';
            }

            function showChatScreen() {
                document.getElementById('auth-screen').classList.add('hidden');
                document.getElementById('chat-screen').classList.add('active');
                isAuthenticated = true;
            }

            // Renew Code
            function renewCode() {
                if (!isAuthenticated) {
                    alert('Please authenticate first!');
                    return;
                }
                if (confirm('⚠️ Renew Access Code?\\n\\nYour current code will be invalidated and a new one will be generated.\\n\\nContinue?')) {
                    vscode.postMessage({ command: 'renewCode' });
                }
            }

            // Send Message
            function sendMessage() {
                if (!isAuthenticated) {
                    alert('Please authenticate first!');
                    return;
                }

                const messageInput = document.getElementById('message');
                const text = messageInput.value.trim();
                const fileInput = document.getElementById('fileUpload');
                const file = fileInput.files[0];

                if (file && text) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const fileContent = event.target.result;
                        vscode.postMessage({
                            command: 'uploadPDF',
                            filename: file.name,
                            content: fileContent,
                            query: text
                        });
                        appendMessage(text, 'user');
                        messageInput.value = '';
                        fileInput.value = '';
                    };
                    reader.readAsDataURL(file);
                    return;
                }

                if (text) {
                    appendMessage(text, 'user');
                    messageInput.value = '';
                    vscode.postMessage({ command: 'sendMessage', text: text });
                    return;
                }

                if (file) {
                    alert('Please enter a query along with the file.');
                    return;
                }

                alert('Please enter a message or upload a PDF.');
            }

            function appendMessage(text, sender) {
                const chatDiv = document.getElementById('chat-container');
                const msgDiv = document.createElement('div');
                msgDiv.className = sender + ' message';

                if (sender === 'ai') {
                    msgDiv.innerHTML = text;
                } else {
                    msgDiv.textContent = text;
                }

                chatDiv.appendChild(msgDiv);
                chatDiv.scrollTop = chatDiv.scrollHeight;

                chatHistory.push({ sender, text });
            }

            function copyCode(button) {
                const codeBlock = button.nextElementSibling.querySelector('code');
                if (!codeBlock) return;

                const textToCopy = codeBlock.textContent || '';
                navigator.clipboard.writeText(textToCopy).then(() => {
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = 'Copy';
                    }, 2000);
                }).catch(err => {
                    alert('Failed to copy: ' + err);
                });
            }

            window.addEventListener('message', event => {
                const message = event.data;

                if (message.command === 'authResult') {
                    if (message.success) {
                        showAuthMessage(message.message, 'success');
                        setTimeout(() => {
                            showChatScreen();
                        }, 1000);
                    } else {
                        showAuthMessage(message.message, 'error');
                    }
                }

                if (message.command === 'receiveMessage') {
                    appendMessage(message.text, 'ai');
                }

                if (message.command === 'codeRenewed') {
                    alert(message.message);
                }

                if (message.command === 'renewError') {
                    alert(message.message);
                }

                // Handle sessions loaded
                if (message.command === 'sessionsLoaded') {
                    sessions = message.sessions;
                    currentSessionId = message.currentSessionId;
                    renderSessions();
                }

                // Handle session loaded
                if (message.command === 'sessionLoaded') {
                    currentSessionId = message.sessionId;
                    document.getElementById('chat-container').innerHTML = '';
                    chatHistory = [];

                    // Load messages
                    message.messages.forEach(msg => {
                        appendMessage(msg.content, msg.role === 'user' ? 'user' : 'ai');
                    });

                    renderSessions();
                }

                // Handle chat cleared
                if (message.command === 'chatCleared') {
                    document.getElementById('chat-container').innerHTML = '';
                    chatHistory = [];
                }

                // Handle session created
                if (message.command === 'sessionCreated') {
                    document.getElementById('chat-container').innerHTML = '';
                    chatHistory = [];
                }

                // Handle session deleted
                if (message.command === 'sessionDeleted') {
                    // Clear chat if deleted session was current
                    const wasCurrentSession = (currentSessionId === message.sessionId);
                    if (wasCurrentSession) {
                        document.getElementById('chat-container').innerHTML = '';
                        chatHistory = [];
                    }
                    // Sessions list will be updated by sessionsLoaded message
                }

                // Handle delete error
                if (message.command === 'deleteError') {
                    alert(message.message);
                }
            });

            // Session Management Functions
            function renderSessions() {
                const sessionsList = document.getElementById('sessions-list');
                sessionsList.innerHTML = '';

                sessions.forEach(session => {
                    const sessionDiv = document.createElement('div');
                    sessionDiv.className = 'session-item' + (session.id === currentSessionId ? ' active' : '');

                    const sessionContent = document.createElement('div');
                    sessionContent.style.flex = '1';
                    sessionContent.onclick = () => loadSession(session.id);

                    const sessionName = document.createElement('div');
                    sessionName.className = 'session-name';
                    sessionName.textContent = session.sessionName || 'Unnamed Chat';

                    const sessionTime = document.createElement('div');
                    sessionTime.className = 'session-time';
                    const date = new Date(session.lastUpdated);
                    sessionTime.textContent = date.toLocaleString();

                    sessionContent.appendChild(sessionName);
                    sessionContent.appendChild(sessionTime);

                    // Delete button
                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '🗑️';
                    deleteBtn.className = 'delete-session-btn';
                    deleteBtn.onclick = (e) => {
                        e.stopPropagation();
                        deleteSession(session.id, session.sessionName);
                    };

                    sessionDiv.appendChild(sessionContent);
                    sessionDiv.appendChild(deleteBtn);
                    sessionsList.appendChild(sessionDiv);
                });
            }

            function newChat() {
                vscode.postMessage({
                    command: 'newSession'
                });
            }

            function loadSession(sessionId) {
                vscode.postMessage({
                    command: 'loadSession',
                    sessionId: sessionId
                });
            }

            function clearChat() {
                if (!isAuthenticated) {
                    alert('Please authenticate first!');
                    return;
                }
                if (confirm('🔄 Start New Chat?\\n\\nYour current chat will be saved to the sidebar.\\n\\nContinue?')) {
                    vscode.postMessage({
                        command: 'clearChat'
                    });
                }
            }

            function deleteSession(sessionId, sessionName) {
                if (confirm('Delete "' + sessionName + '"?\\n\\nThis action cannot be undone.\\n\\nContinue?')) {
                    vscode.postMessage({
                        command: 'deleteSession',
                        sessionId: sessionId
                    });
                }
            }

            function handleKeyPress(event) {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                }
            }

            // Allow Enter key in auth screen
            document.getElementById('special-code')?.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    authenticate();
                }
            });
        </script>
    </body>
    </html>
    `;
}
//# sourceMappingURL=extension.js.map