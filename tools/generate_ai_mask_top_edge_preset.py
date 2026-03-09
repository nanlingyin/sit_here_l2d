#!/usr/bin/env python3
"""
Generate an AI mask and extract editable top-edge polygon points.

Outputs:
1) raw AI image
2) thresholded grayscale mask
3) transparent alpha mask PNG (optional)
4) JSON preset for pc_l2d_demo (topEdgePoints + edgeNodeCount)
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import re
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
import requests
from PIL import Image, ImageFilter


DATA_URI_RE = re.compile(r"data:image/[^;]+;base64,([A-Za-z0-9+/=]+)")

DEFAULT_PROMPT = (
    "Generate a strict black-and-white occlusion mask aligned pixel-perfect to the input photo. "
    "Task: mark the ENTIRE tabletop plane in front of the camera as WHITE, including empty table surface texture, "
    "table edge, and all objects resting on the table (hotpot, bowls, plates, chopsticks, cups, food). "
    "Also mark any near-camera foreground objects as WHITE. "
    "Mark chairs, walls, floor, and all background regions as BLACK. "
    "Output only one flat mask image, no text, no decoration, no style transfer, no extra objects."
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate AI mask top-edge preset")
    parser.add_argument("--image", required=True, help="Input scene image")
    parser.add_argument("--base-url", required=True, help="API base URL")
    parser.add_argument("--api-key", required=True, help="API key")
    parser.add_argument("--model", default="gemini-3.1-flash-image")
    parser.add_argument("--prompt", default=DEFAULT_PROMPT)
    parser.add_argument("--threshold", type=int, default=128)
    parser.add_argument("--node-count", type=int, default=20)
    parser.add_argument("--smooth-window", type=int, default=2)
    parser.add_argument("--out-raw", required=True, help="Raw mask output PNG")
    parser.add_argument("--out-gray", required=True, help="Threshold gray mask output PNG")
    parser.add_argument("--out-alpha", default="", help="Transparent alpha mask output PNG")
    parser.add_argument("--out-preset", required=True, help="Top-edge preset JSON")
    parser.add_argument("--timeout-sec", type=int, default=240)
    return parser.parse_args()


def file_to_data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "image/png"
    b64 = base64.b64encode(path.read_bytes()).decode("utf-8")
    return f"data:{mime};base64,{b64}"


def call_chat_image(
    *,
    base_url: str,
    api_key: str,
    model: str,
    prompt: str,
    scene_path: Path,
    timeout_sec: int,
) -> bytes:
    url = base_url.rstrip("/") + "/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload: Dict[str, Any] = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": file_to_data_uri(scene_path)}},
                ],
            }
        ],
        "modalities": ["text", "image"],
        "temperature": 0.0,
    }
    r = requests.post(url, headers=headers, json=payload, timeout=timeout_sec)
    r.raise_for_status()
    return extract_image_bytes(r.json())


def extract_image_bytes(payload: Dict[str, Any]) -> bytes:
    msg = payload["choices"][0]["message"]
    content = msg.get("content")
    if isinstance(content, list):
        for part in content:
            if not isinstance(part, dict):
                continue
            if part.get("type") in {"output_image", "image"} and isinstance(part.get("b64_json"), str):
                return base64.b64decode(part["b64_json"])
            if part.get("type") == "image_url":
                image_url = part.get("image_url")
                src = image_url.get("url") if isinstance(image_url, dict) else image_url
                if isinstance(src, str):
                    m = DATA_URI_RE.search(src)
                    if m:
                        return base64.b64decode(m.group(1))
    if isinstance(content, str):
        m = DATA_URI_RE.search(content)
        if m:
            return base64.b64decode(m.group(1))
    raise RuntimeError("No image bytes found in API response")


def threshold_gray(raw_bytes: bytes, threshold: int) -> Image.Image:
    from io import BytesIO

    with Image.open(BytesIO(raw_bytes)) as im:
        gray = im.convert("L")
    th = max(0, min(255, threshold))
    if th > 0:
        gray = gray.point(lambda p: 255 if p >= th else 0, mode="L")
    return gray


def gray_to_alpha(gray: Image.Image, feather: float = 1.5) -> Image.Image:
    alpha = gray
    if feather > 0:
        alpha = alpha.filter(ImageFilter.GaussianBlur(radius=feather))
    rgba = Image.new("RGBA", alpha.size, (255, 255, 255, 0))
    rgba.putalpha(alpha)
    return rgba


def smooth_1d(values: List[float], radius: int) -> List[float]:
    if radius <= 0:
        return list(values)
    out: List[float] = []
    n = len(values)
    for i in range(n):
        lo = max(0, i - radius)
        hi = min(n, i + radius + 1)
        out.append(float(np.mean(values[lo:hi])))
    return out


def extract_top_edge_points(mask_gray: Image.Image, node_count: int, smooth_window: int) -> List[List[float]]:
    arr = np.array(mask_gray, dtype=np.uint8)
    h, w = arr.shape
    node_count = int(max(2, min(400, node_count)))
    xs = np.linspace(0, w - 1, node_count)

    ys: List[float] = []
    prev_y = h * 0.6
    for x in xs:
        xi = int(round(x))
        col = arr[:, xi]
        white = np.where(col > 127)[0]
        if len(white) == 0:
            y = prev_y
        else:
            # take first white pixel as top boundary
            y = float(white[0])
            # suppress tiny floating speckles
            if y < h * 0.08 and len(white) < h * 0.03:
                y = prev_y
        ys.append(y)
        prev_y = y

    ys = smooth_1d(ys, max(0, smooth_window))
    ys = [float(max(0, min(h - 1, y))) for y in ys]

    points = [[float(x), float(y)] for x, y in zip(xs.tolist(), ys)]
    return points


def main() -> None:
    args = parse_args()
    scene_path = Path(args.image)
    out_raw = Path(args.out_raw)
    out_gray = Path(args.out_gray)
    out_alpha = (
        Path(args.out_alpha)
        if args.out_alpha
        else out_gray.with_name(out_gray.stem.replace("_gray", "_alpha") + out_gray.suffix)
    )
    out_preset = Path(args.out_preset)

    out_raw.parent.mkdir(parents=True, exist_ok=True)
    out_gray.parent.mkdir(parents=True, exist_ok=True)
    out_alpha.parent.mkdir(parents=True, exist_ok=True)
    out_preset.parent.mkdir(parents=True, exist_ok=True)

    raw_bytes = call_chat_image(
        base_url=args.base_url,
        api_key=args.api_key,
        model=args.model,
        prompt=args.prompt,
        scene_path=scene_path,
        timeout_sec=args.timeout_sec,
    )
    out_raw.write_bytes(raw_bytes)

    gray = threshold_gray(raw_bytes, args.threshold)
    gray.save(out_gray, format="PNG")
    alpha_mask = gray_to_alpha(gray, feather=1.5)
    alpha_mask.save(out_alpha, format="PNG")
    mask_w, mask_h = gray.size

    top_edge = extract_top_edge_points(
        mask_gray=gray,
        node_count=args.node_count,
        smooth_window=args.smooth_window,
    )
    preset = {
        "scene": str(scene_path),
        "topEdgePoints": [[round(p[0], 3), round(p[1], 3)] for p in top_edge],
        "edgeNodeCount": len(top_edge),
        "maskWidth": mask_w,
        "maskHeight": mask_h,
        "threshold": args.threshold,
        "prompt": args.prompt,
    }
    out_preset.write_text(json.dumps(preset, ensure_ascii=False, indent=2), encoding="utf-8")

    print("[ok] generated preset")
    print(f"[ok] raw:    {out_raw}")
    print(f"[ok] gray:   {out_gray}")
    print(f"[ok] alpha:  {out_alpha}")
    print(f"[ok] preset: {out_preset}")
    print(f"[ok] points: {len(top_edge)}")


if __name__ == "__main__":
    main()
