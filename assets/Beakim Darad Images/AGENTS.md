# Beakim Darad Images Domain

## 1. Purpose & Ownership
- **Scope:** High-resolution resort photography for Beakim Beach Darad (located off Diani Beach Road, 5th Row, Diani Beach, Kwale County, Kenya).
- **Key Assets:**
  - 43 WebP photographs optimized at quality 83 (Lanczos downsample to max 2048px width/height).
  - EXIF GPS Coordinates: `Latitude: 4° 16' 57.0" S (-4.2825)`, `Longitude: 39° 35' 20.4" E (39.5890)`.
  - Copyright: `(C) 2026 Beakim Hospitality Group. All rights reserved.`
  - Camera attribution: `Sony Alpha a7 IV / FE 16-35mm f/2.8 GM`.
- **Boundaries:** This folder only stores compressed, web-ready static image assets. Raw uncompressed images belong in `assets/Beakim Darad New Images/` (which is git-ignored).

---

## 2. Asset Catalog & Categories
- **Resort Grounds & Pools:**
  - `beakim-darad-resort-swimming-pools-deluxe-building.webp` (Primary Hero)
  - `beakim-darad-resort-dual-pools-tropical-gardens.webp`
  - `beakim-darad-resort-swimming-pool-cottages.webp`
  - `beakim-darad-swimming-pools-bollards-courtyard.webp`
  - `beakim-darad-poolside-sun-loungers-deck.webp`
  - `beakim-darad-poolside-patio-shaded-loungers.webp`
  - `beakim-darad-poolside-guest-restrooms.webp`
  - `beakim-darad-tropical-garden-pathway-banana-palms.webp`
- **Standard Rooms (Offering 01 & 02):**
  - `beakim-darad-standard-rooms-cottage-row-exterior.webp` (Hero)
  - `beakim-darad-standard-rooms-cottage-row-walkway.webp`
  - `beakim-darad-standard-rooms-covered-walkway-veranda.webp`
  - `beakim-darad-standard-rooms-garden-entrance-veranda.webp`
  - `beakim-darad-standard-rooms-interior-corridor.webp`
  - `beakim-darad-standard-rooms-private-courtyard-patio.webp`
  - `beakim-darad-standard-room-king-bed-bathroom-balcony.webp`
  - `beakim-darad-standard-room-garden-patio-view.webp`
  - `beakim-darad-standard-room-ensuite-washbasin-mirror.webp`
  - `beakim-darad-standard-room-ensuite-shower-toilet.webp`
  - `beakim-darad-standard-room-ensuite-marble-bath.webp`
  - `beakim-darad-standard-room-bedding-ambient-light.webp`
  - `beakim-darad-standard-room-bedside-wardrobe-closet.webp`
  - `beakim-darad-standard-room-hardwood-bed-mosquito-net.webp`
  - `beakim-darad-standard-room-platform-bed-balcony-view.webp`
  - `beakim-darad-standard-room-swan-towel-art-bedding.webp`
  - `beakim-darad-standard-room-towel-art-air-conditioned.webp`
  - `beakim-darad-standard-room-upholstered-king-bed.webp`
- **Deluxe Studio Rooms (Offering 03):**
  - `beakim-darad-deluxe-studio-full-room-kitchenette-tv.webp` (Hero)
  - `beakim-darad-deluxe-studio-king-bed-dual-windows.webp`
  - `beakim-darad-deluxe-studio-tv-lounge-refrigerator.webp`
  - `beakim-darad-deluxe-studio-kitchenette-dining.webp`
  - `beakim-darad-deluxe-studio-bedroom-vanity-angle.webp`
  - `beakim-darad-deluxe-studio-bedroom-wardrobe-lighting.webp`
  - `beakim-darad-deluxe-studio-bedside-table-lamp.webp`
  - `beakim-darad-deluxe-studio-ensuite-bathroom.webp`
  - `beakim-darad-deluxe-studio-sliding-balcony-view.webp`
  - `beakim-darad-deluxe-studios-exterior-facade.webp`
  - `beakim-darad-deluxe-studio-curved-balconies-facade.webp`
  - `beakim-darad-deluxe-suites-poolside-architecture.webp`
- **1-Bedroom Cottages (Offering 04):**
  - `beakim-darad-one-bedroom-cottage-exterior-gardens.webp` (Hero)
  - `beakim-darad-one-bedroom-cottages-lawn-verandah.webp`
- **Compound Infrastructure:**
  - `beakim-darad-secure-entrance-gate-security.webp`
  - `beakim-darad-secure-paved-parking-lot.webp`
  - `beakim-darad-guest-reception-front-desk.webp`

---

## 3. Work Guidance & Verification
- **Test Command:** `node test/clean_code.test.js`
- **Image Pipeline:** Script `scratch/convert_beakim_darad.py` downsamples, applies EXIF metadata via `piexif`, and converts images to WebP.

---

## 4. Child Docs Index
*(Leaf directory — no further child domains)*
