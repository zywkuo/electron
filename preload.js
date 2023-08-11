const remote = require("@electron/remote");

/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }

  // 点击按钮打开新窗口
  const oBtn = document.getElementById("btn");
  oBtn.addEventListener("click", () => {
    const newWindow = new remote.BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true, //启用Node integration 渲染进程可以使用node
      },
      frame: false,
    });
    // require("@electron/remote/main").initialize();
    // require("@electron/remote/main").enable(newWindow.webContents);
    newWindow.loadFile("src/pages/new/index.html");
    newWindow.on("close", () => {});
  });
});
