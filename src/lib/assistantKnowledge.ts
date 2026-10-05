/**
 * Yanhal Holdings Ltd — Verified Knowledge Base & Service Directory
 * This serves as the ground truth for all assistant answers and navigations.
 * Do not invent prices, qualifications, projects, or commitments outside of this data.
 */

export interface ServiceDetail {
  id: string;
  name: string;
  baseRateKes: number;
  description: string;
  typicalApplications: string[];
}

export interface ServiceDepthDetail {
  id: string;
  name: string;
  multiplier: number;
  description: string;
}

export const YANHAL_KNOWLEDGE = {
  company: {
    legalName: "Yanhal Holdings Limited",
    brandName: "Yanhal Holdings Ltd",
    establishedYear: 2020,
    headquarters: "South C, Behind Masjid As Salaam, Nairobi, Kenya",
    directPhone: "+254 724 093256",
    secondaryPhoneOrWhatsApp: "+254 740 895374",
    email: "Yanhalholdingslimited@gmail.com",
    timezone: "Africa/Nairobi",
    timeZoneOffset: "+03:00",
    businessHours: {
      weekdays: "Monday to Friday: 8:00 AM – 5:00 PM EAT",
      saturday: "Saturday: 9:00 AM – 1:00 PM EAT",
      sunday: "Sunday: Closed",
    },
    socialMedia: {
      tiktok: "https://www.tiktok.com/@yanhal.holdings.lt",
      instagram: "https://www.instagram.com/yanhalholdings/",
      googleMaps: "https://maps.google.com/?q=Yanhal+Holdings+Limited,+South+C,+Behind+Masjid+As+Salaam,+Nairobi,+Kenya&ll=-1.3197,36.8317&z=17",
    },
  },

  location: {
    name: "Yanhal Holdings Limited Headquarters",
    address: "South C, Behind Masjid As Salaam, Nairobi, Kenya",
    area: "South C",
    landmark: "Behind Masjid As Salaam",
    city: "Nairobi",
    country: "Kenya",
    coordinates: {
      lat: -1.3197,
      lng: 36.8317,
    },
    placeId: "ChIJ0_qfSbgQLxgR_mF9w6v1FvA",
    isOwnerVerified: true,
    mapsUrl: "https://maps.google.com/?q=Yanhal+Holdings+Limited,+South+C,+Behind+Masjid+As+Salaam,+Nairobi,+Kenya&ll=-1.3197,36.8317&z=17",
    satelliteUrl: "https://maps.google.com/maps?q=-1.3197,36.8317(Yanhal+Holdings+Limited)&t=k&z=18",
    embedMapUrl: "https://maps.google.com/maps?q=-1.3197,36.8317&t=m&z=16&output=embed",
    embedSatelliteUrl: "https://maps.google.com/maps?q=-1.3197,36.8317&t=k&z=17&output=embed",
    verifiedText: "Yanhal Holdings Limited is headquartered in South C, behind Masjid As Salaam in Nairobi, Kenya. We service projects across Nairobi and surrounding metropolitan counties. Note that while you can select a project site for planning, our team verifies the site physically before commencement.",
    voiceConciseAddress: "Yanhal Holdings Limited is headquartered in South C, behind Masjid As Salaam, in Nairobi, Kenya.",
  },

  services: [
    {
      id: "construction",
      name: "Construction & Civil",
      baseRateKes: 45000,
      description: "Complete new builds, deep foundations, reinforced concrete frames, core & shell development, and comprehensive civil works.",
      typicalApplications: ["Residential villas", "Commercial complexes", "Multi-storey developments", "Foundation & substructure"],
    },
    {
      id: "interior",
      name: "Interior Design & Fit-Out",
      baseRateKes: 25000,
      description: "Bespoke millwork, luxury joinery, acoustic lighting, MEP integration, ceiling systems, and premium spatial optimization.",
      typicalApplications: ["Executive offices", "Luxury residential living", "Retail boutiques", "Hospitality spaces"],
    },
    {
      id: "renovation",
      name: "Renovation & Remodeling",
      baseRateKes: 30000,
      description: "Structural restoration, spatial reconfiguration, modernization of outdated finishes, and extending structural lifespan.",
      typicalApplications: ["Older residential revitalizations", "Commercial fit-out upgrades", "Facade facelifts", "Structural reinforcements"],
    },
    {
      id: "commercial",
      name: "Custom Commercial Setup",
      baseRateKes: 35000,
      description: "Purpose-built business environments, retail flagships, corporate headquarters, and high-efficiency operational layouts.",
      typicalApplications: ["Corporate offices", "High-traffic retail flagships", "Cafes and restaurants", "Kiosks and pop-ups"],
    },
    {
      id: "engineering",
      name: "Structural Engineering",
      baseRateKes: 40000,
      description: "Load analysis, seismic integrity audits, concrete reinforcing calculations, civil infrastructure, and compliance inspections.",
      typicalApplications: ["Structural audits", "Reinforcement drawings", "Load-bearing modifications", "Seismic checks"],
    },
  ] as ServiceDetail[],

  serviceDepths: [
    {
      id: "basic",
      name: "Basic / Essential",
      multiplier: 1.0,
      description: "Minor upgrades, essential maintenance, or fundamental repairs using standard materials.",
    },
    {
      id: "standard",
      name: "Standard / Optimized",
      multiplier: 1.5,
      description: "Structured architectural design, moderate remodeling, quality fit-out, and premium durable finishes.",
    },
    {
      id: "full",
      name: "Full Turnkey Service",
      multiplier: 2.5,
      description: "End-to-end architecture, structural delivery, bespoke interiors, continuous project supervision, and complete procurement.",
    },
  ] as ServiceDepthDetail[],

  currency: {
    kesToUsdRate: 0.0077,
    estimatorVariance: {
      lowerFactor: 0.9,
      upperFactor: 1.2,
    },
  },

  blueprintProcess: [
    {
      step: 1,
      title: "Consultation & Project Understanding",
      subtitle: "Initial Briefing / Site Visit",
      summary: "Detailed discussion of purpose, budget, and constraints, followed by site visit to assess physical conditions and accessibility.",
    },
    {
      step: 2,
      title: "Planning & Design Development",
      subtitle: "Structured Planning / Space Optimization",
      summary: "Translating ideas into practical layout plans, defining detailed scope of work, and setting realistic execution timelines.",
    },
    {
      step: 3,
      title: "Material Selection & Preparation",
      subtitle: "Quality Sourcing / Site Readiness",
      summary: "Selecting durable, cost-effective materials suited for long-term use and preparing the site environment prior to breaking ground.",
    },
    {
      step: 4,
      title: "Construction / Execution Phase",
      subtitle: "On-site Building / Managed Workflow",
      summary: "Putting drawings into action with skilled trade coordination, active quality control, and millimeter precision.",
    },
    {
      step: 5,
      title: "Quality Check & Final Touches",
      subtitle: "Standard Review / Detailed Adjustments",
      summary: "Thorough multi-point inspection of structural elements, finishes, and fittings, correcting any minor tolerances before handover.",
    },
    {
      step: 6,
      title: "Project Handover & Client Support",
      subtitle: "Final Delivery / Continued Guidance",
      summary: "Formal handover with maintenance guidance, warranty walk-through, and ongoing post-completion advisory support.",
    },
  ],

  leadership: [
    {
      name: "Ismail Abdirahman",
      role: "Chief Executive Officer (CEO)",
      focus: "Overall executive operations, investor relations, client partnerships, and ensuring zero shortcuts across all projects.",
    },
    {
      name: "Dahir Yusuf",
      role: "Project Manager • Buildings & Road Construction",
      focus: "Ground-zero field management, concrete pours, heavy equipment coordination, road surfacing, and structural tolerances.",
    },
  ],

  portfolioProjects: [
    {
      title: "Modern Retail Kiosk Development",
      category: "Commercial Project",
      description: "Design and construction of a compact retail kiosk optimized for high-traffic commercial use and efficient customer interaction.",
    },
    {
      title: "Interior Space Transformation",
      category: "Commercial Use",
      description: "Upgrading an outdated commercial interior to optimize flow, lighting, acoustic performance, and customer retention.",
    },
    {
      title: "Residential Interior Upgrade",
      category: "Residential Project",
      description: "Modernizing a residential interior with bespoke cabinetry, balanced spatial flow, and refined durable surfaces.",
    },
    {
      title: "Renovation & Structural Improvement",
      category: "Structural Project",
      description: "Restoring and reinforcing an existing structure with strategic repairs, eliminating weaknesses without unnecessary rebuilding.",
    },
    {
      title: "Custom Business Setup",
      category: "Small Commercial Space",
      description: "Tailored business environment for small-scale operations balancing ergonomic staff workflows with customer engagement.",
    },
  ],

  websiteSections: [
    { id: "hero", anchor: "#hero", panelId: "panel-hero", name: "Hero", description: "Top landing section introducing Yanhal Holdings Ltd and core value proposition" },
    { id: "capabilities", anchor: "#capabilities", panelId: "panel-capabilities", name: "What We Do", description: "Overview of capabilities and structural engineering expertise" },
    { id: "about", anchor: "#about", panelId: "panel-about", name: "About Us", description: "Company history, architectural philosophy, standards, and background" },
    { id: "leadership", anchor: "#leadership", panelId: "panel-leadership", name: "Leadership", description: "Profiles of CEO Ismail Abdirahman and Project Manager Dahir Yusuf" },
    { id: "services", anchor: "#services", panelId: "panel-services", name: "Services", description: "Detailed breakdown of construction, fit-out, renovation, commercial, and engineering services" },
    { id: "process", anchor: "#process", panelId: "panel-process", name: "Blueprint Process", description: "Six-step structured execution workflow from consultation to handover" },
    { id: "portfolio", anchor: "#portfolio", panelId: "panel-portfolio", name: "Our Projects", description: "Selected completed works, commercial kiosks, residential upgrades, and structural projects" },
    { id: "rebirth", anchor: "#rebirth", panelId: "panel-rebirth", name: "Arts of Rebirth", description: "Cinematic showreel and before-and-after restoration slider" },
    { id: "testimonials", anchor: "#testimonials", panelId: "panel-testimonials", name: "Testimonials", description: "Client feedback and contractor performance reviews" },
    { id: "updates", anchor: "#updates", panelId: "panel-updates", name: "Latest Updates", description: "Recent announcements, media drops, and industry insights" },
    { id: "contact", anchor: "#contact", panelId: "panel-contact", name: "Start Your Project & Estimator", description: "Dynamic cost estimator, project briefing intake, and direct enquiry submission" },
    { id: "footer", anchor: "#footer", panelId: "panel-footer", name: "Footer & Contacts", description: "Direct telephone numbers, WhatsApp, email, Nairobi headquarters map, and legal information" },
  ],
};

/**
 * Validates whether a proposed section exists in the website.
 */
export function findWebsiteSection(query: string) {
  const q = query.toLowerCase().trim().replace(/^#/, "");
  return YANHAL_KNOWLEDGE.websiteSections.find(s => 
    s.id === q || 
    s.name.toLowerCase() === q ||
    s.description.toLowerCase().includes(q) ||
    (q.includes("estimat") && s.id === "contact") ||
    (q.includes("start") && s.id === "contact") ||
    (q.includes("project") && (s.id === "portfolio" || s.id === "contact")) ||
    (q.includes("leader") && s.id === "leadership") ||
    (q.includes("ceo") && s.id === "leadership") ||
    (q.includes("price") && s.id === "contact") ||
    (q.includes("cost") && s.id === "contact") ||
    (q.includes("service") && s.id === "services") ||
    (q.includes("process") && s.id === "process") ||
    (q.includes("about") && s.id === "about") ||
    (q.includes("office") && s.id === "footer") ||
    (q.includes("phone") && s.id === "footer") ||
    (q.includes("map") && s.id === "footer")
  );
}

/**
 * Calculates official indicative project estimate using Yanhal verified formula.
 */
export function calculateYanhalEstimate(projectTypeId: string, sizeSqm: number, serviceDepthId: string) {
  const pType = YANHAL_KNOWLEDGE.services.find(s => s.id === projectTypeId) || YANHAL_KNOWLEDGE.services[0];
  const depth = YANHAL_KNOWLEDGE.serviceDepths.find(d => d.id === serviceDepthId) || YANHAL_KNOWLEDGE.serviceDepths[1];
  
  const validSize = Math.max(10, Number(sizeSqm) || 150);
  const baseAmount = pType.baseRateKes * validSize * depth.multiplier;
  
  const minKes = Math.round(baseAmount * YANHAL_KNOWLEDGE.currency.estimatorVariance.lowerFactor);
  const maxKes = Math.round(baseAmount * YANHAL_KNOWLEDGE.currency.estimatorVariance.upperFactor);
  const minUsd = Math.round(minKes * YANHAL_KNOWLEDGE.currency.kesToUsdRate);
  const maxUsd = Math.round(maxKes * YANHAL_KNOWLEDGE.currency.kesToUsdRate);

  return {
    projectType: pType.name,
    projectTypeId: pType.id,
    serviceDepth: depth.name,
    serviceDepthId: depth.id,
    sizeSqm: validSize,
    ratePerSqmKes: pType.baseRateKes,
    multiplier: depth.multiplier,
    baseAmountKes: baseAmount,
    minKes,
    maxKes,
    minUsd,
    maxUsd,
    currencyRate: YANHAL_KNOWLEDGE.currency.kesToUsdRate,
    assumptions: [
      "Indicative rates apply to standard site access in Nairobi and surrounding metropolitan areas.",
      "Base scope assumes solid ground conditions without high water table complications or deep piling.",
      "Final binding contract requires on-site structural assessment and Bill of Quantities (BOQ).",
    ],
  };
}

export const YANHAL_OFFICE_LOCATION = YANHAL_KNOWLEDGE.location;

/**
 * Generates an authentic, warm companion engineering response from verified company knowledge.
 * Used when external LLM endpoints are unreachable, rate-limited, or out of quota.
 */
export function getGroundingCompanionResponse(message: string): { reply: string; actionType?: string; actionData?: any; navigationTarget?: any } {
  const m = (message || "").trim().toLowerCase();

  // 1. Warm Greeting
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening|day)|habari|sasa|mambo|greetings)\b/i.test(m) || m.length <= 4) {
    return {
      reply: "Hello! I am Dahir, senior project and civil engineer at Yanhal Holdings Limited. How can I assist you with your construction, renovation, or engineering plans today?",
    };
  }

  // 2. Who leads / Leadership / CEO
  if (/\b(who\s*(is|are|leads|runs)|ceo|leadership|founder|director|manager)\b/i.test(m)) {
    return {
      reply: "Yanhal Holdings Limited is led by Ismail Abdirahman as Chief Executive Officer and myself, Dahir Yusuf, as Project Manager overseeing Buildings and Road Construction. Our team coordinates everything from county building approvals and structural designs to turnkey project delivery.",
      navigationTarget: { panelId: "panel-leadership", anchor: "#leadership", label: "Leadership Team" },
    };
  }

  // 3. Location / Office / Address
  if (/\b(where\s*(are\s*you|is\s*your|located)|headquarters|office\s*address|location|south\s*c|visit\s*you)\b/i.test(m)) {
    return {
      reply: "Our physical headquarters is in South C, Behind Masjid As Salaam, Nairobi, Kenya. We undertake civil engineering, commercial, and residential projects across Nairobi and surrounding counties in Kenya.",
      actionType: "company_location",
      actionData: YANHAL_OFFICE_LOCATION,
      navigationTarget: { panelId: "panel-contact", anchor: "#contact", label: "Headquarters & Contact" },
    };
  }

  // 4. Hours / Availability
  if (/\b(hours|open|closed|operating\s*time|working\s*hours)\b/i.test(m)) {
    return {
      reply: "Our Nairobi headquarters is open Monday to Friday from 8:00 AM to 5:00 PM, and Saturday from 9:00 AM to 1:00 PM. We are closed on Sunday.",
    };
  }

  // 5. Contacts / Phone / WhatsApp / Email
  if (/\b(contact|phone|call|whatsapp|email|reach\s*you|talk\s*to|inquiry|consultation)\b/i.test(m)) {
    return {
      reply: "You can reach our engineering team directly by phone at +254 724 093256, via WhatsApp at +254 740 895374, or by email at Yanhalholdingslimited@gmail.com. We can also arrange an in-person site inspection for your project.",
    };
  }

  // 6. Project Estimations / Area pricing
  const sizeMatch = m.match(/(\d+)\s*(sqm|m2|square\s*met(?:er|re)s?)/i);
  if (sizeMatch || /\b(estimate|cost|price|budget|rate|how\s*much)\b/i.test(m)) {
    let pType = "construction";
    if (m.includes("interior") || m.includes("fitout") || m.includes("fit-out")) pType = "interior";
    else if (m.includes("renovat") || m.includes("remodel")) pType = "renovation";
    else if (m.includes("commercial") || m.includes("office") || m.includes("retail")) pType = "commercial";
    else if (m.includes("structural") || m.includes("engineer")) pType = "engineering";

    const size = sizeMatch ? Math.max(10, Number(sizeMatch[1])) : 150;
    const calc = calculateYanhalEstimate(pType, size, "standard");

    return {
      reply: `For a ${size} sqm ${calc.projectType.toLowerCase()} project, our indicative planning benchmark ranges from approximately KES ${calc.minKes.toLocaleString()} to ${calc.maxKes.toLocaleString()} ($${calc.minUsd.toLocaleString()} to $${calc.maxUsd.toLocaleString()} USD), based on standard finishing depth. Please note that exact figures depend on physical site topography, soil conditions, and a full Bill of Quantities. Would you like to schedule an introductory site inspection?`,
      actionType: "estimate_calculated",
      actionData: calc,
      navigationTarget: { panelId: "panel-contact", anchor: "#estimator", label: "Interactive Estimator" },
    };
  }

  // 7. Services overview
  if (/\b(service|services|what\s*do\s*you\s*do|offer|capabilities|work)\b/i.test(m)) {
    return {
      reply: "Yanhal Holdings specializes in five core engineering disciplines: New Construction & Civil Works (~45,000 KES/sqm), Interior Design & Fit-Out (~25,000 KES/sqm), Renovation & Remodeling (~30,000 KES/sqm), Custom Commercial Setup (~35,000 KES/sqm), and Structural Engineering (~40,000 KES/sqm). Which discipline fits your project requirements?",
      navigationTarget: { panelId: "panel-services", anchor: "#services", label: "Services & Disciplines" },
    };
  }

  // 8. 6-step blueprint process
  if (/\b(process|steps|how\s*(it|do\s*you)\s*work|workflow|methodology)\b/i.test(m)) {
    return {
      reply: "Our 6-step delivery blueprint begins with Consultation & Site Visit, moving into Planning & Architectural Design, Material Selection, Precision Construction, Quality Assurance Inspections, and Handover with Warranty Support. Every phase is closely managed to ensure compliance with Kenyan NCA building codes.",
      navigationTarget: { panelId: "panel-process", anchor: "#process", label: "Execution Process" },
    };
  }

  // 9. Attentive Companion Fallback
  return {
    reply: "I am with you. As a project engineer at Yanhal Holdings, I can guide you through our services, compute indicative project estimates, review site considerations across Kenya, or connect you with our lead team. Tell me more about what you have in mind for your project.",
  };
}
