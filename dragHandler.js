class DragHandler {
    constructor(element, handle) {
        this.element = element;
        this.handle = handle;
        this.isDragging = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.lastTime = 0;
        this.isLocked = false;

        // 绑定事件处理器
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.animate = this.animate.bind(this);

        // 添加事件监听
        this.handle.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);

        // 启动动画循环
        requestAnimationFrame(this.animate);
    }

    handleMouseDown(e) {
        if (e.target.classList.contains('control-btn')) return;
        if (this.isLocked) return;

        this.isDragging = true;
        this.initialX = e.clientX - this.currentX;
        this.initialY = e.clientY - this.currentY;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.lastTime = performance.now();
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.handle.style.cursor = 'grabbing';
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;

        e.preventDefault();

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        // 计算新位置
        const newX = e.clientX - this.initialX;
        const newY = e.clientY - this.initialY;

        // 计算速度（像素/毫秒）
        if (deltaTime > 0) {
            this.xVelocity = (e.clientX - this.lastX) / deltaTime;
            this.yVelocity = (e.clientY - this.lastY) / deltaTime;
        }

        this.currentX = newX;
        this.currentY = newY;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.lastTime = currentTime;
    }

    handleMouseUp() {
        this.isDragging = false;
        this.handle.style.cursor = 'move';
    }

    animate() {
        // 如果正在拖动，直接更新位置
        if (this.isDragging) {
            this.updateElementPosition();
        } else {
            // 添加惯性效果
            const friction = 0.95;
            if (Math.abs(this.xVelocity) > 0.01 || Math.abs(this.yVelocity) > 0.01) {
                this.currentX += this.xVelocity * 16; // 假设16ms每帧
                this.currentY += this.yVelocity * 16;
                this.xVelocity *= friction;
                this.yVelocity *= friction;
                this.updateElementPosition();
            }
        }

        requestAnimationFrame(this.animate);
    }

    updateElementPosition() {
        this.element.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
    }

    setLocked(locked) {
        this.isLocked = locked;
    }

    reset() {
        this.currentX = 0;
        this.currentY = 0;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.updateElementPosition();
    }
} 