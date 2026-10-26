"""
Optimizes Fit Nation images for insights.html.
Converts massive raw 13MB+ camera JPEGs into high-resolution WebP files
with embedded EXIF metadata (title, artist, copyright, GPS coordinates).
"""

import os
from PIL import Image
from PIL.ExifTags import Base, GPS

SOURCE_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "fit-nation")

IMAGE_SPECS = [
    {
        "src": "IMG_7214_Master.jpg",
        "dest": "fit-nation-kenya-diani-convoy-autoxpress.webp",
        "max_dim": 1920,
        "quality": 84,
        "title": "Fit Nation Kenya Convoy Gathered Outside AutoXpress in Diani Beach - Beakim Hospitality Group",
        "lat": (-4, 17, 5.25),
        "lat_ref": "S",
        "lon": (39, 34, 37.74),
        "lon_ref": "E"
    },
    {
        "src": "IMG_7176_Master.jpg",
        "dest": "fit-nation-poolside-swims-beakim-beach-darad.webp",
        "max_dim": 800,
        "quality": 82,
        "title": "Fit Nation Poolside Swims and Gathering with Head Chef at Beakim Beach Darad Resort",
        "lat": (-4, 17, 5.25),
        "lat_ref": "S",
        "lon": (39, 34, 37.74),
        "lon_ref": "E"
    },
    {
        "src": "IMG_7172_Master.jpg",
        "dest": "beakim-executive-head-chef-culinary.webp",
        "max_dim": 800,
        "quality": 82,
        "title": "Beakim Hospitality Executive Head Chef in Uniform - Luxury Coastal Catering",
        "lat": (-4, 17, 5.25),
        "lat_ref": "S",
        "lon": (39, 34, 37.74),
        "lon_ref": "E"
    },
    {
        "src": "IMG_7203_Master.jpg",
        "dest": "fit-nation-honda-fit-convoy-courtyard-parking.webp",
        "max_dim": 800,
        "quality": 82,
        "title": "White Honda Fit Convoy Car 33 in Beakim Beach Darad Gated Courtyard",
        "lat": (-4, 17, 5.25),
        "lat_ref": "S",
        "lon": (39, 34, 37.74),
        "lon_ref": "E"
    },
    {
        "src": "IMG_7211_Master.jpg",
        "dest": "fit-nation-convoy-marshall-radio-coordination.webp",
        "max_dim": 800,
        "quality": 82,
        "title": "Fit Nation Convoy Marshall Coordinating Road Safety with Two-Way Radio",
        "lat": (-4, 17, 5.25),
        "lat_ref": "S",
        "lon": (39, 34, 37.74),
        "lon_ref": "E"
    },
    {
        "src": "IMG_7185_Master.jpg",
        "dest": "family-father-baby-swimming-pool-beakim.webp",
        "max_dim": 800,
        "quality": 82,
        "title": "Father and Baby Daughter Relaxing in Swimming Pool at Beakim Beach Darad",
        "lat": (-4, 17, 5.25),
        "lat_ref": "S",
        "lon": (39, 34, 37.74),
        "lon_ref": "E"
    },
    {
        "src": "IMG_7188_Master.jpg",
        "dest": "mother-daughter-poolside-lounging-diani-resort.webp",
        "max_dim": 800,
        "quality": 82,
        "title": "Mother and Daughter Relaxing on Shaded Poolside Sun Lounger at Beakim Resort",
        "lat": (-4, 17, 5.25),
        "lat_ref": "S",
        "lon": (39, 34, 37.74),
        "lon_ref": "E"
    },
    {
        "src": "IMG_7206_Master.jpg",
        "dest": "fit-nation-support-vans-gated-security-beakim.webp",
        "max_dim": 800,
        "quality": 82,
        "title": "Convoy Support Vans Parked Inside 24/7 Gated Perimeter at Beakim Hospitality",
        "lat": (-4, 17, 5.25),
        "lat_ref": "S",
        "lon": (39, 34, 37.74),
        "lon_ref": "E"
    },
    {
        "src": "IMG_7234_Master.jpg",
        "dest": "fit-nation-highway-fleet-regrouping-coastal-route.webp",
        "max_dim": 800,
        "quality": 82,
        "title": "Fit Nation Convoy Fleet Regrouping Along Coastal Corridor Route to Diani Beach",
        "lat": (-4, 17, 5.25),
        "lat_ref": "S",
        "lon": (39, 34, 37.74),
        "lon_ref": "E"
    },
    {
        "src": "IMG_7197_Master.jpg",
        "dest": "travelers-palm-tropical-gardens-beakim-resort.webp",
        "max_dim": 800,
        "quality": 82,
        "title": "Couple Lounging Under Majestic Traveler's Palm in Beakim Tropical Gardens",
        "lat": (-4, 17, 5.25),
        "lat_ref": "S",
        "lon": (39, 34, 37.74),
        "lon_ref": "E"
    }
]

def build_exif(title, lat, lat_ref, lon, lon_ref):
    exif = Image.Exif()
    exif[Base.ImageDescription] = title
    exif[Base.Artist] = "Beakim Hospitality Group"
    exif[Base.Copyright] = "Copyright 2026 Beakim Hospitality Group. All rights reserved."
    exif[Base.Software] = "Beakim Hospitality Media Pipeline v2.0"

    gps_ifd = exif.get_ifd(Base.GPSInfo)
    gps_ifd[GPS.GPSLatitudeRef] = lat_ref
    gps_ifd[GPS.GPSLatitude] = (abs(lat[0]), abs(lat[1]), abs(lat[2]))
    gps_ifd[GPS.GPSLongitudeRef] = lon_ref
    gps_ifd[GPS.GPSLongitude] = (abs(lon[0]), abs(lon[1]), abs(lon[2]))
    return exif

def main():
    total_orig_bytes = 0
    total_webp_bytes = 0

    print("[START] Starting High-Resolution WebP Conversion with EXIF & GPS metadata...\n")

    for item in IMAGE_SPECS:
        src_path = os.path.join(SOURCE_DIR, item["src"])
        dest_path = os.path.join(SOURCE_DIR, item["dest"])

        if not os.path.exists(src_path):
            print(f"[WARN] Source file not found: {src_path}")
            continue

        orig_size = os.path.getsize(src_path)
        total_orig_bytes += orig_size

        with Image.open(src_path) as img:
            # Preserve RGB mode
            if img.mode != "RGB":
                img = img.convert("RGB")

            # Calculate target dimensions maintaining aspect ratio
            img_copy = img.copy()
            img_copy.thumbnail((item["max_dim"], item["max_dim"]), Image.Resampling.LANCZOS)
            final_dims = img_copy.size

            # Build EXIF
            exif = build_exif(item["title"], item["lat"], item["lat_ref"], item["lon"], item["lon_ref"])

            # Save as high-quality WebP
            img_copy.save(dest_path, "WEBP", quality=item["quality"], method=6, exif=exif)

        webp_size = os.path.getsize(dest_path)
        total_webp_bytes += webp_size

        savings = ((orig_size - webp_size) / orig_size) * 100
        print(f"[OK] {item['dest']}")
        print(f"     Original: {orig_size / (1024*1024):.2f} MB  ->  WebP: {webp_size / 1024:.1f} KB ({final_dims[0]}x{final_dims[1]})  |  Savings: {savings:.1f}%\n")

    orig_mb = total_orig_bytes / (1024 * 1024)
    webp_mb = total_webp_bytes / (1024 * 1024)
    total_savings = ((total_orig_bytes - total_webp_bytes) / total_orig_bytes) * 100

    print("==================================================")
    print("BATCH CONVERSION COMPLETE!")
    print(f"   Total Original Payload: {orig_mb:.2f} MB")
    print(f"   Total Optimized WebP:   {webp_mb:.2f} MB")
    print(f"   Total Bandwidth Saved:  {orig_mb - webp_mb:.2f} MB ({total_savings:.1f}% reduction)")
    print("==================================================")

if __name__ == "__main__":
    main()
