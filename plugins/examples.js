/**
 * 环境光照融合插件使用示例
 * Example Usage of Ambient Lighting Fusion Plugin
 */

// ============================================
// 示例 1: 基础使用
// ============================================

// 在 app.js 中已经自动初始化，用户只需在 UI 中勾选启用即可

// ============================================
// 示例 2: 手动控制插件
// ============================================

// 手动启用插件
function enableLighting() {
  if (ambientLightingPlugin) {
    ambientLightingPlugin.enable();

    // 触发一次背景分析
    if (backgroundSprite && backgroundSprite.texture) {
      const canvas = app.renderer.extract.canvas(backgroundSprite);
      ambientLightingPlugin.analyzeBackground(canvas);
    }
  }
}

// 手动禁用插件
function disableLighting() {
  if (ambientLightingPlugin) {
    ambientLightingPlugin.disable();
  }
}

// ============================================
// 示例 3: 动态调整参数
// ============================================

// 调整效果强度
function setLightingIntensity(value) {
  ambientLightingPlugin.updateConfig({
    intensity: value // 0-1
  });
}

// 调整平滑度
function setLightingSmoothing(value) {
  ambientLightingPlugin.updateConfig({
    smoothing: value // 0-1
  });
}

// 切换色温调整
function toggleColorTemp(enabled) {
  ambientLightingPlugin.updateConfig({
    enableColorTemp: enabled
  });
}

// ============================================
// 示例 4: 获取当前光照数据（调试用）
// ============================================

function debugLightingData() {
  const data = ambientLightingPlugin.getLightingData();
  console.log('当前光照数据:', data);

  // 输出示例:
  // {
  //   current: {
  //     brightness: 1.2,
  //     colorTemp: 5500,
  //     colorTint: { r: 1.0, g: 0.98, b: 0.95 },
  //     lightDirection: { x: 0.3, y: -0.7 }
  //   },
  //   target: { ... },
  //   config: { intensity: 0.5, smoothing: 0.3, ... }
  // }
}

// ============================================
// 示例 5: 添加高级滤镜
// ============================================

// 添加边缘光滤镜
function addRimLight() {
  const rimLight = AdvancedFilters.createRimLightFilter();

  // 自定义参数
  AdvancedFilters.updateFilterUniforms(rimLight, {
    rimColor: [1.0, 1.0, 0.9], // 淡黄色
    rimIntensity: 0.5,
    lightDirection: [0.0, -1.0] // 从上方照射
  });

  // 应用到模型
  const filters = modelContainer.filters || [];
  filters.push(rimLight);
  modelContainer.filters = filters;
}

// 添加环境反射高光
function addEnvironmentReflection() {
  const reflection = AdvancedFilters.createEnvironmentReflectionFilter();

  // 自定义高光位置和颜色
  AdvancedFilters.updateFilterUniforms(reflection, {
    highlightColor: [1.0, 1.0, 0.9],
    highlightIntensity: 0.3,
    highlightPosition: [0.5, 0.3], // 中心偏上
    highlightRadius: 0.4
  });

  const filters = modelContainer.filters || [];
  filters.push(reflection);
  modelContainer.filters = filters;
}

// ============================================
// 示例 6: WebRTC 摄像头集成（扩展功能）
// ============================================

async function enableWebcam() {
  try {
    // 请求摄像头权限
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 1024,
        height: 768,
        facingMode: 'user'
      }
    });

    // 创建 video 元素
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.muted = true;

    // 等待视频加载
    await new Promise(resolve => {
      video.onloadedmetadata = resolve;
    });

    // 创建 Pixi.js 纹理
    const videoTexture = PIXI.Texture.from(video);

    // 替换背景
    backgroundSprite.texture = videoTexture;
    foregroundSprite.texture = videoTexture;

    // 启动实时分析
    setInterval(() => {
      if (ambientLightingPlugin && ambientLightingPlugin.enabled) {
        ambientLightingPlugin.analyzeBackground(video);
      }
    }, 100); // 每 100ms 分析一次

    console.log('摄像头已启用，实时光照分析已开始');

  } catch (error) {
    console.error('摄像头启用失败:', error);
    alert('无法访问摄像头，请检查权限设置');
  }
}

// ============================================
// 示例 7: 预设效果
// ============================================

// 预设 1: 温暖室内光
function applyWarmIndoorPreset() {
  ambientLightingPlugin.updateConfig({
    intensity: 0.6,
    smoothing: 0.4,
    enableColorTemp: true,
    enableBrightness: true
  });
}

// 预设 2: 冷色调办公室
function applyCoolOfficePreset() {
  ambientLightingPlugin.updateConfig({
    intensity: 0.4,
    smoothing: 0.3,
    enableColorTemp: true,
    enableBrightness: true
  });
}

// 预设 3: 强烈效果（演示用）
function applyIntensePreset() {
  ambientLightingPlugin.updateConfig({
    intensity: 0.9,
    smoothing: 0.2,
    enableColorTemp: true,
    enableBrightness: true
  });
}

// 预设 4: 微妙效果（自然融合）
function applySubtlePreset() {
  ambientLightingPlugin.updateConfig({
    intensity: 0.3,
    smoothing: 0.5,
    enableColorTemp: true,
    enableBrightness: true
  });
}

// ============================================
// 示例 8: 响应式调整
// ============================================

// 根据时间自动调整（模拟昼夜变化）
function autoAdjustByTime() {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    // 早晨：冷色调，中等亮度
    ambientLightingPlugin.updateConfig({ intensity: 0.5 });
  } else if (hour >= 12 && hour < 18) {
    // 下午：暖色调，高亮度
    ambientLightingPlugin.updateConfig({ intensity: 0.6 });
  } else if (hour >= 18 && hour < 22) {
    // 傍晚：暖色调，中等亮度
    ambientLightingPlugin.updateConfig({ intensity: 0.7 });
  } else {
    // 夜晚：暖色调，低亮度
    ambientLightingPlugin.updateConfig({ intensity: 0.4 });
  }
}

// ============================================
// 示例 9: 性能监控
// ============================================

function monitorPerformance() {
  let frameCount = 0;
  let lastTime = performance.now();

  app.ticker.add(() => {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime - lastTime >= 1000) {
      const fps = frameCount;
      console.log(`FPS: ${fps}`);

      // 如果 FPS 过低，自动降低更新频率
      if (fps < 30 && ambientLightingPlugin.enabled) {
        ambientLightingPlugin.updateConfig({
          updateInterval: 200 // 降低到 200ms
        });
        console.log('性能优化：降低光照更新频率');
      }

      frameCount = 0;
      lastTime = currentTime;
    }
  });
}

// ============================================
// 示例 10: 完整集成示例
// ============================================

async function setupAdvancedLighting() {
  // 1. 初始化插件（已在 app.js 中完成）
  console.log('插件已初始化');

  // 2. 启用插件
  ambientLightingPlugin.enable();

  // 3. 应用预设
  applySubtlePreset();

  // 4. 添加高级滤镜
  addRimLight();

  // 5. 触发初始分析
  if (backgroundSprite && backgroundSprite.texture) {
    const canvas = app.renderer.extract.canvas(backgroundSprite);
    ambientLightingPlugin.analyzeBackground(canvas);
  }

  // 6. 启动性能监控
  monitorPerformance();

  console.log('高级光照系统已完全启用');
}

// ============================================
// 使用说明
// ============================================

/*
在浏览器控制台中运行以下命令来测试：

// 启用光照融合
enableLighting();

// 查看当前光照数据
debugLightingData();

// 调整效果强度
setLightingIntensity(0.7);

// 应用预设
applyWarmIndoorPreset();

// 启用摄像头（需要用户授权）
enableWebcam();

// 完整设置
setupAdvancedLighting();
*/
