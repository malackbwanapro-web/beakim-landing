"""
Optimizes Beakim Beach Darad accommodation images.
Converts high-resolution original JPEGs from 'assets/Beakim Darad New Images'
into web-optimized, high-performance WebP assets in 'assets/Beakim Darad Images'.
"""

import os
from PIL import Image, ImageOps

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE_DIR, "assets", "Beakim Darad New Images")
DST_DIR = os.path.join(BASE_DIR, "assets", "Beakim Darad Images")

CONVERSIONS = [
    # 1. Standard Rooms
    {
        "src": "standard rooms exteriors (7).jpg",
        "dst": "beakim-darad-standard-rooms-exterior-hero.webp",
        "max_dim": 1920,
        "quality": 84
    },
    {
        "src": "standard rooms exteriors (5).jpg",
        "dst": "beakim-darad-standard-rooms-exterior-gallery-5.webp",
        "max_dim": 1200,
        "quality": 82
    },
    {
        "src": "Beakim standard rooms interiors (1).jpg",
        "dst": "beakim-darad-standard-rooms-interior-gallery-1.webp",
        "max_dim": 1200,
        "quality": 82
    },
    {
        "src": "Beakim standard rooms interiors (5).jpg",
        "dst": "beakim-darad-standard-rooms-interior-gallery-5.webp",
        "max_dim": 1200,
        "quality": 82
    },
    {
        "src": "Beakim standard rooms interiors (4).jpg",
        "dst": "beakim-darad-standard-rooms-interior-gallery-4.webp",
        "max_dim": 1200,
        "quality": 82
    },
    # 2. Spacious Studios
    {
        "src": "Property building with the deluxe studio rooms (2).jpg",
        "dst": "beakim-darad-spacious-studios-building-hero.webp",
        "max_dim": 1920,
        "quality": 84
    },
    {
        "src": "Beakim Deluxe Studios Interiors (7).jpg",
        "dst": "beakim-darad-spacious-studio-interior-gallery-7.webp",
        "max_dim": 1200,
        "quality": 82
    },
    {
        "src": "Beakim Deluxe Studios Interiors (8).jpg",
        "dst": "beakim-darad-spacious-studio-interior-gallery-8.webp",
        "max_dim": 1200,
        "quality": 82
    },
    # 3. Superior Rooms
    {
        "src": "standard rooms exteriors (2).jpg",
        "dst": "beakim-darad-superior-rooms-exterior-hero.webp",
        "max_dim": 1920,
        "quality": 84
    },
    {
        "src": "standard rooms exteriors (1).jpg",
        "dst": "beakim-darad-superior-rooms-exterior-gallery-1.webp",
        "max_dim": 1200,
        "quality": 82
    },
    {
        "src": "Beakim standard rooms interiors (9).jpg",
        "dst": "beakim-darad-superior-rooms-interior-gallery-9.webp",
        "max_dim": 1200,
        "quality": 82
    },
    {
        "src": "standard rooms exteriors (4).jpg",
        "dst": "beakim-darad-superior-rooms-exterior-gallery-4.webp",
        "max_dim": 1200,
        "quality": 82
    },
    {
        "src": "standard rooms exteriors (6).jpg",
        "dst": "beakim-darad-superior-rooms-exterior-gallery-6.webp",
        "max_dim": 1200,
        "quality": 82
    }
]

def optimize_images():
    os.makedirs(DST_DIR, exist_ok=True)
    total_src_bytes = 0
    total_dst_bytes = 0

    print("[Optimizing] Converting Beakim Darad photos to high-performance WebP...\n")
    for item in CONVERSIONS:
        src_path = os.path.join(SRC_DIR, item["src"])
        dst_path = os.path.join(DST_DIR, item["dst"])

        if not os.path.exists(src_path):
            print(f"[MISSING] {item['src']}")
            continue

        src_size = os.path.getsize(src_path)
        total_src_bytes += src_size

        with Image.open(src_path) as im:
            im = ImageOps.exif_transpose(im)
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGB")

            # Scale proportionally to max dimension
            w, h = im.size
            max_dim = item["max_dim"]
            if max(w, h) > max_dim:
                if w >= h:
                    new_w = max_dim
                    new_h = int(h * (max_dim / w))
                else:
                    new_h = max_dim
                    new_w = int(w * (max_dim / h))
                im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)

            im.save(dst_path, "WEBP", quality=item["quality"], method=6)

        dst_size = os.path.getsize(dst_path)
        total_dst_bytes += dst_size
        savings_pct = (1.0 - (dst_size / src_size)) * 100
        print(f"[OK] {item['dst']} ({im.size[0]}x{im.size[1]}) | {src_size / 1024:.1f} KB -> {dst_size / 1024:.1f} KB (-{savings_pct:.1f}%)")

    total_saved_mb = (total_src_bytes - total_dst_bytes) / (1024 * 1024)
    print(f"\n[DONE] Successfully optimized {len(CONVERSIONS)} images!")
    print(f"Total Source Size: {total_src_bytes / (1024 * 1024):.2f} MB")
    print(f"Total WebP Size:   {total_dst_bytes / (1024 * 1024):.2f} MB")
    print(f"Total Bandwidth Saved: {total_saved_mb:.2f} MB (-{(1.0 - (total_dst_bytes / total_src_bytes)) * 100:.1f}%)\n")

if __name__ == "__main__":
    optimize_images()
