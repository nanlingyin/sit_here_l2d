# PC Static Scene Live2D Occlusion Demo

## Run

```powershell
cd D:\sit_here
python -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080/pc_l2d_demo/`.

## Features

1. Language switch (`中文` / `English`).
2. Unbounded numeric model controls (`X`, `Y`, `Scale`).
3. Improved model drag:
   - drag starts from clicked point (no snapping to feet)
   - continuous adjustment without reset
4. Mask tools:
   - edge node count control
   - drag whole mask
   - drag individual edge nodes
   - show/hide nodes
   - show/hide mask edge line
5. AI mask boundary tracing:
   - load AI mask image and trace white boundary into editable nodes
6. Auto mask estimate from current background image.
7. Fast parameter scrub:
   - hover number input
   - hold left mouse
   - drag left/right to quickly adjust

## If You Only Have Generative API

You can still build a mask pipeline if your API supports image-conditioned generation
(`image edit`, `img2img`, or `control` style input).

Use:

```powershell
python D:\sit_here\pc_l2d_demo\tools\generate_mask_via_gen_api.py `
  --image D:\sit_here\test_image\a02eaa95791da37ffb5fdee829c50f04.jpg `
  --out-gray D:\sit_here\mask_gray.png `
  --out-alpha D:\sit_here\mask_alpha.png `
  --endpoint https://YOUR_API/v1/images/edits `
  --api-key YOUR_KEY `
  --model YOUR_MODEL `
  --threshold 128 `
  --feather 2
```

If your API is text-to-image only (no input image), it cannot reliably align to your
real photo. In that case, keep using current local auto-mask + manual node editing.

### Hiyo quick run

One-command script (saves into `D:\sit_here\api_generated_images`):

```powershell
powershell -ExecutionPolicy Bypass -File D:\sit_here\pc_l2d_demo\tools\run_mask_generation_hiyo.ps1
```

## Batch: AI placement + mask + blended image

```powershell
python D:\sit_here\pc_l2d_demo\tools\batch_ai_place_and_mask.py `
  --api-key YOUR_KEY `
  --base-url https://api.hiyo.top `
  --model gemini-3.1-flash-image `
  --test-dir D:\sit_here\test_image `
  --model-image D:\sit_here\l2d\model.png `
  --output-root D:\sit_here\ai_l2d_blend_results
```

## Test1: AI mask shape -> manual node editing

1) Generate AI mask + editable top-edge preset for `test1`:

```powershell
python D:\sit_here\pc_l2d_demo\tools\generate_ai_mask_top_edge_preset.py `
  --image D:\sit_here\test_image\test1.jpg `
  --base-url https://api.hiyo.top `
  --api-key YOUR_KEY `
  --model gemini-3.1-flash-image `
  --out-raw D:\sit_here\api_generated_images\test1_mask_preset\mask_raw.png `
  --out-gray D:\sit_here\api_generated_images\test1_mask_preset\mask_gray.png `
  --out-preset D:\sit_here\pc_l2d_demo\presets\test1_ai_mask.json `
  --node-count 24 `
  --threshold 128
```

2) Open demo page and click `Load AI Mask (test1)`.

3) Enable `Add Node Mode`:
   - click near mask edge to insert node
   - right-click a node to delete
   - drag nodes for fine adjustment

4) In UI click `Load AI Mask (test1)` to trace white boundary from AI mask image.

## Mask Pipeline (API -> Transparent Mask)

If you use an external image/segmentation API to generate grayscale mask:

1. Save the API grayscale result as `mask_gray.png`.
2. Convert grayscale to RGBA alpha mask:

```powershell
python D:\sit_here\pc_l2d_demo\tools\grayscale_to_alpha_mask.py `
  --mask D:\sit_here\mask_gray.png `
  --out D:\sit_here\mask_alpha.png `
  --threshold 128 `
  --feather 2
```

3. Use `mask_alpha.png` in your compositing flow.

## Paths

Configured in `app.js`:

1. `../test_image/a02eaa95791da37ffb5fdee829c50f04.jpg`
2. `../l2d/LilyaBee.model3.json`
3. `../l2d/QQ20251224-201845.png`
