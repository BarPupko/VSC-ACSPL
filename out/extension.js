"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "acspl" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand("acspl.helloWorld", () => {
        vscode.window.showInformationMessage("Hello World from acspl!");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("ascpl.askQuestion", () => {
        vscode.window.showInformationMessage("how was your day?", "good", "bad");
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map