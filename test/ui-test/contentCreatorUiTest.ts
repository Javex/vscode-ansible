import { By, EditorView, WebElement } from "vscode-extension-tester";
import {
  getWebviewByLocator,
  sleep,
  workbenchExecuteCommand,
} from "./uiTestHelper";
import { config, expect } from "chai";

config.truncateThreshold = 0;

describe("Test Ansible playbook project scaffolding", () => {
  let createButton: WebElement;
  let editorView: EditorView;
  let output: WebElement;

  before(async () => {
    // Install ansible-creator
    await workbenchExecuteCommand("Install Ansible Content Creator");
    await sleep(2000);
  });

  async function testWebViewElements(
    command: string,
    editorTitle: string,
    namespaceName: string,
    collectionName: string,
  ) {
    await workbenchExecuteCommand(command);
    await sleep(5000);

    await new EditorView().openEditor(editorTitle);
    const webview = await getWebviewByLocator(
      By.xpath("//vscode-text-field[@id='namespace-name']"),
    );

    const namespaceTextField = await webview.findWebElement(
      By.xpath("//vscode-text-field[@id='namespace-name']"),
    );
    expect(namespaceTextField, "namespaceTextField should not be undefined").not
      .to.be.undefined;
    await namespaceTextField.sendKeys(namespaceName);

    const collectionTextField = await webview.findWebElement(
      By.xpath("//vscode-text-field[@id='collection-name']"),
    );
    expect(collectionTextField, "collectionTextField should not be undefined")
      .not.to.be.undefined;
    await collectionTextField.sendKeys(collectionName);

    const overwriteCheckbox = await webview.findWebElement(
      By.xpath("//vscode-checkbox[@id='overwrite-checkbox']"),
    );
    expect(overwriteCheckbox, "overwriteCheckbox should not be undefined").not
      .to.be.undefined;
    await overwriteCheckbox.click();

    createButton = await webview.findWebElement(
      By.xpath("//vscode-button[@id='create-button']"),
    );
    expect(createButton, "createButton should not be undefined").not.to.be
      .undefined;

    expect(
      await createButton.isEnabled(),
      "Create button should be enabled now",
    ).to.be.true;

    await createButton.click();
    await sleep(500);

    output = await webview.findWebElement(
      By.xpath("//vscode-text-area[@id='log-text-area']"),
    );

    expect(
      await output.getAttribute("current-value"),
      "Creator output should contain success message",
    ).contains("project created at");

    // retry without overwrite selected
    await overwriteCheckbox.click();

    await createButton.click();
    await sleep(500);

    output = await webview.findWebElement(
      By.xpath("//vscode-text-area[@id='log-text-area']"),
    );
    expect(
      await output.getAttribute("current-value"),
      "Creator output should contain overwrite failure message",
    ).contains(
      "The destination directory contains files that will be overwritten",
    );
    await sleep(500);

    await webview.switchBack();
    editorView = new EditorView();
    if (editorView) {
      await editorView.closeAllEditors();
    }
  }

  it("Check create-ansible-project webview elements", async () => {
    await testWebViewElements(
      "Ansible: Create New Playbook Project",
      "Create Ansible project",
      "test_namespace",
      "test_collection",
    );
  });

  it("Check create-ansible-collection webview elements", async () => {
    await testWebViewElements(
      "Ansible: Create New Collection",
      "Create Ansible collection",
      "test_namespace",
      "test_collection",
    );
  });
});

describe("Test Ansible sample execution environment file scaffolding", () => {
  let createEEButton: WebElement;
  let editorView: EditorView;

  async function testWebViewElements(command: string, editorTitle: string) {
    await workbenchExecuteCommand(command);
    await sleep(4000);

    await new EditorView().openEditor(editorTitle);
    const eeWebview = await getWebviewByLocator(
      By.xpath("//vscode-text-field[@id='path-url']"),
    );

    const eeDestination = await eeWebview.findWebElement(
      By.xpath("//vscode-text-field[@id='path-url']"),
    );
    expect(eeDestination, "eeDestination should not be undefined").not.to.be
      .undefined;
    await eeDestination.sendKeys("~");

    const overwriteCheckbox = await eeWebview.findWebElement(
      By.xpath("//vscode-checkbox[@id='overwrite-checkbox']"),
    );
    expect(overwriteCheckbox, "overwriteCheckbox should not be undefined").not
      .to.be.undefined;
    await overwriteCheckbox.click();

    createEEButton = await eeWebview.findWebElement(
      By.xpath("//vscode-button[@id='create-button']"),
    );
    expect(createEEButton, "createEEButton should not be undefined").not.to.be
      .undefined;

    expect(
      await createEEButton.isEnabled(),
      "createEEbutton should be enabled now",
    ).to.be.true;

    await createEEButton.click();
    await eeWebview.switchBack();
    editorView = new EditorView();
    if (editorView) {
      await editorView.closeAllEditors();
    }
  }

  it("Check create-sample-execution-env-file webview elements", async () => {
    await testWebViewElements(
      "Ansible: Create a sample Ansible Execution Environment file",
      "Create Sample Ansible Execution Environment",
    );
  });
});
