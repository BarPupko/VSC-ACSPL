// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  context.subscriptions.push(
    vscode.commands.registerCommand("acspl.helloWorld", () => {
       vscode.window.showInformationMessage("Hello World from acspl1!");
    })
  );

  context.subscriptions.push(
	vscode.commands.registerCommand("acspl.askQuestion",async ()=>{
		const answer = await vscode.window.showInformationMessage(
      "how was your day?",
      "good",
      "bad");

      if(answer === "bad"){
        vscode.window.showInformationMessage("sorry to hear that");
      }else{
        vscode.window.showInformationMessage("great to hear :)");

      }
	})
  );

}//end of activate

// this method is called when your extension is deactivated
export function deactivate() {}
