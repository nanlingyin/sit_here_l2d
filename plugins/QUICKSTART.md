# 环境光照融合插件 - 快速测试指南

## 🚀 快速启动

### 1. 打开项目
```bash
cd d:/sit_here/pc_l2d_demo
# 使用本地服务器打开（推荐）
python -m http.server 8000
# 或使用 Live Server 等工具
```

### 2. 在浏览器中访问
```
http://localhost:8000/index.html
```

### 3. 启用插件
在左侧控制面板中：
1. 找到 "🌟 环境光照融合" 部分
2. 勾选 "启用环境光照（实验性）"
3. 观察 Live2D 模型的色调变化

## ✅ 功能测试清单

### 基础功能测试

- [ ] **启用/禁用开关**
  - 勾选"启用环境光照"，模型应该立即应用滤镜
  - 取消勾选，模型恢复原始状态
  - 状态栏显示相应提示

- [ ] **效果强度调节**
  - 拖动"效果强度"滑块（0-1）
  - 值越大，环境光影响越明显
  - 实时生效，无需刷新

- [ ] **平滑度调节**
  - 拖动"平滑度"滑块（0-1）
  - 值越大，变化越平滑
  - 观察过渡效果

- [ ] **色温调整**
  - 勾选/取消"色温调整"
  - 观察模型色调变化（暖色/冷色）

- [ ] **亮度调整**
  - 勾选/取消"亮度调整"
  - 观察模型整体明暗变化

- [ ] **高级滤镜**
  - 勾选"高级滤镜（边缘光）"
  - 观察模型边缘的光晕效果

## 🔍 调试方法

### 打开浏览器控制台
按 `F12` 或 `Ctrl+Shift+I`，查看：

1. **检查插件是否加载**
```javascript
console.log(ambientLightingPlugin);
// 应该输出插件对象，不是 undefined
```

2. **查看当前光照数据**
```javascript
ambientLightingPlugin.getLightingData();
// 输出当前亮度、色温等信息
```

3. **检查是否有错误**
查看 Console 标签页，不应该有红色错误信息

## 🎨 效果对比测试

### 测试场景 1：暖色调背景
1. 使用暖色调图片作为背景（黄色、橙色为主）
2. 启用插件
3. 观察模型是否偏暖色

### 测试场景 2：冷色调背景
1. 使用冷色调图片作为背景（蓝色、青色为主）
2. 启用插件
3. 观察模型是否偏冷色

### 测试场景 3：明暗对比
1. 使用明亮背景
2. 观察模型亮度提升
3. 切换到暗色背景
4. 观察模型亮度降低

## 🐛 常见问题排查

### 问题 1：插件无效果
**检查项：**
- [ ] 是否勾选了"启用环境光照"
- [ ] "效果强度"是否设置为 0
- [ ] 浏览器控制台是否有错误
- [ ] 是否使用了支持 WebGL 的浏览器

**解决方法：**
```javascript
// 在控制台手动启用
ambientLightingPlugin.enable();
ambientLightingPlugin.updateConfig({ intensity: 0.7 });
```

### 问题 2：效果太强/太弱
**调整参数：**
```javascript
// 减弱效果
ambientLightingPlugin.updateConfig({ intensity: 0.3 });

// 增强效果
ambientLightingPlugin.updateConfig({ intensity: 0.8 });
```

### 问题 3：变化太快/太慢
**调整平滑度：**
```javascript
// 更平滑（慢）
ambientLightingPlugin.updateConfig({ smoothing: 0.5 });

// 更快速
ambientLightingPlugin.updateConfig({ smoothing: 0.1 });
```

### 问题 4：性能问题（卡顿）
**优化方法：**
```javascript
// 降低更新频率
ambientLightingPlugin.updateConfig({ updateInterval: 200 });

// 禁用高级滤镜
document.getElementById('enableAdvancedFilters').checked = false;
```

## 📊 性能监控

### 查看 FPS
```javascript
let frameCount = 0;
let lastTime = performance.now();

app.ticker.add(() => {
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    console.log(`FPS: ${frameCount}`);
    frameCount = 0;
    lastTime = now;
  }
});
```

**正常 FPS：** 应该保持在 50-60 FPS
**如果低于 30 FPS：** 考虑降低更新频率或禁用高级滤镜

## 🎯 高级测试

### 测试 1：手动触发分析
```javascript
// 获取背景画布
const canvas = app.renderer.extract.canvas(backgroundSprite);

// 手动分析
ambientLightingPlugin.analyzeBackground(canvas);

// 查看结果
console.log(ambientLightingPlugin.getLightingData());
```

### 测试 2：动态调整滤镜
```javascript
// 创建自定义边缘光
const rimLight = AdvancedFilters.createRimLightFilter();

// 调整参数
AdvancedFilters.updateFilterUniforms(rimLight, {
  rimColor: [1.0, 0.8, 0.6], // 橙色边缘光
  rimIntensity: 0.7,
  lightDirection: [0.5, -0.5]
});

// 应用到模型
const filters = modelContainer.filters || [];
filters.push(rimLight);
modelContainer.filters = filters;
```

### 测试 3：预设效果
```javascript
// 温暖室内光
ambientLightingPlugin.updateConfig({
  intensity: 0.6,
  smoothing: 0.4,
  enableColorTemp: true,
  enableBrightness: true
});

// 冷色调办公室
ambientLightingPlugin.updateConfig({
  intensity: 0.4,
  smoothing: 0.3
});
```

## 📝 测试报告模板

测试完成后，可以记录：

```
测试日期：____________________
浏览器：____________________
测试结果：

✅ 基础功能
  - 启用/禁用：[ ]
  - 强度调节：[ ]
  - 平滑度：[ ]
  - 色温调整：[ ]
  - 亮度调整：[ ]

✅ 高级功能
  - 边缘光滤镜：[ ]
  - 性能表现：[ ]

问题记录：
1. ____________________
2. ____________________

建议改进：
1. ____________________
2. ____________________
```

## 🎉 成功标志

如果看到以下现象，说明插件工作正常：

1. ✅ 启用插件后，模型色调立即变化
2. ✅ 调整参数时，效果实时更新
3. ✅ 控制台无错误信息
4. ✅ FPS 保持在 50+
5. ✅ 模型与背景色调协调一致

## 📚 更多资源

- 完整文档：[README.md](./README.md)
- 使用示例：[examples.js](./examples.js)
- 主项目：[../index.html](../index.html)

---

**祝测试顺利！如有问题，请查看控制台日志或参考完整文档。**
