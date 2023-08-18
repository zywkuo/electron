const {
  BrowserWindow,
  getCurrentWindow,
  Menu,
  MenuItem,
  dialog,
} = require("@electron/remote");
const { ipcRenderer, shell, clipboard, nativeImage } = require("electron");
const path = require("path");

window.addEventListener("DOMContentLoaded", () => {
  // 点击按钮打开新窗口
  const oBtn = document.getElementById("btn");
  oBtn.addEventListener("click", () => {
    const newWindow = new BrowserWindow({
      width: 800,
      height: 600,
      // frame: false,
      parent: getCurrentWindow(), // 获取父窗口，绑定关系
      // modal: true, // 添加模态，防止父窗口操作
      webPreferences: {
        nodeIntegration: true, //启用Node integration 渲染进程可以使用node
        contextIsolation: false,
      },
    });

    newWindow.loadFile("src/pages/new/index.html");

    // 打开控制台
    newWindow.webContents.openDevTools();

    newWindow.on("close", () => {});
  });

  //利用remote.getCurrentWindow 获取当前窗口对象
  let mainWin = getCurrentWindow();

  let minimizeBtn = document.getElementById("newpage_minimize_btn");
  let maximizeBtn = document.getElementById("newpage_maximize_btn");
  let closeBtn = document.getElementById("newpage_close_btn");

  minimizeBtn.addEventListener("click", () => {
    if (!mainWin.isMinimized()) {
      mainWin.minimize();
    }
  });
  maximizeBtn.addEventListener("click", () => {
    // 判断是否已经最大化
    if (mainWin.isMaximized()) {
      // 恢复窗口到原始状态
      mainWin.unmaximize();
    } else {
      mainWin.maximize();
    }
  });

  // 自定义提示关闭-方式一
  closeBtn.addEventListener("click", () => {
    let flag = confirm("确认关闭？");
    if (flag) {
      mainWin.close();
    }
  });

  // 自定义提示关闭-方式二
  // 屏蔽关闭方法 onbeforeunload 不允许使用alert confirm方法
  // window.onbeforeunload = function () {
  //   let confirmBox = document.getElementById("confirmBox");
  //   let yesBtn = document.getElementById("yes_btn");
  //   let noBtn = document.getElementById("no_btn");
  //   confirmBox.style.display = "block";
  //   yesBtn.addEventListener("click", () => {
  //     mainWin.destroy();
  //   });

  //   noBtn.addEventListener("click", () => {
  //     confirmBox.style.display = "none";
  //   });
  //   return false;
  // };
  // closeBtn.addEventListener("click", () => {
  //   mainWin.close();
  // });

  let addMenu = document.getElementById("addMenu");
  let menuCon = document.getElementById("menuCon");
  let addItem = document.getElementById("addItem");

  let addMenuItem = new Menu();

  addMenu.addEventListener("click", () => {
    let menuFile = new MenuItem({
      label: "自定义菜单一",
      submenu: [
        {
          label: "关于",
          role: "about",
        },
      ],
    });
    let customItem = new MenuItem({
      label: "添加菜单项",
      submenu: addMenuItem,
    });

    let menu = new Menu();
    if (process.platform == "darwin") {
      // mac 空占位
      menu.append(new MenuItem({ label: "" }));
    }
    menu.append(menuFile);
    menu.append(customItem);
    Menu.setApplicationMenu(menu);
  });

  // TODO 有问题 ，先点击创建菜单在添加，添加不上
  addItem.addEventListener("click", () => {
    let con = menuCon.value.trim();
    if (con) {
      addMenuItem.append(new MenuItem({ label: con, type: "normal" }));
      menuCon.value = "";
    }
  });

  // 右键菜单
  let contextTemp = [
    { label: "Run Code" },
    { label: "转到定义" },
    { type: "separator" },
    {
      label: "其他功能",
      click() {
        console.log("点击了");
      },
    },
  ];
  let rc_menu = Menu.buildFromTemplate(contextTemp);
  window.addEventListener(
    "contextmenu",
    (e) => {
      e.preventDefault();
      rc_menu.popup({ window: getCurrentWindow() });
    },
    false
  );

  // 渲染进程与主进程通信
  let asynBtn = document.getElementById("asynBtn");
  let syncBtn = document.getElementById("syncBtn");
  // 异步api 在渲染进程中给主进程发送消息
  asynBtn.addEventListener("click", () => {
    ipcRenderer.send("msg1", "来自渲染进程的异步消息");
  });
  // 接收主进程异步消息
  ipcRenderer.on("msg1Re", (e, data) => {
    console.log("msg1Re", data);
  });

  // 同步方式完成数据通讯
  syncBtn.addEventListener("click", () => {
    let val = ipcRenderer.sendSync("msg2", "来自渲染进程的同步消息");
    console.log(val);
  });

  // 接收主进程的消息
  ipcRenderer.on("mtp", (e, data) => {
    console.log("mtp", data);
  });

  // 渲染进程间通信
  let openWin2 = document.getElementById("openWin2");
  openWin2.addEventListener("click", () => {
    ipcRenderer.send("openWin2", "来自于index进程数据");
    // 打开窗口2之后，保存数据
    localStorage.setItem("name", "zyw");
  });

  // 接收消息
  ipcRenderer.on("mti", (e, data) => {
    console.log("mti", data);
  });

  // Dialog
  let dialogBtn = document.getElementById("dialog_btn");
  dialogBtn.addEventListener("click", () => {
    dialog.showOpenDialogSync(
      {
        defaultPath: __dirname, // 显示当前文件路径
        buttonLabel: "请选择",
        title: "自定义titile",
        properties: ["openFile", "multiSelections"],
        filters: [
          { name: "Images", extensions: ["jpg", "png", "gif", "ico"] },
          { name: "Movies", extensions: ["mkv", "avi", "mp4"] },
          { name: "All Files", extensions: ["*"] },
        ],
      },
      (result) => {
        console.log("result", result);
      }
    );
  });

  let dialogBtnErr = document.getElementById("dialog_btn_err");
  dialogBtnErr.addEventListener("click", () => {
    dialog.showErrorBox("错误标题", "错误内容");
  });

  // shell 与 iframe
  let shellOpen = document.getElementById("shellOpen");
  let shellFolder = document.getElementById("shellFolder");

  shellOpen.addEventListener("click", (e) => {
    e.preventDefault();
    let urlPath = shellOpen.getAttribute("href");
    shell.openExternal(urlPath);
  });

  // 会卡死
  shellFolder.addEventListener("click", (e) => {
    shell.showItemInFolder(path.resolve(__filename));
  });

  ipcRenderer.on("openUrl", () => {
    // let iframe = document.getElementById("iframe");
    // iframe.src = "https://www.baidu.com/";
    let a = document.createElement("a");
    a.setAttribute("href", "https://www.baidu.com/");
    a.setAttribute("target", "_blank");
    //给个id,可以在触发点击事件后移除这个a链接元素
    a.setAttribute("id", "openLink");
    // 防止反复添加
    if (document.getElementById("openLink")) {
      document.body.removeChild(document.getElementById("openLink"));
    }
    document.body.appendChild(a);
    //触发点击事件
    a.click();
  });

  // 基于H5实现消息通知
  let msgBtn = document.getElementById("msgBtn");
  msgBtn.addEventListener("click", () => {
    let option = {
      title: "标题",
      body: "内容",
      icon: "./favicon.ico",
    };

    let myNotification = new window.Notification(option.title, option);
    myNotification.addEventListener("click", () => {
      console.log("点击了消息");
    });
  });

  // 剪切板
  let copyText = document.getElementById("copyText");
  let copuBtn = document.getElementById("copuBtn");
  let pasteText = document.getElementById("pasteText");
  let pasteBtn = document.getElementById("pasteBtn");
  let clipImgBtn = document.getElementById("clipImgBtn");

  let realCopyText;
  copuBtn.addEventListener("click", () => {
    realCopyText = clipboard.writeText(copyText.value);
  });

  pasteBtn.addEventListener("click", () => {
    pasteText.value = clipboard.readText(realCopyText);
  });

  clipImgBtn.addEventListener("click", () => {
    // 图片放置剪切板 要求图片属于 nativeImage 实例
    let oImage = nativeImage.createFromPath("./images/bmh.png");
    clipboard.writeImage(oImage);
    // 将剪切板中图片作为dom放在元素界面上
    let oImg = clipboard.readImage();
    let oImgDom = new Image();
    oImgDom.src = oImg.toDataURL();
    document.body.appendChild(oImgDom);
  });
});
