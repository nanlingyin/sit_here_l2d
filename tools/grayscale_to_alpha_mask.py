#!/usr/bin/env python3
"""
Convert a grayscale mask image into an RGBA transparent mask.

Typical workflow:
1) Use any segmentation/image API to generate grayscale mask.
2) Run this script to convert grayscale -> alpha PNG.
3) Use output PNG as the foreground mask layer in compositing.

Example:
    python grayscale_to_alpha_mask.py \
      --mask ./mask_gray.png \
      --out ./mask_alpha.png \
      --threshold 128 \
      --feather 2 \
      --invert
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageFilter


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert grayscale mask to transparent alpha mask PNG."
    )
    parser.add_argument("--mask", required=True, help="Input grayscale mask image path")
    parser.add_argument("--out", required=True, help="Output RGBA PNG path")
    parser.add_argument(
        "--threshold",
        type=int,
        default=0,
        help="0 means keep soft alpha; >0 means binarize by threshold [1..255]",
    )
    parser.add_argument(
        "--invert",
        action="store_true",
        help="Invert alpha (white->transparent, black->opaque)",
    )
    parser.add_argument(
        "--feather",
        type=float,
        default=0.0,
        help="Gaussian blur radius on alpha channel",
    )
    parser.add_argument(
        "--solid-color",
        default="255,255,255",
        help="RGB fill color for non-transparent area, format: R,G,B",
    )
    return parser.parse_args()


def parse_color(value: str) -> tuple[int, int, int]:
    parts = [p.strip() for p in value.split(",")]
    if len(parts) != 3:
        raise ValueError("--solid-color must be R,G,B")
    r, g, b = (int(parts[0]), int(parts[1]), int(parts[2]))
    for c in (r, g, b):
        if c < 0 or c > 255:
            raise ValueError("--solid-color channel must be in [0,255]")
    return r, g, b


def apply_threshold(alpha: Image.Image, threshold: int) -> Image.Image:
    if threshold <= 0:
        return alpha
    threshold = max(1, min(255, threshold))
    return alpha.point(lambda p: 255 if p >= threshold else 0, mode="L")


def main() -> None:
    args = parse_args()

    mask_path = Path(args.mask)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    color = parse_color(args.solid_color)

    gray = Image.open(mask_path).convert("L")
    alpha = gray

    if args.invert:
        alpha = Image.eval(alpha, lambda p: 255 - p)

    alpha = apply_threshold(alpha, args.threshold)

    if args.feather > 0:
        alpha = alpha.filter(ImageFilter.GaussianBlur(radius=args.feather))

    rgba = Image.new("RGBA", gray.size, (*color, 0))
    rgba.putalpha(alpha)
    rgba.save(out_path, format="PNG")

    print(f"[ok] input:  {mask_path}")
    print(f"[ok] output: {out_path}")
    print(
        "[ok] options: "
        f"threshold={args.threshold}, invert={args.invert}, feather={args.feather}"
    )


if __name__ == "__main__":
    main()
