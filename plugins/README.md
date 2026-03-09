# 环境光照融合插件 (Ambient Lighting Fusion Plugin)

## 功能介绍

这个插件系统为 Live2D 桌面遮挡演示项目添加了环境光照分析和动态滤镜功能，让 Live2D 模型能够真正"融入"现实场景，而不是简单的贴图效果。

### 核心功能

1. **环境光照分析** - 自动分析背景图像的亮度、色温和主光源方向
2. **动态色温调整** - 根据环境光自动调整模型色调（暖光/冷光）
3. **亮度适配** - 让模型亮度与环境保持一致
4. **高级滤镜** - 边缘光（Rim Light）等高级光照效果
5. **平滑过渡** - 所有效果都有平滑过渡，避免闪烁

## 快速开始

### 1. 启用插件

在控制面板中找到 "🌟 环境光照融合" 部分，勾选 "启用环境光照（实验性）"。

### 2. 调整参数

- **效果强度** (0-1): 控制光照效果的强度，0 为无效果，1 为最强
- **平滑度** (0-1): 控制过渡速度，值越小变化越快
- **色温调整**: 启用/禁用色温自动调整
- **亮度调整**: 启用/禁用亮度自动调整
- **高级滤镜**: 启用边缘光等高级效果

### 3. 实时效果

插件会每 100ms 分析一次背景图像，并自动应用滤镜效果。所有调整都是实时的。

## 技术原理

### 环境光照分析

插件通过以下步骤分析环境光照：

1. **降采样** - 将背景图像缩小到 256x192 提高性能
2. **亮度计算** - 使用 ITU-R BT.601 标准计算每个像素的亮度
3. **色温估算** - 分析 RGB 比例估算色温（2000K-10000K）
4. **梯度分析** - 计算图像梯度检测主光源方向

### 滤镜系统

#### 基础滤镜（ColorMatrixFilter）
- 色温调整：通过颜色矩阵变换调整 RGB 通道
- 亮度调整：整体亮度缩放

#### 高级滤镜（自定义 WebGL Shader）
- **边缘光滤镜** - 在模型边缘添加光晕效果
- **方向性阴影** - 根据光源方向生成阴影（预留）
- **环境反射** - 模拟环境光反射高光（预留）

## 文件结构

```
plugins/
├── ambient-lighting.js    # 核心插件类
├── advanced-filters.js    # 高级滤镜系统
└── README.md             # 本文档
```

## API 文档

### AmbientLightingPlugin

#### 构造函数

```javascript
new AmbientLightingPlugin(options)
```

**参数:**
- `updateInterval` (number): 更新间隔（毫秒），默认 100
- `intensity` (number): 效果强度 0-1，默认 0.5
- `smoothing` (number): 平滑系数 0-1，默认 0.3
- `enableColorTemp` (boolean): 启用色温调整，默认 true
- `enableBrightness` (boolean): 启用亮度调整，默认 true
- `enableDirectional` (boolean): 启用方向性光照，默认 false

#### 方法

**initialize(pixiApp, modelContainer)**
初始化插件，必须在使用前调用。

**enable()**
启用插件并开始更新循环。

**disable()**
禁用插件并停止更新循环。

**analyzeBackground(imageElement)**
手动触发背景分析。

**updateConfig(newConfig)**
更新插件配置。

**getLightingData()**
获取当前光照数据（用于调试）。

### AdvancedFilters

静态工具类，提供高级滤镜创建方法。

#### 静态方法

**createRimLightFilter()**
创建边缘光滤镜。

**createDirectionalShadowFilter()**
创建方向性阴影滤镜。

**createEnvironmentReflectionFilter()**
创建环境反射高光滤镜。

**updateFilterUniforms(filter, uniforms)**
更新滤镜参数。

## 性能优化

1. **降采样分析** - 背景图像降采样到 256x192 进行分析
2. **可调更新频率** - 默认 100ms，可根据需要调整
3. **平滑过渡** - 避免每帧重新计算，使用插值平滑
4. **条件渲染** - 仅在启用时运行更新循环

## 扩展 WebRTC 摄像头支持

要添加实时摄像头支持，可以参考以下代码：

```javascript
// 获取摄像头流
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: 1024, height: 768 }
});

// 创建 video 元素
const video = document.createElement('video');
video.srcObject = stream;
video.play();

// 创建 Pixi.js 纹理
const videoTexture = PIXI.Texture.from(video);
backgroundSprite.texture = videoTexture;

// 定期分析摄像头画面
setInterval(() => {
  if (ambientLightingPlugin.enabled) {
    ambientLightingPlugin.analyzeBackground(video);
  }
}, 100);
```

## 故障排除

### 插件无效果
- 确认已勾选"启用环境光照"
- 检查效果强度是否设置为 0
- 查看浏览器控制台是否有错误

### 效果闪烁
- 增加"平滑度"参数值
- 降低更新频率（修改 updateInterval）

### 性能问题
- 增加 updateInterval 到 200-300ms
- 禁用高级滤镜
- 降低效果强度

## 未来扩展

- [ ] 深度感知光照（结合现有蒙版系统）
- [ ] 多光源支持
- [ ] 实时阴影投射
- [ ] AI 光场估算集成
- [ ] 更多预设效果

## 许可证

与主项目保持一致。
