class CursorEffects {
    constructor() {
        this.cursor = null;
        this.corners = null;
        this.activeTarget = null;
        this.isAnimating = false;
        this.spinAnimation = null;
        this.resumeTimeout = null;
        this.currentTargetMove = null;
        this.currentLeaveHandler = null;
        
        this.config = {
            targetSelector: '.cursor-target',
            spinDuration: 2000, // 毫秒
            hideDefaultCursor: true,
            borderWidth: 3,
            cornerSize: 12,
            parallaxStrength: 0.00005
        };
        
        this.init();
    }
    
    init() {
        this.createCursorElement();
        this.setupEventListeners();
        this.startSpinAnimation();
        
        if (this.config.hideDefaultCursor) {
            document.body.style.cursor = 'none';
        }
    }
    
    createCursorElement() {
        // 创建主光标容器
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        this.cursor.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0;
            height: 0;
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
            mix-blend-mode: difference;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // 创建中心点
        const centerDot = document.createElement('div');
        centerDot.className = 'cursor-center';
        centerDot.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 50%;
            transform: translate(-50%, -50%);
        `;
        
        // 创建四个角落
        const cornerPositions = [
            { class: 'corner-tl', style: 'border-top: 3px solid white; border-left: 3px solid white;' },
            { class: 'corner-tr', style: 'border-top: 3px solid white; border-right: 3px solid white;' },
            { class: 'corner-br', style: 'border-bottom: 3px solid white; border-right: 3px solid white;' },
            { class: 'corner-bl', style: 'border-bottom: 3px solid white; border-left: 3px solid white;' }
        ];
        
        this.corners = [];
        cornerPositions.forEach((corner, index) => {
            const cornerEl = document.createElement('div');
            cornerEl.className = `cursor-corner ${corner.class}`;
            cornerEl.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: ${this.config.cornerSize}px;
                height: ${this.config.cornerSize}px;
                ${corner.style}
                transform: translate(-150%, -150%);
                transition: transform 0.2s ease;
            `;
            
            // 设置初始位置
            const positions = [
                { x: -this.config.cornerSize * 1.5, y: -this.config.cornerSize * 1.5 },
                { x: this.config.cornerSize * 0.5, y: -this.config.cornerSize * 1.5 },
                { x: this.config.cornerSize * 0.5, y: this.config.cornerSize * 0.5 },
                { x: -this.config.cornerSize * 1.5, y: this.config.cornerSize * 0.5 }
            ];
            
            cornerEl.style.transform = `translate(${positions[index].x}px, ${positions[index].y}px)`;
            
            this.corners.push(cornerEl);
            this.cursor.appendChild(cornerEl);
        });
        
        this.cursor.appendChild(centerDot);
        document.body.appendChild(this.cursor);
        
        // 设置初始位置
        this.moveCursor(window.innerWidth / 2, window.innerHeight / 2);
        this.cursor.style.opacity = '1';
    }
    
    moveCursor(x, y) {
        if (!this.cursor) return;
        this.cursor.style.left = x + 'px';
        this.cursor.style.top = y + 'px';
    }
    
    startSpinAnimation() {
        if (this.spinAnimation) {
            clearInterval(this.spinAnimation);
        }
        
        let rotation = 0;
        this.spinAnimation = setInterval(() => {
            if (!this.activeTarget && this.cursor) {
                rotation += 2;
                this.cursor.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
            }
        }, 16); // ~60fps
    }
    
    stopSpinAnimation() {
        if (this.spinAnimation) {
            clearInterval(this.spinAnimation);
            this.spinAnimation = null;
        }
        if (this.cursor) {
            this.cursor.style.transform = 'translate(-50%, -50%) rotate(0deg)';
        }
    }
    
    setupEventListeners() {
        // 鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            this.moveCursor(e.clientX, e.clientY);
        });
        
        // 鼠标进入目标元素
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest(this.config.targetSelector);
            if (target && target !== this.activeTarget) {
                this.handleTargetEnter(target, e);
            }
        });
        
        // 为现有的模块添加cursor-target类
        this.addTargetClasses();
    }
    
    addTargetClasses() {
        // 为所有模块添加cursor-target类
        const selectors = [
            'button', 'a', '.clickable', '.interactive',
            '.terminal', '.xterm', '.keyboard_key',
            '[class^="fs_disp_"]', // 文件系统项目
            '.window-preview', '.window-selector-overlay',
            '.modal', '.modal_popup',
            // 左右信息列的各个模块
            '#mod_clock', '#mod_sysinfo', '#mod_hardwareInspector',
            '#mod_cpuinfo', '#mod_ramwatcher', '#mod_toplist',
            '#mod_netstat', '#mod_globe', '#mod_conninfo',
            'section[id^="mod_"]', '.toplist-row', '.shell_tab',
            '.filesystem-entry', '.file-item', '.directory-item'
        ];
        const modules = document.querySelectorAll(selectors.join(', '));
        modules.forEach(module => {
            module.classList.add('cursor-target');
        });
        
        // 定期检查新添加的元素
        setInterval(() => {
            const newElements = document.querySelectorAll('section[id^="mod_"], .modal, .toplist-row, button, .shell_tab, .keyboard_key, [class^="fs_disp_"], .filesystem-entry, .file-item, .directory-item');
            newElements.forEach(element => {
                if (!element.classList.contains('cursor-target')) {
                    element.classList.add('cursor-target');
                }
            });
        }, 1000);
    }
    
    handleTargetEnter(target, event) {
        if (this.activeTarget) {
            this.cleanupTarget(this.activeTarget);
        }
        
        if (this.resumeTimeout) {
            clearTimeout(this.resumeTimeout);
            this.resumeTimeout = null;
        }
        
        this.activeTarget = target;
        this.stopSpinAnimation();
        
        this.updateCorners(target);
        
        // 添加鼠标移动监听
        this.currentTargetMove = (e) => {
            if (!this.isAnimating) {
                this.updateCorners(target, e.clientX, e.clientY);
            }
        };
        
        // 添加鼠标离开监听
        this.currentLeaveHandler = () => {
            this.handleTargetLeave(target);
        };
        
        target.addEventListener('mousemove', this.currentTargetMove);
        target.addEventListener('mouseleave', this.currentLeaveHandler);
    }
    
    handleTargetLeave(target) {
        this.activeTarget = null;
        this.isAnimating = false;
        
        // 重置角落位置
        const positions = [
            { x: -this.config.cornerSize * 1.5, y: -this.config.cornerSize * 1.5 },
            { x: this.config.cornerSize * 0.5, y: -this.config.cornerSize * 1.5 },
            { x: this.config.cornerSize * 0.5, y: this.config.cornerSize * 0.5 },
            { x: -this.config.cornerSize * 1.5, y: this.config.cornerSize * 0.5 }
        ];
        
        this.corners.forEach((corner, index) => {
            corner.style.transform = `translate(${positions[index].x}px, ${positions[index].y}px)`;
        });
        
        // 延迟恢复旋转动画
        this.resumeTimeout = setTimeout(() => {
            if (!this.activeTarget) {
                this.startSpinAnimation();
            }
            this.resumeTimeout = null;
        }, 50);
        
        this.cleanupTarget(target);
    }
    
    cleanupTarget(target) {
        if (this.currentTargetMove) {
            target.removeEventListener('mousemove', this.currentTargetMove);
        }
        if (this.currentLeaveHandler) {
            target.removeEventListener('mouseleave', this.currentLeaveHandler);
        }
        this.currentTargetMove = null;
        this.currentLeaveHandler = null;
    }
    
    updateCorners(target, mouseX, mouseY) {
        if (!target || !this.cursor || !this.corners) return;
        
        const rect = target.getBoundingClientRect();
        const cursorRect = this.cursor.getBoundingClientRect();
        
        const cursorCenterX = cursorRect.left + cursorRect.width / 2;
        const cursorCenterY = cursorRect.top + cursorRect.height / 2;
        
        const { borderWidth, cornerSize, parallaxStrength } = this.config;
        
        // 计算四个角的偏移
        const offsets = [
            {
                x: rect.left - cursorCenterX - borderWidth,
                y: rect.top - cursorCenterY - borderWidth
            },
            {
                x: rect.right - cursorCenterX + borderWidth - cornerSize,
                y: rect.top - cursorCenterY - borderWidth
            },
            {
                x: rect.right - cursorCenterX + borderWidth - cornerSize,
                y: rect.bottom - cursorCenterY + borderWidth - cornerSize
            },
            {
                x: rect.left - cursorCenterX - borderWidth,
                y: rect.bottom - cursorCenterY + borderWidth - cornerSize
            }
        ];
        
        // 添加视差效果
        if (mouseX !== undefined && mouseY !== undefined) {
            const targetCenterX = rect.left + rect.width / 2;
            const targetCenterY = rect.top + rect.height / 2;
            const mouseOffsetX = (mouseX - targetCenterX) * parallaxStrength;
            const mouseOffsetY = (mouseY - targetCenterY) * parallaxStrength;
            
            offsets.forEach(offset => {
                offset.x += mouseOffsetX;
                offset.y += mouseOffsetY;
            });
        }
        
        // 应用变换
        this.corners.forEach((corner, index) => {
            corner.style.transform = `translate(${offsets[index].x}px, ${offsets[index].y}px)`;
        });
    }
    
    destroy() {
        if (this.spinAnimation) {
            clearInterval(this.spinAnimation);
        }
        
        if (this.resumeTimeout) {
            clearTimeout(this.resumeTimeout);
        }
        
        if (this.activeTarget) {
            this.cleanupTarget(this.activeTarget);
        }
        
        if (this.cursor) {
            document.body.removeChild(this.cursor);
        }
        
        document.body.style.cursor = '';
    }
}

module.exports = {
    CursorEffects
};