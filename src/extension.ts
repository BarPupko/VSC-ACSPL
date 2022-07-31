// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as os from "os";
import * as execFile from "child_process";
import * as process from "process";
import * as psnode from "ps-node";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  

  context.subscriptions.push(
	vscode.commands.registerCommand("acspl.askQuestion",async ()=>{
		const answer = await vscode.window.showInformationMessage(
      "how's the extenstion,do you enjoy?",
      "yes",
      "no");

      if(answer === "no"){
               
        vscode.window.showInformationMessage("sorry to hear that, you can address you problem to barpupco@gmail.com");
      }else{
        vscode.window.showInformationMessage("great to hear :)");

      }
	})
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("acspl.OpenMMI", () => {
      // A simple pid lookup
      
      psnode.lookup({psargs : "ACS.Framework.exe" }, function(err, resultList ) {
        if (err) {
          let err = "";
            vscode.window.showInformationMessage("Cant open MMI");
            throw new Error( err );
        }

        var process = resultList[ 0 ];

        if( process ){
            vscode.window.showInformationMessage("Opening MMI");
            console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
        }
        else {
            console.log( 'No such process found!' );
        }
      });   

      
      var MMI: execFile.ChildProcess = execFile.exec('"C:\\Program Files (x86)\\ACS Motion Control\\SPiiPlus ADK Suite v3.13 Alpha\\SPiiPlus MMI Application Studio\\ACS.Framework.exe"'); //open calculator
    })
  

  );  
  context.subscriptions.push(
    vscode.commands.registerCommand("acspl.OpenUserModeDrive", () => {
      psnode.lookup({psargs : "ACSCSRV.exe" }, function(err, resultList ) {
        if (err) {
          let err = "";
            vscode.window.showInformationMessage("Cant open UserModeDrive");
            throw new Error( err );
        }

        var process = resultList[ 0 ];

        if(process ){
          vscode.window.showInformationMessage("Opening UMD-UserModeDrive");
          console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
          var UMD: execFile.ChildProcess = execFile.exec('"C:\\Program Files (x86)\\ACS Motion Control\\SPiiPlus Runtime Kit\\User Mode Driver\\ACSCSRV.exe"'); //open calculator
          
        }
        else {
          vscode.window.showInformationMessage("Can't Open User Mode Drive");
        }
      });   
      
    })
  
  );


  //handler

//   getDiagnostic
// const diagnosticCollection = vscode.languages.createDiagnosticCollection('types-insta')

// const handler = async(doc:vscode.TextDocument) => {
//   if(!doc.fileName.endsWith('package.json')){
//     return;
//   }

//   const diagnostics = await getDiagnostics(doc);
//   diagnostics.set(doc.uri, diagnostics);
// }

// const didOpen= vscode.workspace.onDidOpenTextDocument(doc => handler(doc));
// const didChange= vscode.workspace.onDidOpenTextDocument(doc => handler(e.document));

}//end of activate

// this method is called when your extension is deactivated
export function deactivate() {}
