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

  // Module 2 specifics
  capillaryRadiusMm: number; // r in mm (e.g., 0.1 to 2.5 mm)
  showForceBalance: boolean;
  showLaplaceVector: boolean;
  showPipLoupe: boolean;

  // Module 3 specifics
  tubeLengthMm: number;     // L in mm (for paradox test)
  tubeTiltAngleDeg: number; // alpha: 0 to 75 deg
  insufficientLengthMode: boolean; // toggle paradox interactive mode
  multiTubeMode: boolean;   // show 4-bore manifold vs single tube
}

export function calculateJurinHeight(T: number, thetaDeg: number, rMm: number, rho: number, g: number): number {
  // h = (2 * T * cos(theta)) / (r * rho * g)
  // r is in mm -> r * 1e-3 m
  // returns h in mm
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const rMeters = (rMm * 1e-3);
  const cosTheta = Math.cos(thetaRad);
  const hMeters = (2 * T * cosTheta) / (rMeters * rho * g);
  return hMeters * 1000; // convert to mm
}

export function calculateLaplacePressure(T: number, R_m: number): number {
  if (Math.abs(R_m) < 1e-7) return 0;
  return (2 * T) / R_m; // Pascals (N/m^2)
}

export function calculateRadiusOfCurvatureMm(rMm: number, thetaDeg: number): number {
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const cosTheta = Math.cos(thetaRad);
  if (Math.abs(cosTheta) < 1e-4) return 999999; // flat
  return rMm / cosTheta;
}

export function calculateEnergies(T: number, thetaDeg: number, rMm: number, rho: number, g: number, hMm: number) {
  const rM = rMm * 1e-3;
  const hM = hMm * 1e-3;
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const cosTheta = Math.cos(thetaRad);

  // Work done by surface tension: W_st = (2 * pi * r * T * cos(theta)) * h
  const wSurfaceTension = 2 * Math.PI * rM * T * cosTheta * hM;

  // Mass of raised column: m = pi * r^2 * h * rho
  const massKg = Math.PI * rM * rM * Math.abs(hM) * rho;

  // Gravitational Potential energy gained: Ep = 0.5 * m * g * h
  // Note: center of mass is at h/2
  const potentialEnergy = 0.5 * Math.PI * Math.pow(rM, 2) * rho * g * Math.pow(hM, 2);

  // Dissipated viscous heat / kinetic loss = W_st - Ep (theoretically Ep is 0.5 of W_st!)
  const dissipatedHeat = Math.max(0, wSurfaceTension - potentialEnergy);

  return {
    wSurfaceTension: Math.max(0, wSurfaceTension),
    potentialEnergy: Math.max(0, potentialEnergy),
    dissipatedHeat,
    massMg: massKg * 1e6
  };
}
