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
const axios_1 = __importDefault(require("axios"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const execFile = __importStar(require("child_process"));
const fs = __importStar(require("fs")); // Check if file exists in file system.
const path = __importStar(require("path")); // Import path module to handle paths easily
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
    const panel = vscode.window.createWebviewPanel('montyChat', 'Monty - ACS AI Assistant', // 🟢 Sets the title to reflect the assistant's identity
    vscode.ViewColumn.One, { enableScripts: true });
    panel.webview.html = getWebviewContent();
    // 🟢 Send an introduction message when the assistant starts
    // Removed invalid onDidLoad event
    panel.webview.postMessage({
        command: 'receiveMessage',
        text: `👋 Hello! I’m 🐎Monty - Your ACS AI Assistant.\n How can I help you today?`
    });
    panel.webview.onDidReceiveMessage((message) => __awaiter(void 0, void 0, void 0, function* () {
        const systemIntro = "You are Monty, an AI assistant specialized in ACS Motion Control and technical guidance.";
        if (message.command === 'sendMessage') {
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
        if (message.command === 'uploadPDF') {
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
// Function to get AI response from Gemini
function getAIResponse(userInput) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const apiKey = 'AIzaSyBDU5lpolgT-6W_gYdQeYASXqIikl9QamE'; // Replace with your actual key
        try {
            const response = yield axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                contents: [{ parts: [{ text: userInput }] }]
            });
            let formattedResponse = ((_f = (_e = (_d = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.candidates) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.parts) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.text) || "No response received.";
            // Format response with Markdown-like structure
            formattedResponse = formatAIResponse(formattedResponse);
            return formattedResponse;
        }
        catch (error) {
            const err = error; // or use `as AxiosError` if using Axios
            return `❌ **Error:** ${(_g = err.response) === null || _g === void 0 ? void 0 : _g.status} - ${((_k = (_j = (_h = err.response) === null || _h === void 0 ? void 0 : _h.data) === null || _j === void 0 ? void 0 : _j.error) === null || _k === void 0 ? void 0 : _k.message) || err.message}`;
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
            body { 
                font-family: Arial, sans-serif; 
                background: #1e1e1e; 
                color: white; 
                padding: 10px; 
            }
            #chat-container {
                display: flex; flex-direction: column; max-height: 500px; overflow-y: auto;
                border: 2px solid #444; padding: 10px; border-radius: 10px; 
                background: #252526;
            }
            .message { margin: 5px 0; padding: 10px; border-radius: 10px; }
            .user { background: #007acc; align-self: flex-end; text-align: right; }
            .ai { background: #444; align-self: flex-start; text-align: left; }
            pre { background: #333; padding: 5px; border-radius: 5px; overflow-x: auto; }
            code { color: #ffcc00; }
            .input-container {
                display: flex; flex-direction: column; margin-top: 10px;
            }
            textarea, input[type="file"] { 
                width: 100%; padding: 8px; border-radius: 5px; 
                border: 1px solid #555; background: #333; color: white;
                resize: none;
                margin-top: 5px;
            }
            button { 
                padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer;
                background: #007acc; color: white; margin-top: 5px;
            }
            button:hover { background: #005fa3; }
            #header {
                display: flex; align-items: center; justify-content: space-between;
                margin-bottom: 10px;
            }
            #header img {
                width: 40px; height: 40px; border-radius: 50%;
                margin-right: 10px;
            }
            #clear-btn {
                background: red;
                padding: 6px 10px;
                font-weight: bold;
            }
            #disclaimer {
                margin-top: 10px;
                padding: 8px;
                border-left: 4px solid #007acc;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
            }
            h3 {
                color: #ffcc00;
                margin: 5px 0;
                font-size: 1.1em;
            }
            a {
                color: #00aaff;
                text-decoration: underline;
                cursor: pointer;
                display: block;
                margin-top: 5px;
            }
            a:hover {
                color: #0088cc;
            }
            .code-block {
            position: relative;
            background: #1e1e1e;
            color: #dcdcdc;
            border-radius: 10px;
            margin: 1em 0;
            }

            .copy-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #007acc;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            }
        </style>
    </head>
    <body>
        <div id="header">
            <div style="display: flex; align-items: center;">
                <img src="https://cdn-icons-png.flaticon.com/512/5511/5511666.png" alt="Monty Icon" />
                <h2>Monty - AI Chat</h2>
            </div>
            <button id="clear-btn" onclick="clearChat()">Clear Chat</button>
        </div>

        <div id="disclaimer">
            <h3>Important Disclaimer:</h3>
            <a>Please be aware that the information provided here is based on an AI model. 
            While I strive for accuracy, AI-generated content may contain errors. 
            Always verify critical information with official documentation.</a>
        </div>

        <div id="chat-container"></div>

        <!-- Input Area for Query & File -->
        <div class="input-container">
            <textarea id="message" placeholder="Ask Monty..." onkeydown="handleKeyPress(event)"></textarea>
            <input type="file" id="fileUpload" accept=".pdf">
            <button onclick="sendMessage()">Send</button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

            function sendMessage() {
                const messageInput = document.getElementById('message');
                const text = messageInput.value.trim();
                const fileInput = document.getElementById('fileUpload');
                const file = fileInput.files[0];

                // Case 1: If both query and file are provided
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
                        messageInput.value = '';  // Clear text area
                        fileInput.value = '';  // Clear file input
                    };
                    reader.readAsDataURL(file);
                    return;
                }

                // Case 2: If only query is provided
                if (text) {
                    appendMessage(text, 'user');
                    messageInput.value = '';  // Clear text area
                    vscode.postMessage({ command: 'sendMessage', text: text });
                    return;
                }

                // Case 3: If only file is uploaded without query
                if (file) {
                    alert('Please enter a query along with the file.');
                    return;
                }

                // Case 4: If nothing is provided
                alert('Please enter a query or upload a PDF.');
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

            window.addEventListener('message', event => {
                const message = event.data;
                if (message.command === 'receiveMessage') {
                    appendMessage(message.text, 'ai');
                } else if (message.command === 'clearChat') {
                    clearChat();
                }
            });

            function loadChatHistory() {
                chatHistory.forEach(msg => appendMessage(msg.text, msg.sender));
            }

            function clearChat() {
                document.getElementById('chat-container').innerHTML = '';
                localStorage.removeItem('chatHistory');
                chatHistory = [];
                vscode.postMessage({ command: 'clearChat' });
            }

            function handleKeyPress(event) {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                }
            }

            loadChatHistory();
        </script>
    </body>
    </html>
    `;
}
function deactivate() { }
