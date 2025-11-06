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
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const execFile = __importStar(require("child_process"));
const process = __importStar(require("process"));
const fs = __importStar(require("fs")); // Check if file exists in file system.
const path = __importStar(require("path")); // Import path module to handle paths easily
const crypto = __importStar(require("crypto")); // For SHA256 hashing
const admin = __importStar(require("firebase-admin")); // Firebase Admin SDK
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables - try multiple paths
const envPath1 = path.join(__dirname, '..', '.env');
const envPath2 = path.join(__dirname, '..', '..', '.env');
const envPath3 = 'c:\\Projects\\VSC-ACSPL\\.env'; // Absolute fallback
console.log('__dirname:', __dirname);
console.log('Trying env paths:', envPath1, envPath2, envPath3);
if (fs.existsSync(envPath1)) {
    const result = dotenv.config({ path: envPath1 });
    console.log('✅ Loaded .env from:', envPath1);
    if (result.error) {
        console.error('❌ Error loading .env:', result.error);
    }
}
else if (fs.existsSync(envPath2)) {
    const result = dotenv.config({ path: envPath2 });
    console.log('✅ Loaded .env from:', envPath2);
    if (result.error) {
        console.error('❌ Error loading .env:', result.error);
    }
}
else if (fs.existsSync(envPath3)) {
    const result = dotenv.config({ path: envPath3 });
    console.log('✅ Loaded .env from:', envPath3, '(fallback)');
    if (result.error) {
        console.error('❌ Error loading .env:', result.error);
    }
}
else {
    console.error('❌ .env file not found at:', envPath1, 'or', envPath2, 'or', envPath3);
}
// Firebase configuration and initialization
let firebaseInitialized = false;
function initializeFirebase(context) {
    if (firebaseInitialized) {
        return;
    }
    try {
        // Get Firebase config from VSCode settings or use service account file
        const config = vscode.workspace.getConfiguration('acspl');
        const serviceAccountPath = config.get('firebaseServiceAccountPath');
        if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: config.get('firebaseDatabaseURL')
            });
            firebaseInitialized = true;
        }
        else {
            console.warn('Firebase service account not configured. Chat authentication will be disabled.');
        }
    }
    catch (error) {
        console.error('Failed to initialize Firebase:', error);
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
// Verify special code with Firebase
function verifySpecialCode(code) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!firebaseInitialized) {
            return false;
        }
        try {
            const db = admin.database();
            const usersRef = db.ref('users');
            const snapshot = yield usersRef.orderByChild('specialCode').equalTo(code).once('value');
            if (snapshot.exists()) {
                const userData = Object.values(snapshot.val())[0];
                return userData.isActive === true;
            }
            return false;
        }
        catch (error) {
            console.error('Error verifying special code:', error);
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
let disposable = vscode.commands.registerCommand('acspl.askAI', () => __awaiter(void 0, void 0, void 0, function* () {
    const panel = vscode.window.createWebviewPanel('montyChat', 'Monty - ACS AI Assistant', vscode.ViewColumn.One, { enableScripts: true });
    let isAuthenticated = false;
    let userCode = null;
    panel.webview.html = getWebviewContent();
    panel.webview.onDidReceiveMessage((message) => __awaiter(void 0, void 0, void 0, function* () {
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
            const isValid = yield verifySpecialCode(code);
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
            }
            else {
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
                const newCode = yield renewUserCode(userCode);
                if (newCode) {
                    userCode = newCode;
                    panel.webview.postMessage({
                        command: 'codeRenewed',
                        newCode: newCode,
                        message: `✅ Your new special code is: ${newCode}\n\nPlease save it securely!`
                    });
                }
                else {
                    panel.webview.postMessage({
                        command: 'renewError',
                        message: '❌ Failed to renew code. Please try again later.'
                    });
                }
            }
            else {
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
                response = yield queryAIWithPdf(`${systemIntro} ${userInput}`, uploadedPdfText);
            }
            else {
                response = yield getAIResponse(`${systemIntro} ${userInput}`);
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
                const pdfData = yield (0, pdf_parse_1.default)(pdfBuffer);
                uploadedPdfText = pdfData.text;
                if (message.query.trim()) {
                    const response = yield queryAIWithPdf(`${systemIntro} ${message.query}`, uploadedPdfText);
                    panel.webview.postMessage({ command: 'receiveMessage', text: response });
                }
                else {
                    panel.webview.postMessage({ command: 'receiveMessage', text: '✅ PDF uploaded successfully! Now enter a query.' });
                }
            }
            catch (error) {
                console.error("Error processing PDF:", error);
                panel.webview.postMessage({ command: 'receiveMessage', text: '❌ Error reading PDF. Please try again.' });
            }
        }
    }));
}));
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
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: 'acsplext' }, new VariableCompletionProvider(), ' ', '\t', '=', '(' // Adjust triggers for your syntax
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
        const apiKey = process.env.CLAUDE_API_KEY;
        console.log('API Key check:', apiKey ? 'Found (length: ' + apiKey.length + ')' : 'NOT FOUND');
        console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('CLAUDE')));
        if (!apiKey) {
            return '❌ **Error:** Claude API key not configured. Please check your .env file.\n\nTried loading from: ' + path.join(__dirname, '..', '.env');
        }
        try {
            const anthropic = new sdk_1.default({
                apiKey: apiKey
            });
            const response = yield anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
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
                padding: 20px;
                min-height: 100vh;
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
            }

            #chat-screen.active {
                display: block;
            }

            #header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
                background: rgba(45, 45, 68, 0.8);
                padding: 15px 20px;
                border-radius: 15px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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

            #disclaimer {
                margin-bottom: 20px;
                padding: 15px;
                border-left: 4px solid #00d4ff;
                background: rgba(0, 212, 255, 0.1);
                border-radius: 8px;
                font-size: 0.9em;
            }

            #disclaimer h3 {
                color: #00d4ff;
                margin-bottom: 8px;
                font-size: 1em;
            }

            #chat-container {
                display: flex;
                flex-direction: column;
                max-height: 500px;
                overflow-y: auto;
                padding: 20px;
                border-radius: 15px;
                background: rgba(30, 30, 46, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.1);
                margin-bottom: 20px;
                box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
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
                border-radius: 15px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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
                    <input type="password" id="special-code" placeholder="Enter your access code..." />
                </div>
                <button class="auth-button" onclick="authenticate()">Start Chat</button>
                <div id="auth-message"></div>
            </div>
        </div>

        <!-- Chat Screen -->
        <div id="chat-screen">
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

            <div id="disclaimer">
                <h3>⚠️ Important Disclaimer</h3>
                <p>The information provided here is AI-generated. While I strive for accuracy, always verify critical information with official documentation.</p>
            </div>

            <div id="chat-container"></div>

            <div class="input-container">
                <textarea id="message" placeholder="Ask Monty anything..." onkeydown="handleKeyPress(event)"></textarea>
                <input type="file" id="fileUpload" accept=".pdf">
                <button class="send-btn" onclick="sendMessage()">Send Message</button>
            </div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
            let isAuthenticated = false;

            // Authentication
            function authenticate() {
                const codeInput = document.getElementById('special-code');
                const code = codeInput.value.trim();

                if (!code) {
                    showAuthMessage('Please enter your special code', 'error');
                    return;
                }

                vscode.postMessage({
                    command: 'authenticate',
                    code: code
                });
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
                loadChatHistory();
            }

            // Renew Code
            function renewCode() {
                if (confirm('Do you want to renew your access code? Your old code will be invalidated.')) {
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
                localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
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
            });

            function loadChatHistory() {
                chatHistory.forEach(msg => appendMessage(msg.text, msg.sender));
            }

            function clearChat() {
                if (confirm('Are you sure you want to clear the chat history?')) {
                    document.getElementById('chat-container').innerHTML = '';
                    localStorage.removeItem('chatHistory');
                    chatHistory = [];
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
function deactivate() { }
