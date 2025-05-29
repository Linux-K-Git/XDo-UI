const { exec } = require('child_process');
const ffi = require('ffi-napi');
const ref = require('ref-napi'); 
class Toplist {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        // Create DOM
        this.parent = document.getElementById(parentId);
        this._element = document.createElement("div");
        this._element.setAttribute("id", "mod_toplist");
        this._element.innerHTML = `<h1>TOP PROCESSES<i>PID | NAME | CPU | MEM</i></h1><br>
        <table id="mod_toplist_table"></table>`;
        this._element.onclick = this.processList.bind(this); // 绑定this上下文

        this.parent.append(this._element);

        this.currentlyUpdating = false;
        this.processListUpdater = null; // 新增属性用于存储processList的定时器

        this.updateList();
        // 将刷新间隔从 2000 毫秒改为 100 毫秒
        this.listUpdater = setInterval(() => {
            this.updateList();
        }, 100);
    }
    updateList() {
        if (this.currentlyUpdating) return;
        this.currentlyUpdating = true;

        // 使用PowerShell获取更详细的进程信息
        exec('powershell -command "Get-Process | Select-Object Id,ProcessName,CPU,WorkingSet,StartTime | ConvertTo-Json"', 
            (error, stdout, stderr) => {
                if (error) {
                    console.error('获取进程信息失败:', error);
                    this.currentlyUpdating = false;
                    return;
                }

                try {
                    // 修改updateList函数中的数据处理部分
                    let processes = JSON.parse(stdout).map(proc => ({
                        pid: proc.Id,
                        name: proc.ProcessName,
                        cpu: (proc.CPU || 0) / 100, // 保持CPU计算不变
                        mem: (proc.WorkingSet / (1024 * 1024)) / 100, // 转换为MB后再计算百分比
                        started: proc.StartTime ? new Date(parseInt(proc.StartTime.match(/\d+/)[0])).toISOString() : 'N/A'
                    }));

                    // 排序并显示前 7 个进程
                    let list = processes.sort((a, b) => 
                        ((b.cpu-a.cpu)*100 + b.mem-a.mem)
                    ).slice(0, 7);
            
                    document.querySelectorAll("#mod_toplist_table > tr").forEach(el => {
                        el.remove();
                    });
                    list.forEach(proc => {
                        let el = document.createElement("tr");
                        el.innerHTML = `<td>${proc.pid}</td>
                                        <td><strong>${proc.name}</strong></td>
                                        <td>${Math.round(proc.cpu*10)/10}%</td>
                                        <td>${Math.round(proc.mem*10)/10}%</td>`;
                        el.classList.add('toplist-row'); // 添加新的类用于鼠标悬停效果
                        document.getElementById("mod_toplist_table").append(el);
                    });
                    this.currentlyUpdating = false;
                } catch (e) {
                    console.error('解析进程信息失败:', e);
                    this.currentlyUpdating = false;
                }
            });
    }

    processList(){
        let sortKey;
        let ascending = false;
        let removed = false;
        let currentlyUpdating = false;
        let initialLoad = true; // 新增变量，标记是否是首次加载

        function setSortKey(fieldName){
            if (sortKey === fieldName){
                if (ascending){
                    sortKey = undefined;
                    ascending = false;
                }
                else{
                    ascending = true;
                }
            }
            else {
                sortKey = fieldName;
                ascending = false;
            }
        }

        function formatRuntime(ms){
            const msInDay = 24 * 60 * 60 * 1000;
            let days = Math.floor(ms / msInDay);
            let remainingMS = ms % msInDay;

            const msInHour = 60 * 60 * 1000;
            let hours = Math.floor(remainingMS / msInHour);
            remainingMS = ms % msInHour;

            let msInMin = 60 * 1000;
            let minutes = Math.floor(remainingMS / msInMin);
            remainingMS = ms % msInMin;

            let seconds = Math.floor(remainingMS / 1000);

            return `${days < 10 ? "0" : ""}${days}:${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        }

        const updateProcessList = () => {
            if (currentlyUpdating) return;
            currentlyUpdating = true;

            // 首次加载时显示加载动画
            if (initialLoad) {
                document.getElementById('processListLoading').style.display = 'block';
                document.getElementById('processList').style.display = 'none';
            }
    
            exec('powershell -command "Get-Process | Select-Object Id,ProcessName,CPU,WorkingSet,StartTime,Responding,SessionId,Handles,Threads,Path | ConvertTo-Json"', 
                (error, stdout, stderr) => {
                    if (error) {
                        console.error('获取进程信息失败:', error);
                        currentlyUpdating = false;
                        if (initialLoad) {
                            document.getElementById('processListLoading').style.display = 'none';
                        }
                        return;
                    }
    
                    try {
                        // 获取系统总内存用于计算内存百分比
                        const os = require('os'); // 确保os模块已引入
                        const totalMemory = os.totalmem() / (1024 * 1024); // 转换为MB
                        let data = { 
                            list: JSON.parse(stdout).map(proc => ({
                                pid: proc.Id,
                                name: proc.ProcessName,
                                cpu: (proc.CPU || 0) / 100, // CPU百分比保持不变
                                mem: (proc.WorkingSet / (1024 * 1024)) / 100, // 内存百分比统一为除以100
                                state: proc.Responding ? 'Running' : 'Not Responding',
                                started: proc.StartTime ? new Date(parseInt(proc.StartTime.match(/\d+/)[0])).toISOString() : 'N/A',
                                user: `Session ${proc.SessionId}`,
                                runtime: proc.StartTime ? Date.now() - new Date(parseInt(proc.StartTime.match(/\d+/)[0])).getTime() : 0,
                                path: proc.Path || 'N/A'
                            })) 
                        };
    
                        // 排序逻辑保持不变
                        let list = data.list.sort((a, b) => {
                            // 根据sortKey进行排序
                            switch (sortKey) {
                                case 'PID':
                                    return ascending ? a.pid - b.pid : b.pid - a.pid;
                                case 'Name':
                                    return ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                                case 'User':
                                    return ascending ? a.user.localeCompare(b.user) : b.user.localeCompare(a.user);
                                case 'CPU':
                                    return ascending ? a.cpu - b.cpu : b.cpu - a.cpu;
                                case 'Memory':
                                    return ascending ? a.mem - b.mem : b.mem - a.mem;
                                case 'State':
                                    return ascending ? a.state.localeCompare(b.state) : b.state.localeCompare(a.state);
                                case 'Started':
                                    return ascending ? new Date(a.started).getTime() - new Date(b.started).getTime() : new Date(b.started).getTime() - new Date(a.started).getTime();
                                case 'Runtime':
                                    return ascending ? a.runtime - b.runtime : b.runtime - a.runtime;
                                default:
                                    // 默认按CPU和内存排序
                                    return ((b.cpu - a.cpu) * 100 + b.mem - a.mem);
                            }
                        });
    
                        // 更新processList表格内容
                        document.querySelectorAll("#processList > tr").forEach(el => {
                            el.remove();
                        });
    
                        // 显示所有进程
                        list.forEach(proc => {
                            let el = document.createElement("tr");
                            el.innerHTML = `<td class="pid">${proc.pid}</td>
                                                <td class="name">${proc.name}</td>
                                                <td class="user">${proc.user}</td>
                                                <td class="cpu">${Math.round(proc.cpu * 10)/10}%</td>
                                                <td class="mem">${Math.round(proc.mem * 10)/10}%</td>
                                                <td class="state">${proc.state}</td>
                                                <td class="started">${new Date(proc.started).toLocaleString()}</td>
                                                <td class="runtime">${formatRuntime(proc.runtime)}</td>`;

                            document.getElementById("processList").append(el);
                        });
    
                        currentlyUpdating = false;
                        // 首次加载完成后隐藏加载动画，显示表格
                        if (initialLoad) {
                            document.getElementById('processListLoading').style.display = 'none';
                            document.getElementById('processList').style.display = 'table-row-group';
                            initialLoad = false; // 标记首次加载已完成
                        }
                    } catch (e) {
                        console.error('解析进程信息失败:', e);
                        currentlyUpdating = false;
                        if (initialLoad) {
                            document.getElementById('processListLoading').style.display = 'none';
                        }
                    }
                });
        }

        window.keyboard.detach();
        new Modal(
            {
                type: "custom",
                title: "Active Processes",
                html: `
<div style="display: flex; align-items: center; margin-bottom: 10px;">
    <h2 style="margin: 0;">Active Processes  </h2>
    <div id="processListLoading" style="margin-left: 20px; display: none;">
        <div class="loader"></div>
        <p>Loading processes...</p>
    </div>
</div>
<table id="processContainer">
    <thead>
        <tr>
            <td class="pid header">PID</td>
            <td class="name header">Name</td>
            <td class="user header">User</td>
            <td class="cpu header">CPU</td>
            <td class="mem header">Memory</td>
            <td class="state header">State</td>
            <td class="started header">Started</td>
            <td class="runtime header">Runtime</td>
        </tr>
    </thead>
    <tbody id="processList">
    </tbody>
  </table>`,
            },
            () => {
                removed = true;
                clearInterval(this.processListUpdater); // 清除定时器
            }
        );

        let headers = document.getElementsByClassName("header");
        for (let header of headers){
            let title = header.textContent;
            header.addEventListener("click", () => {
                for (let header of headers) {
                    header.textContent = header.textContent.replace('\u25B2', "").replace('\u25BC', "");
                }
                setSortKey(title);
                if (sortKey){
                    header.textContent = `${title}${ascending ? '\u25B2' : '\u25BC'}`;
                }
            });
        }

        updateProcessList();
        window.keyboard.attach();
        window.term[window.currentTerm].term.focus();
        // 将刷新间隔从 1000 毫秒改为 100 毫秒
        this.processListUpdater = setInterval(updateProcessList, 100); // 使用实例属性存储定时器
    }
}

module.exports = {
    Toplist
};
