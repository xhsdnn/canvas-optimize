class Scene {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width = 800;
        this.height = this.canvas.height = 500;
        this.ctx = this.canvas.getContext('2d');

        this.amount = 1000; // 粒子总数量
        this.radius = 5; // 粒子半径
        this.particles = []; // 粒子集合
        this.speed = 10; // 粒子速度
        this.timer = null; // 定时器

        this.useOffCanvas = false; // 是否使用离屏渲染
        this.useMultInstance = false; // 离屏渲染情况下是否使用多个实例

        this.count = 0; // 计算动画执行的次数
        this.time = new Date().getTime(); // 起始时间
        this.fpsDom = document.getElementById('fps'); // 展示fps的dom元素

        this.init();
    }

    init() {
        this.particles = [];
        this.timer = null;
        this.count = 0;
        this.time = new Date().getTime();

        let particle = '';
        if (!this.useMultInstance) {
            // 单实例
            particle = new Particle(this.radius);
        }

        // 随机位置生成粒子
        for (let i = 0; i < this.amount; i++) {
            let rx = Math.floor(this.radius + Math.random() * (this.width - this.radius * 2));
            let ry = Math.floor(this.radius + Math.random() * (this.height - this.radius * 2));

            if (this.useOffCanvas) {
                if (this.useMultInstance) {
                    // 多实例
                    particle = new Particle(this.radius);
                }

                this.particles.push({
                    instance: particle,
                    x: rx,
                    y: ry,
                    isMax: false
                });
            } else {
                this.particles.push({
                    x: rx,
                    y: ry,
                    isMax: false
                });
                this.drawParticle(this.ctx, rx, ry, this.radius);
            }
        }

        this.animate();
    }

    /* 绘制一个粒子
     * ctx —— canvas上下文
     * x —— 圆心x坐标
     * y —— 圆心y坐标
     * r —— 圆半径
     */
    drawParticle(ctx, x, y, r) {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = 0; i < this.particles.length; i++) {
            let particle = this.particles[i];

            if (particle.isMax) {
                particle.y -= this.speed;
                if (particle.y <= 0 + this.radius) {
                    particle.isMax = false;
                    particle.y += this.speed;
                }
            } else {
                particle.y += this.speed;
                if (particle.y >= this.height - this.radius) {
                    particle.isMax = true;
                    particle.y -= this.speed;
                }
            }

            if (this.useOffCanvas) {
                particle.instance.move(this.ctx, particle.x, particle.y);
            } else {
                this.drawParticle(this.ctx, particle.x, particle.y, this.radius);
            }
        }

        let self = this;
        this.timer = requestAnimationFrame(() => {
            // 计算fps
            self.computedFps();

            self.animate();
        });
    }

    // 更新粒子数量
    updateAmount(amount) {
        cancelAnimationFrame(this.timer);
        this.amount = Number(amount);
        this.init();
    }

    // 切换渲染方式
    toggleRender() {
        cancelAnimationFrame(this.timer);
        this.useOffCanvas = !this.useOffCanvas;
        this.init();
    }

    // 离屏渲染时单/多实例切换
    toggleMultInstance() {
        if (this.useOffCanvas) {
            cancelAnimationFrame(this.timer);
            this.useMultInstance = !this.useMultInstance;
            this.init();

            return true;
        } else {
            return false;
        }
    }

    // 计算fps
    computedFps() {
        let now = new Date().getTime();
        if (now - this.time >= 1000) {
            this.time = now;
            this.fpsDom.innerHTML = this.count;
            this.count = 0;
        } else {
            this.count++;
        }
    }
}

// 粒子类
class Particle {
    constructor(r) {
        this.canvas = document.createElement('canvas');
        this.width = this.canvas.width = r * 2;
        this.height = this.canvas.height = r * 2;
        this.ctx = this.canvas.getContext('2d');
        this.x = this.width / 2;
        this.y = this.height / 2;
        this.r = r;

        this.create();
    }

    // 创建粒子
    create() {
        this.ctx.save();
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    // 移动粒子
    move(ctx, x, y) {
        ctx.drawImage(this.canvas, x, y);
    }
}
