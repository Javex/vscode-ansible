import { extensionUIAssetsTest } from "./extensionUITest";
import { lightspeedUILoginTest } from "./lightspeedAuthUiTest";
import { lightspeedOneClickTrialUITest } from "./lightspeedOneClickTrialUITest";
import { lightspeedUIAssetsTest } from "./lightspeedUiTest";
import { terminalUITests } from "./terminalUiTest";
import { WelcomePageUITest } from "./welcomePageUITest";

describe("VSCode Ansible - UI tests", function () {
  this.timeout(30000);
  extensionUIAssetsTest();
  lightspeedUIAssetsTest();
  terminalUITests();
  WelcomePageUITest();

  // Skip this on MacOS due to the functional limitation on menu support
  if (process.platform === "darwin") {
    lightspeedUILoginTest();
  } else {
    lightspeedOneClickTrialUITest();
    // lightspeedUILoginTest();
    // lightspeedUISignOutTest();
  }
});
