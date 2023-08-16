const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  let oInput = document.getElementById("text");
  let val = localStorage.getItem("name");
  oInput.value = val;

  // 在subWin1 中发送数据给index
  let oBtn = document.getElementById("btn");
  oBtn.addEventListener("click", () => {
    ipcRenderer.send("stm", "来自于subWin进程");
  });

  ipcRenderer.on("its", (i, data) => {
    console.log("its", data);
  });
});
