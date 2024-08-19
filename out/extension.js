"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const execFile = require("child_process");
const fs = require("fs"); // Check if file exists in file system.
const path = require("path"); // Import path module to handle paths easily
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
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
    context.subscriptions.push(vscode.commands.registerCommand("acspl.JoinUs", () => {
        const careerUrl = "https://www.acsmotioncontrol.com/careers/careers-israel/?coref=1.10.r18_C01&t=1724072064619/";
        try {
            vscode.window.showInformationMessage("Opening Career Page - Join Us!");
            vscode.env.openExternal(vscode.Uri.parse(careerUrl));
        }
        catch (err) {
            vscode.window.showInformationMessage("An error occurred while trying to open the Career Page");
            console.error(err);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand("acspl.OpenLinkedIn", () => {
        const linkedInUrl = "https://www.linkedin.com/company/acs-motion-control/mycompany/";
        try {
            vscode.window.showInformationMessage("Please Follow us on LinkedIn");
            vscode.env.openExternal(vscode.Uri.parse(linkedInUrl));
        }
        catch (err) {
            vscode.window.showErrorMessage("An error occurred while trying to open the LinkedIn page");
            console.error(err);
        }
    }));
} // end of activate function
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map