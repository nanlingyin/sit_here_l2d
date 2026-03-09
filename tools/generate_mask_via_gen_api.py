#!/usr/bin/env python3
"""
Generate occlusion masks using a generative API.

Supports two API styles:
1) edits mode: POST /v1/images/edits (OpenAI image-edit style)
2) chat mode:  POST /v1/chat/completions with image input, parse data:image base64 output
"""

from __future__ import annotations

import argparse
import base64
import io
import json
import mimetypes
import re
from pathlib import Path
from typing import Any, Dict, Optional

import requests
from PIL import Image, ImageFilter, ImageOps


DEFAULT_PROMPT = (
    "Generate a strict black-and-white occlusion mask aligned pixel-perfect to the input photo. "
    "Task: mark the ENTIRE tabletop plane in front of the camera as WHITE, including empty table surface texture, "
    "table edge, and all objects resting on the table (hotpot, bowls, plates, chopsticks, cups, food). "
    "Also mark any near-camera foreground objects as WHITE. "
    "Mark chairs, walls, floor, and all background regions as BLACK. "
    "Output only one flat mask image, no text, no decoration, no style transfer, no extra objects."
)

DATA_URI_RE = re.compile(r"data:image/[^;]+;base64,([A-Za-z0-9+/=]+)")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate mask via generative API.")
    parser.add_argument("--image", required=True, help="Input scene image path")
    parser.add_argument("--out-gray", required=True, help="Output grayscale mask path")
    parser.add_argument("--out-alpha", help="Output RGBA alpha mask path (optional)")
    parser.add_argument("--out-raw", help="Output raw generated image path (optional)")
    parser.add_argument(
        "--base-url",
        required=True,
        help="API base URL, e.g. https://api.hiyo.top",
    )
    parser.add_argument("--api-key", required=True, help="API key")
    parser.add_argument("--model", required=True, help="Model name")
    parser.add_argument("--prompt", default=DEFAULT_PROMPT, help="Mask generation prompt")
    parser.add_argument(
        "--mode",
        default="chat",
        choices=["chat", "edits"],
        help="API call mode",
    )
    parser.add_argument(
        "--response-format",
        default="b64_json",
        choices=["b64_json", "url"],
        help="For edits mode only",
    )
    parser.add_argument(
        "--size",
        default="",
        help="Output size, e.g. 1024x768. Leave empty to use source image size.",
    )
    parser.add_argument("--threshold", type=int, default=128, help="Binarize threshold [0..255]")
    parser.add_argument("--invert", action="store_true", help="Invert gray result before saving")
    parser.add_argument("--feather", type=float, default=0.0, help="Feather radius for alpha output")
    parser.add_argument("--timeout-sec", type=int, default=180, help="HTTP timeout in seconds")
    return parser.parse_args()


def ensure_size_arg(image_path: Path, size_arg: str) -> str:
    if size_arg:
        return size_arg
    with Image.open(image_path) as img:
        return f"{img.width}x{img.height}"


def call_edits_mode(
    *,
    base_url: str,
    api_key: str,
    model: str,
    prompt: str,
    image_path: Path,
    response_format: str,
    size: str,
    timeout_sec: int,
) -> bytes:
    url = base_url.rstrip("/") + "/v1/images/edits"
    headers = {"Authorization": f"Bearer {api_key}"}
    data = {
        "model": model,
        "prompt": prompt,
        "response_format": response_format,
        "n": "1",
        "size": size,
    }
    with image_path.open("rb") as f:
        files = {"image": (image_path.name, f, "application/octet-stream")}
        response = requests.post(
            url,
            headers=headers,
            data=data,
            files=files,
            timeout=timeout_sec,
        )
    response.raise_for_status()
    payload = response.json()
    return extract_image_bytes_from_images_payload(payload, response_format, timeout_sec)


def call_chat_mode(
    *,
    base_url: str,
    api_key: str,
    model: str,
    prompt: str,
    image_path: Path,
    timeout_sec: int,
) -> bytes:
    url = base_url.rstrip("/") + "/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    mime = mimetypes.guess_type(image_path.name)[0] or "image/png"
    image_b64 = base64.b64encode(image_path.read_bytes()).decode("utf-8")
    data_uri = f"data:{mime};base64,{image_b64}"

    payload: Dict[str, Any] = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": data_uri}},
                ],
            }
        ],
        "modalities": ["text", "image"],
        "temperature": 0,
    }

    response = requests.post(url, headers=headers, json=payload, timeout=timeout_sec)
    response.raise_for_status()
    payload = response.json()
    return extract_image_bytes_from_chat_payload(payload)


def extract_image_bytes_from_images_payload(
    payload: Dict[str, Any], response_format: str, timeout_sec: int
) -> bytes:
    if "data" not in payload or not payload["data"]:
        raise RuntimeError(f"Unexpected images payload: {json.dumps(payload)[:500]}")

    item = payload["data"][0]
    if response_format == "b64_json":
        b64 = item.get("b64_json")
        if not b64:
            raise RuntimeError("Missing data[0].b64_json")
        return base64.b64decode(b64)

    url = item.get("url")
    if not url:
        raise RuntimeError("Missing data[0].url")
    r = requests.get(url, timeout=timeout_sec)
    r.raise_for_status()
    return r.content


def extract_image_bytes_from_chat_payload(payload: Dict[str, Any]) -> bytes:
    try:
        message = payload["choices"][0]["message"]
    except Exception as exc:
        raise RuntimeError(f"Unexpected chat payload: {json.dumps(payload)[:500]}") from exc

    content = message.get("content")

    if isinstance(content, list):
        for part in content:
            if not isinstance(part, dict):
                continue
            if part.get("type") in {"image_url", "input_image"}:
                src = (
                    part.get("image_url", {}).get("url")
                    if isinstance(part.get("image_url"), dict)
                    else part.get("image_url")
                )
                if isinstance(src, str):
                    b = extract_data_uri_bytes(src)
                    if b:
                        return b
            if part.get("type") in {"output_image", "image"} and isinstance(part.get("b64_json"), str):
                return base64.b64decode(part["b64_json"])

    if isinstance(content, str):
        b = extract_data_uri_bytes(content)
        if b:
            return b

    raise RuntimeError("No image bytes found in chat response content")


def extract_data_uri_bytes(text: str) -> Optional[bytes]:
    match = DATA_URI_RE.search(text)
    if not match:
        return None
    return base64.b64decode(match.group(1))


def load_image_bytes_as_l(image_bytes: bytes) -> Image.Image:
    with Image.open(io.BytesIO(image_bytes)) as img:
        return img.convert("L")


def save_gray(gray: Image.Image, out_path: Path, threshold: int, invert: bool) -> Image.Image:
    result = gray
    if invert:
        result = ImageOps.invert(result)

    if threshold > 0:
        th = max(0, min(255, threshold))
        result = result.point(lambda p: 255 if p >= th else 0, mode="L")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    result.save(out_path, format="PNG")
    return result


def save_alpha(gray_mask: Image.Image, out_path: Path, feather: float) -> None:
    alpha = gray_mask
    if feather > 0:
        alpha = alpha.filter(ImageFilter.GaussianBlur(radius=feather))
    rgba = Image.new("RGBA", alpha.size, (255, 255, 255, 0))
    rgba.putalpha(alpha)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(out_path, format="PNG")


def main() -> None:
    args = parse_args()
    image_path = Path(args.image)
    out_gray = Path(args.out_gray)
    out_alpha = Path(args.out_alpha) if args.out_alpha else None
    out_raw = Path(args.out_raw) if args.out_raw else None

    size = ensure_size_arg(image_path, args.size)
    if args.mode == "edits":
        raw_bytes = call_edits_mode(
            base_url=args.base_url,
            api_key=args.api_key,
            model=args.model,
            prompt=args.prompt,
            image_path=image_path,
            response_format=args.response_format,
            size=size,
            timeout_sec=args.timeout_sec,
        )
    else:
        raw_bytes = call_chat_mode(
            base_url=args.base_url,
            api_key=args.api_key,
            model=args.model,
            prompt=args.prompt,
            image_path=image_path,
            timeout_sec=args.timeout_sec,
        )

    if out_raw:
        out_raw.parent.mkdir(parents=True, exist_ok=True)
        out_raw.write_bytes(raw_bytes)

    gray = load_image_bytes_as_l(raw_bytes)
    gray = save_gray(gray, out_gray, threshold=args.threshold, invert=args.invert)
    if out_alpha:
        save_alpha(gray, out_alpha, feather=args.feather)

    print("[ok] mask generated")
    print(f"[ok] mode:      {args.mode}")
    print(f"[ok] image:     {image_path}")
    print(f"[ok] out_gray:  {out_gray}")
    if out_alpha:
        print(f"[ok] out_alpha: {out_alpha}")
    if out_raw:
        print(f"[ok] out_raw:   {out_raw}")
    print(f"[ok] size:      {size}")


if __name__ == "__main__":
    main()
