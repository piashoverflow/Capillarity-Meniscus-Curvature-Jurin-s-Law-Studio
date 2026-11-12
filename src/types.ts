export interface LiquidPreset {
  id: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  surfaceTension: number; // N/m (J/m^2)
  density: number;        // kg/m^3
  defaultAngle: number;   // degrees on clean glass
  color: {
    primary: string;
    glow: string;
    deep: string;
    meniscusEdge: string;
    metallic?: boolean;
    opacity: number;
  };
}

export interface SubstrateMaterial {
  id: string;
  nameEn: string;
  nameBn: string;
  adhesionModifier: number; // multiplier for adhesion
  baseAngleOffset: number;  // offset in degrees
  color: string;
  surfaceTexture: 'smooth' | 'wax' | 'metallic' | 'matte';
}

export interface PhysicsState {
  // Fluid selection & properties
  liquidId: string;
  substrateId: string;
  surfaceTension: number; // T in N/m
  density: number;        // rho in kg/m^3
  contactAngle: number;   // theta in degrees (0 to 180)
  gravity: number;        // g in m/s^2

  // Module 1 specifics
  adhesionForce: number;  // 0 to 100 arbitrary units
  cohesionForce: number;  // 0 to 100 arbitrary units
  showForceVectors: boolean;
  showGoniometer: boolean;
  showMolecularParticles: boolean;
  viewMode: 'split' | 'plate-focus' | 'drop-focus'; // allows magnifying the plate simulation to huge full screen
  zoomScale: number; // 1.0 to 2.5x magnification for ultra detail

  // Module 2 specifics
  capillaryRadiusMm: number; // r in mm (e.g., 0.1 to 2.5 mm)
  showForceBalance: boolean;
  showLaplaceVector: boolean;
  showPipLoupe: boolean;
  zoomScale2: number; // 1.0 to 2.5x magnification for Module 2

  // Module 3 specifics
  tubeLengthMm: number;     // L in mm (for paradox test)
  tubeTiltAngleDeg: number; // alpha: 0 to 75 deg
  insufficientLengthMode: boolean; // toggle paradox interactive mode
  multiTubeMode: boolean;   // show 4-bore manifold vs single tube
  zoomScale3: number; // 1.0 to 2.5x magnification for Module 3
}

export const LIQUID_PRESETS: LiquidPreset[] = [
  {
    id: 'water',
    nameEn: 'Pure Water (H₂O)',
    nameBn: 'বিশুদ্ধ পানি (H₂O)',
    descriptionEn: 'Strong hydrogen bonds; high surface tension (0.0728 N/m); wets clean glass completely.',
    descriptionBn: 'শক্তিশালী হাইড্রোজেন বন্ধন; উচ্চ পৃষ্ঠটান (০.০৭২৮ N/m); কাচকে সম্পূর্ণ ভেজায়।',
    surfaceTension: 0.0728,
    density: 1000,
    defaultAngle: 5,
    color: {
      primary: 'rgba(56, 189, 248, 0.65)',
      glow: 'rgba(186, 230, 253, 0.85)',
      deep: 'rgba(14, 116, 144, 0.8)',
      meniscusEdge: 'rgba(2, 132, 199, 0.95)',
      opacity: 0.65
    }
  },
  {
    id: 'mercury',
    nameEn: 'Mercury (Quicksilver, Hg)',
    nameBn: 'পারদ (মার্কারি, Hg)',
    descriptionEn: 'Metallic cohesive bonding dominates; very dense (13,600 kg/m³); convex depression, non-wetting.',
    descriptionBn: 'ধাতব সংশক্তি বল প্রাধান্য পায়; অতি ঘন (১৩,৬০০ kg/m³); উত্তল অধঃগমন, কাচ ভেজায় না।',
    surfaceTension: 0.485,
    density: 13600,
    defaultAngle: 138,
    color: {
      primary: 'rgba(148, 163, 184, 0.98)',
      glow: 'rgba(241, 245, 249, 1)',
      deep: 'rgba(30, 41, 59, 1)',
      meniscusEdge: 'rgba(203, 213, 225, 1)',
      metallic: true,
      opacity: 0.98
    }
  },
  {
    id: 'ethanol',
    nameEn: 'Ethanol / Alcohol (C₂H₅OH)',
    nameBn: 'ইথানল / অ্যালকোহল (C₂H₅OH)',
    descriptionEn: 'Low surface tension (0.022 N/m); low density (789 kg/m³); extremely high wetting.',
    descriptionBn: 'কম পৃষ্ঠটান (০.০২২ N/m); কম ঘনত্ব (৭৮৯ kg/m³); কাচে অত্যন্ত উচ্চ ব্যাপ্তি।',
    surfaceTension: 0.0223,
    density: 789,
    defaultAngle: 0,
    color: {
      primary: 'rgba(99, 102, 241, 0.45)',
      glow: 'rgba(199, 210, 254, 0.75)',
      deep: 'rgba(67, 56, 202, 0.6)',
      meniscusEdge: 'rgba(79, 70, 229, 0.85)',
      opacity: 0.45
    }
  },
  {
    id: 'glycerol',
    nameEn: 'Glycerol (C₃H₈O₃)',
    nameBn: 'গ্লিসারল (C₃H₈O₃)',
    descriptionEn: 'Dense, viscous syrupy amber liquid; high viscosity and moderate wetting.',
    descriptionBn: 'ঘন, আঠালো সোনালী-অ্যাম্বার তরল; উচ্চ সান্দ্রতা এবং মধ্যম ভেজানোর ক্ষমতা।',
    surfaceTension: 0.0634,
    density: 1261,
    defaultAngle: 45,
    color: {
      primary: 'rgba(245, 158, 11, 0.70)',
      glow: 'rgba(254, 243, 199, 0.85)',
      deep: 'rgba(180, 83, 9, 0.85)',
      meniscusEdge: 'rgba(217, 119, 6, 0.95)',
      opacity: 0.7
    }
  },
  {
    id: 'custom',
    nameEn: 'Custom Fluid Lab Spec',
    nameBn: 'কাস্টম তরল ল্যাব স্পেক',
    descriptionEn: 'Freely calibrate adhesion, cohesion, density, and surface tension.',
    descriptionBn: 'ইচ্ছামতো আসক্তি, সংশক্তি, ঘনত্ব ও পৃষ্ঠটান সমন্বয় করুন।',
    surfaceTension: 0.050,
    density: 1000,
    defaultAngle: 60,
    color: {
      primary: 'rgba(20, 184, 166, 0.65)',
      glow: 'rgba(204, 251, 241, 0.85)',
      deep: 'rgba(15, 118, 110, 0.8)',
      meniscusEdge: 'rgba(13, 148, 136, 0.95)',
      opacity: 0.65
    }
  }
];

export const SUBSTRATE_MATERIALS: SubstrateMaterial[] = [
  {
    id: 'glass',
    nameEn: 'Clean Borosilicate Glass',
    nameBn: 'পরিষ্কার বোরোসিলিকেট কাচ',
    adhesionModifier: 1.0,
    baseAngleOffset: 0,
    color: '#cbd5e1',
    surfaceTexture: 'smooth'
  },
  {
    id: 'waxed_glass',
    nameEn: 'Paraffin Wax Coated',
    nameBn: 'প্যারাফিন মোমের প্রলেপযুক্ত',
    adhesionModifier: 0.35,
    baseAngleOffset: 75,
    color: '#fef08a',
    surfaceTexture: 'wax'
  },
  {
    id: 'teflon',
    nameEn: 'PTFE / Teflon (Hydrophobic)',
    nameBn: 'পিটিএফই / টেফলন (হাইড্রোফোবিক)',
    adhesionModifier: 0.20,
    baseAngleOffset: 85,
    color: '#94a3b8',
    surfaceTexture: 'matte'
  },
  {
    id: 'silver',
    nameEn: 'Polished Clean Silver',
    nameBn: 'পালিশ করা পরিষ্কার রূপা',
    adhesionModifier: 0.75,
    baseAngleOffset: 40,
    color: '#e2e8f0',
    surfaceTexture: 'metallic'
  }
];

export const GRAVITY_PRESETS = [
  { id: 'earth', nameEn: 'Earth (9.80 m/s²)', nameBn: 'পৃথিবী (৯.৮০ m/s²)', g: 9.80 },
  { id: 'moon', nameEn: 'Moon (1.62 m/s²)', nameBn: 'চাঁদ (১.৬২ m/s²)', g: 1.62 },
  { id: 'mars', nameEn: 'Mars (3.72 m/s²)', nameBn: 'মঙ্গল (৩.৭২ m/s²)', g: 3.72 },
  { id: 'jupiter', nameEn: 'Jupiter (24.79 m/s²)', nameBn: 'বৃহস্পতি (২৪.৭৯ m/s²)', g: 24.79 },
  { id: 'micro', nameEn: 'Microgravity (0.50 m/s²)', nameBn: 'মাইক্রোগ্র্যাভিটি (০.৫০ m/s²)', g: 0.50 },
];
