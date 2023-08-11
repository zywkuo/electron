// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");

/**
 * 声明周期
    ready: app 初始化完成
    dom-ready: 一个窗口中的文本加载完成
    did-finsh-load:导航完成时触发
    window-all-closed: 所有窗口都被关闭时触发
    before-quit: 在关闭窗口之前触发
    will-quit: 在窗口关闭并且应用退出时触发
    quit: 当所有窗口被关闭时触发
    closed: 当窗口关闭时触发，此时应删除窗口引用
 */

// 创建窗口
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // x: 200,
    // y: 200,
    show: false,
    width: 1200,
    height: 1000,
    maxWidth: 1600,
    maxHeight: 1200,
    minWidth: 400,
    minHeight: 300,
    // resizable: false,   // 禁止缩放
    title: "My App", // 应用标题
    icon: "favicon.ico", // 窗口图标。 在 Windows 上推荐使用 ICO 图标来获得最佳的视觉效果, 默认使用可执行文件的图标.
    // frame: false, // 用于自定义menu 设置为false 可以将默认菜单隐藏
    // transparent: true, // 背景透明
    // autoHideMenuBar: true, // 自动隐藏菜单栏
    webPreferences: {
      nodeIntegration: true, //启用Node integration 渲染进程可以使用node
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 使用remote模块
  // 先下载依赖 npm install --save @electron/remote
  // main导入remote模块
  require("@electron/remote/main").initialize();
  require("@electron/remote/main").enable(mainWindow.webContents);
  // 子页面引入 const remote = require("@electron/remote")

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // 与show: false,配合，防止白屏
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // mainWindow.webContents.on("dom-ready", () => {
  //   console.log("2--->dom-ready");
  // });

  // mainWindow.webContents.on("did-finish-load", () => {
  //   console.log("3--->did-finish-load");
  // });

  // mainWindow.on("close", () => {
  //   console.log("8--->this window is closed");
  //   // mainWindow = null;
  // });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  console.log("4--->window-all-closed");
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// app.on("ready", function () {
//   console.log("1--->ready");
// });

// app.on("before-quit", function () {
//   console.log("5--->before-quit");
// });

// app.on("will-quit", function () {
//   console.log("6--->will-quit");
// });

// app.on("quit", function () {
//   console.log("7--->quit");
// });
