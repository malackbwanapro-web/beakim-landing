/**
 * Beakim Hospitality Group - Official Property Catalog
 * Single Source of Truth for verified property offerings, rates, and inventory.
 * Verified: 30 September 2026
 */

const BEAKIM_CATALOG = {
  "beakim-darad": {
    id: "beakim-darad",
    name: "Beakim Darad",
    locality: "Diani Beach",
    address: "Ukunda-Diani Beach Road, Diani Beach, Kenya",
    coordinates: { latitude: -4.2796, longitude: 39.5936 },
    stayType: "nightly",
    pools: 2,
    totalUnits: 28,
    offerings: [
      {
        id: "darad-standard-no-ac",
        name: "Standard Studio Room (Without AC)",
        dropdownLabel: "Beakim Darad - Standard Studio Room (Without AC)",
        rate: 2000,
        rateBasis: "per night",
        units: 10,
        maxAdults: 2,
        maxChildren: 1,
        maxGuests: 2,
        hasAc: false,
        amenities: ["Ceiling Fan", "Ensuite Bathroom", "2 Resort Pools", "High-Speed Wi-Fi", "24/7 Security"],
        description: "Budget-friendly studio room with cooling ceiling fan, ensuite washroom, and full access to both resort swimming pools."
      },
      {
        id: "darad-standard-ac",
        name: "Standard Studio Room (With AC)",
        dropdownLabel: "Beakim Darad - Standard Studio Room (With AC)",
        rate: 2500,
        rateBasis: "per night",
        units: 10,
        maxAdults: 2,
        maxChildren: 1,
        maxGuests: 2,
        hasAc: true,
        amenities: ["Air Conditioning", "Ensuite Bathroom", "2 Resort Pools", "High-Speed Wi-Fi", "24/7 Security"],
        description: "Cozy standard studio room featuring individually controlled air conditioning, fresh coastal linen, and resort pool access."
      },
      {
        id: "darad-deluxe-ac",
        name: "Deluxe Studio Room (With AC)",
        dropdownLabel: "Beakim Darad - Deluxe Studio Room (With AC)",
        rate: 3000,
        rateBasis: "per night",
        units: 5,
        maxAdults: 2,
        maxChildren: 1,
        maxGuests: 2,
        hasAc: true,
        amenities: ["Air Conditioning", "Private Patio", "2 Resort Pools", "High-Speed Wi-Fi", "Dedicated Desk", "24/7 Security"],
        description: "Spacious deluxe studio room featuring modern finishes, premium bedding, air conditioning, and garden/pool views."
      },
      {
        id: "darad-1br-cottage",
        name: "1-Bedroom Cottage (With AC)",
        dropdownLabel: "Beakim Darad - 1-Bedroom Cottage (With AC)",
        rate: 4000,
        rateBasis: "per night",
        units: 3,
        maxAdults: 3,
        maxChildren: 2,
        maxGuests: 4,
        hasAc: true,
        amenities: ["Air Conditioning", "Kitchenette", "Living Lounge", "2 Resort Pools", "High-Speed Wi-Fi", "24/7 Security"],
        description: "Standalone 1-bedroom holiday cottage with private living lounge, air conditioning, kitchenette, and poolside terrace."
      }
    ]
  },

  "tower-cottages": {
    id: "tower-cottages",
    name: "Tower Cottages",
    locality: "Ukunda",
    address: "Directly Behind Naivas Supermarket, Ukunda-Diani, Kenya",
    coordinates: { latitude: -4.2831, longitude: 39.5702 },
    stayType: "nightly",
    totalUnits: 3,
    offerings: [
      {
        id: "tower-2br",
        name: "2-Bedroom Apartment",
        dropdownLabel: "Tower Cottages - 2-Bedroom Apartment",
        rate: 2500,
        rateBasis: "per night",
        units: 3,
        maxAdults: 4,
        maxChildren: 2,
        maxGuests: 5,
        hasAc: true,
        amenities: ["Full Kitchen", "Living Room", "Air Conditioning", "High-Speed Wi-Fi", "Gated Compound", "30s to Naivas"],
        description: "Fully furnished 2-bedroom self-catering apartment with complete kitchen, secure gated parking, located 30 seconds behind Naivas Supermarket Ukunda."
      }
    ]
  },

  "diani-darling": {
    id: "diani-darling",
    name: "Diani Darling Cottages",
    locality: "Diani Beach",
    address: "Diani Beach Road, Diani Beach, Kenya",
    coordinates: { latitude: -4.2796, longitude: 39.5936 },
    stayType: "nightly",
    totalUnits: 14,
    offerings: [
      {
        id: "darling-deluxe-studio",
        name: "Deluxe Studio Room (Kitchenette & Balcony)",
        dropdownLabel: "Diani Darling Cottages - Deluxe Studio Room",
        rate: 5000,
        rateBasis: "per night",
        units: 14,
        maxAdults: 2,
        maxChildren: 1,
        maxGuests: 2,
        hasAc: true,
        amenities: ["Private Balcony", "Kitchenette", "Swimming Pool", "Air Conditioning", "High-Speed Wi-Fi", "Beach Road Access"],
        description: "Premium deluxe holiday studio featuring a private balcony, equipped kitchenette, swimming pool access, and prime Diani Beach Road location."
      }
    ]
  },

  "beakim-apartments": {
    id: "beakim-apartments",
    name: "Beakim Apartments",
    locality: "Diani Beach",
    address: "5th Row, Diani Beach, Kenya",
    coordinates: { latitude: -4.2750, longitude: 39.5880 },
    stayType: "monthly",
    totalUnits: 20,
    offerings: [
      {
        id: "apartments-1br-monthly",
        name: "1-Bedroom Apartment (Monthly Lease)",
        dropdownLabel: "Beakim Apartments - 1-Bedroom (Monthly Lease)",
        rate: 15000,
        rateBasis: "per month",
        units: 10,
        maxAdults: 2,
        maxChildren: 1,
        maxGuests: 2,
        hasAc: true,
        amenities: ["Private Balcony", "Equipped Kitchen", "Swimming Pool", "24/7 Gated Security", "Quiet 5th Row"],
        description: "Serene 1-bedroom apartment in a peaceful, secure gated compound designed specifically for long-term residential living on a monthly rent basis."
      },
      {
        id: "apartments-2br-monthly",
        name: "2-Bedroom Apartment (Monthly Lease)",
        dropdownLabel: "Beakim Apartments - 2-Bedroom (Monthly Lease)",
        rate: 25000,
        rateBasis: "per month",
        units: 10,
        maxAdults: 4,
        maxChildren: 2,
        maxGuests: 4,
        hasAc: true,
        amenities: ["Full Kitchen", "Spacious Living Room", "Private Balcony", "Swimming Pool", "24/7 Gated Security", "Parking"],
        description: "Spacious 2-bedroom residential apartment with modern kitchen and private balcony, ideal for long-term family or professional residency."
      }
    ]
  }
};

// Helper function to find offering by ID or dropdown value
function getOfferingById(offeringId) {
  for (const propKey in BEAKIM_CATALOG) {
    const prop = BEAKIM_CATALOG[propKey];
    for (const off of prop.offerings) {
      if (off.id === offeringId || off.dropdownLabel === offeringId || off.name === offeringId) {
        return { ...off, propertyName: prop.name, propertyId: prop.id, stayType: prop.stayType };
      }
    }
  }
  return null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BEAKIM_CATALOG, getOfferingById };
}
