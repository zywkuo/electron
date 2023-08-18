// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  shell,
  globalShortcut,
} = require("electron");
const path = require("path");

// main初始化remote模块
require("@electron/remote/main").initialize();

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

// 定义全局变量，存放主窗口id
let mainWinId = null;

// 创建窗口
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // x: 200,
    // y: 200,
    show: false,
    width: 1200,
    height: 1000,
    // maxWidth: 1600,
    // maxHeight: 1200,
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
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 自定义菜单
  let menuTemp = [
    {
      label: "文件",
      submenu: [
        {
          label: "打开",
          accelerator: "Ctrl+O",
          click() {
            console.log("open");
          },
        },
        {
          type: "separator",
        },
        {
          label: "向渲染进程发送消息",
          click() {
            BrowserWindow.getFocusedWindow().webContents.send(
              "mtp",
              "来自于主进程的消息"
            );
          },
        },
        {
          label: "关于",
          role: "about",
        },
        {
          label: "复制",
          role: "copy",
        },
        {
          label: "粘贴",
          role: "paste",
        },
        {
          label: "剪切",
          role: "cut",
        },
        {
          label: "最小化",
          role: "minimize",
        },
        {
          label: "撤销",
          role: "undo",
        },
      ],
    },
    {
      label: "类型",
      submenu: [
        {
          label: "选项一",
          type: "checkbox",
        },
        {
          label: "选项二",
          type: "checkbox",
        },
        {
          label: "选项三",
          type: "checkbox",
        },
        {
          type: "separator",
        },
        {
          label: "item1",
          type: "radio",
        },
        {
          label: "item2",
          type: "radio",
        },
        {
          type: "separator",
        },
        {
          label: "mac",
          type: "submenu",
          role: "windowMenu",
        },
      ],
    },
    {
      label: "其他",
      submenu: [
        {
          label: "打开",
          icon: "./images/bmh.png",
          accelerator: "ctrl + o",
          click() {
            console.log("open 操作执行了");
          },
        },
        {
          label: "打开网址-本机浏览器",
          click() {
            shell.openExternal("https://www.baidu.com/");
          },
        },
        {
          label: "打开网址-内置浏览器",
          click() {
            BrowserWindow.getFocusedWindow().webContents.send("openUrl");
          },
        },
      ],
    },
  ];
  if (process.platform == "darwin") {
    // mac 空占位
    menuTemp.unshift({ label: "" });
  }
  let menu = Menu.buildFromTemplate(menuTemp);
  Menu.setApplicationMenu(menu);

  // 使用remote模块
  // 先下载依赖 npm install --save @electron/remote
  // main导入remote模块
  require("@electron/remote/main").enable(mainWindow.webContents);
  // 子页面引入 const remote = require("@electron/remote")

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  mainWinId = mainWindow.id;

  // 打开控制台
  mainWindow.webContents.openDevTools();

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

// app.enableSandbox();

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

// 主进程接收消息操作
ipcMain.on("msg1", (e, data) => {
  console.log("msg1", data);
  e.sender.send("msg1Re", "主进程的异步消息");
});

ipcMain.on("msg2", (e, data) => {
  console.log("msg2", data);
  e.returnValue = "主进程的同步消息";
});

// 渲染进程间通信
ipcMain.on("openWin2", (e, data) => {
  // 接收渲染进程按钮后，打开窗口2
  let subWin1 = new BrowserWindow({
    width: 400,
    height: 300,
    title: "窗口2",
    parent: BrowserWindow.fromId(mainWinId),
    webPreferences: {
      nodeIntegration: true, //启用Node integration 渲染进程可以使用node
      contextIsolation: false,
    },
  });

  subWin1.loadFile("src/pages/sbuWin1/index.html");

  // 打开控制台
  subWin1.webContents.openDevTools();

  subWin1.on("close", () => {
    subWin1 = null;
  });

  // 加载完成后发送数据
  subWin1.webContents.on("did-finish-load", () => {
    subWin1.webContents.send("its", data);
  });
});

ipcMain.on("stm", (e, data) => {
  console.log("stm", data);
  // 将data经过main 主进程转到index渲染进程
  // 根据窗口id 获取渲染进程，执行发送
  let mainWin = BrowserWindow.fromId(mainWinId);
  mainWin.webContents.send("mti", data);
});

app.on("ready", () => {
  // 注册快捷键
  let res = globalShortcut.register("ctrl + q", () => {
    console.log("快捷键注册成功");
  });
  if (!res) {
    console.log("注册失败");
  }
  console.log("ctrl + q 是否注册成功", globalShortcut.isRegistered("ctrl + q"));
});

app.on("will-quit", () => {
  // 取消快捷键
  globalShortcut.unregister("ctrl + q");
});