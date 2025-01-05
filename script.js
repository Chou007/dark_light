document.addEventListener('DOMContentLoaded', () => {
    const brightnessSlider = document.getElementById('brightness');
    const temperatureSlider = document.getElementById('temperature');
    const brightnessValue = brightnessSlider.nextElementSibling;
    const temperatureValue = temperatureSlider.nextElementSibling;
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const container = document.querySelector('.container');
    const lightPanel = document.querySelector('.light-panel');
    const dragHandle = document.querySelector('.drag-handle');
    const minimizeBtn = document.querySelector('.minimize-btn');
    const lockBtn = document.querySelector('.lock-btn');
    let isMinimized = false;
    let isLocked = false;

    // 创建拖动处理器实例
    const dragHandler = new DragHandler(lightPanel, dragHandle);

    // 添加全屏功能
    fullscreenBtn.addEventListener('click', toggleFullScreen);

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            // 进入全屏
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
            container.classList.add('fullscreen');
            fullscreenBtn.textContent = '退出全屏';
        } else {
            // 退出全屏
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            container.classList.remove('fullscreen');
            fullscreenBtn.textContent = '全屏显示';
        }
    }

    // 监听全屏变化
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            container.classList.remove('fullscreen');
            fullscreenBtn.textContent = '全屏显示';
        }
    });

    // 保持原有的亮度和色温控制功能
    function updateLight() {
        const brightness = brightnessSlider.value;
        const temperature = temperatureSlider.value;
        
        brightnessValue.textContent = `${brightness}%`;
        temperatureValue.textContent = `${temperature}K`;

        const rgb = colorTemperatureToRGB(temperature);
        
        // 增加亮度倍数并使用非线性曲线来优化亮度控制
        const brightnessMultiplier = 5.0; // 增加到5倍
        // 使用指数曲线使低亮度时更精确，高亮度时增长更快
        const adjustedBrightness = Math.pow(brightness / 100, 1.5) * brightnessMultiplier;
        
        // 确保RGB值不超过255，使用更激进的亮度提升
        const adjustedRGB = rgb.map(v => {
            // 在较高亮度时额外提升亮度
            let multiplier = adjustedBrightness;
            if (brightness > 80) {
                // 在高亮度范围额外提升亮度
                multiplier *= 1 + (brightness - 80) / 20 * 0.5; // 最高可以再提升50%
            }
            const adjusted = Math.round(v * multiplier);
            return Math.min(255, adjusted);
        });

        document.body.style.backgroundColor = `rgb(${adjustedRGB.join(',')})`;
    }

    // 保持原有的色温转换函数
    function colorTemperatureToRGB(kelvin) {
        let temp = kelvin / 100;
        let red, green, blue;

        if (temp <= 66) {
            red = 255;
            
            // 改进绿色计算公式以适应更大范围
            green = temp;
            green = 99.4708025861 * Math.log(green) - 161.1195681661;

            if (temp <= 19) {
                blue = 0;
            } else {
                blue = temp - 10;
                blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
            }
        } else {
            // 改进红色计算公式以适应更大范围
            red = temp - 60;
            red = 329.698727446 * Math.pow(red, -0.1332047592);
            
            // 改进绿色计算公式以适应更大范围
            green = temp - 60;
            green = 288.1221695283 * Math.pow(green, -0.0755148492);
            
            blue = 255;
        }

        // 添加额外的色温调整逻辑
        if (kelvin >= 10000) {
            // 超高色温时增加蓝色比重
            blue = Math.min(255, blue * 1.1);
            red = Math.max(0, red * 0.9);
        } else if (kelvin <= 1000) {
            // 超低色温时增加红色比重
            red = Math.min(255, red * 1.1);
            blue = Math.max(0, blue * 0.9);
        }

        return [
            Math.min(255, Math.max(0, red)),
            Math.min(255, Math.max(0, green)),
            Math.min(255, Math.max(0, blue))
        ];
    }

    brightnessSlider.addEventListener('input', updateLight);
    temperatureSlider.addEventListener('input', updateLight);
    updateLight();

    // 修改最小化控制逻辑
    minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止触发拖动
        isMinimized = !isMinimized;
        lightPanel.classList.toggle('minimized');
        minimizeBtn.textContent = isMinimized ? '□' : '─';
        minimizeBtn.title = isMinimized ? '还原' : '最小化';
    });

    // 修改锁定控制逻辑
    lockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isLocked = !isLocked;
        lightPanel.classList.toggle('locked');
        lockBtn.textContent = isLocked ? '🔒' : '🔓';
        lockBtn.title = isLocked ? '解锁控件' : '锁定控件';
        dragHandler.setLocked(isLocked);
    });

    // 在进入/退出全屏时重置位置
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            container.classList.remove('fullscreen');
            fullscreenBtn.textContent = '全屏显示';
            dragHandler.reset();
        }
    });
}); 