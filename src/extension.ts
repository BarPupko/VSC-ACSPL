// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as os from "os";
import axios from 'axios';
import pdf from 'pdf-parse';
import * as execFile from "child_process";
import Mocha from 'mocha';
import glob from 'glob';

import * as process from "process"; 
import * as psNode from "ps-node"; // Using to check if process is in work.
import * as fs from "fs"; // Check if file exists in file system.
import * as path from 'path'; // Import path module to handle paths easily
const legend = new vscode.SemanticTokensLegend(['variable', 'keyword', 'type'], []);

class VariableCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.CompletionItem[] {

        const text = document.getText();
        const variables = extractVariables(text);

        return variables.map(varName => {
            const item = new vscode.CompletionItem(varName, vscode.CompletionItemKind.Variable);
            item.detail = "Integer Variable";
            return item;
        });
    }
}
let uploadedPdfText: string | null = null;

let disposable = vscode.commands.registerCommand('acspl.askAI', async () => {
    const panel = vscode.window.createWebviewPanel(
        'montyChat',
        'Monty - ACS AI Assistant', // 🟢 Sets the title to reflect the assistant's identity
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    // 🟢 Send an introduction message when the assistant starts
    // Removed invalid onDidLoad event
        panel.webview.postMessage({
            command: 'receiveMessage',
            text: `👋 Hello! I’m 🐎Monty - Your ACS AI Assistant.\n How can I help you today?`
        });

    panel.webview.onDidReceiveMessage(async (message) => {
            const systemIntro = "You are Monty, an AI assistant specialized in ACS Motion Control and technical guidance.";
    
            if (message.command === 'sendMessage') {
                const userInput = message.text.trim();
    
                let response = "";
    
                if (uploadedPdfText) {
                    response = await queryAIWithPdf(`${systemIntro} ${userInput}`, uploadedPdfText);
                } else {
                    response = await getAIResponse(`${systemIntro} ${userInput}`);
                }
    
                panel.webview.postMessage({ command: 'receiveMessage', text: response });
            }
    
            if (message.command === 'uploadPDF') {
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
async function searchDocumentation(query: string): Promise<string> {
    const docFolder = "C:\\Software Guides";
    const pdfFile = path.join(docFolder, "ACSPL-Commands-Variables-Reference-Guide.pdf");

    try {
        // Check if the file exists
        if (!fs.existsSync(pdfFile)) {
            console.error("Error: PDF file not found at", pdfFile);
            return "❌ **Error:** Documentation file not found.";
        }

        console.log("Reading PDF:", pdfFile);
        const dataBuffer = fs.readFileSync(pdfFile);
        const pdfData = await pdf(dataBuffer);
        const content = pdfData.text;

        console.log("Extracted PDF content:", content.substring(0, 500)); // Log first 500 chars

        // ✅ General regex to match **any** ACSPL command (e.g., PTP, MOVE, VEL, etc.)
        const keywords = [
            "global", "static", "local", "ref", "int", "real", "struct", "void", "break", "commut", "connect", "depends", "disable", "disableall", "enable",
            "enableall", "encinit", "fclear", "follow", "go", "group", "halt", "home", "imm", "kill", "killall", "safetyconf", "safetygroup", "set", "split", "unfollow", "disp", "string", "inp", "interrupt",
            "interruptex", "send", "trigger", "outp", "assignmark", "assignpeg", "assignpouts", "peg_i", "peg_r", "startpeg", "stoppeg", "axisdef", "dc", "stopdc", "read", "spdc", "write", "spinject",
            "stopinject", "sprt", "sprtstop", "eipgetattr", "eipgetind1", "eipgetind2", "eipgettag", "eipsetasm", "arc1", "arc2", "bptp", "bptpcalc", "bseg", "ends", "jog", "line", "master", "mpoint",
            "mptp", "mseg", "path", "point", "projection", "ptp", "pvspline", "slave", "stopper", "track", "xseg", "block", "end", "call", "goto", "if", "else", "elseif", "input", "loop", "on", "till", "wait", "while",
            "ret", "disabelon", "enableon", "pause", "resume", "start", "stop", "stopall", "lcenable", "lcdisable", "inshapeon", "inshapeoff", "LCI", "DPM_Measurement", "DPM_Motion_Status"
        ];
        
        const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, 'gi');
        const matches = content.match(keywordRegex);

        if (matches && matches.length > 0) {
            return `📄 **Matching ACSPL Commands:**<br><pre><code>${matches.slice(0, 5).join("\n")}</code></pre>`;
        } else {
            return "⚠️ No relevant ACSPL commands found.";
        }
    } catch (error) {
        console.error("Error processing PDF:", error);
        return "❌ **Error:** Unable to process PDF.";
    }
}
function extractVariables(text: string): string[] {
    const regex = /^\s*(?:unsigned\s+|signed\s+|long\s+|short\s+)?(?:int|REAL|char|void)\s+(\*?\s*\w+)(?:\s*\[.*\])?\s*(?:=.*)?;/gm;
    const matches = [...text.matchAll(regex)];
    return matches.map(match => match[1].replace('*', '').trim());
}
//When hovering over a function or variable, display documentation or usage examples.

vscode.languages.registerHoverProvider('acsplext', {
    provideHover(document, position, token) {
      const word = document.getText(document.getWordRangeAtPosition(position));
      if(word === 'VEL') {
        return new vscode.Hover("`VEL(axis)` sets the velocity of the specified axis.\n\n**Example:**\n```acspl\nVEL(X) = 1000;\n```");
      }
    }
  });

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { language: 'acsplext' },
            new VariableCompletionProvider(),
            ' ', '\t', '=', '('  // Adjust triggers for your syntax
        )
    );

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated

    context.subscriptions.push(
        vscode.commands.registerCommand("acspl.askQuestion", async () => {
            const answer = await vscode.window.showInformationMessage(
                "How's the extension, do you enjoy it?",
                "Yes",
                "No"
            );

            if (answer === "No") {
                vscode.window.showInformationMessage("Sorry to hear that, you can address your problem to barp@acsmotioncontrol.com");
            } else if (answer === "Yes") {
                vscode.window.showInformationMessage("Great to hear :), Please rate us on the marketplace.");
            }
        })
    );


    
  context.subscriptions.push(
    vscode.commands.registerCommand("acspl.OpenMMI", async () => {
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
              } else {
                  vscode.window.showInformationMessage("The selected version does not exist or is not properly installed.");
              }
          }
      } catch (err) {
          vscode.window.showInformationMessage("An error occurred while trying to switch versions");
          console.error(err);
      }
  })
);


    

  context.subscriptions.push(
    vscode.commands.registerCommand("acspl.OpenUserModeDrive", () => {
        const baseDir = "C:\\Program Files (x86)\\ACS Motion Control\\SPiiPlus Runtime Kit\\User Mode Driver";
        const executableName = "ACSCSRV.exe";

        try {
            const driverPath = path.join(baseDir, executableName);

            if (fs.existsSync(driverPath)) {
                // File exists
                vscode.window.showInformationMessage("Opening User Mode Drive");
                execFile.exec(`"${driverPath}"`, { cwd: baseDir });
            } else {
                vscode.window.showInformationMessage("User Mode Drive does not exist");
            }
        } catch (err) {
            vscode.window.showInformationMessage("An error occurred while trying to open User Mode Drive");
            console.error(err);
        }
    })
);

context.subscriptions.push(
  vscode.commands.registerCommand("acspl.OpenUpdateCenter", () => {
      const baseDir = "C:\\Program Files (x86)\\ACS Motion Control\\SPiiPlus Update Center";
      const executableName = "ACS.UpdateCenter.exe";

      try {
          const updateCenterPath = path.join(baseDir, executableName);

          if (fs.existsSync(updateCenterPath)) {
              // File exists
              vscode.window.showInformationMessage("Opening Update Center");
              execFile.exec(`"${updateCenterPath}"`, { cwd: baseDir });
          } else {
              vscode.window.showInformationMessage("Update Center does not exist");
          }
      } catch (err) {
          vscode.window.showInformationMessage("An error occurred while trying to open Update Center");
          console.error(err);
      }
  })
);


context.subscriptions.push(
    vscode.commands.registerCommand("acspl.OpenKnowledgeCenter", () => {
        const baseDir = "C:\\Program Files (x86)\\ACS Motion Control\\SPiiPlus Documentation Kit\\Knowledge Center";
        const fileName = "KC.htm";

        try {
            const filePath = path.join(baseDir, fileName);

            if (fs.existsSync(filePath)) {
                // File exists
                vscode.window.showInformationMessage("Opening Knowledge Center");
                vscode.env.openExternal(vscode.Uri.file(filePath));
            } else {
                vscode.window.showInformationMessage("Knowledge Center file does not exist");
            }
        } catch (err) {
            vscode.window.showInformationMessage("An error occurred while trying to open Knowledge Center");
            console.error(err);
        }
    })
);




context.subscriptions.push(
  vscode.commands.registerCommand("acspl.OpenSoftwareGuides", () => {
      const baseDir = "C:\\Program Files (x86)\\ACS Motion Control\\SPiiPlus Documentation Kit";
      const folderName = "Software Guides";

      try {
          const folderPath = path.join(baseDir, folderName);

          if (fs.existsSync(folderPath)) {
              // Directory exists
              vscode.window.showInformationMessage("Opening Software Guides");
              vscode.env.openExternal(vscode.Uri.file(folderPath));
          } else {
              vscode.window.showInformationMessage("Software Guides folder does not exist");
          }
      } catch (err) {
          vscode.window.showInformationMessage("An error occurred while trying to open Software Guides");
          console.error(err);
      }
  })
);


context.subscriptions.push(
  vscode.commands.registerCommand("acspl.OpenTutorialVideos", () => {
      const tutorialUrl = "https://www.acsmotioncontrol.com/videos/tutorial-video-series/";

      try {
          vscode.window.showInformationMessage("Opening Tutorial Videos");
          vscode.env.openExternal(vscode.Uri.parse(tutorialUrl));
      } catch (err) {
          vscode.window.showInformationMessage("An error occurred while trying to open the Tutorial Videos");
          console.error(err);
      }
  })
);


context.subscriptions.push(
    vscode.commands.registerCommand("acspl.JoinUs", async () => {
        const selectedLocation = await vscode.window.showQuickPick(
            ["ISRAEL", "CHINA", "GERMANY", "USA"],
            { placeHolder: "Select a location to view career opportunities" }
        );

        let careerUrl = "";

        if (selectedLocation === "ISRAEL") {
            careerUrl = "https://acsmotioncontrol.com/careers/careers-israel/?coref=1.10.r18_C01&t=1741869411841";
        } else if (selectedLocation === "CHINA") {
            careerUrl = "https://www.acsmotioncontrol.com/careers/careers-china/";
        } else if (selectedLocation === "GERMANY") {
            careerUrl = "https://www.acsmotioncontrol.com/careers/careers-germany/";
        } else if (selectedLocation === "USA") {
            careerUrl = "https://www.acsmotioncontrol.com/careers/careers-usa/";
        } else {
            vscode.window.showInformationMessage("No location selected.");
            return; // Exit function if no selection is made
        }

        try {
            vscode.window.showInformationMessage(`Opening Career Page - ${selectedLocation}`);
            vscode.env.openExternal(vscode.Uri.parse(careerUrl));
        } catch (err) {
            vscode.window.showErrorMessage("An error occurred while trying to open the Career Page.");
            console.error(err);
        }
    })
);


context.subscriptions.push(
  vscode.commands.registerCommand("acspl.OpenLinkedIn", () => {
      const linkedInUrl = "https://www.linkedin.com/company/acs-motion-control/";

      try {
          vscode.window.showInformationMessage("Please Follow us on LinkedIn");
          vscode.env.openExternal(vscode.Uri.parse(linkedInUrl));
      } catch (err) {
          vscode.window.showErrorMessage("An error occurred while trying to open the LinkedIn page");
          console.error(err);
      }
  })
);


context.subscriptions.push(
    vscode.commands.registerCommand("acspl.DeveloperEmail", async () => {
        try {
            const subject = encodeURIComponent("Support Request: ACSPL+ Extension");
            const body = encodeURIComponent("Hello Bar,\n\nI need assistance with the ACSPL+ extension.\n\nBest regards,\n[Your Name]");
            const mailtoLink = `mailto:barp@acsmotioncontrol.com?subject=${subject}&body=${body}`;

            vscode.env.openExternal(vscode.Uri.parse(mailtoLink));
            vscode.window.showInformationMessage("Opening email client...");
        } catch (err) {
            vscode.window.showErrorMessage("An error occurred while trying to open the email client.");
            console.error(err);
        }
    })
);






} // end of activate function
async function queryAIWithPdf(query: string, pdfContent: string): Promise<string> {
	const prompt = `Answer based on this PDF content: ${pdfContent}\n\nQuestion: ${query}`;
	return await getAIResponse(prompt);
}


// Function to get AI response from Gemini
async function getAIResponse(userInput: string): Promise<string> {
    const apiKey = 'AIzaSyBDU5lpolgT-6W_gYdQeYASXqIikl9QamE'; // Replace with your actual key
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: userInput }] }]
            }
        );

        let formattedResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
        
        // Format response with Markdown-like structure
        formattedResponse = formatAIResponse(formattedResponse);

        return formattedResponse;
    } catch (error) {
        const err = error as any; // or use `as AxiosError` if using Axios
        return `❌ **Error:** ${err.response?.status} - ${err.response?.data?.error?.message || err.message}`;
    }
}

function formatAIResponse(response: string): string {
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



function getWebviewContent(): string {
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



export function deactivate() {}

