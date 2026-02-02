class WindowSelector {
    constructor() {
        this.isActive = false;
        this.selectedWindow = null;
        this.overlay = null;
        this.windows = [];
        this.currentIndex = 0;
        this.animationFrame = null;
        
        this.config = {
            activationKey: 'Tab',
            modifierKey: 'Alt',
            animationDuration: 300,
            overlayOpacity: 0.8,
            windowScale: 0.8,
            windowSpacing: 20,
            borderWidth: 3,
            glowSize: 10
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createOverlay();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === this.config.activationKey) {
                e.preventDefault();
                if (!this.isActive) {
                    this.activate();
                } else {
                    this.nextWindow();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'Alt' && this.isActive) {
                this.deactivate();
            }
        });
        
        // 鼠标点击选择
        document.addEventListener('click', (e) => {
            if (this.isActive) {
                const windowElement = e.target.closest('.window-preview');
                if (windowElement) {
                    const index = parseInt(windowElement.dataset.index);
                    this.selectWindow(index);
                    this.deactivate();
                }
            }
        });
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'window-selector-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, ${this.config.overlayOpacity});
            backdrop-filter: blur(5px);
            z-index: 999999;
            display: none;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity ${this.config.animationDuration}ms ease;
            isolation: isolate;
        `;
        
        const container = document.createElement('div');
        container.className = 'window-selector-container';
        container.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: ${this.config.windowSpacing}px;
            max-width: 80%;
            max-height: 80%;
            padding: 20px;
        `;
        
        this.overlay.appendChild(container);
        document.body.appendChild(this.overlay);
    }
    
    activate() {
        this.isActive = true;
        
        // 保存当前页面状态
        this.savePageState();
        
        this.collectWindows();
        this.renderWindows();
        this.showOverlay();
        this.currentIndex = 0;
        this.highlightWindow(this.currentIndex);
    }
    
    deactivate() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.hideOverlay();
        
        // 恢复页面状态
        this.restorePageState();
        
        if (this.selectedWindow) {
            this.focusWindow(this.selectedWindow);
        }
        
        this.selectedWindow = null;
        this.windows = [];
    }
    
    savePageState() {
        // 保存页面的当前状态，防止窗口选择器影响原有样式
        this.savedState = {
            bodyOverflow: document.body.style.overflow,
            bodyPointerEvents: document.body.style.pointerEvents,
            documentOverflow: document.documentElement.style.overflow
        };
        
        // 防止页面滚动
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }
    
    restorePageState() {
        // 恢复页面的原始状态
        if (this.savedState) {
            document.body.style.overflow = this.savedState.bodyOverflow;
            document.body.style.pointerEvents = this.savedState.bodyPointerEvents;
            document.documentElement.style.overflow = this.savedState.documentOverflow;
            this.savedState = null;
        }
    }
     
     collectWindows() {
         // 收集所有可见的模块作为"窗口"
         const modules = document.querySelectorAll('section[id^="mod_"]:not([style*="display: none"])');
         this.windows = Array.from(modules).map((module, index) => {
            const rect = module.getBoundingClientRect();
            const title = module.querySelector('h3.title p')?.textContent || `Window ${index + 1}`;
            
            return {
                element: module,
                title: title,
                rect: rect,
                index: index,
                thumbnail: this.createThumbnail(module)
            };
        });
    }
    
    createThumbnail(element) {
        // 创建元素的缩略图
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const rect = element.getBoundingClientRect();
        
        canvas.width = 200;
        canvas.height = 150;
        
        // 绘制简化的模块预览
        ctx.fillStyle = getComputedStyle(element).backgroundColor || '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制边框
        ctx.strokeStyle = getComputedStyle(element).borderColor || '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // 绘制标题区域
        const titleElement = element.querySelector('h3.title');
        if (titleElement) {
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(0, 0, canvas.width, 30);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.fillText(titleElement.textContent || '', 10, 20);
        }
        
        // 绘制内容区域的简化表示
        ctx.fillStyle = '#333';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(10, 40 + i * 20, canvas.width - 20, 15);
        }
        
        return canvas.toDataURL();
    }
    
    renderWindows() {
        const container = this.overlay.querySelector('.window-selector-container');
        container.innerHTML = '';
        
        this.windows.forEach((window, index) => {
            const windowPreview = document.createElement('div');
            windowPreview.className = 'window-preview';
            windowPreview.dataset.index = index;
            windowPreview.style.cssText = `
                position: relative;
                width: 200px;
                height: 150px;
                background: #1a1a1a;
                border: ${this.config.borderWidth}px solid #333;
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                transition: all ${this.config.animationDuration}ms ease;
                transform: scale(${this.config.windowScale});
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                z-index: 1000000;
                isolation: isolate;
                will-change: transform, box-shadow;
            `;
            
            // 添加缩略图
            const thumbnail = document.createElement('img');
            thumbnail.src = window.thumbnail;
            thumbnail.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                pointer-events: none;
            `;
            
            // 添加标题
            const title = document.createElement('div');
            title.className = 'window-title';
            title.textContent = window.title;
            title.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px;
                font-size: 12px;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;
            
            windowPreview.appendChild(thumbnail);
            windowPreview.appendChild(title);
            container.appendChild(windowPreview);
        });
    }
    
    showOverlay() {
        this.overlay.style.display = 'flex';
        requestAnimationFrame(() => {
            this.overlay.style.opacity = '1';
        });
    }
    
    hideOverlay() {
        this.overlay.style.opacity = '0';
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, this.config.animationDuration);
    }
    
    nextWindow() {
        if (this.windows.length === 0) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.windows.length;
        this.highlightWindow(this.currentIndex);
    }
    
    selectWindow(index) {
        if (index >= 0 && index < this.windows.length) {
            this.currentIndex = index;
            this.selectedWindow = this.windows[index].element;
            this.highlightWindow(index);
        }
    }
    
    highlightWindow(index) {
        const previews = this.overlay.querySelectorAll('.window-preview');
        
        previews.forEach((preview, i) => {
            if (i === index) {
                preview.style.transform = 'scale(1)';
                preview.style.borderColor = 'var(--color_light_blue, #4a9eff)';
                preview.style.boxShadow = `0 0 ${this.config.glowSize}px var(--color_light_blue, #4a9eff), 0 4px 20px rgba(0, 0, 0, 0.3)`;
                preview.style.zIndex = '1';
            } else {
                preview.style.transform = `scale(${this.config.windowScale})`;
                preview.style.borderColor = '#333';
                preview.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                preview.style.zIndex = '0';
            }
        });
        
        this.selectedWindow = this.windows[index]?.element;
    }
    
    focusWindow(windowElement) {
        if (!windowElement) return;
        
        // 滚动到窗口位置
        windowElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
        
        // 添加焦点效果
        windowElement.style.transition = 'all 0.3s ease';
        windowElement.style.transform = 'scale(1.02)';
        windowElement.style.boxShadow = '0 0 20px var(--color_light_blue, #4a9eff)';
        
        setTimeout(() => {
            windowElement.style.transform = '';
            windowElement.style.boxShadow = '';
        }, 500);
    }
    
    destroy() {
        if (this.overlay) {
            document.body.removeChild(this.overlay);
        }
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

module.exports = {
    WindowSelector
};