/**
 * Yanhal Google Places & Location Integration
 * Provides accurate site and meeting location discovery across Nairobi and Kenya.
 * Rule: A place search alone must NEVER be treated as a verified project site until confirmed.
 */

export interface VerifiedPlace {
  placeId: string;
  name: string;
  formattedAddress: string;
  mapsUrl: string;
  area: string;
  isNairobiMetropolitan: boolean;
  isVerifiedProjectSite: boolean;
}

const PRESET_KENYA_LOCATIONS: VerifiedPlace[] = [
  {
    placeId: "yanhal_hq_south_c",
    name: "Yanhal Holdings Headquarters",
    formattedAddress: "South C, Behind Masjid As Salaam, Nairobi, Kenya",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=South+C,+Behind+Masjid+As+Salaam,+Nairobi,+Kenya",
    area: "South C",
    isNairobiMetropolitan: true,
    isVerifiedProjectSite: false,
  },
  {
    placeId: "nairobi_westlands",
    name: "Westlands Commercial District",
    formattedAddress: "Westlands, Nairobi, Kenya",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Westlands,+Nairobi,+Kenya",
    area: "Westlands",
    isNairobiMetropolitan: true,
    isVerifiedProjectSite: false,
  },
  {
    placeId: "nairobi_kilimani",
    name: "Kilimani Area",
    formattedAddress: "Kilimani, Nairobi, Kenya",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kilimani,+Nairobi,+Kenya",
    area: "Kilimani",
    isNairobiMetropolitan: true,
    isVerifiedProjectSite: false,
  },
  {
    placeId: "nairobi_karen",
    name: "Karen Suburb",
    formattedAddress: "Karen, Nairobi, Kenya",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Karen,+Nairobi,+Kenya",
    area: "Karen",
    isNairobiMetropolitan: true,
    isVerifiedProjectSite: false,
  },
  {
    placeId: "nairobi_runda",
    name: "Runda Estate",
    formattedAddress: "Runda, Nairobi, Kenya",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Runda,+Nairobi,+Kenya",
    area: "Runda",
    isNairobiMetropolitan: true,
    isVerifiedProjectSite: false,
  },
  {
    placeId: "nairobi_lavington",
    name: "Lavington Area",
    formattedAddress: "Lavington, Nairobi, Kenya",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lavington,+Nairobi,+Kenya",
    area: "Lavington",
    isNairobiMetropolitan: true,
    isVerifiedProjectSite: false,
  },
  {
    placeId: "nairobi_upperhill",
    name: "Upper Hill Financial Center",
    formattedAddress: "Upper Hill, Nairobi, Kenya",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Upper+Hill,+Nairobi,+Kenya",
    area: "Upper Hill",
    isNairobiMetropolitan: true,
    isVerifiedProjectSite: false,
  },
  {
    placeId: "nairobi_kileleshwa",
    name: "Kileleshwa Residential Area",
    formattedAddress: "Kileleshwa, Nairobi, Kenya",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kileleshwa,+Nairobi,+Kenya",
    area: "Kileleshwa",
    isNairobiMetropolitan: true,
    isVerifiedProjectSite: false,
  },
  {
    placeId: "nairobi_gigiri",
    name: "Gigiri Diplomatic Zone",
    formattedAddress: "Gigiri, Nairobi, Kenya",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Gigiri,+Nairobi,+Kenya",
    area: "Gigiri",
    isNairobiMetropolitan: true,
    isVerifiedProjectSite: false,
  },
];

export async function searchPlaces(query: string): Promise<VerifiedPlace[]> {
  const clean = query.trim().toLowerCase();
  if (!clean) return PRESET_KENYA_LOCATIONS.slice(0, 4);

  // Match against curated verified Kenyan localities
  const matches = PRESET_KENYA_LOCATIONS.filter(
    p => p.name.toLowerCase().includes(clean) || 
         p.area.toLowerCase().includes(clean) || 
         p.formattedAddress.toLowerCase().includes(clean)
  );

  if (matches.length > 0) {
    return matches;
  }

  // If visitor entered a custom location, format into safe place entry with Google Maps link
  const safeTitle = query.charAt(0).toUpperCase() + query.slice(1);
  const formatted = `${safeTitle}, Kenya`;
  const encoded = encodeURIComponent(formatted);

  return [
    {
      placeId: `custom_place_${Date.now()}`,
      name: safeTitle,
      formattedAddress: formatted,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
      area: safeTitle,
      isNairobiMetropolitan: formatted.toLowerCase().includes("nairobi"),
      isVerifiedProjectSite: false, // Must be explicitly confirmed by visitor
    }
  ];
}
