class Conninfo {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        // 初始化DOM结构
        this.parent = document.getElementById(parentId);
        this.parent.innerHTML += `<div id="mod_conninfo">
            <div id="mod_conninfo_innercontainer">
                <h1>NETWORK TRAFFIC<i>UP / DOWN, MB/S</i></h1>
                <h2>TOTAL<i>0B OUT, 0B IN</i></h2>
                <canvas id="mod_conninfo_canvas_top"></canvas>
                <canvas id="mod_conninfo_canvas_bottom"></canvas>
                <h3>DEMO MODE</h3>
            </div>
        </div>`;

        // 初始化图表相关配置（保持不变）
        this.current = document.querySelector("#mod_conninfo_innercontainer > h1 > i");
        this.total = document.querySelector("#mod_conninfo_innercontainer > h2 > i");
        this._pb = require("pretty-bytes");

        // 初始化Smoothie图表
        const TimeSeries = require("smoothie").TimeSeries;
        const SmoothieChart = require("smoothie").SmoothieChart;

        // 简化后的图表配置
        const chartOptions = {
            limitFPS: 40,
            responsive: true,
            millisPerPixel: 70,
            interpolation: 'linear',
            grid: {
                millisPerLine: 5000,
                fillStyle: 'transparent',
                strokeStyle: `rgba(${window.theme.r},${window.theme.g},${window.theme.b},0.4)`,
                verticalSections: 3,
                borderVisible: false
            },
            labels: {
                fontSize: 10,
                fillStyle: `rgb(${window.theme.r},${window.theme.g},${window.theme.b})`,
                precision: 2
            }
        };

        // 创建图表实例
        this.series = [new TimeSeries(), new TimeSeries()];
        // 调整图表Y轴范围（从5→8以适应更大波动）
        this.charts = [
            new SmoothieChart({ ...chartOptions, minValue: 0, maxValue: 8 }), 
            new SmoothieChart({ ...chartOptions, minValue: 0, maxValue: -8 })  
        ];
        this.charts[0].addTimeSeries(this.series[0], { lineWidth: 1.7, strokeStyle: `rgb(${window.theme.r},${window.theme.g},${window.theme.b})` });
        this.charts[1].addTimeSeries(this.series[1], { lineWidth: 1.7, strokeStyle: `rgb(${window.theme.r},${window.theme.g},${window.theme.b})` });

        // 启动图表渲染
        this.charts[0].streamTo(document.getElementById("mod_conninfo_canvas_top"), 1000);
        this.charts[1].streamTo(document.getElementById("mod_conninfo_canvas_bottom"), 1000);

        // 改进后的高频波动数据生成器
        this.mockCounter = 0;
        this.generateMockData = () => {
            const t = this.mockCounter++ * 0.2;  // 加快时间因子（原0.15→0.2）
            const noise = Math.random() * 2.0;    // 增大随机噪声（原1.5→2.0）
            
            // 高频正弦波叠加（振幅从3→4）
            const txWave = Math.sin(t * 3) * 4 + noise;  // 频率从2→3，振幅提升33%
            const rxWave = Math.cos(t * 2.5) * 3.5 + noise * 1.2;  // 频率从1.8→2.5
            
            return {
                tx_sec: Math.max(0, txWave),    // 强制非负
                rx_sec: Math.max(0, rxWave),
                tx_bytes: this.mockCounter * 2e5,  // 增长速率提升33%（原1.5e5→2e5）
                rx_bytes: this.mockCounter * 2.4e5  // 增长速率提升33%（原1.8e5→2.4e5）
            };
        };

        // 启动数据更新
        this.infoUpdater = setInterval(() => this.updateInfo(), 1000);
    }

    updateInfo() {
        const time = Date.now();
        const mockData = this.generateMockData();

        // 更新图表数据
        this.series[0].append(time, mockData.tx_sec);
        this.series[1].append(time, -mockData.rx_sec);

        // 更新显示文本
        this.current.innerText = `UP ${mockData.tx_sec.toFixed(2)} DOWN ${mockData.rx_sec.toFixed(2)}`;
        this.total.innerText = `${this._pb(mockData.tx_bytes)} OUT, ${this._pb(mockData.rx_bytes)} IN`.toUpperCase();
    }
}

module.exports = { Conninfo };



