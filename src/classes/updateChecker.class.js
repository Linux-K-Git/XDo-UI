class UpdateChecker {
    constructor() {
        let electron = require("electron");
        let remote = require("@electron/remote");
        let current = remote.app.getVersion();
        
        // 更新检查器已禁用 - 不进行任何网络连接
        electron.ipcRenderer.send("log", "info", `更新检查器: 当前版本 ${current} - 网络更新检查已禁用 (UpdateChecker: Current version ${current} - Network update check disabled).`);
    }
}

module.exports = {
    UpdateChecker
};
