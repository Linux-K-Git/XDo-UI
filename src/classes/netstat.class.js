class Netstat {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        // Create DOM（保持原有结构不变）
        this.parent = document.getElementById(parentId);
        this.parent.innerHTML += `<div id="mod_netstat">
            <div id="mod_netstat_inner">
                <h1>NETWORK STATUS<i id="mod_netstat_iname"></i></h1>
                <div id="mod_netstat_innercontainer">
                    <div>
                        <h1>STATE</h1>
                        <h2>UNKNOWN</h2>
                    </div>
                    <div>
                        <h1>IPv4</h1>
                        <h2>--.--.--.--</h2>
                    </div>
                    <div>
                        <h1>PING</h1>
                        <h2>--ms</h2>
                    </div>
                </div>
            </div>
        </div>`;

        // 保留77行后代码的初始化属性（新增属性）
        this.offline = false;
        this.lastconn = {finished: false}; // Prevent geoip lookup until maxminddb loaded
        this.iface = null;
        this.failedAttempts = {};
        this.runsBeforeGeoIPUpdate = 0;
        this._httpsAgent = new require("https").Agent({
            keepAlive: false,
            maxSockets: 10
        });

        // 初始化定时器（合并原有逻辑）
        this.updateInfo();
        this.infoUpdater = setInterval(() => {
            this.updateInfo();
        }, 2000);

        // 保留GeoIP初始化逻辑（77行后代码的核心功能）
        this.geoLookup = { get: () => null };
        let geolite2 = require("geolite2-redist");
        let maxmind = require("maxmind");
        geolite2.downloadDbs(require("path").join(require("@electron/remote").app.getPath("userData"), "geoIPcache")).then(() => {
            geolite2.open('GeoLite2-City', path => maxmind.open(path))
                .catch(e => { throw e })
                .then(lookup => {
                    this.geoLookup = lookup;
                    this.lastconn.finished = true;
                });
        });
    }

    updateInfo() {
        const https = require("https");

        // 请求公网IP接口（1-73行正确逻辑）
        https.get("https://myexternalip.com/raw", (res) => {
            let rawData = "";
            res.on("data", (chunk) => rawData += chunk);
            res.on("end", () => {
                const publicIP = rawData.trim();
                this.offline = !publicIP; // 新增：根据IP是否存在设置离线状态
                if (publicIP) {
                    document.querySelector("#mod_netstat_innercontainer > div:nth-child(2) > h2").innerHTML = publicIP;
                    document.querySelector("#mod_netstat_innercontainer > div:first-child > h2").innerHTML = "ONLINE";
                } else {
                    document.querySelector("#mod_netstat_innercontainer > div:nth-child(2) > h2").innerHTML = "--.--.--.--";
                    document.querySelector("#mod_netstat_innercontainer > div:first-child > h2").innerHTML = "OFFLINE";
                }
            });
        }).on("error", (e) => {
            document.querySelector("#mod_netstat_innercontainer > div:nth-child(2) > h2").innerHTML = "--.--.--.--";
            document.querySelector("#mod_netstat_innercontainer > div:first-child > h2").innerHTML = "OFFLINE";
        }); 

        // 使用JS HTTP请求检测百度延迟（1-73行正确逻辑）
        const start = Date.now();
        https.get("https://www.baidu.com", (res) => {
            res.on("data", () => {}); // 空操作触发数据接收
            res.on("end", () => {
                const delay = Date.now() - start;
                document.querySelector("#mod_netstat_innercontainer > div:nth-child(3) > h2").innerHTML = `${delay}ms`;
            });
        }).on("error", () => {
            document.querySelector("#mod_netstat_innercontainer > div:nth-child(3) > h2").innerHTML = "--ms";
        });

        // 改为直接显示配置中的接口名称（如果存在）
        const ifaceDisplay = window.settings.iface ? 
            `Interface: ${window.settings.iface}` : 
            "Interface: (auto)";
        document.getElementById("mod_netstat_iname").innerText = ifaceDisplay;
    }

    // 保留77行后代码的ping方法（关键功能）
    ping(target, port, local) {
        return new Promise((resolve, reject) => {
            let s = new require("net").Socket();
            let start = process.hrtime();

            s.connect({ port, host: target, localAddress: local, family: 4 }, () => {
                let time_arr = process.hrtime(start);
                let time = (time_arr[0] * 1e9 + time_arr[1]) / 1e6;
                resolve(time);
                s.destroy();
            });
            s.on('error', e => {
                s.destroy();
                reject(e);
            });
            s.setTimeout(1900, () => {
                s.destroy();
                reject(new Error("Socket timeout"));
            });
        });
    }
}

module.exports = { Netstat };