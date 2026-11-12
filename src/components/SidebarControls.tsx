import React from 'react';
import { LIQUID_PRESETS, SUBSTRATE_MATERIALS, GRAVITY_PRESETS, PhysicsState } from '../types';
import { TRANSLATIONS, Language } from '../translations';
import { 
  Droplet, 
  Layers, 
  Gauge, 
  HelpCircle, 
  RotateCcw, 
  Eye, 
  Sparkles, 
  Compass, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Scale
} from 'lucide-react';

interface SidebarControlsProps {
  activeModule: number;
  physicsState: PhysicsState;
  updatePhysicsState: (partial: Partial<PhysicsState>) => void;
  lang: Language;
  onReset: () => void;
  calculatedHeight: number;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  activeModule,
  physicsState,
  updatePhysicsState,
  lang,
  onReset,
  calculatedHeight
}) => {
  const t = TRANSLATIONS[lang];

  // Helper to change liquid preset
  const handleLiquidChange = (id: string) => {
    const preset = LIQUID_PRESETS.find(p => p.id === id);
    if (!preset) return;
    
    // Substrate offset calculation
    const sub = SUBSTRATE_MATERIALS.find(s => s.id === physicsState.substrateId) || SUBSTRATE_MATERIALS[0];
    let angle = preset.defaultAngle;
    if (preset.id === 'water') {
      if (sub.id === 'waxed_glass') angle = 108;
      else if (sub.id === 'teflon') angle = 115;
      else if (sub.id === 'silver') angle = 45;
      else angle = 5;
    } else if (preset.id === 'mercury') {
      angle = 138;
    } else if (preset.id === 'ethanol') {
      angle = 0;
    }

    // Cohesion/adhesion rough derivation
    let adh = 70;
    let coh = 50;
    if (angle < 90) {
      adh = 80;
      coh = 40;
    } else {
      adh = 30;
      coh = 85;
    }

    updatePhysicsState({
      liquidId: preset.id,
      surfaceTension: preset.surfaceTension,
      density: preset.density,
      contactAngle: angle,
      adhesionForce: adh,
      cohesionForce: coh
    });
  };

  // Helper to change substrate
  const handleSubstrateChange = (subId: string) => {
    const sub = SUBSTRATE_MATERIALS.find(s => s.id === subId);
    if (!sub) return;
    let newAngle = physicsState.contactAngle;
    if (physicsState.liquidId === 'water') {
      if (subId === 'glass') newAngle = 5;
      else if (subId === 'waxed_glass') newAngle = 108;
      else if (subId === 'teflon') newAngle = 115;
      else if (subId === 'silver') newAngle = 45;
    }
    updatePhysicsState({
      substrateId: subId,
      contactAngle: newAngle
    });
  };

  return (
    <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-4 bg-white/90 backdrop-blur-md border border-sky-200/80 rounded-2xl p-4 shadow-xl shadow-sky-950/5 text-slate-900 select-none overflow-y-auto max-h-[calc(100vh-100px)]">
      
      {/* Module Badge & Quick Guide Header */}
      <div className="flex items-center justify-between pb-3 border-b border-sky-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-sky-500/20">
            M{activeModule}
          </div>
          <span className="font-semibold text-sm text-slate-800">
            {activeModule === 1 && (lang === 'en' ? 'Molecular Force & Angle' : 'আণবিক বল ও কোণ')}
            {activeModule === 2 && (lang === 'en' ? 'Jurin Formula Dynamics' : 'জুরিন সূত্রের সমীকরণ')}
            {activeModule === 3 && (lang === 'en' ? 'Manifold & Paradox Rig' : 'ম্যানিফোল্ড ও প্যারাডক্স')}
          </span>
        </div>
        <button
          onClick={onReset}
          title={t.reset}
          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Preset Liquid Selection Matrix */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
          <Droplet className="w-3.5 h-3.5 text-sky-600" />
          {t.fluidPreset}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {LIQUID_PRESETS.map((p) => {
            const isSelected = physicsState.liquidId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleLiquidChange(p.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium text-left transition-all flex flex-col border ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-700 shadow-md shadow-sky-600/25 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-sky-50/60 text-slate-700 border-slate-200/90'
                }`}
              >
                <span className="font-semibold truncate">{lang === 'en' ? p.nameEn.split('(')[0] : p.nameBn.split('(')[0]}</span>
                <span className={`text-[10px] ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                  {p.surfaceTension} N/m
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Substrate Selector (Visible on Module 1 & 2) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-sky-600" />
          {t.substrateMaterial}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {SUBSTRATE_MATERIALS.map((sub) => {
            const isSelected = physicsState.substrateId === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubstrateChange(sub.id)}
                className={`px-2 py-1.5 rounded-xl text-xs font-medium text-left transition-all border ${
                  isSelected
                    ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <span className="truncate block font-medium">
                  {lang === 'en' ? sub.nameEn.split('(')[0] : sub.nameBn.split('(')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-slate-200/80 my-1" />

      {/* MODULE SPECIFIC CONTROLS */}
      {activeModule === 1 && (
        <div className="space-y-4">
          <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3 text-xs text-sky-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-sky-950">
              <Sparkles className="w-4 h-4 text-sky-600" />
              {lang === 'en' ? "Young's Adhesion Condition" : "ইয়ংয়ের আসক্তি শর্ত"}
            </div>
            <p className="text-[11px] leading-relaxed text-slate-700">
              {physicsState.contactAngle < 90 ? (
                <span className="text-emerald-800 font-medium">
                  {lang === 'en' 
                    ? "F_adh > F_coh / √2 → Contact angle θ < 90°. Liquid climbs wall to minimize free energy."
                    : "F_adh > F_coh / √2 → স্পর্শ কোণ θ < ৯০°। তরল মুক্ত শক্তি কমাতে কাচ বেয়ে ওঠে।"}
                </span>
              ) : (
                <span className="text-amber-800 font-medium">
                  {lang === 'en'
                    ? "F_adh < F_coh / √2 → Contact angle θ > 90°. Liquid cohesion repels wall; meniscus pulls down."
                    : "F_adh < F_coh / √2 → স্পর্শ কোণ θ > ৯০°। তরলের সংশক্তি বল জয়ী হয়; মেনিস্কাস নেমে যায়।"}
                </span>
              )}
            </p>
          </div>

          {/* Adhesion vs Cohesion interactive sliders */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">{t.adhesionForce}</span>
                <span className="text-emerald-700 font-mono font-bold">{physicsState.adhesionForce}</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={physicsState.adhesionForce}
                onChange={(e) => {
                  const adh = Number(e.target.value);
                  const coh = physicsState.cohesionForce;
                  // Dynamic angle calculation based on force ratio
                  // cos(theta) = (F_adh - F_coh/sqrt(2)) / (F_coh/sqrt(2))
                  const ratio = (adh - coh / 1.414) / Math.max(1, (adh + coh) * 0.45);
                  const clamped = Math.max(-1, Math.min(1, ratio));
                  const newAngle = Math.round((Math.acos(clamped) * 180) / Math.PI);
                  updatePhysicsState({ adhesionForce: adh, contactAngle: newAngle, liquidId: 'custom' });
                }}
                className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                <span>0 (Repelling)</span>
                <span>100 (Max Wetting)</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">{t.cohesionForce}</span>
                <span className="text-emerald-700 font-mono font-bold">{physicsState.cohesionForce}</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={physicsState.cohesionForce}
                onChange={(e) => {
                  const coh = Number(e.target.value);
                  const adh = physicsState.adhesionForce;
                  const ratio = (adh - coh / 1.414) / Math.max(1, (adh + coh) * 0.45);
                  const clamped = Math.max(-1, Math.min(1, ratio));
                  const newAngle = Math.round((Math.acos(clamped) * 180) / Math.PI);
                  updatePhysicsState({ cohesionForce: coh, contactAngle: newAngle, liquidId: 'custom' });
                }}
                className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                <span>0 (Dispersed)</span>
                <span>100 (Mercury-like)</span>
              </div>
            </div>
          </div>

          {/* View Mode & Zoom controls for Module 1 */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="text-xs font-semibold text-sky-800 uppercase tracking-wide block">
              {lang === 'bn' ? 'সিমুলেশন ভিউ ও সাইজ (View & Scale)' : 'Simulation View & Zoom'}
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => updatePhysicsState({ viewMode: 'split' })}
                className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                  physicsState.viewMode === 'split'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                {lang === 'bn' ? 'উভয় ভিউ' : 'Split View'}
              </button>
              <button
                onClick={() => updatePhysicsState({ viewMode: 'plate-focus' })}
                className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                  physicsState.viewMode === 'plate-focus'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
                title="প্লেটের বল ভেক্টর পুরো স্ক্রিন জুড়ে বড় করে দেখুন"
              >
                {lang === 'bn' ? 'প্লেট ফোকাস' : 'Plate Focus'}
              </button>
              <button
                onClick={() => updatePhysicsState({ viewMode: 'drop-focus' })}
                className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                  physicsState.viewMode === 'drop-focus'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                {lang === 'bn' ? 'ড্রপলেট' : 'Droplet'}
              </button>
            </div>
          </div>

          {/* Visual Overlay Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="text-xs font-semibold text-sky-800 uppercase tracking-wide block">
              {lang === 'en' ? 'Diagnostics & Vectors' : 'ডায়াগনস্টিক ও ভেক্টর'}
            </span>
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
              <input
                type="checkbox"
                checked={physicsState.showForceVectors}
                onChange={(e) => updatePhysicsState({ showForceVectors: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="font-medium">{t.forceVectors}</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
              <input
                type="checkbox"
                checked={physicsState.showGoniometer}
                onChange={(e) => updatePhysicsState({ showGoniometer: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="font-medium">{t.goniometer}</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
              <input
                type="checkbox"
                checked={physicsState.showMolecularParticles}
                onChange={(e) => updatePhysicsState({ showMolecularParticles: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="font-medium">{t.particles}</span>
            </label>
          </div>
        </div>
      )}

      {activeModule === 2 && (
        <div className="space-y-3.5">
          {/* Capillary Radius r */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">{t.capillaryRadius}</span>
              <span className="text-emerald-700 font-mono font-bold">{physicsState.capillaryRadiusMm.toFixed(2)} mm</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="2.50"
              step="0.05"
              value={physicsState.capillaryRadiusMm}
              onChange={(e) => updatePhysicsState({ capillaryRadiusMm: Number(e.target.value) })}
              className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-mono">
              <span>0.10 mm (Microbore)</span>
              <span>2.50 mm (Wide)</span>
            </div>
          </div>

          {/* Contact Angle theta */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">{t.contactAngle} (θ)</span>
              <span className="text-emerald-700 font-mono font-bold">{physicsState.contactAngle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="1"
              value={physicsState.contactAngle}
              onChange={(e) => updatePhysicsState({ contactAngle: Number(e.target.value), liquidId: 'custom' })}
              className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-mono">
              <span>0° (Full Wetting)</span>
              <span>90° (Flat)</span>
              <span>180° (Full Depress)</span>
            </div>
          </div>

          {/* Surface Tension T */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">{t.surfaceTension}</span>
              <span className="text-emerald-700 font-mono font-bold">{physicsState.surfaceTension.toFixed(3)} N/m</span>
            </div>
            <input
              type="range"
              min="0.015"
              max="0.550"
              step="0.005"
              value={physicsState.surfaceTension}
              onChange={(e) => updatePhysicsState({ surfaceTension: Number(e.target.value), liquidId: 'custom' })}
              className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Liquid Density rho */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">{t.liquidDensity}</span>
              <span className="text-emerald-700 font-mono font-bold">{Math.round(physicsState.density)} kg/m³</span>
            </div>
            <input
              type="range"
              min="600"
              max="14000"
              step="100"
              value={physicsState.density}
              onChange={(e) => updatePhysicsState({ density: Number(e.target.value), liquidId: 'custom' })}
              className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Gravity selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-sky-600" />
              {t.gravity}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {GRAVITY_PRESETS.map((grp) => {
                const isSelected = Math.abs(physicsState.gravity - grp.g) < 0.05;
                return (
                  <button
                    key={grp.id}
                    onClick={() => updatePhysicsState({ gravity: grp.g })}
                    className={`px-2 py-1 rounded-lg text-xs font-medium border text-left transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {lang === 'en' ? grp.nameEn.split('(')[0] : grp.nameBn.split('(')[0]}
                    <span className="block text-[10px] opacity-75 font-mono">{grp.g} m/s²</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={physicsState.showForceBalance}
                onChange={(e) => updatePhysicsState({ showForceBalance: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="font-medium">{t.forceBalance}</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={physicsState.showPipLoupe}
                onChange={(e) => updatePhysicsState({ showPipLoupe: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="font-medium">{t.pipLoupe}</span>
            </label>
          </div>
        </div>
      )}

      {activeModule === 3 && (
        <div className="space-y-4">
          {/* Mode Switcher: Multi-Tube Manifold vs Insufficient Rig */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => updatePhysicsState({ multiTubeMode: true, insufficientLengthMode: false })}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                physicsState.multiTubeMode
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? '4-Bore Manifold' : '৪-নল ম্যানিফোল্ড'}
            </button>
            <button
              onClick={() => updatePhysicsState({ multiTubeMode: false, insufficientLengthMode: true })}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                physicsState.insufficientLengthMode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? "Paradox Lab (L < h)" : "প্যারাডক্স ল্যাব (L < h)"}
            </button>
          </div>

          {physicsState.insufficientLengthMode ? (
            <div className="space-y-3.5">
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-amber-950">
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  {lang === 'en' ? 'The Classic Physical Paradox' : 'পদার্থবিজ্ঞানের ক্লাসিক প্যারাডক্স'}
                </span>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  {lang === 'en'
                    ? "If tube length L is cut below equilibrium height h, does liquid overflow in an infinite fountain? Drag slider L below h to witness nature's real answer!"
                    : "যদি নলের দৈর্ঘ্য L তাত্ত্বিক উচ্চতা h এর চেয়ে ছোট কাটা হয়, তরল কি অবিরাম ঝর্ণার মতো উছলে পড়বে? নিচের স্লাইডার দিয়ে L কমিয়ে দেখুন!"}
                </p>
              </div>

              {/* Tube cut length L */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{t.tubeLength}</span>
                  <span className={`font-mono font-bold ${physicsState.tubeLengthMm < calculatedHeight ? 'text-amber-600 font-extrabold' : 'text-emerald-700'}`}>
                    {physicsState.tubeLengthMm.toFixed(1)} mm
                    {physicsState.tubeLengthMm < calculatedHeight && " (L < h !)"}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={physicsState.tubeLengthMm}
                  onChange={(e) => updatePhysicsState({ tubeLengthMm: Number(e.target.value) })}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                  <span>5 mm (Very Short)</span>
                  <span className="text-sky-700 font-bold">h = {calculatedHeight.toFixed(1)} mm</span>
                  <span>100 mm</span>
                </div>
              </div>

              {/* Tube Tilt Angle alpha */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{t.tubeTilt}</span>
                  <span className="text-emerald-700 font-mono font-bold">{physicsState.tubeTiltAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="75"
                  step="1"
                  value={physicsState.tubeTiltAngleDeg}
                  onChange={(e) => updatePhysicsState({ tubeTiltAngleDeg: Number(e.target.value) })}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                  <span>0° (Vertical)</span>
                  <span>45°</span>
                  <span>75° (Extreme Slant)</span>
                </div>
                <p className="text-[10px] text-slate-500 italic mt-0.5">
                  {lang === 'en'
                    ? "Vertical height h remains invariant, while liquid slant length l = h / cos(α) elongates."
                    : "উল্লম্ব উচ্চতা h অপরিবর্তিত থাকে, কিন্তু নলের মধ্যে তরলের দৈর্ঘ্য l = h / cos(α) বৃদ্ধি পায়।"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-950 space-y-1">
                <span className="font-bold flex items-center gap-1 text-sky-900">
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                  {lang === 'en' ? "Jurin's Hyperbolic Law: h · r = const" : "জুরিনের অধিবৃত্তীয় সূত্র: h · r = ধ্রুবক"}
                </span>
                <p className="text-[11px] text-slate-700">
                  {lang === 'en'
                    ? "Observing 4 side-by-side tubes with radii r = 0.25, 0.50, 1.00, and 2.00 mm. Notice the exact rectangular hyperbolic envelope."
                    : "পাশাপাশি ৪টি নলে ব্যাসার্ধ r = ০.২৫, ০.৫০, ১.০০ ও ২.০০ মিমি। শীর্ষবিন্দুগুলো একটি নিখুঁত আয়তাকার অধিবৃত্ত তৈরি করে।"}
                </p>
              </div>

              {/* Surface Tension fine-tune */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{t.surfaceTension}</span>
                  <span className="text-emerald-700 font-mono font-bold">{physicsState.surfaceTension.toFixed(3)} N/m</span>
                </div>
                <input
                  type="range"
                  min="0.020"
                  max="0.485"
                  step="0.005"
                  value={physicsState.surfaceTension}
                  onChange={(e) => updatePhysicsState({ surfaceTension: Number(e.target.value) })}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Tilt Tube for Multi-Tube */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{t.tubeTilt}</span>
                  <span className="text-emerald-700 font-mono font-bold">{physicsState.tubeTiltAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={physicsState.tubeTiltAngleDeg}
                  onChange={(e) => updatePhysicsState({ tubeTiltAngleDeg: Number(e.target.value) })}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          )}

        </div>
      )}

      {/* Floating Info Snippet */}
      <div className="mt-auto pt-3 border-t border-sky-100">
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-sky-50 to-emerald-50/50 border border-sky-200/80 text-[11px] text-slate-700 space-y-1">
          <div className="flex items-center justify-between text-sky-950 font-bold">
            <span>{t.height}</span>
            <span className={`font-mono text-xs px-2 py-0.5 rounded-md ${calculatedHeight >= 0 ? 'bg-sky-200 text-sky-900' : 'bg-amber-200 text-amber-900'}`}>
              {calculatedHeight >= 0 ? `+${calculatedHeight.toFixed(2)} mm` : `${calculatedHeight.toFixed(2)} mm`}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 flex justify-between">
            <span>Formula:</span>
            <span className="font-mono font-semibold">h = 2T cos(θ) / (r ρ g)</span>
          </div>
        </div>
      </div>

    </div>
  );
};
