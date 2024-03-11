import {
  provideVSCodeDesignSystem,
  Button,
  vsCodeButton,
  vsCodeTag,
  vsCodeTextArea,
  vsCodeTextField,
  TextArea,
} from "@vscode/webview-ui-toolkit";
import { update } from "lodash";
import { TextDocumentSaveReason } from "vscode-languageclient";

provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeTag(),
  vsCodeTextArea(),
  vsCodeTextField()
);

const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function setListener(id: string, func: Function) {
  const button = document.getElementById(id) as Button;
  if (button) {
    button.addEventListener("click", () => func());
  }
}

function main() {
  setListener("submit-button", submitInput);
  setListener("create-button", createPlaybook);
  setListener("edit-button", editInput);
  setListener("undo-button", undoSuggestion);
  setListener('thumbsup-button', sendThumbsup);
  setListener("thumbsdown-button", sendThumbsdown);
  setListener("restart-button", restartInput);
  setListener("continue-button", updateHtml);
}

function changeDisplay(className: string, displayState: string) {
  let elements = document.getElementsByClassName(className);
  for(let i = 0; i < elements.length; i++) {
    const element = elements[i] as HTMLElement;
    element.style.display = displayState;
  }
}

function submitInput() {
  changeDisplay("bigIconButton", "none");
  changeDisplay("examplesContainer", "none");
  changeDisplay("editUndoContainer", "block");
  changeDisplay("feedbackContainer", "flex");
  changeDisplay("continueButtonContainer", "block");

  const sampleSuggestion = `Name: "Create an azure network...
  Description: "Create an azure network peering between VNET named VNET_1 and VNET named VNET_2"
  This playbook will perform the following tass by this order:
  
    1. Create VNET named VNET_1
    2. Create VNET named VNET_2
    3. Create virtual network peering
  `;

  const element = document.getElementById("playbook-text-area") as TextArea;
  element.value = sampleSuggestion;
  element.readOnly = true;
}

function createPlaybook() {
  vscode.postMessage({ command: "createPlaybook" });
}

function editInput() {
  const element = document.getElementById("playbook-text-area") as TextArea;
  element.readOnly = false;
}

function undoSuggestion() {

}

function sendThumbsup() {

}

function sendThumbsdown() {

}

function restartInput() {

}

function updateHtml() {
  vscode.postMessage({ command: "updateHtml" });
}
