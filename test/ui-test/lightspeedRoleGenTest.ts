// BEFORE: ansible.lightspeed.enabled: true

import { expect, config } from "chai";
import axios from "axios";

import {
  By,
  Workbench,
  VSBrowser,
  EditorView,
  SettingsEditor,
  ModalDialog,
  until,
} from "vscode-extension-tester";
import {
  sleep,
  updateSettings,
  getWebviewByLocator,
  workbenchExecuteCommand,
  openSettings,
} from "./uiTestHelper";

config.truncateThreshold = 0;

describe("Verify Role generation and explanation features work as expected", function () {
  let workbench: Workbench;
  let settingsEditor: SettingsEditor;

  before(async function () {
    if (process.env.TEST_LIGHTSPEED_URL) {
      await VSBrowser.instance.openResources(
        "test/units/lightspeed/utils/samples/",
      );
      workbench = new Workbench();
      settingsEditor = await openSettings();
      await updateSettings(settingsEditor, "ansible.lightspeed.enabled", true);
      await updateSettings(
        settingsEditor,
        "ansible.lightspeed.URL",
        process.env.TEST_LIGHTSPEED_URL,
      );
      await workbenchExecuteCommand(
        "Ansible Lightspeed: Enable experimental features",
      );
      await workbenchExecuteCommand("View: Close All Editor Groups");

      const notifications = await workbench.getNotifications();
      for (let i = 0; i < notifications.length; i++) {
        const n = notifications[i];
        await n.dismiss();
      }
    }
  });

  after(async function () {
    await workbenchExecuteCommand("View: Close All Editor Groups");
    // Reset the feedback event queue
    await axios.get(`${process.env.TEST_LIGHTSPEED_URL}/__debug__/feedbacks`);
  });

  it("Role generation webview works as expected", async function () {
    await workbenchExecuteCommand("Ansible Lightspeed: Role generation");
    await sleep(500);
    const webView = await getWebviewByLocator(
      By.xpath("//*[text()='Create a role with Ansible Lightspeed']"),
    );
    const textArea = await webView.findWebElement(
      By.xpath("//vscode-text-area"),
    );
    await textArea.sendKeys("Install and configure Nginx");

    (
      await webView.findWebElement(
        By.xpath("//vscode-button[@id='submit-button']"),
      )
    ).click();
    await sleep(5000);

    await webView.findWebElement(
      By.xpath("//*[contains(text(), 'Review the suggested')]"),
    );
    await (
      await webView.findWebElement(
        By.xpath("//vscode-button[@id='generateButton']"),
      )
    ).click();

    await sleep(5000);

    await (
      await webView.findWebElement(
        By.xpath("//vscode-button[@id='openEditorButton']"),
      )
    ).click();

    const driver = webView.getDriver();
    driver.switchTo().defaultContent();

    const editorView = new EditorView();

    const titles = await editorView.getOpenEditorTitles();
    expect(titles[0].includes("- name"));
    expect(titles[1].includes("install_nginx_packages:"));
    await workbenchExecuteCommand("View: Close All Editor Groups");
    const dialog = new ModalDialog();
    await dialog.pushButton(`Don't Save`);
    await dialog.getDriver().wait(until.stalenessOf(dialog), 2000);

    driver.switchTo().defaultContent();
  });
});
