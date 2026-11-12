export type Language = 'en' | 'bn';

export const TRANSLATIONS = {
  en: {
    appTitle: "Capillarity, Meniscus Curvature & Jurin's Law Studio",
    subtitle: "Interactive Computational Fluid Physics & Molecular Interface Laboratory",
    reset: "Reset Simulation",
    activeSection: "Active Module",
    module1: "1. Contact Angle & Molecular Engine",
    module1Short: "1. Contact Angle",
    module2: "2. Capillary Rise & Formula Lab",
    module2Short: "2. Dynamic Capillarity",
    module3: "3. Jurin's Law & Paradox Rig",
    module3Short: "3. Jurin's Paradox",
    
    // Controls
    fluidPreset: "Liquid / Fluid Specimen",
    substrateMaterial: "Substrate Material",
    surfaceTension: "Surface Tension (T)",
    liquidDensity: "Liquid Density (ρ)",
    contactAngle: "Contact Angle (θ)",
    capillaryRadius: "Capillary Bore Radius (r)",
    gravity: "Gravitational Acceleration (g)",
    tubeLength: "Tube Cut Length (L)",
    tubeTilt: "Tube Tilt Angle (α)",
    
    // Physics labels
    adhesionForce: "Adhesion Force (Solid-Liquid)",
    cohesionForce: "Cohesion Force (Liquid-Liquid)",
    forceVectors: "Show Molecular Force Vectors",
    goniometer: "Show Contact Angle Goniometer",
    particles: "Show Molecular Attraction Field",
    forceBalance: "Show Laplace & Upward Pull Vectors",
    pipLoupe: "Ultra-Zoom Meniscus Loupe (8×)",
    insufficientMode: "Insufficient Length Paradox (L < h)",
    multiTubeMode: "4-Bore Hyperbolic Manifold",
    
    // Physics readouts
    height: "Equilibrium Height (h)",
    meniscusCurvature: "Curvature Radius (R)",
    laplaceDeltaP: "Laplace Pressure Jump (ΔP)",
    upwardForce: "Upward Capillary Pull (F_up)",
    columnWeight: "Supported Liquid Weight (W)",
    theoreticalHeight: "Theoretical Jurin Height (h_th)",
    actualHeight: "Effective Column Height (h_eff)",
    effectiveAngle: "Effective Meniscus Angle (θ')",
    apparentLength: "Liquid Slanted Column Length (l)",
    
    // Explanations
    adhesionDominates: "Adhesion > Cohesion/√2: Concave meniscus, wets substrate, capillary rise (+h)",
    cohesionDominates: "Cohesion/√2 > Adhesion: Convex meniscus, non-wetting, capillary depression (-h)",
    paradoxBanner: "PARADOX RESOLVED: When L < h, the liquid does NOT overflow like a perpetual motion fountain! Instead, the meniscus automatically flattens (R increases, θ' → 90°), adjusting ΔP = 2T/R to exactly match ρgL in static equilibrium.",
    energyConservation: "Energy Balance & 50% Viscous Dissipation Paradox:",
    workDoneST: "Total Surface Work (W_st)",
    gravPE: "Gravitational P.E. (E_p)",
    viscousHeat: "Viscous Heat Loss (Q)",
    energyProof: "Notice Ep = 0.5 × W_st: exactly 50% of work is dissipated into heat as the column rises!",
    
    // Substrates
    glass: "Clean Glass",
    waxed_glass: "Waxed Glass",
    teflon: "PTFE Teflon",
    silver: "Clean Silver",

    // Actions
    fullscreenLoupe: "Meniscus Loupe (8×)",
    exportState: "Save Parameters",
    infoNotes: "Physical Principles"
  },
  bn: {
    appTitle: "কৈশিকতা, মেনিস্কাস বক্রতা ও জুরিনের সূত্র স্টুডিও",
    subtitle: "ইন্টারঅ্যাক্টিভ গণনামূলক তরল পদার্থবিজ্ঞান ও আণবিক ইন্টারফেস গবেষণাগার",
    reset: "রিসেট করুন",
    activeSection: "সক্রিয় মডিউল",
    module1: "১. স্পর্শ কোণ ও আণবিক বল ইঞ্জিন",
    module1Short: "১. স্পর্শ কোণ",
    module2: "২. কৈশিক উত্থান ও সূত্র ল্যাব",
    module2Short: "২. কৈশিক উত্থান",
    module3: "৩. জুরিনের সূত্র ও দৈর্ঘ্য প্যারাডক্স",
    module3Short: "৩. জুরিনের প্যারাডক্স",
    
    // Controls
    fluidPreset: "তরল বা নমুনার ধরন",
    substrateMaterial: "কঠিন পৃষ্ঠের উপাদান",
    surfaceTension: "পৃষ্ঠটান (T)",
    liquidDensity: "তরলের ঘনত্ব (ρ)",
    contactAngle: "স্পর্শ কোণ (θ)",
    capillaryRadius: "কৈশিক নলের ব্যাসার্ধ (r)",
    gravity: "অভিকর্ষজ ত্বরণ (g)",
    tubeLength: "নলের কার্যকর দৈর্ঘ্য (L)",
    tubeTilt: "নলের হেলানো কোণ (α)",
    
    // Physics labels
    adhesionForce: "আসক্তি বল (কঠিন-তরল আকর্ষণ)",
    cohesionForce: "সংশক্তি বল (তরল-তরল আকর্ষণ)",
    forceVectors: "আণবিক বল ভেক্টরসমূহ প্রদর্শন",
    goniometer: "স্পর্শ কোণ গনিওমিটার প্রদর্শন",
    particles: "আণবিক ক্ষেত্র কণা প্রদর্শন",
    forceBalance: "ল্যাপ্লাস ও ঊর্ধ্বমুখী টান ভেক্টর",
    pipLoupe: "অতি-বর্ধক মেনিস্কাস লুপ (৮×)",
    insufficientMode: "অপর্যাপ্ত দৈর্ঘ্য প্যারাডক্স (L < h)",
    multiTubeMode: "৪-নল অধিবৃত্তীয় ম্যানিফোল্ড",
    
    // Physics readouts
    height: "ভারসাম্য উচ্চতা (h)",
    meniscusCurvature: "বক্রতার ব্যাসার্ধ (R)",
    laplaceDeltaP: "ল্যাপ্লাস চাপ ব্যবধান (ΔP)",
    upwardForce: "ঊর্ধ্বমুখী পৃষ্ঠটান বল (F_up)",
    columnWeight: "স্তম্ভের তরলের ওজন (W)",
    theoreticalHeight: "তাত্ত্বিক জুরিন উচ্চতা (h_th)",
    actualHeight: "কার্যকর তরল উচ্চতা (h_eff)",
    effectiveAngle: "কার্যকর স্পর্শ কোণ (θ')",
    apparentLength: "নলের অক্ষ বরাবর তরলের দৈর্ঘ্য (l)",
    
    // Explanations
    adhesionDominates: "আসক্তি > সংশক্তি/√২: অবতল মেনিস্কাস, পৃষ্ঠ ভেজায়, কৈশিক উত্থান (+h)",
    cohesionDominates: "সংশক্তি/√২ > আসক্তি: উত্তল মেনিস্কাস, পৃষ্ঠ ভেজায় না, কৈশিক অবনমন (-h)",
    paradoxBanner: "প্যারাডক্স সমাধান: যখন L < h, তরল কখনোই ঝর্ণার মতো উছলে পড়ে না! বরং নলের মুখে এসে মেনিস্কাস চ্যাপ্টা হতে শুরু করে (R বৃদ্ধি পায়, θ' → ৯০°)। এতে ল্যাপ্লাস চাপ কমে ঠিক ρgL এর সমান হয়ে স্থির ভারসাম্যে পৌঁছে যায়।",
    energyConservation: "শক্তি সংরক্ষণ ও ৫০% সান্দ্র অপচয় রহস্য:",
    workDoneST: "পৃষ্ঠটান দ্বারা কৃতকাজ (W_st)",
    gravPE: "অর্জিত বিভব শক্তি (E_p)",
    viscousHeat: "সান্দ্র ঘর্ষণজনিত তাপক্ষয় (Q)",
    energyProof: "লক্ষ্য করুন Ep = ০.৫ × W_st: উত্তোলনের সময় ঠিক ৫০% শক্তি তরলের সান্দ্র ঘর্ষণে তাপে পরিণত হয়!",
    
    // Substrates
    glass: "পরিষ্কার কাচ",
    waxed_glass: "মোমযুক্ত কাচ",
    teflon: "টেফলন",
    silver: "পরিষ্কার রূপা",

    // Actions
    fullscreenLoupe: "মেনিস্কাস ম্যাগনিফায়ার (৮×)",
    exportState: "প্যারামিটার সংরক্ষণ",
    infoNotes: "পদার্থবিজ্ঞানের মূলনীতি"
  }
};
