import { AmbientLightingPlugin } from './plugins/ambient-lighting.js';
import { AdvancedFilters } from './plugins/advanced-filters.js';
import { CONFIG } from './config.js';

const PATHS = CONFIG.paths;
const API_CONFIG = CONFIG.api;

const IMAGE_SIZE = { width: 1024, height: 768 };
const DEFAULT_TOP_EDGE = [
  [0, 458],
  [120, 414],
  [305, 390],
  [533, 388],
  [744, 402],
  [1024, 450],
];

const I18N = {
  zh: {
    title: "桌面对面 Live2D 遮挡 Demo",
    tip_main:
      "拖拽模型移动，滚轮缩放。数值输入支持长按左键后左右拖动快速调参。",
    language: "语言",
    unit_switch: "切换",
    section_model: "模型变换",
    model_x: "模型 X (px)",
    model_y: "模型 Y (px)",
    model_scale: "模型缩放",
    model_rotation: "模型旋转",
    unit_free: "无限",
    unit_degree: "度",
    section_mask: "遮挡蒙版",
    mask_offset_y: "蒙版 Y 偏移",
    mask_nodes: "边缘节点数",
    unit_px: "像素",
    unit_count: "个",
    show_handles: "显示边缘节点",
    show_mask_line: "显示蒙版边缘线",
    enable_mask_drag: "启用蒙版拖动（在蒙版区域内拖动）",
    tip_polygon_format:
      "多边形格式: [[x1,y1],[x2,y2],...]，支持完整多边形或仅上边缘点。",
    tip_add_delete_nodes:
      "添加节点模式：点击边缘附近可插入节点。右键节点可删除。",
    tip_mask_mode: "蒙版可在多边形、AI原始蒙版、用户上传蒙版之间切换。",
    tip_scrub: "提示：鼠标停留在数值输入框，长按左键并左右拖动可快速增减。",
    tip_rotation: "按住 Shift + 拖动模型可旋转。右键点击模型可重置旋转。",
    section_lighting: "🌟 环境光照融合",
    enable_lighting: "启用环境光照（实验性）",
    lighting_intensity: "效果强度",
    lighting_smoothing: "平滑度",
    lighting_update_interval: "更新间隔",
    enable_color_temp: "色温调整",
    color_temp_strength: "色温强度",
    enable_brightness: "亮度调整",
    brightness_strength: "亮度强度",
    brightness_range: "亮度范围",
    enable_contrast: "对比度调整",
    contrast_strength: "对比度强度",
    enable_saturation: "饱和度调整",
    saturation_strength: "饱和度强度",
    enable_advanced_filters: "高级滤镜（边缘光）",
    rim_light_intensity: "边缘光强度",
    btn_preset_subtle: "微妙",
    btn_preset_natural: "自然",
    btn_preset_intense: "强烈",
    btn_preset_reset: "重置",
    tip_lighting: "提示：启用光照融合后，模型会根据环境光照分析自动调整色调和亮度，融入真实场景。",
    unit_ratio: "0-1",
    unit_ms: "毫秒",
    unit_multiplier: "倍数",
    status_lighting_enabled: "环境光照融合已启用。",
    status_lighting_disabled: "环境光照融合已禁用。",
    status_preset_applied: "已应用预设：{preset}",
    btn_auto_mask: "自动估计蒙版",
    btn_load_ai_mask: "加载 AI 蒙版(test1)",
    btn_load_ai_mask_exact: "使用AI原始蒙版",
    btn_use_polygon_mask: "使用多边形蒙版",
    btn_upload_user_mask: "上传用户蒙版",
    btn_toggle_add_node: "添加节点模式",
    btn_apply_polygon: "应用多边形",
    btn_copy_polygon: "复制多边形",
    btn_reset_model: "重置模型",
    btn_reset_mask: "重置蒙版",
    btn_reset_all: "重置全部",
    btn_print_config: "输出配置",
    section_background: "📷 背景图片",
    btn_upload_background: "上传背景图片",
    btn_extract_foreground: "提取前景 (AI)",
    tip_background_upload: "上传背景图片后，点击\"提取前景\"通过 AI 生成蒙版。",
    status_background_uploaded: "背景图片已上传：{name}",
    status_background_upload_fail: "上传背景图片失败：{reason}",
    status_extract_no_image: "请先上传背景图片。",
    status_extracting_foreground: "正在提取前景，请稍候...",
    status_foreground_extracted: "前景提取完成！点击\"加载 AI 蒙版\"应用轮廓。",
    status_extract_fail: "提取前景失败：{reason}",
    status_rotation_reset: "模型旋转已重置。",
    status_extract_cancelled: "已取消提取。",
    status_loaded: "加载完成，可拖拽模型和蒙版进行调节。",
    status_live2d_loaded: "Live2D 模型加载成功。",
    status_live2d_fallback: "Live2D 加载失败，已切换静态图占位。",
    status_polygon_applied: "已应用多边形，共 {count} 个上边缘点。",
    status_polygon_invalid: "多边形无效: {reason}",
    status_polygon_copied: "多边形已复制到剪贴板。",
    status_clipboard_denied: "无法访问剪贴板，已选中多边形文本。",
    status_auto_mask_done: "自动蒙版完成，可继续拖动微调。",
    status_auto_mask_fail: "自动估计失败: {reason}",
    status_ai_mask_loaded: "AI 蒙版白色边界描边完成，共 {count} 个节点。",
    status_ai_mask_exact_loaded: "已切换为 AI 原始蒙版（严格一致）。",
    status_ai_mask_fail: "加载 AI 蒙版失败: {reason}",
    status_user_mask_loaded: "已加载用户蒙版：{name}",
    status_user_mask_fail: "加载用户蒙版失败: {reason}",
    status_mask_mode_polygon: "已切换为多边形蒙版模式。",
    status_add_node_mode_on: "添加节点模式已开启：点击边缘附近可插入节点。",
    status_add_node_mode_off: "添加节点模式已关闭。",
    status_node_inserted: "已添加节点。",
    status_node_deleted: "已删除节点。",
    status_node_delete_blocked: "至少保留 2 个节点，无法继续删除。",
    status_node_insert_miss: "未点击到边缘附近，请靠近蒙版边线点击。",
    status_model_reset: "模型参数已重置。",
    status_mask_reset: "蒙版参数已重置。",
    status_all_reset: "全部参数已重置。",
    status_config_printed: "当前配置已输出到控制台。",
    status_number_invalid: "{name} 不是有效数字。",
    status_init_fail: "初始化失败: {reason}",
  },
  en: {
    title: "Desk Occlusion Live2D Demo",
    tip_main:
      "Drag model to move, wheel to scale. Number fields support long press + left/right drag for quick adjustment.",
    language: "Language",
    unit_switch: "switch",
    section_model: "Model Transform",
    model_x: "Model X (px)",
    model_y: "Model Y (px)",
    model_scale: "Model Scale",
    model_rotation: "Model Rotation",
    unit_free: "free",
    unit_degree: "deg",
    section_mask: "Occlusion Mask",
    mask_offset_y: "Mask Offset Y",
    mask_nodes: "Edge Node Count",
    unit_px: "px",
    unit_count: "count",
    show_handles: "Show edge nodes",
    show_mask_line: "Show mask edge line",
    enable_mask_drag: "Enable mask drag (drag inside masked area)",
    tip_polygon_format:
      "Polygon format: [[x1,y1],[x2,y2],...], supports full polygon or top edge only.",
    tip_add_delete_nodes:
      "Add-node mode: click near mask edge to insert a node. Right-click a node to delete it.",
    tip_mask_mode:
      "You can switch between polygon mask, exact AI mask, or your own uploaded mask.",
    tip_scrub:
      "Tip: hover a number field, hold left mouse, then drag left/right to quickly change values.",
    tip_rotation:
      "Hold Shift + drag model to rotate. Right-click model to reset rotation.",
    section_lighting: "🌟 Ambient Lighting Fusion",
    enable_lighting: "Enable Ambient Lighting (Experimental)",
    lighting_intensity: "Effect Intensity",
    lighting_smoothing: "Smoothing",
    lighting_update_interval: "Update Interval",
    enable_color_temp: "Color Temperature Adjustment",
    color_temp_strength: "Color Temp Strength",
    enable_brightness: "Brightness Adjustment",
    brightness_strength: "Brightness Strength",
    brightness_range: "Brightness Range",
    enable_contrast: "Contrast Adjustment",
    contrast_strength: "Contrast Strength",
    enable_saturation: "Saturation Adjustment",
    saturation_strength: "Saturation Strength",
    enable_advanced_filters: "Advanced Filters (Rim Light)",
    rim_light_intensity: "Rim Light Intensity",
    btn_preset_subtle: "Subtle",
    btn_preset_natural: "Natural",
    btn_preset_intense: "Intense",
    btn_preset_reset: "Reset",
    tip_lighting: "Tip: Enable lighting fusion to make the model blend into the scene based on ambient light analysis.",
    unit_ratio: "0-1",
    unit_ms: "ms",
    unit_multiplier: "0.5-2x",
    status_lighting_enabled: "Ambient lighting fusion enabled.",
    status_lighting_disabled: "Ambient lighting fusion disabled.",
    status_preset_applied: "Preset applied: {preset}",
    btn_auto_mask: "Auto Estimate Mask",
    btn_load_ai_mask: "Load AI Mask (test1)",
    btn_load_ai_mask_exact: "Use Exact AI Mask",
    btn_use_polygon_mask: "Use Polygon Mask",
    btn_upload_user_mask: "Upload User Mask",
    btn_toggle_add_node: "Add Node Mode",
    btn_apply_polygon: "Apply Polygon",
    btn_copy_polygon: "Copy Polygon",
    btn_reset_model: "Reset Model",
    btn_reset_mask: "Reset Mask",
    btn_reset_all: "Reset All",
    btn_print_config: "Print Config",
    section_background: "📷 Background Image",
    btn_upload_background: "Upload Background",
    btn_extract_foreground: "Extract Foreground (AI)",
    tip_background_upload: "Upload a background image, then click 'Extract Foreground' to generate mask via AI.",
    status_background_uploaded: "Background uploaded: {name}",
    status_background_upload_fail: "Failed to upload background: {reason}",
    status_extract_no_image: "Please upload a background image first.",
    status_extracting_foreground: "Extracting foreground, please wait...",
    status_foreground_extracted: "Foreground extracted! Click 'Load AI Mask' to apply contour.",
    status_extract_fail: "Failed to extract foreground: {reason}",
    status_rotation_reset: "Model rotation reset.",
    status_extract_cancelled: "Extraction cancelled.",
    status_loaded: "Loaded. Drag model and mask to tune placement.",
    status_live2d_loaded: "Live2D loaded.",
    status_live2d_fallback: "Live2D load failed. Fallback image in use.",
    status_polygon_applied: "Polygon applied with {count} top-edge points.",
    status_polygon_invalid: "Invalid polygon: {reason}",
    status_polygon_copied: "Polygon copied to clipboard.",
    status_clipboard_denied: "Clipboard denied. Polygon text selected.",
    status_auto_mask_done: "Auto mask complete. You can refine by dragging.",
    status_auto_mask_fail: "Auto estimate failed: {reason}",
    status_ai_mask_loaded: "AI white-boundary tracing complete with {count} nodes.",
    status_ai_mask_exact_loaded: "Switched to exact AI mask mode.",
    status_ai_mask_fail: "Failed to load AI mask: {reason}",
    status_user_mask_loaded: "User mask loaded: {name}",
    status_user_mask_fail: "Failed to load user mask: {reason}",
    status_mask_mode_polygon: "Switched to polygon mask mode.",
    status_add_node_mode_on: "Add-node mode ON: click near mask edge to insert a node.",
    status_add_node_mode_off: "Add-node mode OFF.",
    status_node_inserted: "Node inserted.",
    status_node_deleted: "Node deleted.",
    status_node_delete_blocked: "Need at least 2 nodes. Cannot delete more.",
    status_node_insert_miss: "No nearby edge found. Click closer to the mask edge.",
    status_model_reset: "Model settings reset.",
    status_mask_reset: "Mask settings reset.",
    status_all_reset: "All settings reset.",
    status_config_printed: "Current config printed to console.",
    status_number_invalid: "{name} is not a valid number.",
    status_init_fail: "Init failed: {reason}",
  },
};

const DEFAULT_STATE = {
  language: "zh",
  modelXPx: IMAGE_SIZE.width * 0.5,
  modelYPx: IMAGE_SIZE.height * 0.66,
  modelScaleMul: 0.72,
  modelRotationDeg: 0,
  occlusionOffsetY: 0,
  topEdgePoints: clonePoints(DEFAULT_TOP_EDGE),
  edgeNodeCount: DEFAULT_TOP_EDGE.length,
  showHandles: true,
  showMaskLine: true,
  enableMaskDrag: true,
  addNodeMode: false,
};

const state = {
  language: DEFAULT_STATE.language,
  modelXPx: DEFAULT_STATE.modelXPx,
  modelYPx: DEFAULT_STATE.modelYPx,
  modelScaleMul: DEFAULT_STATE.modelScaleMul,
  modelRotationDeg: DEFAULT_STATE.modelRotationDeg,
  occlusionOffsetY: DEFAULT_STATE.occlusionOffsetY,
  topEdgePoints: clonePoints(DEFAULT_STATE.topEdgePoints),
  edgeNodeCount: DEFAULT_STATE.edgeNodeCount,
  showHandles: DEFAULT_STATE.showHandles,
  showMaskLine: DEFAULT_STATE.showMaskLine,
  enableMaskDrag: DEFAULT_STATE.enableMaskDrag,
  addNodeMode: DEFAULT_STATE.addNodeMode,
  uploadedBackgroundImage: null,
  extractedMaskTexture: null,
};

const ui = {
  languageSelect: document.getElementById("languageSelect"),
  xInput: document.getElementById("xInput"),
  yInput: document.getElementById("yInput"),
  scaleInput: document.getElementById("scaleInput"),
  rotationInput: document.getElementById("rotationInput"),
  occlusionOffsetInput: document.getElementById("occlusionOffsetInput"),
  edgeNodeCountInput: document.getElementById("edgeNodeCountInput"),
  showHandles: document.getElementById("showHandles"),
  showMaskLine: document.getElementById("showMaskLine"),
  enableMaskDrag: document.getElementById("enableMaskDrag"),
  polygonInput: document.getElementById("polygonInput"),
  enableLighting: document.getElementById("enableLighting"),
  lightingIntensity: document.getElementById("lightingIntensity"),
  lightingSmoothing: document.getElementById("lightingSmoothing"),
  lightingUpdateInterval: document.getElementById("lightingUpdateInterval"),
  enableColorTemp: document.getElementById("enableColorTemp"),
  colorTempStrength: document.getElementById("colorTempStrength"),
  enableBrightness: document.getElementById("enableBrightness"),
  brightnessStrength: document.getElementById("brightnessStrength"),
  brightnessRange: document.getElementById("brightnessRange"),
  enableContrast: document.getElementById("enableContrast"),
  contrastStrength: document.getElementById("contrastStrength"),
  enableSaturation: document.getElementById("enableSaturation"),
  saturationStrength: document.getElementById("saturationStrength"),
  enableAdvancedFilters: document.getElementById("enableAdvancedFilters"),
  rimLightIntensity: document.getElementById("rimLightIntensity"),
  lightingPresetSubtle: document.getElementById("lightingPresetSubtle"),
  lightingPresetNatural: document.getElementById("lightingPresetNatural"),
  lightingPresetIntense: document.getElementById("lightingPresetIntense"),
  lightingPresetReset: document.getElementById("lightingPresetReset"),
  autoMaskBtn: document.getElementById("autoMask"),
  loadAiMaskBtn: document.getElementById("loadAiMask"),
  toggleAddNodeBtn: document.getElementById("toggleAddNode"),
  uploadBackgroundBtn: document.getElementById("uploadBackground"),
  extractForegroundBtn: document.getElementById("extractForeground"),
  backgroundFileInput: document.getElementById("backgroundFileInput"),
  resetModelBtn: document.getElementById("resetModel"),
  resetOcclusionBtn: document.getElementById("resetOcclusion"),
  resetAllBtn: document.getElementById("resetAll"),
  saveBtn: document.getElementById("save"),
  status: document.getElementById("status"),
};

let app;
let sceneRoot;
let modelContainer;
let foregroundSprite;
let tableMask;
let maskEditorLayer;
let maskDragArea;
let maskOutline;
let handleNodes = [];
let backgroundTexture;
let backgroundSprite;
let actor;
let baseModelScale = 1;

// 环境光照插件实例
let ambientLightingPlugin = null;
let advancedFiltersEnabled = false;
let rimLightFilter = null;

let modelDrag = null;
let handleDrag = null;
let maskDrag = null;
let scrub = null;

let lastStatus = { key: "status_loaded", vars: {} };

boot().catch((error) => {
  console.error(error);
  setStatusKey("status_init_fail", {
    reason: error?.message ?? String(error),
  });
});

async function boot() {
  app = new PIXI.Application({
    resizeTo: window,
    antialias: true,
    autoDensity: true,
    backgroundAlpha: 0,
  });
  document.getElementById("stage").appendChild(app.view);

  sceneRoot = new PIXI.Container();
  sceneRoot.sortableChildren = true;
  app.stage.addChild(sceneRoot);

  app.stage.interactive = true;
  app.stage.hitArea = new PIXI.Rectangle(-100000, -100000, 200000, 200000);
  app.stage.on("pointerdown", onStagePointerDown);
  app.stage.on("pointermove", onStagePointerMove);
  app.stage.on("pointerup", onStagePointerUp);
  app.stage.on("pointerupoutside", onStagePointerUp);

  backgroundTexture = await PIXI.Texture.fromURL(PATHS.background);
  backgroundSprite = new PIXI.Sprite(backgroundTexture);
  backgroundSprite.width = IMAGE_SIZE.width;
  backgroundSprite.height = IMAGE_SIZE.height;
  backgroundSprite.zIndex = 0;
  sceneRoot.addChild(backgroundSprite);

  modelContainer = new PIXI.Container();
  modelContainer.zIndex = 10;
  sceneRoot.addChild(modelContainer);

  // 初始化环境光照插件
  ambientLightingPlugin = new AmbientLightingPlugin({
    updateInterval: 100,
    intensity: 0.5,
    smoothing: 0.3,
    enableColorTemp: true,
    enableBrightness: true,
  });
  ambientLightingPlugin.initialize(app, modelContainer);

  foregroundSprite = new PIXI.Sprite(backgroundTexture);
  foregroundSprite.width = IMAGE_SIZE.width;
  foregroundSprite.height = IMAGE_SIZE.height;
  foregroundSprite.zIndex = 20;
  sceneRoot.addChild(foregroundSprite);

  tableMask = new PIXI.Graphics();
  tableMask.zIndex = 30;
  // Mask source should affect compositing but not be visibly rendered.
  tableMask.renderable = false;
  sceneRoot.addChild(tableMask);
  foregroundSprite.mask = tableMask;

  maskEditorLayer = new PIXI.Container();
  maskEditorLayer.zIndex = 40;
  sceneRoot.addChild(maskEditorLayer);

  maskDragArea = new PIXI.Graphics();
  maskDragArea.interactive = true;
  maskDragArea.cursor = "move";
  maskDragArea.on("pointerdown", onMaskDragAreaPointerDown);
  maskEditorLayer.addChild(maskDragArea);

  maskOutline = new PIXI.Graphics();
  maskEditorLayer.addChild(maskOutline);

  actor = await loadLive2DActor();
  setupUiBindings();
  applyLanguage();
  redrawOcclusionMask(true);
  applyActorTransform();
  syncUiFromState(true);
  resizeScene();

  app.view.addEventListener(
    "wheel",
    (event) => {
      onWheelScale(event);
      event.preventDefault();
    },
    { passive: false }
  );
  app.view.addEventListener("contextmenu", (event) => event.preventDefault());

  window.addEventListener("resize", resizeScene);
  window.addEventListener("pointermove", onWindowPointerMove, true);
  window.addEventListener("pointerup", onWindowPointerUp, true);
  window.addEventListener("pointercancel", onWindowPointerUp, true);

  setStatusKey("status_loaded");
}

async function loadLive2DActor() {
  let loadedActor;
  try {
    if (!PIXI?.live2d?.Live2DModel) {
      throw new Error("pixi-live2d-display not mounted");
    }
    loadedActor = await PIXI.live2d.Live2DModel.from(PATHS.model, {
      autoInteract: false,
    });
    setStatusKey("status_live2d_loaded");
  } catch (error) {
    console.warn("Live2D load failed, fallback to static image:", error);
    setStatusKey("status_live2d_fallback");
    const fallbackTexture = await PIXI.Texture.fromURL(PATHS.fallback);
    loadedActor = new PIXI.Sprite(fallbackTexture);
  }

  if (!loadedActor.anchor) {
    loadedActor.anchor = new PIXI.Point(0.5, 1);
  } else {
    loadedActor.anchor.set(0.5, 1);
  }

  loadedActor.zIndex = 12;
  loadedActor.interactive = true;
  loadedActor.buttonMode = true;
  loadedActor.cursor = "grab";
  loadedActor.on("pointerdown", onActorPointerDown);
  modelContainer.addChild(loadedActor);

  if (loadedActor.height > 0) {
    const targetHeight = IMAGE_SIZE.height * 0.88;
    baseModelScale = targetHeight / loadedActor.height;
  } else {
    baseModelScale = 1;
  }

  return loadedActor;
}

function setupUiBindings() {
  console.log("setupUiBindings called");
  console.log("languageSelect:", ui.languageSelect);
  console.log("uploadBackgroundBtn:", ui.uploadBackgroundBtn);
  console.log("backgroundFileInput:", ui.backgroundFileInput);

  ui.languageSelect.addEventListener("change", () => {
    console.log("Language changed to:", ui.languageSelect.value);
    state.language = ui.languageSelect.value === "en" ? "en" : "zh";
    applyLanguage();
  });

  bindNumberInput(ui.xInput, {
    key: "modelXPx",
    scrubStep: 1,
    onValue: () => applyActorTransform(),
  });
  bindNumberInput(ui.yInput, {
    key: "modelYPx",
    scrubStep: 1,
    onValue: () => applyActorTransform(),
  });
  bindNumberInput(ui.scaleInput, {
    key: "modelScaleMul",
    scrubStep: 0.01,
    onValue: () => applyActorTransform(),
  });
  bindNumberInput(ui.rotationInput, {
    key: "modelRotationDeg",
    scrubStep: 1,
    onValue: () => applyActorTransform(),
  });
  bindNumberInput(ui.occlusionOffsetInput, {
    key: "occlusionOffsetY",
    scrubStep: 1,
    onValue: () => redrawOcclusionMask(false),
  });
  bindNumberInput(ui.edgeNodeCountInput, {
    key: "edgeNodeCount",
    scrubStep: 0.2,
    integer: true,
    min: 2,
    max: 300,
    onValue: (value) => setEdgeNodeCount(value),
  });

  ui.showHandles.addEventListener("change", () => {
    state.showHandles = ui.showHandles.checked;
    redrawMaskEditor(false);
  });
  ui.showMaskLine.addEventListener("change", () => {
    state.showMaskLine = ui.showMaskLine.checked;
    redrawMaskEditor(false);
  });
  ui.enableMaskDrag.addEventListener("change", () => {
    state.enableMaskDrag = ui.enableMaskDrag.checked;
    redrawMaskEditor(false);
  });

  ui.autoMaskBtn.addEventListener("click", () => {
    try {
      const targetCount = clampInt(state.edgeNodeCount, 2, 300);
      const topEdge = autoEstimateTopEdge(targetCount);
      state.topEdgePoints = topEdge;
      state.edgeNodeCount = topEdge.length;
      redrawOcclusionMask(true);
      syncUiFromState(true);
      setStatusKey("status_auto_mask_done");
    } catch (error) {
      setStatusKey("status_auto_mask_fail", {
        reason: error?.message ?? String(error),
      });
    }
  });

  ui.loadAiMaskBtn.addEventListener("click", async () => {
    try {
      let loaded;

      // Use extracted mask texture if available
      if (state.extractedMaskTexture) {
        console.log("Using extracted mask texture");
        const points = extractTopEdgePointsFromMaskTexture(state.extractedMaskTexture);
        if (points.length < 2) {
          throw new Error("cannot trace usable edge from AI mask");
        }
        loaded = { topEdgePoints: points };
      } else {
        // Fall back to loading from default path
        console.log("Loading mask from default path:", PATHS.aiMaskImage);
        loaded = await loadTopEdgeFromMaskImage(PATHS.aiMaskImage);
      }

      state.topEdgePoints = loaded.topEdgePoints;
      state.edgeNodeCount = loaded.topEdgePoints.length;
      if (state.topEdgePoints.length > 280) {
        state.showHandles = false;
      }
      redrawOcclusionMask(true);
      syncUiFromState(true);
      setStatusKey("status_ai_mask_loaded", { count: loaded.topEdgePoints.length });
    } catch (error) {
      setStatusKey("status_ai_mask_fail", {
        reason: error?.message ?? String(error),
      });
    }
  });

  ui.toggleAddNodeBtn.addEventListener("click", () => {
    state.addNodeMode = !state.addNodeMode;
    refreshAddNodeButtonState();
    setStatusKey(state.addNodeMode ? "status_add_node_mode_on" : "status_add_node_mode_off");
  });

  // Upload background image
  ui.uploadBackgroundBtn.addEventListener("click", () => {
    console.log("Upload background button clicked");
    ui.backgroundFileInput.click();
  });

  ui.backgroundFileInput.addEventListener("change", async (e) => {
    console.log("File input changed, files:", e.target.files);
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    console.log("Selected file:", file.name);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.onload = () => {
          state.uploadedBackgroundImage = img;
          console.log("Image loaded, creating texture");

          // Create new texture from loaded image
          const baseTexture = new PIXI.BaseTexture(img);
          const texture = new PIXI.Texture(baseTexture);

          // Replace background sprite texture
          if (backgroundSprite) {
            backgroundSprite.texture = texture;
            backgroundSprite.width = IMAGE_SIZE.width;
            backgroundSprite.height = IMAGE_SIZE.height;
          }

          // Replace foreground sprite texture
          if (foregroundSprite) {
            foregroundSprite.texture = texture;
            foregroundSprite.width = IMAGE_SIZE.width;
            foregroundSprite.height = IMAGE_SIZE.height;
          }

          console.log("Background and foreground updated");
          setStatusKey("status_background_uploaded", { name: file.name });
        };
        img.onerror = () => {
          setStatusKey("status_background_upload_fail", { reason: "Invalid image file" });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setStatusKey("status_background_upload_fail", {
        reason: error?.message ?? String(error),
      });
    }
  });

  // Extract foreground via API
  ui.extractForegroundBtn.addEventListener("click", async () => {
    if (!state.uploadedBackgroundImage) {
      setStatusKey("status_extract_no_image");
      return;
    }

    try {
      setStatusKey("status_extracting_foreground");

      // Convert image to base64
      const canvas = document.createElement("canvas");
      canvas.width = state.uploadedBackgroundImage.width;
      canvas.height = state.uploadedBackgroundImage.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(state.uploadedBackgroundImage, 0, 0);

      const base64Image = canvas.toDataURL("image/jpeg", 0.95);

      // Call API to extract foreground using chat completions
      const url = API_CONFIG.baseUrl.replace(/\/$/, "") + "/v1/chat/completions";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_CONFIG.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: API_CONFIG.model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Generate a strict black-and-white occlusion mask aligned pixel-perfect to the input photo. Task: mark the ENTIRE tabletop plane in front of the camera as WHITE, including empty table surface texture, table edge, and all objects resting on the table (hotpot, bowls, plates, chopsticks, cups, food). Also mark any near-camera foreground objects as WHITE. Mark chairs, walls, floor, and all background regions as BLACK. Output only one flat mask image, no text, no decoration, no style transfer, no extra objects."
                },
                {
                  type: "image_url",
                  image_url: { url: base64Image }
                }
              ]
            }
          ],
          modalities: ["text", "image"],
          temperature: 0
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const result = await response.json();
      console.log("API response:", result);

      // Extract image bytes from response (matching Python logic)
      let maskImageDataUrl = null;

      if (result.choices && result.choices[0] && result.choices[0].message) {
        const message = result.choices[0].message;
        const content = message.content;

        // Format 1: content is array
        if (Array.isArray(content)) {
          for (const part of content) {
            if (typeof part !== "object") continue;

            // Check for image_url or input_image type
            if (part.type === "image_url" || part.type === "input_image") {
              const src = typeof part.image_url === "object"
                ? part.image_url?.url
                : part.image_url;
              if (typeof src === "string" && src.startsWith("data:image/")) {
                maskImageDataUrl = src;
                break;
              }
            }

            // Check for output_image or image type with b64_json
            if ((part.type === "output_image" || part.type === "image") && typeof part.b64_json === "string") {
              maskImageDataUrl = `data:image/png;base64,${part.b64_json}`;
              break;
            }
          }
        }
        // Format 2: content is string with data URI
        else if (typeof content === "string") {
          const dataUriMatch = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
          if (dataUriMatch) {
            maskImageDataUrl = dataUriMatch[0];
          }
        }
      }

      if (!maskImageDataUrl) {
        console.error("Could not find image in response:", result);
        throw new Error("No mask image found in API response");
      }

      console.log("Loading mask image, data URL length:", maskImageDataUrl.length);

      // Load the generated mask image and convert to grayscale
      const maskImg = new Image();
      maskImg.onload = () => {
        console.log("Mask image loaded, size:", maskImg.width, "x", maskImg.height);

        // Convert to grayscale mask
        const canvas = document.createElement("canvas");
        canvas.width = maskImg.width;
        canvas.height = maskImg.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(maskImg, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
          // Keep alpha channel as is
        }

        ctx.putImageData(imageData, 0, 0);

        // Create a PIXI texture from the canvas
        const baseTexture = new PIXI.BaseTexture(canvas);
        const texture = new PIXI.Texture(baseTexture);

        // Save the texture to state so loadTopEdgeFromMaskImage can use it
        state.extractedMaskTexture = texture;

        console.log("Grayscale mask ready, saved to state.extractedMaskTexture");
        setStatusKey("status_foreground_extracted");
      };
      maskImg.onerror = () => {
        console.error("Failed to load mask image");
        setStatusKey("status_extract_fail", { reason: "Failed to load generated mask" });
      };
      maskImg.src = maskImageDataUrl;
    } catch (error) {
      setStatusKey("status_extract_fail", {
        reason: error?.message ?? String(error),
      });
    }
  });

  ui.resetModelBtn.addEventListener("click", () => {
    state.modelXPx = DEFAULT_STATE.modelXPx;
    state.modelYPx = DEFAULT_STATE.modelYPx;
    state.modelScaleMul = DEFAULT_STATE.modelScaleMul;
    applyActorTransform();
    syncUiFromState(false);
    setStatusKey("status_model_reset");
  });

  ui.resetOcclusionBtn.addEventListener("click", () => {
    state.occlusionOffsetY = DEFAULT_STATE.occlusionOffsetY;
    state.topEdgePoints = clonePoints(DEFAULT_STATE.topEdgePoints);
    state.edgeNodeCount = DEFAULT_STATE.edgeNodeCount;
    state.showHandles = DEFAULT_STATE.showHandles;
    state.showMaskLine = DEFAULT_STATE.showMaskLine;
    state.enableMaskDrag = DEFAULT_STATE.enableMaskDrag;
    state.addNodeMode = DEFAULT_STATE.addNodeMode;
    redrawOcclusionMask(true);
    syncUiFromState(true);
    setStatusKey("status_mask_reset");
  });

  ui.resetAllBtn.addEventListener("click", () => {
    state.modelXPx = DEFAULT_STATE.modelXPx;
    state.modelYPx = DEFAULT_STATE.modelYPx;
    state.modelScaleMul = DEFAULT_STATE.modelScaleMul;
    state.occlusionOffsetY = DEFAULT_STATE.occlusionOffsetY;
    state.topEdgePoints = clonePoints(DEFAULT_STATE.topEdgePoints);
    state.edgeNodeCount = DEFAULT_STATE.edgeNodeCount;
    state.showHandles = DEFAULT_STATE.showHandles;
    state.showMaskLine = DEFAULT_STATE.showMaskLine;
    state.enableMaskDrag = DEFAULT_STATE.enableMaskDrag;
    state.addNodeMode = DEFAULT_STATE.addNodeMode;
    redrawOcclusionMask(true);
    applyActorTransform();
    syncUiFromState(true);
    setStatusKey("status_all_reset");
  });

  ui.saveBtn.addEventListener("click", () => {
    const config = {
      language: state.language,
      modelXPx: round(state.modelXPx),
      modelYPx: round(state.modelYPx),
      modelScaleMul: round(state.modelScaleMul),
      occlusionOffsetY: round(state.occlusionOffsetY),
      edgeNodeCount: state.edgeNodeCount,
      showHandles: state.showHandles,
      showMaskLine: state.showMaskLine,
      enableMaskDrag: state.enableMaskDrag,
      addNodeMode: state.addNodeMode,
      topEdgePoints: serializedTopEdge(),
      occlusionPolygon: serializedPolygon(),
    };
    console.log("Current config:", JSON.stringify(config));
    setStatusKey("status_config_printed");
  });

  // 环境光照插件事件绑定
  ui.enableLighting.addEventListener("change", () => {
    if (ui.enableLighting.checked) {
      ambientLightingPlugin.enable();
      // 触发一次背景分析
      if (backgroundSprite && backgroundSprite.texture) {
        const canvas = app.renderer.extract.canvas(backgroundSprite);
        ambientLightingPlugin.analyzeBackground(canvas);
      }
      setStatusKey("status_lighting_enabled");
    } else {
      ambientLightingPlugin.disable();
      setStatusKey("status_lighting_disabled");
    }
  });

  // 使用 bindNumberInput 支持拖动调整
  bindNumberInput(ui.lightingIntensity, {
    scrubStep: 0.01,
    min: 0,
    max: 1,
    onValue: (value) => {
      ambientLightingPlugin.updateConfig({ intensity: value });
    }
  });

  bindNumberInput(ui.lightingSmoothing, {
    scrubStep: 0.01,
    min: 0,
    max: 1,
    onValue: (value) => {
      ambientLightingPlugin.updateConfig({ smoothing: value });
    }
  });

  bindNumberInput(ui.lightingUpdateInterval, {
    scrubStep: 10,
    min: 50,
    max: 500,
    integer: true,
    onValue: (value) => {
      ambientLightingPlugin.updateConfig({ updateInterval: value });
    }
  });

  ui.enableColorTemp.addEventListener("change", () => {
    ambientLightingPlugin.updateConfig({
      enableColorTemp: ui.enableColorTemp.checked
    });
  });

  bindNumberInput(ui.colorTempStrength, {
    scrubStep: 0.01,
    min: 0,
    max: 1,
    onValue: (value) => {
      ambientLightingPlugin.colorTempStrength = value;
      if (ambientLightingPlugin.enabled) {
        ambientLightingPlugin.applyFilter();
      }
    }
  });

  ui.enableBrightness.addEventListener("change", () => {
    ambientLightingPlugin.updateConfig({
      enableBrightness: ui.enableBrightness.checked
    });
  });

  bindNumberInput(ui.brightnessStrength, {
    scrubStep: 0.01,
    min: 0,
    max: 1,
    onValue: (value) => {
      ambientLightingPlugin.brightnessStrength = value;
      if (ambientLightingPlugin.enabled) {
        ambientLightingPlugin.applyFilter();
      }
    }
  });

  bindNumberInput(ui.brightnessRange, {
    scrubStep: 0.05,
    min: 0.5,
    max: 2.0,
    onValue: (value) => {
      ambientLightingPlugin.brightnessRange = value;
      if (ambientLightingPlugin.enabled) {
        ambientLightingPlugin.applyFilter();
      }
    }
  });

  ui.enableContrast.addEventListener("change", () => {
    ambientLightingPlugin.enableContrast = ui.enableContrast.checked;
    if (ambientLightingPlugin.enabled) {
      ambientLightingPlugin.applyFilter();
    }
  });

  bindNumberInput(ui.contrastStrength, {
    scrubStep: 0.01,
    min: 0,
    max: 1,
    onValue: (value) => {
      ambientLightingPlugin.contrastStrength = value;
      if (ambientLightingPlugin.enabled) {
        ambientLightingPlugin.applyFilter();
      }
    }
  });

  ui.enableSaturation.addEventListener("change", () => {
    ambientLightingPlugin.enableSaturation = ui.enableSaturation.checked;
    if (ambientLightingPlugin.enabled) {
      ambientLightingPlugin.applyFilter();
    }
  });

  bindNumberInput(ui.saturationStrength, {
    scrubStep: 0.01,
    min: 0,
    max: 1,
    onValue: (value) => {
      ambientLightingPlugin.saturationStrength = value;
      if (ambientLightingPlugin.enabled) {
        ambientLightingPlugin.applyFilter();
      }
    }
  });

  ui.enableAdvancedFilters.addEventListener("change", () => {
    advancedFiltersEnabled = ui.enableAdvancedFilters.checked;

    if (advancedFiltersEnabled && modelContainer) {
      // 创建边缘光滤镜
      if (!rimLightFilter) {
        rimLightFilter = AdvancedFilters.createRimLightFilter();
      }
      const filters = modelContainer.filters || [];
      if (!filters.includes(rimLightFilter)) {
        filters.push(rimLightFilter);
        modelContainer.filters = filters;
      }
    } else if (rimLightFilter && modelContainer) {
      // 移除边缘光滤镜
      if (modelContainer.filters) {
        modelContainer.filters = modelContainer.filters.filter(f => f !== rimLightFilter);
      }
    }
  });

  bindNumberInput(ui.rimLightIntensity, {
    scrubStep: 0.01,
    min: 0,
    max: 1,
    onValue: (value) => {
      if (rimLightFilter) {
        AdvancedFilters.updateFilterUniforms(rimLightFilter, {
          rimIntensity: value
        });
      }
    }
  });

  // 预设按钮
  ui.lightingPresetSubtle.addEventListener("click", () => {
    applyLightingPreset("subtle");
  });

  ui.lightingPresetNatural.addEventListener("click", () => {
    applyLightingPreset("natural");
  });

  ui.lightingPresetIntense.addEventListener("click", () => {
    applyLightingPreset("intense");
  });

  ui.lightingPresetReset.addEventListener("click", () => {
    applyLightingPreset("reset");
  });

  refreshAddNodeButtonState();
}

function bindNumberInput(inputElement, options) {
  const applyValue = (rawValue) => {
    let value = Number(rawValue);
    if (!Number.isFinite(value)) {
      const label = t(labelKeyForStateKey(options.key));
      setStatusKey("status_number_invalid", { name: label });
      return false;
    }
    if (options.integer) {
      value = Math.round(value);
    }
    if (Number.isFinite(options.min)) {
      value = Math.max(options.min, value);
    }
    if (Number.isFinite(options.max)) {
      value = Math.min(options.max, value);
    }

    state[options.key] = value;
    if (typeof options.onValue === "function") {
      options.onValue(value);
    }
    syncUiFromState(false);
    return true;
  };

  const handler = () => {
    if (inputElement.value.trim() === "") {
      return;
    }
    applyValue(inputElement.value);
  };
  inputElement.addEventListener("input", handler);
  inputElement.addEventListener("change", handler);
  inputElement.addEventListener("blur", () => syncUiFromState(false));

  attachScrubBehavior(inputElement, {
    key: options.key,
    scrubStep: options.scrubStep,
    applyValue,
  });
}

function attachScrubBehavior(inputElement, config) {
  let holdTimer = null;

  inputElement.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }

    const startValue = Number(state[config.key]);
    if (!Number.isFinite(startValue)) {
      return;
    }

    const pointerId = event.pointerId;
    holdTimer = window.setTimeout(() => {
      scrub = {
        pointerId,
        input: inputElement,
        startX: event.clientX,
        startValue,
        config,
      };
      inputElement.classList.add("scrubbing");
      try {
        inputElement.setPointerCapture(pointerId);
      } catch {
        // No-op.
      }
    }, 220);

    const cancelPending = (upEvent) => {
      if (upEvent.pointerId !== pointerId) {
        return;
      }
      if (holdTimer !== null) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
      window.removeEventListener("pointerup", cancelPending, true);
      window.removeEventListener("pointercancel", cancelPending, true);
    };

    window.addEventListener("pointerup", cancelPending, true);
    window.addEventListener("pointercancel", cancelPending, true);
  });
}

function onWindowPointerMove(event) {
  if (!scrub || event.pointerId !== scrub.pointerId) {
    return;
  }

  const speed = event.shiftKey ? 5 : event.altKey ? 0.2 : 1;
  const deltaX = event.clientX - scrub.startX;
  const rawValue = scrub.startValue + deltaX * scrub.config.scrubStep * speed;
  scrub.config.applyValue(rawValue);
  event.preventDefault();
}

function onWindowPointerUp(event) {
  clearDragByPointer(event.pointerId);
  if (scrub && scrub.pointerId === event.pointerId) {
    scrub.input.classList.remove("scrubbing");
    try {
      scrub.input.releasePointerCapture(scrub.pointerId);
    } catch {
      // No-op.
    }
    scrub = null;
  }
}

function onActorPointerDown(event) {
  if (scrub) {
    return;
  }

  // Right-click to reset rotation
  if (event.data.button === 2) {
    state.modelRotationDeg = 0;
    applyActorTransform();
    syncUiFromState(false);
    setStatusKey("status_rotation_reset");
    event.stopPropagation();
    return;
  }

  const localPos = event.data.getLocalPosition(sceneRoot);
  const isRotating = event.data.originalEvent.shiftKey;

  if (isRotating) {
    // Calculate initial angle for rotation mode
    const dx = localPos.x - state.modelXPx;
    const dy = localPos.y - state.modelYPx;
    const currentAngle = Math.atan2(dy, dx);
    const currentAngleDeg = (currentAngle * 180) / Math.PI;

    modelDrag = {
      pointerId: event.data.pointerId,
      isRotating: true,
      startAngleOffset: currentAngleDeg - state.modelRotationDeg,
    };
  } else {
    // Translation mode
    modelDrag = {
      pointerId: event.data.pointerId,
      isRotating: false,
      offsetX: state.modelXPx - localPos.x,
      offsetY: state.modelYPx - localPos.y,
    };
  }

  actor.cursor = "grabbing";
  event.stopPropagation();
}

function onMaskDragAreaPointerDown(event) {
  if (state.addNodeMode) {
    return;
  }
  if (!state.enableMaskDrag || scrub) {
    return;
  }
  if (handleDrag) {
    return;
  }
  const localPos = event.data.getLocalPosition(sceneRoot);
  maskDrag = {
    pointerId: event.data.pointerId,
    startX: localPos.x,
    startY: localPos.y,
    startTopEdge: clonePoints(state.topEdgePoints),
  };
  event.stopPropagation();
}

function onHandlePointerDown(event) {
  if (scrub) {
    return;
  }
  const button = event?.data?.originalEvent?.button ?? 0;
  if (button === 2) {
    const index = this.__pointIndex;
    if (state.topEdgePoints.length <= 2) {
      setStatusKey("status_node_delete_blocked");
      return;
    }
    state.topEdgePoints.splice(index, 1);
    state.edgeNodeCount = state.topEdgePoints.length;
    redrawOcclusionMask(true);
    syncUiFromState(true);
    setStatusKey("status_node_deleted");
    event.stopPropagation();
    return;
  }
  handleDrag = {
    pointerId: event.data.pointerId,
    index: this.__pointIndex,
  };
  event.stopPropagation();
}

function onStagePointerDown(event) {
  if (!state.addNodeMode || scrub || handleDrag || maskDrag || modelDrag) {
    return;
  }
  const localPos = event.data.getLocalPosition(sceneRoot);
  const inserted = tryInsertNodeAt(localPos.x, localPos.y);
  if (inserted) {
    redrawOcclusionMask(true);
    syncUiFromState(true);
    setStatusKey("status_node_inserted");
    event.stopPropagation();
  } else {
    setStatusKey("status_node_insert_miss");
  }
}

function onStagePointerMove(event) {
  const pointerId = event.data.pointerId;
  const localPos = event.data.getLocalPosition(sceneRoot);

  if (handleDrag && handleDrag.pointerId === pointerId) {
    const idx = handleDrag.index;
    state.topEdgePoints[idx][0] = localPos.x;
    state.topEdgePoints[idx][1] = localPos.y - state.occlusionOffsetY;
    redrawOcclusionMask(false);
    syncUiFromState(false);
    return;
  }

  if (maskDrag && maskDrag.pointerId === pointerId) {
    const dx = localPos.x - maskDrag.startX;
    const dy = localPos.y - maskDrag.startY;
    state.topEdgePoints = maskDrag.startTopEdge.map((p) => [p[0] + dx, p[1] + dy]);
    redrawOcclusionMask(false);
    syncUiFromState(false);
    return;
  }

  if (modelDrag && modelDrag.pointerId === pointerId) {
    if (modelDrag.isRotating) {
      // Rotation mode: calculate angle from center
      const dx = localPos.x - state.modelXPx;
      const dy = localPos.y - state.modelYPx;
      const angle = Math.atan2(dy, dx);
      const angleDeg = (angle * 180) / Math.PI;
      state.modelRotationDeg = angleDeg - modelDrag.startAngleOffset;
    } else {
      // Translation mode
      state.modelXPx = localPos.x + modelDrag.offsetX;
      state.modelYPx = localPos.y + modelDrag.offsetY;
    }
    applyActorTransform();
    syncUiFromState(false);
  }
}

function onStagePointerUp(event) {
  clearDragByPointer(event.data.pointerId);
}

function clearDragByPointer(pointerId) {
  if (handleDrag && handleDrag.pointerId === pointerId) {
    handleDrag = null;
  }
  if (maskDrag && maskDrag.pointerId === pointerId) {
    maskDrag = null;
  }
  if (modelDrag && modelDrag.pointerId === pointerId) {
    modelDrag = null;
    if (actor) {
      actor.cursor = "grab";
    }
  }
}

function onWheelScale(event) {
  const wheel = event?.deltaY ?? 0;
  if (!Number.isFinite(wheel)) {
    return;
  }
  const factor = wheel < 0 ? 1.06 : 0.94;
  state.modelScaleMul *= factor;
  applyActorTransform();
  syncUiFromState(false);
}

function applyActorTransform() {
  if (!actor) {
    return;
  }
  actor.x = state.modelXPx;
  actor.y = state.modelYPx;
  const scale = baseModelScale * state.modelScaleMul;
  actor.scale.set(scale, scale);
  actor.rotation = (state.modelRotationDeg * Math.PI) / 180;
}

function redrawOcclusionMask(rebuildHandles = true) {
  if (!tableMask) {
    return;
  }

  const polygon = buildMaskPolygon(true);
  if (polygon.length < 3) {
    return;
  }

  tableMask.clear();
  tableMask.beginFill(0xffffff, 1);
  tableMask.moveTo(polygon[0][0], polygon[0][1]);
  for (let i = 1; i < polygon.length; i += 1) {
    tableMask.lineTo(polygon[i][0], polygon[i][1]);
  }
  tableMask.closePath();
  tableMask.endFill();

  redrawMaskEditor(rebuildHandles);
}

function redrawMaskEditor(rebuildHandles = true) {
  if (!maskDragArea || !maskOutline) {
    return;
  }

  const polygon = buildMaskPolygon(true);
  if (polygon.length < 3) {
    return;
  }

  maskDragArea.clear();
  if (state.enableMaskDrag) {
    maskDragArea.beginFill(0x000000, 0.001);
    maskDragArea.moveTo(polygon[0][0], polygon[0][1]);
    for (let i = 1; i < polygon.length; i += 1) {
      maskDragArea.lineTo(polygon[i][0], polygon[i][1]);
    }
    maskDragArea.closePath();
    maskDragArea.endFill();
    maskDragArea.interactive = true;
    maskDragArea.cursor = "move";
  } else {
    maskDragArea.interactive = false;
  }

  maskOutline.clear();
  if (state.showMaskLine) {
    maskOutline.lineStyle(2, 0x6dc2a2, 0.95);
    maskOutline.moveTo(polygon[0][0], polygon[0][1]);
    for (let i = 1; i < polygon.length; i += 1) {
      maskOutline.lineTo(polygon[i][0], polygon[i][1]);
    }
    maskOutline.lineTo(polygon[0][0], polygon[0][1]);
  }

  const shiftedTop = shiftedTopEdge();
  if (rebuildHandles || handleNodes.length !== shiftedTop.length) {
    for (const node of handleNodes) {
      node.destroy();
    }
    handleNodes = [];
    for (let i = 0; i < shiftedTop.length; i += 1) {
      const handle = new PIXI.Graphics();
      handle.beginFill(0xffde7c, 0.95);
      handle.lineStyle(1, 0x19222d, 0.9);
      handle.drawCircle(0, 0, 7);
      handle.endFill();
      handle.interactive = true;
      handle.buttonMode = true;
      handle.cursor = "pointer";
      handle.__pointIndex = i;
      handle.on("pointerdown", onHandlePointerDown);
      maskEditorLayer.addChild(handle);
      handleNodes.push(handle);
    }
  }

  for (let i = 0; i < handleNodes.length; i += 1) {
    handleNodes[i].x = shiftedTop[i][0];
    handleNodes[i].y = shiftedTop[i][1];
    handleNodes[i].visible = state.showHandles;
  }
}

function tryInsertNodeAt(x, yShifted) {
  const shiftedTop = shiftedTopEdge();
  if (shiftedTop.length < 2) {
    return false;
  }

  let bestSeg = -1;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < shiftedTop.length - 1; i += 1) {
    const a = shiftedTop[i];
    const b = shiftedTop[i + 1];
    const d = pointToSegmentDistance(x, yShifted, a[0], a[1], b[0], b[1]);
    if (d < bestDist) {
      bestDist = d;
      bestSeg = i;
    }
  }

  if (bestSeg < 0 || bestDist > 18) {
    return false;
  }

  const unshiftedY = yShifted - state.occlusionOffsetY;
  state.topEdgePoints.splice(bestSeg + 1, 0, [x, unshiftedY]);
  state.edgeNodeCount = state.topEdgePoints.length;
  return true;
}

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    return Math.hypot(px - x1, py - y1);
  }
  const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  const k = Math.max(0, Math.min(1, t));
  const cx = x1 + k * dx;
  const cy = y1 + k * dy;
  return Math.hypot(px - cx, py - cy);
}

function setEdgeNodeCount(targetCount) {
  const clamped = clampInt(targetCount, 2, 300);
  state.edgeNodeCount = clamped;
  if (state.topEdgePoints.length !== clamped) {
    state.topEdgePoints = resamplePolyline(state.topEdgePoints, clamped);
    redrawOcclusionMask(true);
  }
}

function buildMaskPolygon(applyOffset) {
  const offset = applyOffset ? state.occlusionOffsetY : 0;
  const top = state.topEdgePoints.map((p) => [p[0], p[1] + offset]);
  return [
    ...top,
    [IMAGE_SIZE.width, IMAGE_SIZE.height + offset],
    [0, IMAGE_SIZE.height + offset],
  ];
}

function shiftedTopEdge() {
  const offset = state.occlusionOffsetY;
  return state.topEdgePoints.map((p) => [p[0], p[1] + offset]);
}

function serializedTopEdge() {
  return state.topEdgePoints.map((p) => [round(p[0]), round(p[1])]);
}

function serializedPolygon() {
  return buildMaskPolygon(false).map((p) => [round(p[0]), round(p[1])]);
}

function syncUiFromState(syncPolygon) {
  ui.languageSelect.value = state.language;
  ui.xInput.value = formatNumber(state.modelXPx);
  ui.yInput.value = formatNumber(state.modelYPx);
  ui.scaleInput.value = formatNumber(state.modelScaleMul);
  ui.rotationInput.value = formatNumber(state.modelRotationDeg);
  ui.occlusionOffsetInput.value = formatNumber(state.occlusionOffsetY);
  ui.edgeNodeCountInput.value = String(clampInt(state.edgeNodeCount, 2, 300));
  ui.showHandles.checked = state.showHandles;
  ui.showMaskLine.checked = state.showMaskLine;
  ui.enableMaskDrag.checked = state.enableMaskDrag;
  refreshAddNodeButtonState();

  if (syncPolygon || document.activeElement !== ui.polygonInput) {
    ui.polygonInput.value = JSON.stringify(serializedPolygon());
  }
}

function refreshAddNodeButtonState() {
  if (!ui.toggleAddNodeBtn) {
    return;
  }
  if (state.addNodeMode) {
    ui.toggleAddNodeBtn.classList.add("active-btn");
  } else {
    ui.toggleAddNodeBtn.classList.remove("active-btn");
  }
}

async function loadTopEdgeFromMaskImage(path) {
  const ref = path.includes("?") ? `${path}&t=${Date.now()}` : `${path}?t=${Date.now()}`;
  const texture = await PIXI.Texture.fromURL(ref);
  const points = extractTopEdgePointsFromMaskTexture(texture);
  if (points.length < 2) {
    throw new Error("cannot trace usable edge from AI mask");
  }
  return { topEdgePoints: points };
}

function extractTopEdgePointsFromMaskTexture(texture) {
  const src = texture?.baseTexture?.resource?.source;
  if (!src || !src.width || !src.height) {
    throw new Error("mask source unavailable");
  }

  const canvas = document.createElement("canvas");
  canvas.width = src.width;
  canvas.height = src.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = img.data;

  const w = canvas.width;
  const h = canvas.height;
  const topYs = new Array(w);
  let prevY = Math.round(h * 0.6);

  for (let x = 0; x < w; x += 1) {
    let foundY = -1;
    for (let y = 0; y < h; y += 1) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (a > 12 && lum > 127) {
        foundY = y;
        break;
      }
    }
    if (foundY < 0) {
      foundY = prevY;
    }
    topYs[x] = foundY;
    prevY = foundY;
  }

  const traced = [];
  const pushPoint = (xPix, yPix) => {
    const x = (xPix / Math.max(1, w - 1)) * IMAGE_SIZE.width;
    const y = (yPix / Math.max(1, h - 1)) * IMAGE_SIZE.height;
    const last = traced[traced.length - 1];
    if (!last || Math.abs(last[0] - x) > 0.001 || Math.abs(last[1] - y) > 0.001) {
      traced.push([x, y]);
    }
  };

  pushPoint(0, topYs[0]);
  for (let x = 1; x < w; x += 1) {
    const yPrev = topYs[x - 1];
    const yCur = topYs[x];
    if (yCur !== yPrev) {
      pushPoint(x - 1, yPrev);
      pushPoint(x, yCur);
    }
  }
  pushPoint(w - 1, topYs[w - 1]);

  return traced;
}

function autoEstimateTopEdge(nodeCount) {
  if (!backgroundTexture?.baseTexture?.resource?.source) {
    throw new Error("background image source unavailable");
  }

  const source = backgroundTexture.baseTexture.resource.source;
  const canvas = document.createElement("canvas");
  canvas.width = IMAGE_SIZE.width;
  canvas.height = IMAGE_SIZE.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, IMAGE_SIZE.width, IMAGE_SIZE.height);
  const imageData = ctx.getImageData(0, 0, IMAGE_SIZE.width, IMAGE_SIZE.height);
  const data = imageData.data;

  const luminance = (x, y) => {
    const px = clampInt(x, 0, IMAGE_SIZE.width - 1);
    const py = clampInt(y, 0, IMAGE_SIZE.height - 1);
    const idx = (py * IMAGE_SIZE.width + px) * 4;
    return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  };

  const rowStart = Math.floor(IMAGE_SIZE.height * 0.34);
  const rowEnd = Math.floor(IMAGE_SIZE.height * 0.78);
  let bestRow = rowStart;
  let bestScore = -Infinity;

  for (let y = rowStart + 1; y < rowEnd - 1; y += 1) {
    let sum = 0;
    let count = 0;
    for (let x = 0; x < IMAGE_SIZE.width; x += 4) {
      sum += Math.abs(luminance(x, y + 1) - luminance(x, y - 1));
      count += 1;
    }
    const score = sum / Math.max(count, 1);
    if (score > bestScore) {
      bestScore = score;
      bestRow = y;
    }
  }

  const targetCount = clampInt(nodeCount, 2, 300);
  const segments = targetCount - 1;
  const sampled = [];
  for (let i = 0; i <= segments; i += 1) {
    const x = Math.round((i / segments) * (IMAGE_SIZE.width - 1));
    const searchStart = clampInt(bestRow - 120, 10, IMAGE_SIZE.height - 10);
    const searchEnd = clampInt(bestRow + 120, 10, IMAGE_SIZE.height - 10);

    let localBestY = bestRow;
    let localBestScore = -Infinity;
    for (let y = searchStart; y <= searchEnd; y += 1) {
      let grad = 0;
      for (let dx = -6; dx <= 6; dx += 3) {
        grad += Math.abs(luminance(x + dx, y + 1) - luminance(x + dx, y - 1));
      }
      const centerBias = 1 - Math.abs(y - bestRow) / 160;
      const score = grad * Math.max(centerBias, 0.2);
      if (score > localBestScore) {
        localBestScore = score;
        localBestY = y;
      }
    }
    sampled.push(localBestY);
  }

  const smooth = smoothArray(sampled, 1).map((y) => clampInt(y, 40, IMAGE_SIZE.height - 10));
  const topEdge = [];
  for (let i = 0; i <= segments; i += 1) {
    const x = Math.round((i / segments) * IMAGE_SIZE.width);
    topEdge.push([x, smooth[i]]);
  }
  return topEdge;
}

function resamplePolyline(points, targetCount) {
  if (!Array.isArray(points) || points.length === 0) {
    return [];
  }
  if (targetCount <= 1) {
    return [[points[0][0], points[0][1]]];
  }
  if (points.length === 1) {
    return Array.from({ length: targetCount }, () => [points[0][0], points[0][1]]);
  }

  const cumulative = [0];
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    cumulative[i] = cumulative[i - 1] + Math.hypot(dx, dy);
  }
  const totalLength = cumulative[cumulative.length - 1];
  if (totalLength <= 0) {
    return Array.from({ length: targetCount }, () => [points[0][0], points[0][1]]);
  }

  const sampled = [];
  for (let i = 0; i < targetCount; i += 1) {
    const dist = (i / (targetCount - 1)) * totalLength;
    let seg = 1;
    while (seg < cumulative.length && cumulative[seg] < dist) {
      seg += 1;
    }
    seg = Math.min(seg, cumulative.length - 1);
    const prevDist = cumulative[seg - 1];
    const nextDist = cumulative[seg];
    const t = nextDist === prevDist ? 0 : (dist - prevDist) / (nextDist - prevDist);
    sampled.push([
      lerp(points[seg - 1][0], points[seg][0], t),
      lerp(points[seg - 1][1], points[seg][1], t),
    ]);
  }
  return sampled;
}

function applyLanguage() {
  console.log("applyLanguage called, current language:", state.language);
  document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
  for (const node of document.querySelectorAll("[data-i18n]")) {
    const key = node.getAttribute("data-i18n");
    node.textContent = t(key);
  }
  if (lastStatus.key) {
    ui.status.textContent = t(lastStatus.key, lastStatus.vars);
  }
  console.log("applyLanguage completed");
}

function t(key, vars = {}) {
  const table = I18N[state.language] ?? I18N.en;
  const fallback = I18N.en[key] ?? key;
  const template = table[key] ?? fallback;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, token) => {
    const value = vars[token];
    return value === undefined ? `{${token}}` : String(value);
  });
}

function setStatusKey(key, vars = {}) {
  lastStatus = { key, vars };
  ui.status.textContent = t(key, vars);
}

function labelKeyForStateKey(stateKey) {
  const map = {
    modelXPx: "model_x",
    modelYPx: "model_y",
    modelScaleMul: "model_scale",
    occlusionOffsetY: "mask_offset_y",
    edgeNodeCount: "mask_nodes",
  };
  return map[stateKey] ?? stateKey;
}

function resizeScene() {
  if (!sceneRoot || !app) {
    return;
  }
  const scale = Math.min(
    app.screen.width / IMAGE_SIZE.width,
    app.screen.height / IMAGE_SIZE.height
  );
  sceneRoot.scale.set(scale, scale);
  sceneRoot.x = (app.screen.width - IMAGE_SIZE.width * scale) * 0.5;
  sceneRoot.y = (app.screen.height - IMAGE_SIZE.height * scale) * 0.5;
}

function smoothArray(values, radius) {
  return values.map((_, index) => {
    let sum = 0;
    let count = 0;
    for (let i = index - radius; i <= index + radius; i += 1) {
      if (i >= 0 && i < values.length) {
        sum += values[i];
        count += 1;
      }
    }
    return sum / Math.max(count, 1);
  });
}

function clonePoints(points) {
  return points.map((p) => [p[0], p[1]]);
}

function almostSamePoint(a, b) {
  return Math.abs(a[0] - b[0]) < 0.001 && Math.abs(a[1] - b[1]) < 0.001;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "";
  }
  if (Math.abs(value) >= 1000) {
    return Math.round(value).toString();
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(3);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clampInt(value, min, max) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function applyLightingPreset(presetName) {
  const presets = {
    subtle: {
      intensity: 0.3,
      smoothing: 0.5,
      updateInterval: 150,
      colorTempStrength: 0.5,
      brightnessStrength: 0.4,
      brightnessRange: 1.2,
      contrastStrength: 0.1,
      saturationStrength: 0.1,
      rimLightIntensity: 0.2,
      enableContrast: false,
      enableSaturation: false,
    },
    natural: {
      intensity: 0.5,
      smoothing: 0.3,
      updateInterval: 100,
      colorTempStrength: 1.0,
      brightnessStrength: 1.0,
      brightnessRange: 1.5,
      contrastStrength: 0.3,
      saturationStrength: 0.2,
      rimLightIntensity: 0.5,
      enableContrast: true,
      enableSaturation: false,
    },
    intense: {
      intensity: 0.8,
      smoothing: 0.2,
      updateInterval: 80,
      colorTempStrength: 1.0,
      brightnessStrength: 1.0,
      brightnessRange: 1.8,
      contrastStrength: 0.5,
      saturationStrength: 0.4,
      rimLightIntensity: 0.8,
      enableContrast: true,
      enableSaturation: true,
    },
    reset: {
      intensity: 0.5,
      smoothing: 0.3,
      updateInterval: 100,
      colorTempStrength: 1.0,
      brightnessStrength: 1.0,
      brightnessRange: 1.5,
      contrastStrength: 0.3,
      saturationStrength: 0.2,
      rimLightIntensity: 0.5,
      enableContrast: false,
      enableSaturation: false,
    }
  };

  const preset = presets[presetName];
  if (!preset) return;

  // 更新插件配置
  ambientLightingPlugin.updateConfig({
    intensity: preset.intensity,
    smoothing: preset.smoothing,
    updateInterval: preset.updateInterval
  });

  // 更新插件属性
  ambientLightingPlugin.colorTempStrength = preset.colorTempStrength;
  ambientLightingPlugin.brightnessStrength = preset.brightnessStrength;
  ambientLightingPlugin.brightnessRange = preset.brightnessRange;
  ambientLightingPlugin.contrastStrength = preset.contrastStrength;
  ambientLightingPlugin.saturationStrength = preset.saturationStrength;
  ambientLightingPlugin.enableContrast = preset.enableContrast;
  ambientLightingPlugin.enableSaturation = preset.enableSaturation;

  // 更新 UI
  ui.lightingIntensity.value = preset.intensity;
  ui.lightingSmoothing.value = preset.smoothing;
  ui.lightingUpdateInterval.value = preset.updateInterval;
  ui.colorTempStrength.value = preset.colorTempStrength;
  ui.brightnessStrength.value = preset.brightnessStrength;
  ui.brightnessRange.value = preset.brightnessRange;
  ui.contrastStrength.value = preset.contrastStrength;
  ui.saturationStrength.value = preset.saturationStrength;
  ui.enableContrast.checked = preset.enableContrast;
  ui.enableSaturation.checked = preset.enableSaturation;
  ui.rimLightIntensity.value = preset.rimLightIntensity;

  // 更新边缘光强度
  if (rimLightFilter) {
    AdvancedFilters.updateFilterUniforms(rimLightFilter, {
      rimIntensity: preset.rimLightIntensity
    });
  }

  // 应用滤镜
  if (ambientLightingPlugin.enabled) {
    ambientLightingPlugin.applyFilter();
  }

  setStatusKey("status_preset_applied", { preset: presetName });
}
