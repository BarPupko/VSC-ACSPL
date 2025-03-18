"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const axios_1 = require("axios");
const execFile = require("child_process");
const fs = require("fs"); // Check if file exists in file system.
const path = require("path"); // Import path module to handle paths easily
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
let disposable = vscode.commands.registerCommand('acspl.askAI', async () => {
    // Ask for a password before opening Monty
    const password = await vscode.window.showInputBox({
        prompt: 'Enter password to start Monty:',
        password: true
    });
    if (password !== '1234') { // Change this to your actual password
        vscode.window.showErrorMessage('Incorrect password! Access denied.');
        return;
    }
    // Create a new Webview Panel for "Monty"
    const panel = vscode.window.createWebviewPanel('montyChat', 'Monty - AI Assistant', vscode.ViewColumn.One, { enableScripts: true, retainContextWhenHidden: true });
    // Load the initial HTML
    panel.webview.html = getWebviewContent();
    // Listen for messages from the Webview
    panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === 'sendMessage') {
            const userInput = message.text;
            const aiResponse = await getAIResponse(userInput);
            panel.webview.postMessage({ command: 'receiveMessage', text: aiResponse });
        }
    });
});
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
    context.subscriptions.push(vscode.commands.registerCommand("acspl.askQuestion", async () => {
        const answer = await vscode.window.showInformationMessage("How's the extension, do you enjoy it?", "Yes", "No");
        if (answer === "No") {
            vscode.window.showInformationMessage("Sorry to hear that, you can address your problem to barp@acsmotioncontrol.com");
        }
        else if (answer === "Yes") {
            vscode.window.showInformationMessage("Great to hear :), Please rate us on the marketplace.");
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand("acspl.OpenMMI", async () => {
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
            const selectedVersion = await vscode.window.showQuickPick(versions.map(v => v.version), {
                placeHolder: "Select a version to start",
            });
            if (selectedVersion) {
                const selectedPath = versions.find(v => v.version === selectedVersion)?.fullPath;
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
    }));
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
    context.subscriptions.push(vscode.commands.registerCommand("acspl.JoinUs", async () => {
        const selectedLocation = await vscode.window.showQuickPick(["ISRAEL", "CHINA", "GERMANY", "USA"], { placeHolder: "Select a location to view career opportunities" });
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
    }));
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
    context.subscriptions.push(vscode.commands.registerCommand("acspl.DeveloperEmail", async () => {
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
    }));
} // end of activate function
exports.activate = activate;
// Function to get AI response from Gemini
async function getAIResponse(userInput) {
    const apiKey = 'AIzaSyBDU5lpolgT-6W_gYdQeYASXqIikl9QamE'; // Replace with your actual key
    try {
        const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            contents: [{ parts: [{ text: userInput }] }]
        });
        let formattedResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
        // Format response with Markdown-like structure
        formattedResponse = formatAIResponse(formattedResponse);
        return formattedResponse;
    }
    catch (error) {
        const err = error; // or use `as AxiosError` if using Axios
        return `❌ **Error:** ${err.response?.status} - ${err.response?.data?.error?.message || err.message}`;
    }
}
function formatAIResponse(response) {
    return response
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Convert **bold** to <strong>
        .replace(/\n\s*\n/g, "<br><br>") // Add extra spacing between paragraphs
        .replace(/\n- /g, "<ul><li>") // Convert bullet points to lists
        .replace(/<\/li>\n/g, "</li>") // Ensure bullet points close properly
        .replace(/<ul><br>/g, "<ul>") // Fix bullet point formatting issues
        .replace(/```python([\s\S]*?)```/g, '<pre><code class="language-python">$1</code></pre>') // Format Python code
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Format generic code
        .replace(/\n/g, "<br>"); // Convert new lines to HTML <br> for spacing
}
// Function to generate Webview content (HTML + JavaScript)
function getWebviewContent() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title> Monty - AI Assistant</title>
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
            textarea { 
                width: 100%; height: 80px; padding: 8px; border-radius: 5px; 
                border: 1px solid #555; background: #333; color: white;
                resize: none;
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
            }
            #clear-btn {
                background: red;
            }
        </style>
    </head>
    <body>
        <div id="header">
            <div style="display: flex; align-items: center;">
                <img src="https://cdn-icons-png.flaticon.com/512/5511/5511666.png" alt="Monty Icon" />
                <h2>  Monty - AI Chat</h2>
            </div>
            <button id="clear-btn" onclick="clearChat()">Clear Chat</button>
        </div>

        <div id="chat-container"></div>

        <div class="input-container">
            <textarea id="message" placeholder="Ask Monty..." onkeydown="handleKeyPress(event)"></textarea>
            <button onclick="sendMessage()">Send</button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

            function sendMessage() {
                const messageInput = document.getElementById('message');
                const text = messageInput.value.trim();
                if (!text) return;

                appendMessage(text, 'user');
                messageInput.value = '';

                vscode.postMessage({ command: 'sendMessage', text: text });
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
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map