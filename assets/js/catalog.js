/**
 * Beakim Hospitality Group - Official Property Catalog
 * Single Source of Truth for verified property offerings, rates, and inventory.
 * Authoritative 76-Unit Portfolio Matrix
 */

const BEAKIM_CATALOG = {
  "beakim-darad": {
    id: "beakim-darad",
    name: "Beakim Darad",
    locality: "Diani Beach",
    address: "Off Diani Links Road, Diani Beach, Kenya",
    phone: "+254 750 864 119",
    coordinates: { latitude: -4.284794, longitude: 39.577151 },
    stayType: "nightly",
    pools: 2,
    totalUnits: 45,
    breakfastRate: 500,
    offerings: [
      {
        id: "darad-cottage",
        name: "Garden View Cottage (1-Bedroom With AC)",
        dropdownLabel: "Beakim Darad - Garden View Cottage (1-Bedroom)",
        rate: 4000,
        rateBasis: "per night",
        units: 3,
        maxAdults: 3,
        maxChildren: 2,
        maxGuests: 4,
        hasAc: true,
        amenities: ["Air Conditioning", "Private Living Room", "Kitchenette", "Private Patio", "2 Resort Pools", "High-Speed Wi-Fi", "24/7 Security"],
        description: "Standalone 1-bedroom holiday cottage with private living lounge, air conditioning, kitchenette, and garden terrace."
      },
      {
        id: "darad-std-no-ac",
        name: "Standard Room (Without AC, Shared Kitchen)",
        dropdownLabel: "Beakim Darad - Standard Room (Without AC)",
        rate: 1700,
        rateBasis: "per night",
        units: 14,
        maxAdults: 2,
        maxChildren: 1,
        maxGuests: 2,
        hasAc: false,
        amenities: ["Ceiling Fan", "Ensuite Washroom", "Shared Kitchen (3 Rooms)", "2 Resort Pools", "High-Speed Wi-Fi", "24/7 Security"],
        description: "Budget-friendly standard room with cooling ceiling fan, ensuite washroom, and access to a clean kitchen shared with 2 other rooms."
      },
      {
        id: "darad-std-ac",
        name: "Standard Room (With AC, Shared Kitchen)",
        dropdownLabel: "Beakim Darad - Standard Room (With AC)",
        rate: 2300,
        rateBasis: "per night",
        units: 7,
        maxAdults: 2,
        maxChildren: 1,
        maxGuests: 2,
        hasAc: true,
        amenities: ["Air Conditioning", "Ensuite Washroom", "Shared Kitchen (3 Rooms)", "2 Resort Pools", "High-Speed Wi-Fi", "24/7 Security"],
        description: "Comfortable standard room with split-unit air conditioning, ensuite bathroom, and access to a shared kitchen with 2 other rooms."
      },
      {
        id: "darad-superior-ac",
        name: "Superior Room (With AC)",
        dropdownLabel: "Beakim Darad - Superior Room (With AC)",
        rate: 3000,
        rateBasis: "per night",
        units: 12,
        maxAdults: 2,
        maxChildren: 1,
        maxGuests: 2,
        hasAc: true,
        amenities: ["Air Conditioning", "Ensuite Washroom", "Premium Finishes", "2 Resort Pools", "High-Speed Wi-Fi", "24/7 Security"],
        description: "Spacious ensuite superior room featuring premium coastal finishes, air conditioning, pool access, and tranquil garden ambience."
      },
      {
        id: "darad-studio-kitchenette",
        name: "Ensuite Studio with Kitchenette (With AC)",
        dropdownLabel: "Beakim Darad - Ensuite Studio with Kitchenette",
        rate: 3000,
        rateBasis: "per night",
        units: 9,
        maxAdults: 2,
        maxChildren: 1,
        maxGuests: 2,
        hasAc: true,
        amenities: ["Air Conditioning", "Private Kitchenette", "Ensuite Washroom", "2 Resort Pools", "High-Speed Wi-Fi", "24/7 Security"],
        description: "Independent studio suite complete with its own private kitchenette, ensuite bathroom, split AC, and resort amenities."
      }
    ]
  },

  "tower-cottages": {
    id: "tower-cottages",
    name: "Tower Cottages",
    locality: "Ukunda",
    address: "Likoni-Lunga Lunga Rd, Behind Naivas Supermarket, Ukunda, Kenya",
    phone: "+254 746 938 529",
    coordinates: { latitude: -4.2874, longitude: 39.5665 },
    stayType: "nightly",
    breakfastRate: 0,
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
    phone: "+254 119 237 439",
    coordinates: { latitude: -4.288156, longitude: 39.581767 },
    stayType: "nightly",
    breakfastRate: 1000,
    totalUnits: 16,
    offerings: [
      {
        id: "darling-deluxe-studio",
        name: "Deluxe Studio Room (Kitchenette & Balcony)",
        dropdownLabel: "Diani Darling Cottages - Deluxe Studio Room",
        rate: 5000,
        rateBasis: "per night",
        units: 16,
        maxAdults: 2,
        maxChildren: 1,
        maxGuests: 2,
        hasAc: true,
        amenities: ["Private Balcony", "Kitchenette", "Swimming Pool", "Air Conditioning", "High-Speed Wi-Fi", "Beach Road Access"],
        description: "Premium deluxe holiday studio featuring a private balcony, equipped kitchenette, swimming pool access, and prime Diani Beach Road location."
      }
    ],
    conferencePackages: [
      {
        id: "darling-conf-half-day",
        name: "Half Day Standard Conference Package",
        rate: 1500,
        rateBasis: "per person",
        includesLunch: false,
        maxOccupants: 60,
        timing: "Morning (8:00 AM – 12:00 PM) or Afternoon (1:00 PM – 5:00 PM)",
        inclusions: [
          "Tea break with fresh hot Kenyan tea/coffee & coastal light snacks",
          "Executive conference notebook & pen for every delegate",
          "Chilled bottled mineral water",
          "Full dual-split air conditioning",
          "High-output digital projector & projection screen",
          "Professional PA sound system & wireless microphones",
          "Dedicated high-speed fiber Wi-Fi",
          "Free secure solar-canopy parking"
        ],
        description: "Half-day executive meeting session with tea break, light snacks, full audiovisual setup, and up to 60 delegate capacity (no lunch)."
      },
      {
        id: "darling-conf-full-day",
        name: "Full Day Conference Package with Lunch",
        rate: 3000,
        rateBasis: "per person",
        includesLunch: true,
        maxOccupants: 60,
        timing: "Full Day Session (8:00 AM – 5:00 PM)",
        inclusions: [
          "Chef-prepared coastal buffet lunch served in private group dining hall",
          "Two tea breaks (morning & afternoon) with hot beverages & fresh snacks",
          "Executive conference notebook & pen for every delegate",
          "Chilled bottled mineral water throughout the day",
          "Full dual-split air conditioning",
          "High-output digital projector & projection screen",
          "Professional PA sound system & wireless microphones",
          "Dedicated high-speed fiber Wi-Fi",
          "Free secure solar-canopy parking"
        ],
        description: "Comprehensive full-day corporate package including chef-prepared lunch, two tea breaks, light snacks, full AV, and stationery for up to 60 delegates."
      }
    ]
  },

  "beakim-apartments": {
    id: "beakim-apartments",
    name: "Beakim Apartments",
    locality: "Diani Beach",
    address: "5th Row, Diani Beach, Kenya",
    phone: "+254 746 938 529",
    coordinates: { latitude: -4.2750, longitude: 39.5880 },
    stayType: "hybrid",
    breakfastRate: 0,
    totalUnits: 12,
    isUnderRenovation: true,
    isClosed: true,
    closureReason: "Under Renovation & Interior Upgrades",
    offerings: [
      {
        id: "apartments-1br-short",
        name: "1-Bedroom Apartment (Short-Term Stay)",
        stayType: "nightly",
        dropdownLabel: "Beakim Apartments - 1-Bedroom (Short-Term)",
        rate: 5000,
        rateBasis: "per night",
        units: 12,
        maxAdults: 2,
        maxChildren: 1,
        maxGuests: 2,
        hasAc: true,
        amenities: ["Private Kitchen", "Living Room", "Private Balcony", "Swimming Pool", "24/7 Gated Security", "Quiet 5th Row"],
        description: "Self-catering 1-bedroom apartment with private kitchen, living room, and balcony. Currently under renovation & interior upgrades."
      },
      {
        id: "apartments-1br-monthly",
        name: "1-Bedroom Apartment (Monthly Lease)",
        stayType: "monthly",
        dropdownLabel: "Beakim Apartments - 1-Bedroom (Monthly Lease)",
        rate: 75000,
        rateBasis: "per month (negotiable up to KSh 100,000)",
        units: 12,
        maxAdults: 2,
        maxChildren: 1,
        maxGuests: 2,
        hasAc: true,
        amenities: ["Private Kitchen", "Living Room", "Private Balcony", "Swimming Pool", "24/7 Gated Security", "Quiet 5th Row"],
        description: "Long-term residential monthly lease (KSh 75,000 - 100,000 negotiable via direct call to office). Currently under renovation & interior upgrades."
      }
    ]
  }
};

// Helper function to find offering by ID or dropdown value
function getOfferingById(offeringId) {
  const normalizedId = offeringId === "darad-standard-ac" ? "darad-std-ac" : (offeringId === "darad-standard-no-ac" ? "darad-std-no-ac" : offeringId);
  for (const propKey in BEAKIM_CATALOG) {
    const prop = BEAKIM_CATALOG[propKey];
    for (const off of prop.offerings) {
      if (off.id === offeringId || off.id === normalizedId || off.dropdownLabel === offeringId || off.name === offeringId) {
        return {
          ...off,
          propertyName: prop.name,
          propertyId: prop.id,
          stayType: off.stayType || prop.stayType,
          propertyBreakfastRate: prop.breakfastRate || 0,
          isUnderRenovation: Boolean(prop.isUnderRenovation)
        };
      }
    }
  }
  return null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BEAKIM_CATALOG, getOfferingById };
}
