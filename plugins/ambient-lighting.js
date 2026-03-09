/**
 * 环境光照分析与融合插件
 * Ambient Lighting Analysis & Fusion Plugin
 *
 * 功能：
 * 1. 分析摄像头/背景图的环境光照（亮度、色温、主光源方向）
 * 2. 动态应用滤镜让 Live2D 模型融入真实场景
 * 3. 支持实时更新和参数调节
 */

export class AmbientLightingPlugin {
  constructor(options = {}) {
    this.enabled = false;
    this.config = {
      updateInterval: options.updateInterval || 100, // 更新间隔（毫秒）
      intensity: options.intensity || 0.5, // 效果强度 0-1
      smoothing: options.smoothing || 0.3, // 平滑系数 0-1
      enableColorTemp: options.enableColorTemp !== false, // 色温调整
      enableBrightness: options.enableBrightness !== false, // 亮度调整
      enableDirectional: options.enableDirectional || false, // 方向性光照（高级）
    };

    // 扩展配置属性
    this.colorTempStrength = options.colorTempStrength || 1.0; // 色温强度
    this.brightnessStrength = options.brightnessStrength || 1.0; // 亮度强度
    this.brightnessRange = options.brightnessRange || 1.5; // 亮度范围
    this.enableContrast = options.enableContrast || false; // 对比度调整
    this.contrastStrength = options.contrastStrength || 0.3; // 对比度强度
    this.enableSaturation = options.enableSaturation || false; // 饱和度调整
    this.saturationStrength = options.saturationStrength || 0.2; // 饱和度强度

    // 当前环境光照数据
    this.currentLighting = {
      brightness: 1.0, // 0-2
      colorTemp: 6500, // 色温 K (2000-10000)
      colorTint: { r: 1, g: 1, b: 1 }, // RGB 色调
      lightDirection: { x: 0, y: -1 }, // 主光源方向（归一化）
    };

    // 平滑过渡的目标值
    this.targetLighting = { ...this.currentLighting };

    // 分析用的 canvas
    this.analysisCanvas = null;
    this.analysisCtx = null;

    // 更新定时器
    this.updateTimer = null;

    // Pixi.js 滤镜
    this.colorMatrixFilter = null;
  }

  /**
   * 初始化插件
   */
  initialize(pixiApp, modelContainer) {
    this.app = pixiApp;
    this.modelContainer = modelContainer;

    // 创建分析用 canvas
    this.analysisCanvas = document.createElement('canvas');
    this.analysisCanvas.width = 256; // 降采样提高性能
    this.analysisCanvas.height = 192;
    this.analysisCtx = this.analysisCanvas.getContext('2d', { willReadFrequently: true });

    // 创建 Pixi.js 颜色矩阵滤镜
    this.colorMatrixFilter = new PIXI.filters.ColorMatrixFilter();

    console.log('[AmbientLighting] Plugin initialized');
  }

  /**
   * 启用插件
   */
  enable() {
    if (this.enabled) return;
    this.enabled = true;

    // 应用滤镜到模型容器
    if (this.modelContainer) {
      const filters = this.modelContainer.filters || [];
      if (!filters.includes(this.colorMatrixFilter)) {
        filters.push(this.colorMatrixFilter);
        this.modelContainer.filters = filters;
      }
    }

    // 启动更新循环
    this.startUpdateLoop();
    console.log('[AmbientLighting] Plugin enabled');
  }

  /**
   * 禁用插件
   */
  disable() {
    if (!this.enabled) return;
    this.enabled = false;

    // 停止更新循环
    this.stopUpdateLoop();

    // 移除滤镜
    if (this.modelContainer && this.modelContainer.filters) {
      this.modelContainer.filters = this.modelContainer.filters.filter(
        f => f !== this.colorMatrixFilter
      );
    }

    // 重置滤镜
    this.colorMatrixFilter.reset();

    console.log('[AmbientLighting] Plugin disabled');
  }

  /**
   * 分析图像的环境光照
   */
  analyzeImage(imageSource) {
    if (!this.analysisCtx) return;

    try {
      // 绘制图像到分析 canvas（降采样）
      this.analysisCtx.clearRect(0, 0, this.analysisCanvas.width, this.analysisCanvas.height);
      this.analysisCtx.drawImage(
        imageSource,
        0, 0,
        this.analysisCanvas.width,
        this.analysisCanvas.height
      );

      const imageData = this.analysisCtx.getImageData(
        0, 0,
        this.analysisCanvas.width,
        this.analysisCanvas.height
      );
      const data = imageData.data;

      // 分析亮度和色彩
      let totalR = 0, totalG = 0, totalB = 0;
      let totalLuminance = 0;
      let pixelCount = 0;

      // 梯度累积（用于检测主光源方向）
      let gradientX = 0, gradientY = 0;

      for (let y = 0; y < this.analysisCanvas.height; y++) {
        for (let x = 0; x < this.analysisCanvas.width; x++) {
          const idx = (y * this.analysisCanvas.width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          totalR += r;
          totalG += g;
          totalB += b;

          // 计算亮度（ITU-R BT.601）
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += lum;

          // 计算梯度（简化版）
          if (x > 0 && y > 0) {
            const prevIdx = (y * this.analysisCanvas.width + (x - 1)) * 4;
            const prevLum = 0.299 * data[prevIdx] + 0.587 * data[prevIdx + 1] + 0.114 * data[prevIdx + 2];
            gradientX += (lum - prevLum);

            const upIdx = ((y - 1) * this.analysisCanvas.width + x) * 4;
            const upLum = 0.299 * data[upIdx] + 0.587 * data[upIdx + 1] + 0.114 * data[upIdx + 2];
            gradientY += (lum - upLum);
          }

          pixelCount++;
        }
      }

      // 计算平均值
      const avgR = totalR / pixelCount;
      const avgG = totalG / pixelCount;
      const avgB = totalB / pixelCount;
      const avgLuminance = totalLuminance / pixelCount;

      // 计算亮度（归一化到 0-2，1 为正常）
      const brightness = Math.max(0.2, Math.min(2.0, avgLuminance / 128));

      // 计算色温和色调
      const { colorTemp, colorTint } = this.calculateColorTemp(avgR, avgG, avgB);

      // 计算主光源方向（归一化）
      const gradMag = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
      const lightDirection = gradMag > 0 ? {
        x: gradientX / gradMag,
        y: gradientY / gradMag
      } : { x: 0, y: -1 };

      // 更新目标值
      this.targetLighting = {
        brightness,
        colorTemp,
        colorTint,
        lightDirection
      };

    } catch (error) {
      console.warn('[AmbientLighting] Analysis failed:', error);
    }
  }

  /**
   * 根据 RGB 计算色温和色调
   */
  calculateColorTemp(r, g, b) {
    // 归一化 RGB
    const max = Math.max(r, g, b, 1);
    const nr = r / max;
    const ng = g / max;
    const nb = b / max;

    // 简化的色温估算
    let colorTemp = 6500; // 默认日光

    if (nb > ng && nb > nr) {
      // 偏蓝 -> 冷光
      colorTemp = 6500 + (nb - Math.max(nr, ng)) * 3500; // 6500-10000K
    } else if (nr > nb && nr > ng) {
      // 偏红 -> 暖光
      colorTemp = 6500 - (nr - Math.max(ng, nb)) * 4500; // 2000-6500K
    }

    colorTemp = Math.max(2000, Math.min(10000, colorTemp));

    // 生成色调（基于色温的 RGB 调整）
    const colorTint = this.colorTempToRGB(colorTemp);

    return { colorTemp, colorTint };
  }

  /**
   * 色温转 RGB 色调
   */
  colorTempToRGB(kelvin) {
    const temp = kelvin / 100;
    let r, g, b;

    // 红色通道
    if (temp <= 66) {
      r = 255;
    } else {
      r = temp - 60;
      r = 329.698727446 * Math.pow(r, -0.1332047592);
      r = Math.max(0, Math.min(255, r));
    }

    // 绿色通道
    if (temp <= 66) {
      g = temp;
      g = 99.4708025861 * Math.log(g) - 161.1195681661;
    } else {
      g = temp - 60;
      g = 288.1221695283 * Math.pow(g, -0.0755148492);
    }
    g = Math.max(0, Math.min(255, g));

    // 蓝色通道
    if (temp >= 66) {
      b = 255;
    } else if (temp <= 19) {
      b = 0;
    } else {
      b = temp - 10;
      b = 138.5177312231 * Math.log(b) - 305.0447927307;
      b = Math.max(0, Math.min(255, b));
    }

    return {
      r: r / 255,
      g: g / 255,
      b: b / 255
    };
  }

  /**
   * 平滑过渡到目标光照值
   */
  smoothTransition() {
    const alpha = this.config.smoothing;

    this.currentLighting.brightness +=
      (this.targetLighting.brightness - this.currentLighting.brightness) * alpha;

    this.currentLighting.colorTemp +=
      (this.targetLighting.colorTemp - this.currentLighting.colorTemp) * alpha;

    this.currentLighting.colorTint.r +=
      (this.targetLighting.colorTint.r - this.currentLighting.colorTint.r) * alpha;
    this.currentLighting.colorTint.g +=
      (this.targetLighting.colorTint.g - this.currentLighting.colorTint.g) * alpha;
    this.currentLighting.colorTint.b +=
      (this.targetLighting.colorTint.b - this.currentLighting.colorTint.b) * alpha;

    this.currentLighting.lightDirection.x +=
      (this.targetLighting.lightDirection.x - this.currentLighting.lightDirection.x) * alpha;
    this.currentLighting.lightDirection.y +=
      (this.targetLighting.lightDirection.y - this.currentLighting.lightDirection.y) * alpha;
  }

  /**
   * 应用滤镜效果
   */
  applyFilter() {
    if (!this.colorMatrixFilter) return;

    const intensity = this.config.intensity;
    const lighting = this.currentLighting;

    // 重置矩阵
    this.colorMatrixFilter.reset();

    // 应用亮度调整
    if (this.config.enableBrightness) {
      const brightnessFactor = 1 + (lighting.brightness - 1) * intensity;
      this.colorMatrixFilter.brightness(brightnessFactor, false);
    }

    // 应用色温调整（色彩偏移）
    if (this.config.enableColorTemp) {
      const tint = lighting.colorTint;
      const tintR = 1 + (tint.r - 1) * intensity;
      const tintG = 1 + (tint.g - 1) * intensity;
      const tintB = 1 + (tint.b - 1) * intensity;

      // 使用颜色矩阵调整色调
      this.colorMatrixFilter.matrix = [
        tintR, 0, 0, 0, 0,
        0, tintG, 0, 0, 0,
        0, 0, tintB, 0, 0,
        0, 0, 0, 1, 0
      ];
    }
  }

  /**
   * 启动更新循环
   */
  startUpdateLoop() {
    this.stopUpdateLoop();
    this.updateTimer = setInterval(() => {
      this.update();
    }, this.config.updateInterval);
  }

  /**
   * 停止更新循环
   */
  stopUpdateLoop() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * 更新循环（每帧调用）
   */
  update() {
    if (!this.enabled) return;

    // 平滑过渡
    this.smoothTransition();

    // 应用滤镜
    this.applyFilter();
  }

  /**
   * 手动触发分析（传入背景图像元素）
   */
  analyzeBackground(backgroundElement) {
    if (!this.enabled) return;
    this.analyzeImage(backgroundElement);
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    Object.assign(this.config, newConfig);

    // 如果更新了间隔，重启定时器
    if (newConfig.updateInterval !== undefined && this.enabled) {
      this.startUpdateLoop();
    }
  }

  /**
   * 获取当前光照数据（用于调试）
   */
  getLightingData() {
    return {
      current: { ...this.currentLighting },
      target: { ...this.targetLighting },
      config: { ...this.config }
    };
  }

  /**
   * 销毁插件
   */
  destroy() {
    this.disable();
    this.analysisCanvas = null;
    this.analysisCtx = null;
    this.colorMatrixFilter = null;
  }
}
