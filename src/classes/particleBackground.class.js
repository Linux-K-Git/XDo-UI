class ParticleBackground {
    constructor() {
        this.container = null;
        this.particles = [];
        this.animationFrame = null;
        this.isActive = false;
        
        this.config = {
            particleCount: 50,
            particleSize: { min: 1, max: 3 },
            speed: { min: 0.5, max: 2 },
            colors: [
                'rgba(74, 158, 255, 0.3)',
                'rgba(138, 43, 226, 0.3)',
                'rgba(255, 20, 147, 0.3)',
                'rgba(0, 255, 127, 0.3)',
                'rgba(255, 165, 0, 0.3)'
            ],
            spawnRate: 0.02, // 每帧生成粒子的概率
            maxParticles: 100
        };
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.setupEventListeners();
        this.start();
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'particle-background';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        `;
        
        document.body.appendChild(this.container);
    }
    
    setupEventListeners() {
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.updateContainerSize();
        });
        
        // 监听可见性变化以优化性能
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }
    
    updateContainerSize() {
        if (this.container) {
            this.container.style.width = window.innerWidth + 'px';
            this.container.style.height = window.innerHeight + 'px';
        }
    }
    
    createParticle() {
        const particle = {
            element: document.createElement('div'),
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 10,
            size: this.config.particleSize.min + Math.random() * (this.config.particleSize.max - this.config.particleSize.min),
            speed: this.config.speed.min + Math.random() * (this.config.speed.max - this.config.speed.min),
            color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
            opacity: 0.3 + Math.random() * 0.7,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 4,
            life: 1.0,
            decay: 0.002 + Math.random() * 0.003
        };
        
        particle.element.className = 'particle';
        particle.element.style.cssText = `
            position: absolute;
            width: ${particle.size}px;
            height: ${particle.size}px;
            background: ${particle.color};
            border-radius: 50%;
            pointer-events: none;
            opacity: ${particle.opacity};
            transform: translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg);
            box-shadow: 0 0 ${particle.size * 2}px ${particle.color};
        `;
        
        this.container.appendChild(particle.element);
        return particle;
    }
    
    updateParticle(particle) {
        // 更新位置
        particle.y -= particle.speed;
        particle.rotation += particle.rotationSpeed;
        particle.life -= particle.decay;
        
        // 添加轻微的水平漂移
        particle.x += Math.sin(particle.y * 0.01) * 0.5;
        
        // 更新透明度
        const currentOpacity = particle.opacity * particle.life;
        
        // 应用变换
        particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg)`;
        particle.element.style.opacity = currentOpacity;
        
        // 检查是否需要移除粒子
        return particle.y > -10 && particle.life > 0;
    }
    
    removeParticle(particle) {
        if (particle.element && particle.element.parentNode) {
            particle.element.parentNode.removeChild(particle.element);
        }
    }
    
    animate() {
        if (!this.isActive) return;
        
        // 生成新粒子
        if (Math.random() < this.config.spawnRate && this.particles.length < this.config.maxParticles) {
            this.particles.push(this.createParticle());
        }
        
        // 更新现有粒子
        this.particles = this.particles.filter(particle => {
            const shouldKeep = this.updateParticle(particle);
            if (!shouldKeep) {
                this.removeParticle(particle);
            }
            return shouldKeep;
        });
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.animate();
    }
    
    pause() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    resume() {
        if (!this.isActive) {
            this.start();
        }
    }
    
    stop() {
        this.pause();
        
        // 清除所有粒子
        this.particles.forEach(particle => {
            this.removeParticle(particle);
        });
        this.particles = [];
    }
    
    setIntensity(intensity) {
        // 调整粒子强度 (0-1)
        intensity = Math.max(0, Math.min(1, intensity));
        
        this.config.spawnRate = 0.01 + (intensity * 0.03);
        this.config.maxParticles = Math.floor(50 + (intensity * 100));
        
        // 调整颜色透明度
        this.config.colors = this.config.colors.map(color => {
            const alpha = 0.2 + (intensity * 0.3);
            return color.replace(/[\d\.]+\)$/, alpha + ')');
        });
    }
    
    addBurst(x, y, count = 10) {
        // 在指定位置创建粒子爆发效果
        for (let i = 0; i < count; i++) {
            const particle = this.createParticle();
            particle.x = x + (Math.random() - 0.5) * 50;
            particle.y = y + (Math.random() - 0.5) * 50;
            particle.speed = 1 + Math.random() * 3;
            particle.size *= 1.5;
            particle.opacity = 0.8;
            
            // 随机方向
            const angle = Math.random() * Math.PI * 2;
            particle.vx = Math.cos(angle) * particle.speed;
            particle.vy = Math.sin(angle) * particle.speed;
            
            this.particles.push(particle);
        }
    }
    
    destroy() {
        this.stop();
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        window.removeEventListener('resize', this.updateContainerSize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
}

module.exports = {
    ParticleBackground
};