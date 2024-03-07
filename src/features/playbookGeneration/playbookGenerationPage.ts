import * as vscode from "vscode";
import { Webview, Uri } from "vscode";

function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

export function getWebviewContent(webview: Webview, extensionUri: Uri, index=1) {
  const webviewUri = getUri(webview, extensionUri, ["out", "client", "webview", "apps", "playbookGeneration", "main.js"]);
  const styleUri = getUri(webview, extensionUri, ["media", "playbookGeneration", "style.css"]);

  const nonce = getNonce();

  webview.onDidReceiveMessage((message) => {
    const command = message.command;
    switch (command) {
      case "requestNoteData":
        webview.postMessage({
          command: "receiveDataInWebview",
          payload: "",
        });
        break;
    }
  });

  const html1 = /*html*/ `
  <!DOCTYPE html>
  <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <link rel="stylesheet" href="${styleUri}">
        <title>Playbook</title>
    </head>
    <body>
      <div class="playbookGeneration">
        <h2>Create a playbook</h2>
        <h4>1 of 2</h4>
        <h3>What would you want the playbook to accomplish?</h3>
        <div class="editArea" class="editArea">
          <textarea placeholder="Describe with as much details as you can, in your own words."></textarea>
          <button id="submit-button">Next</button>
        </div>
      </div>
      <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
    </body>
  </html>
  `;

  const html2 = /*html*/ `
  <!DOCTYPE html>
  <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <link rel="stylesheet" href="${styleUri}">
        <title>Playbook</title>
    </head>
    <body>
    <div class="playbookGeneration">
    <h2>Create a playbook</h2>
    <h4>2 of 2</h4>
    <div>
      <h3>Which hosts will this playbook apply to?</h3>
      <div class="inputArea">
        <input placeholder="localhost (default)"></input>
      </div>
    </div>
    <div>
      <h3>Any variables you want to add?</h3>
      <div class="inputArea">
        <input placeholder="Enter variables"></input>
      </div>
      <button id="create-button">Create playbook</button>
    </div>
  </div>
      <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
    </body>
  </html>
  `;

  return index === 1 ? html1 : html2;
}

export function openNewPlaybookEditor() {
  const options = {
    language: "ansible"
  };
  const content = `---
- name: Playbook generated!
  hosts: all
  become: false
  tasks:
    - name: Print greeting
      ansible.builtins.debug:
      msg: Hello Playbook Generation!
`;

return vscode.workspace.openTextDocument( {
        language: options.language
    } )
    .then( doc => vscode.window.showTextDocument( doc ) )
    .then( editor => {
        let editBuilder = (textEdit: any) => {
            textEdit.insert( new vscode.Position( 0, 0 ), String( content ) );
        };

        return editor.edit( editBuilder, {
                undoStopBefore: true,
                undoStopAfter: false
            } )
            .then( () => editor );
    } );
}

export function showPlaybookGenerationPage(extensionUri: vscode.Uri) {
  // Create a new panel and update the HTML
  let panel: vscode.WebviewPanel | undefined;
  panel  = vscode.window.createWebviewPanel(
    "noteDetailView",
    "Title",
    vscode.ViewColumn.One,
    {
      // Enable JavaScript in the webview
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(extensionUri, "out"),
        vscode.Uri.joinPath(extensionUri, "media"),
      ],
      enableCommandUris: true,
      retainContextWhenHidden: true,
      // Restrict the webview to only load resources from the `out` directory
      // localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out")],
    }
  );

  // If a panel is open, update the HTML with the selected item's content
  // If a panel is open and receives an update message, update the notes array and the panel title/html
  panel.webview.onDidReceiveMessage((message) => {
    const command = message.command;
    switch (command) {
      case "updateHtml":
        panel!.webview.html =  getWebviewContent(panel!.webview, extensionUri, 2);
        break;
      case "createPlaybook":
        openNewPlaybookEditor();
        break
    }
  });

  panel.title = "Playbook Generation";
  panel.webview.html = getWebviewContent(panel.webview, extensionUri);
}
