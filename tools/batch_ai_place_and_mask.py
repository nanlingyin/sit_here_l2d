#!/usr/bin/env python3
"""
Batch pipeline:
1) Ask AI for L2D placement on each scene image.
2) Ask AI to generate foreground occlusion mask for each scene.
3) Composite L2D behind foreground mask.
4) Save blended image + mask + metadata.
"""

from __future__ import annotations

import argparse
import base64
import io
import json
import mimetypes
import re
from collections import deque
from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np
import requests
from PIL import Image, ImageFilter, ImageOps


IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
DATA_URI_RE = re.compile(r"data:image/[^;]+;base64,([A-Za-z0-9+/=]+)")


PLACEMENT_PROMPT = """You are a precise image layout planner.
Input image #1 is a real scene photo.
Input image #2 is a character sprite (front-view full body).

Choose where the character should be placed so it naturally blends into the scene.
Rules:
- Return ONLY strict JSON (no markdown, no extra text).
- Use bottom-center anchor for character placement.
- anchor_x, anchor_y are normalized in [0,1] relative to scene width/height.
- scale_ratio means target character height = scene_height * scale_ratio.
- Keep important scene subjects visible.
- For table/counter scenes place character behind the foreground plane.
- For street scenes place character on walkable ground, not floating.

Output schema:
{
  "anchor_x": 0.50,
  "anchor_y": 0.66,
  "scale_ratio": 0.32,
  "confidence": 0.0,
  "reason_short": "..."
}
"""


MASK_PROMPT_TEMPLATE = """Generate a strict black-and-white occlusion mask aligned pixel-perfect to input scene.
Character planned anchor=(x={anchor_x:.3f}, y={anchor_y:.3f}), scale_ratio={scale_ratio:.3f}.

White (foreground):
- all objects/planes that should be in front of the character
- table/counter/near-camera ground surface where applicable
- near-camera obstacles

Black (background):
- far background, walls, sky, distant objects

Output requirements:
- single flat mask image only
- no text, no style transfer, no extra objects
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Batch AI placement + mask + blending")
    parser.add_argument("--test-dir", default=r"D:\sit_here\test_image")
    parser.add_argument("--model-image", default=r"D:\sit_here\l2d\model.png")
    parser.add_argument("--output-root", default=r"D:\sit_here\ai_l2d_blend_results")
    parser.add_argument("--base-url", default="https://api.hiyo.top")
    parser.add_argument("--api-key", required=True)
    parser.add_argument("--model", default="gemini-3.1-flash-image")
    parser.add_argument("--threshold", type=int, default=128)
    parser.add_argument("--feather", type=float, default=2.0)
    parser.add_argument("--timeout-sec", type=int, default=240)
    return parser.parse_args()


def file_to_data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "image/png"
    b64 = base64.b64encode(path.read_bytes()).decode("utf-8")
    return f"data:{mime};base64,{b64}"


def chat_completion(
    *,
    base_url: str,
    api_key: str,
    model: str,
    messages: List[Dict[str, Any]],
    timeout_sec: int,
    modalities: List[str] | None = None,
    temperature: float = 0.0,
) -> Dict[str, Any]:
    url = base_url.rstrip("/") + "/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload: Dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }
    if modalities:
        payload["modalities"] = modalities

    response = requests.post(url, headers=headers, json=payload, timeout=timeout_sec)
    response.raise_for_status()
    return response.json()


def extract_text_from_chat_payload(payload: Dict[str, Any]) -> str:
    msg = payload["choices"][0]["message"]
    content = msg.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        chunks: List[str] = []
        for part in content:
            if isinstance(part, dict) and "text" in part:
                chunks.append(str(part["text"]))
        return "\n".join(chunks)
    return json.dumps(msg, ensure_ascii=False)


def extract_image_bytes_from_chat_payload(payload: Dict[str, Any]) -> bytes:
    msg = payload["choices"][0]["message"]
    content = msg.get("content")

    if isinstance(content, list):
        for part in content:
            if not isinstance(part, dict):
                continue
            if part.get("type") in {"output_image", "image"} and isinstance(part.get("b64_json"), str):
                return base64.b64decode(part["b64_json"])
            src = None
            if part.get("type") == "image_url":
                image_url = part.get("image_url")
                if isinstance(image_url, dict):
                    src = image_url.get("url")
                elif isinstance(image_url, str):
                    src = image_url
            if isinstance(src, str):
                b = extract_data_uri_bytes(src)
                if b:
                    return b

    if isinstance(content, str):
        b = extract_data_uri_bytes(content)
        if b:
            return b

    raise RuntimeError("No image bytes found in chat response")


def extract_data_uri_bytes(text: str) -> bytes | None:
    m = DATA_URI_RE.search(text)
    if not m:
        return None
    return base64.b64decode(m.group(1))


def parse_json_from_text(text: str) -> Dict[str, Any]:
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass

    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        raise ValueError(f"Cannot find JSON object in response: {text[:500]}")
    return json.loads(m.group(0))


def infer_placement(
    *,
    scene_path: Path,
    model_path: Path,
    base_url: str,
    api_key: str,
    model: str,
    timeout_sec: int,
) -> Dict[str, Any]:
    scene_uri = file_to_data_uri(scene_path)
    model_uri = file_to_data_uri(model_path)

    messages = [
        {"role": "system", "content": "You only output strict JSON."},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": PLACEMENT_PROMPT},
                {"type": "image_url", "image_url": {"url": scene_uri}},
                {"type": "image_url", "image_url": {"url": model_uri}},
            ],
        },
    ]

    payload = chat_completion(
        base_url=base_url,
        api_key=api_key,
        model=model,
        messages=messages,
        timeout_sec=timeout_sec,
        temperature=0.0,
    )
    text = extract_text_from_chat_payload(payload)
    obj = parse_json_from_text(text)

    anchor_x = clamp(float(obj.get("anchor_x", 0.5)), 0.0, 1.0)
    anchor_y = clamp(float(obj.get("anchor_y", 0.66)), 0.06, 0.98)
    scale_ratio = clamp(float(obj.get("scale_ratio", 0.32)), 0.08, 0.95)

    # Prevent model top from going out of frame:
    # top_normalized ~= anchor_y - scale_ratio >= 0.02
    max_scale_by_top = max(0.08, anchor_y - 0.02)
    scale_ratio = min(scale_ratio, max_scale_by_top)

    # Keep at least a small visible body in frame.
    scale_ratio = max(scale_ratio, 0.10)
    confidence = clamp(float(obj.get("confidence", 0.5)), 0.0, 1.0)
    reason_short = str(obj.get("reason_short", ""))[:300]

    return {
        "anchor_x": anchor_x,
        "anchor_y": anchor_y,
        "scale_ratio": scale_ratio,
        "confidence": confidence,
        "reason_short": reason_short,
        "raw_text": text,
    }


def generate_mask_with_ai(
    *,
    scene_path: Path,
    placement: Dict[str, Any],
    base_url: str,
    api_key: str,
    model: str,
    timeout_sec: int,
) -> bytes:
    scene_uri = file_to_data_uri(scene_path)
    prompt = MASK_PROMPT_TEMPLATE.format(
        anchor_x=placement["anchor_x"],
        anchor_y=placement["anchor_y"],
        scale_ratio=placement["scale_ratio"],
    )
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": scene_uri}},
            ],
        }
    ]
    payload = chat_completion(
        base_url=base_url,
        api_key=api_key,
        model=model,
        messages=messages,
        timeout_sec=timeout_sec,
        modalities=["text", "image"],
        temperature=0.0,
    )
    return extract_image_bytes_from_chat_payload(payload)


def remove_border_background(model_img: Image.Image) -> Image.Image:
    arr = np.array(model_img.convert("RGBA"), dtype=np.uint8)
    rgb = arr[:, :, :3].astype(np.int16)
    h, w, _ = rgb.shape

    edge = 6
    border = np.concatenate(
        [
            rgb[:edge, :, :].reshape(-1, 3),
            rgb[-edge:, :, :].reshape(-1, 3),
            rgb[:, :edge, :].reshape(-1, 3),
            rgb[:, -edge:, :].reshape(-1, 3),
        ],
        axis=0,
    )
    bg_mean = border.mean(axis=0)

    visited = np.zeros((h, w), dtype=bool)
    q: deque[Tuple[int, int]] = deque()

    def try_seed(y: int, x: int) -> None:
        d = np.linalg.norm(rgb[y, x] - bg_mean)
        if d <= 95:
            q.append((y, x))

    for x in range(w):
        for y in range(edge):
            try_seed(y, x)
            try_seed(h - 1 - y, x)
    for y in range(h):
        for x in range(edge):
            try_seed(y, x)
            try_seed(y, w - 1 - x)

    while q:
        y, x = q.popleft()
        if visited[y, x]:
            continue
        visited[y, x] = True
        cur = rgb[y, x]

        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if ny < 0 or ny >= h or nx < 0 or nx >= w or visited[ny, nx]:
                continue
            local_d = np.linalg.norm(rgb[ny, nx] - cur)
            global_d = np.linalg.norm(rgb[ny, nx] - bg_mean)
            if local_d <= 28 and global_d <= 110:
                q.append((ny, nx))

    alpha = np.where(visited, 0, 255).astype(np.uint8)
    alpha_img = Image.fromarray(alpha, mode="L").filter(ImageFilter.GaussianBlur(radius=1.0))
    alpha_img = alpha_img.point(lambda p: 0 if p < 20 else p, mode="L")

    rgba = model_img.convert("RGBA").copy()
    rgba.putalpha(alpha_img)
    return rgba


def save_gray_and_alpha(
    raw_image_bytes: bytes,
    out_raw: Path,
    out_gray: Path,
    out_alpha: Path,
    threshold: int,
    feather: float,
) -> Image.Image:
    out_raw.parent.mkdir(parents=True, exist_ok=True)
    out_gray.parent.mkdir(parents=True, exist_ok=True)
    out_alpha.parent.mkdir(parents=True, exist_ok=True)
    out_raw.write_bytes(raw_image_bytes)

    with Image.open(io.BytesIO(raw_image_bytes)) as im:
        gray = im.convert("L")

    if threshold > 0:
        th = max(0, min(255, threshold))
        gray = gray.point(lambda p: 255 if p >= th else 0, mode="L")
    gray.save(out_gray, format="PNG")

    alpha = gray
    if feather > 0:
        alpha = alpha.filter(ImageFilter.GaussianBlur(radius=feather))
    rgba = Image.new("RGBA", alpha.size, (255, 255, 255, 0))
    rgba.putalpha(alpha)
    rgba.save(out_alpha, format="PNG")
    return gray


def blend_with_mask(
    scene: Image.Image,
    model_cutout: Image.Image,
    placement: Dict[str, Any],
    mask_gray: Image.Image,
) -> Image.Image:
    scene_rgba = scene.convert("RGBA")
    sw, sh = scene_rgba.size
    mw, mh = model_cutout.size

    target_h = max(8, int(sh * placement["scale_ratio"]))
    scale = target_h / max(1, mh)
    target_w = max(8, int(mw * scale))

    model_resized = model_cutout.resize((target_w, target_h), Image.Resampling.LANCZOS)

    anchor_x = int(round(placement["anchor_x"] * sw))
    anchor_y = int(round(placement["anchor_y"] * sh))
    left = anchor_x - target_w // 2
    top = anchor_y - target_h

    model_layer = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    model_layer.paste(model_resized, (left, top), model_resized)

    comp = Image.alpha_composite(scene_rgba, model_layer)
    fg = scene_rgba.copy()
    fg.putalpha(mask_gray.resize((sw, sh), Image.Resampling.BILINEAR))
    final = Image.alpha_composite(comp, fg)
    return final


def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def run_one(
    scene_path: Path,
    model_cutout: Image.Image,
    args: argparse.Namespace,
) -> Dict[str, Any]:
    scene_name = scene_path.stem
    out_dir = Path(args.output_root) / scene_name
    out_dir.mkdir(parents=True, exist_ok=True)

    placement = infer_placement(
        scene_path=scene_path,
        model_path=Path(args.model_image),
        base_url=args.base_url,
        api_key=args.api_key,
        model=args.model,
        timeout_sec=args.timeout_sec,
    )

    raw_mask = generate_mask_with_ai(
        scene_path=scene_path,
        placement=placement,
        base_url=args.base_url,
        api_key=args.api_key,
        model=args.model,
        timeout_sec=args.timeout_sec,
    )

    raw_path = out_dir / "03_mask_raw.png"
    gray_path = out_dir / "04_mask_gray.png"
    alpha_path = out_dir / "05_mask_alpha.png"
    mask_gray = save_gray_and_alpha(
        raw_image_bytes=raw_mask,
        out_raw=raw_path,
        out_gray=gray_path,
        out_alpha=alpha_path,
        threshold=args.threshold,
        feather=args.feather,
    )

    scene = Image.open(scene_path).convert("RGB")
    blended = blend_with_mask(scene, model_cutout, placement, mask_gray)
    blended_path = out_dir / "06_blended.png"
    blended.save(blended_path, format="PNG")

    scene.copy().save(out_dir / "01_scene.png", format="PNG")
    model_cutout.save(out_dir / "02_model_cutout.png", format="PNG")

    meta = {
        "scene": str(scene_path),
        "placement": placement,
        "threshold": args.threshold,
        "feather": args.feather,
        "outputs": {
            "scene": "01_scene.png",
            "model_cutout": "02_model_cutout.png",
            "mask_raw": "03_mask_raw.png",
            "mask_gray": "04_mask_gray.png",
            "mask_alpha": "05_mask_alpha.png",
            "blended": "06_blended.png",
        },
    }
    (out_dir / "07_meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return {
        "scene": scene_path.name,
        "out_dir": str(out_dir),
        "placement": placement,
    }


def main() -> None:
    args = parse_args()
    test_dir = Path(args.test_dir)
    output_root = Path(args.output_root)
    output_root.mkdir(parents=True, exist_ok=True)

    model_img = Image.open(args.model_image).convert("RGBA")
    model_cutout = remove_border_background(model_img)
    model_cutout.save(output_root / "model_cutout_auto.png", format="PNG")

    scene_paths = sorted(
        p for p in test_dir.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTS
    )
    if not scene_paths:
        raise SystemExit(f"No images found in {test_dir}")

    summary = []
    for idx, scene_path in enumerate(scene_paths, start=1):
        print(f"[{idx}/{len(scene_paths)}] processing {scene_path.name} ...")
        try:
            row = run_one(scene_path, model_cutout, args)
            summary.append(row)
            print(f"  [ok] {row['out_dir']}")
        except Exception as exc:
            print(f"  [fail] {scene_path.name}: {exc}")
            summary.append(
                {"scene": scene_path.name, "out_dir": "", "error": str(exc)}
            )

    (output_root / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("\nDone.")
    print(f"Output root: {output_root}")


if __name__ == "__main__":
    main()
