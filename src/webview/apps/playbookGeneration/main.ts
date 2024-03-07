import {
  provideVSCodeDesignSystem,
  Button,
  vsCodeButton,
  vsCodeTag,
  vsCodeTextArea,
  vsCodeTextField,
} from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeTag(),
  vsCodeTextArea(),
  vsCodeTextField()
);

const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  const saveButton = document.getElementById("submit-button") as Button;
  if (saveButton) {
    saveButton.addEventListener("click", () => updateHtml());
  }

  const createButton = document.getElementById("create-button") as Button;
  if (createButton) {
    createButton.addEventListener("click", () => createPlaybook());
  }
}

function updateHtml() {
  vscode.postMessage({ command: "updateHtml" });
}

function createPlaybook() {
  vscode.postMessage({ command: "createPlaybook" });
}