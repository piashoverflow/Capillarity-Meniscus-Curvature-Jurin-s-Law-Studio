import React, { useState } from 'react';
import { PhysicsState, LIQUID_PRESETS } from './types';
import { Language, TRANSLATIONS } from './translations';
import { SidebarControls } from './components/SidebarControls';
import { Module1ContactAngleCanvas } from './components/Module1ContactAngleCanvas';
import { Module2CapillaryCanvas } from './components/Module2CapillaryCanvas';
import { Module3ParadoxCanvas } from './components/Module3ParadoxCanvas';
import { calculateJurinHeight } from './physics';
import { 
  Atom, 
  FlaskConical, 
  Waves, 
  Languages, 
  RotateCcw, 
  Info, 
  BookOpen, 
  CheckCircle2, 
  X,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

const INITIAL_STATE: PhysicsState = {
  liquidId: 'water',
  substrateId: 'glass',
  surfaceTension: 0.0728,
  density: 1000,
  contactAngle: 5,
  gravity: 9.80,

  // Module 1
  adhesionForce: 85,
  cohesionForce: 45,
  showForceVectors: true,
  showGoniometer: true,
  showMolecularParticles: true,
  viewMode: 'split',
  zoomScale: 1.25,

  // Module 2
  capillaryRadiusMm: 0.50,
  showForceBalance: true,
  showLaplaceVector: true,
  showPipLoupe: true,
  zoomScale2: 1.0,

  // Module 3
  tubeLengthMm: 20.0,
  tubeTiltAngleDeg: 0,
  insufficientLengthMode: true,
  multiTubeMode: false,
  zoomScale3: 1.0
};

export default function App() {
  const [activeModule, setActiveModule] = useState<1 | 2 | 3>(1);
  const [physicsState, setPhysicsState] = useState<PhysicsState>(INITIAL_STATE);
  const [lang, setLang] = useState<Language>('bn');
  const [showTheoryModal, setShowTheoryModal] = useState(false);
  const [liveCalculatedHeight, setLiveCalculatedHeight] = useState<number>(() =>
    calculateJurinHeight(INITIAL_STATE.surfaceTension, INITIAL_STATE.contactAngle, INITIAL_STATE.capillaryRadiusMm, INITIAL_STATE.density, INITIAL_STATE.gravity)
  );

  const t = TRANSLATIONS[lang];

  const updatePhysicsState = (partial: Partial<PhysicsState>) => {
    setPhysicsState((prev) => {
      const next = { ...prev, ...partial };
      // Recalculate live height if relevant variables changed
      if (
        partial.surfaceTension !== undefined ||
        partial.contactAngle !== undefined ||
        partial.capillaryRadiusMm !== undefined ||
        partial.density !== undefined ||
        partial.gravity !== undefined
      ) {
        const newH = calculateJurinHeight(
          next.surfaceTension,
          next.contactAngle,
          next.capillaryRadiusMm,
          next.density,
          next.gravity
        );
        setLiveCalculatedHeight(newH);
      }
      return next;
    });
  };

  const handleReset = () => {
    setPhysicsState(INITIAL_STATE);
    setLiveCalculatedHeight(
      calculateJurinHeight(
        INITIAL_STATE.surfaceTension,
        INITIAL_STATE.contactAngle,
        INITIAL_STATE.capillaryRadiusMm,
        INITIAL_STATE.density,
        INITIAL_STATE.gravity
      )
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* ============================================================== */}
      {/* TOP BAR / NAVIGATION HEADER                                     */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-200/90 shadow-sm px-3 sm:px-4 py-2.5">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Title (Image icon removed as requested) */}
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-950 flex items-center gap-2">
              {t.appTitle}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                v2.4 Pro
              </span>
            </h1>
            <p className="text-[11px] text-slate-700 font-medium hidden sm:block">
              {t.subtitle}
            </p>
          </div>

          {/* Module Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200 shadow-inner overflow-x-auto">
            <button
              onClick={() => setActiveModule(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeModule === 1
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span>{t.module1Short}</span>
            </button>
            <button
              onClick={() => setActiveModule(2)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeModule === 2
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{t.module2Short}</span>
            </button>
            <button
              onClick={() => setActiveModule(3)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeModule === 3
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>{t.module3Short}</span>
            </button>
          </div>

          {/* Utility buttons & Top Right Red UDVASH Branding */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowTheoryModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-sky-50 text-sky-800 border border-sky-300 shadow-sm transition-all whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">{t.infoNotes}</span>
            </button>

            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm transition-all"
              title="Toggle English / বাংলা"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
              title={t.reset}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* UDVASH in Bold Red Colour in the Top Right */}
            <div className="flex items-center px-3 py-1 rounded-xl bg-red-50 border-2 border-red-500 shadow-sm shadow-red-500/10 select-none">
              <span className="font-black text-sm sm:text-base tracking-wider text-red-600 font-sans">
                UDVASH
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN WORKSPACE BODY (FULL WIDTH EDGE-TO-EDGE)                   */}
      {/* ============================================================== */}
      <main className="flex-1 w-full p-2 sm:p-3 md:p-4 flex flex-col lg:flex-row gap-3 md:gap-4 items-stretch">
        
        {/* Left Interactive Control Panel */}
        <SidebarControls
          activeModule={activeModule}
          physicsState={physicsState}
          updatePhysicsState={updatePhysicsState}
          lang={lang}
          onReset={handleReset}
          calculatedHeight={liveCalculatedHeight}
        />

        {/* Center / Right Canvas Stage */}
        <section className="flex-1 min-h-[600px] lg:min-h-[calc(100vh-130px)] flex flex-col gap-2.5">
          
          {/* Active Canvas Switcher with Direct Floating On-Simulation Zoom Toolbar */}
          <div className="flex-1 w-full min-h-[500px] relative">
            
            {/* On-Simulation Zoom Controls (Overlay Floating Island) */}
            <div className="absolute top-3 right-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-sky-300 shadow-lg shadow-sky-950/10">
              <button
                onClick={() => {
                  if (activeModule === 1) {
                    const next = Math.max(1.0, (physicsState.zoomScale || 1.25) - 0.2);
                    updatePhysicsState({ zoomScale: Number(next.toFixed(1)) });
                  } else if (activeModule === 2) {
                    const next = Math.max(1.0, (physicsState.zoomScale2 || 1.0) - 0.2);
                    updatePhysicsState({ zoomScale2: Number(next.toFixed(1)) });
                  } else {
                    const next = Math.max(1.0, (physicsState.zoomScale3 || 1.0) - 0.2);
                    updatePhysicsState({ zoomScale3: Number(next.toFixed(1)) });
                  }
                }}
                className="p-1 rounded-lg hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition-colors"
                title={lang === 'bn' ? 'জুম আউট' : 'Zoom Out'}
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs font-bold text-slate-800 min-w-[36px] text-center select-none">
                {activeModule === 1 && `${(physicsState.zoomScale || 1.25).toFixed(1)}×`}
                {activeModule === 2 && `${(physicsState.zoomScale2 || 1.0).toFixed(1)}×`}
                {activeModule === 3 && `${(physicsState.zoomScale3 || 1.0).toFixed(1)}×`}
              </span>

              <button
                onClick={() => {
                  if (activeModule === 1) {
                    const next = Math.min(2.5, (physicsState.zoomScale || 1.25) + 0.2);
                    updatePhysicsState({ zoomScale: Number(next.toFixed(1)) });
                  } else if (activeModule === 2) {
                    const next = Math.min(2.5, (physicsState.zoomScale2 || 1.0) + 0.2);
                    updatePhysicsState({ zoomScale2: Number(next.toFixed(1)) });
                  } else {
                    const next = Math.min(2.5, (physicsState.zoomScale3 || 1.0) + 0.2);
                    updatePhysicsState({ zoomScale3: Number(next.toFixed(1)) });
                  }
                }}
                className="p-1 rounded-lg hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition-colors"
                title={lang === 'bn' ? 'জুম ইন' : 'Zoom In'}
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-slate-200 mx-0.5" />

              <button
                onClick={() => {
                  if (activeModule === 1) updatePhysicsState({ zoomScale: 1.0 });
                  else if (activeModule === 2) updatePhysicsState({ zoomScale2: 1.0 });
                  else updatePhysicsState({ zoomScale3: 1.0 });
                }}
                className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded transition-colors"
                title={lang === 'bn' ? 'রিসেট জুম' : 'Reset Zoom'}
              >
                1.0×
              </button>

              <button
                onClick={() => {
                  if (activeModule === 1) updatePhysicsState({ zoomScale: 2.2 });
                  else if (activeModule === 2) updatePhysicsState({ zoomScale2: 2.0 });
                  else updatePhysicsState({ zoomScale3: 2.0 });
                }}
                className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"
                title={lang === 'bn' ? 'ম্যাক্সিমাম বড় ভিউ' : 'Max Zoom View'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeModule === 1 && (
              <Module1ContactAngleCanvas
                state={physicsState}
                lang={lang}
              />
            )}
            {activeModule === 2 && (
              <Module2CapillaryCanvas
                state={physicsState}
                lang={lang}
                onCalculatedHeightChange={(h) => setLiveCalculatedHeight(h)}
              />
            )}
            {activeModule === 3 && (
              <Module3ParadoxCanvas
                state={physicsState}
                lang={lang}
              />
            )}
          </div>

          {/* Quick Real-Time Insight Banner below Canvas */}
          <div className="bg-white/90 backdrop-blur-sm border border-sky-200 rounded-xl p-3 shadow-md flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="font-semibold text-slate-800">
                {activeModule === 1 && t.adhesionDominates}
                {activeModule === 2 && (
                  <span>
                    <strong>Jurin's Height:</strong> {liveCalculatedHeight >= 0 ? `+${liveCalculatedHeight.toFixed(2)} mm (Rise)` : `${liveCalculatedHeight.toFixed(2)} mm (Depression)`} | 
                    <span className="text-slate-500 ml-1">Energy Ratio Ep / W_st = 0.50 (50% Viscous Heat)</span>
                  </span>
                )}
                {activeModule === 3 && (
                  physicsState.insufficientLengthMode
                    ? t.paradoxBanner
                    : (lang === 'en' ? "Multi-Bore Hyperbolic profile: h · r = constant across all tubes." : "বহু-নল অধিবৃত্তীয় প্রোফাইল: প্রতিটি নলে h · r = ধ্রুবক।")
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 text-slate-500 text-[11px] font-mono">
              <span>Canvas 60FPS</span>
              <span>•</span>
              <span>Retina DPR {typeof window !== 'undefined' ? window.devicePixelRatio : 1}</span>
            </div>
          </div>

        </section>

      </main>

      {/* ============================================================== */}
      {/* MODAL: PHYSICAL PRINCIPLES & FORMULA REFERENCE                  */}
      {/* ============================================================== */}
      {showTheoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-sky-300 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5 text-sky-950 font-bold text-lg">
                <BookOpen className="w-5 h-5 text-sky-600" />
                <h2>{t.infoNotes}</h2>
              </div>
              <button
                onClick={() => setShowTheoryModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              
              {/* Young's Equation */}
              <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-200 space-y-1.5">
                <h3 className="font-bold text-sky-950 text-sm">
                  1. Young's Equation & Contact Angle (θ)
                </h3>
                <p className="font-mono text-slate-800 bg-white p-2 rounded border border-sky-100">
                  γ_SG = γ_SL + γ_LG · cos(θ)
                </p>
                <p>
                  Where γ_SG, γ_SL, and γ_LG represent interfacial surface free energies of Solid-Gas, Solid-Liquid, and Liquid-Gas interfaces.
                  When Adhesive forces between solid and liquid exceed Cohesion/√2, θ &lt; 90° (concave meniscus; wets surface). When Cohesive attraction dominates, θ &gt; 90° (convex depression, e.g. Mercury on glass).
                </p>
              </div>

              {/* Jurin's Law */}
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
                <h3 className="font-bold text-emerald-950 text-sm">
                  2. Jurin's Law of Capillarity
                </h3>
                <p className="font-mono text-slate-800 bg-white p-2 rounded border border-emerald-100">
                  h = (2 · T · cos θ) / (r · ρ · g)
                </p>
                <p>
                  The vertical equilibrium height h is inversely proportional to capillary bore radius r (h · r = constant). Narrower bores draw liquid dramatically higher due to greater circumference-to-cross-sectional-area ratio (2πr / πr² = 2/r).
                </p>
              </div>

              {/* Laplace Pressure */}
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-1.5">
                <h3 className="font-bold text-amber-950 text-sm">
                  3. Laplace Pressure Jump & Spherical Meniscus
                </h3>
                <p className="font-mono text-slate-800 bg-white p-2 rounded border border-amber-100">
                  ΔP = (2 · T) / R = ρ · g · h, where R = r / cos(θ)
                </p>
                <p>
                  Across any curved fluid interface with radius of curvature R, surface tension establishes a pressure difference ΔP. In a concave meniscus, pressure immediately beneath the curve is lower than atmospheric, sucking liquid upward until hydrostatic head ρgh cancels the deficit.
                </p>
              </div>

              {/* The Insufficient Length Paradox */}
              <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 space-y-1.5">
                <h3 className="font-bold text-rose-950 text-sm">
                  4. The Insufficient Length Paradox (L &lt; h)
                </h3>
                <p>
                  If a tube is cut shorter than theoretical height h, the liquid does NOT overflow in a perpetual fountain! Instead, upon touching the top rim, the meniscus increases its radius of curvature R' (flattens from acute θ toward 90°), reducing ΔP = 2T/R' until it exactly balances the shorter hydrostatic head ρgL.
                </p>
              </div>

              {/* 50% Energy Dissipation */}
              <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200 space-y-1.5">
                <h3 className="font-bold text-indigo-950 text-sm">
                  5. The 50% Viscous Dissipation Paradox
                </h3>
                <p>
                  Work done by surface tension during capillary rise is W_st = (2πr T cosθ) · h.
                  The gravitational potential energy gained is Ep = m g (h/2) = ½ W_st.
                  Exactly 50% of the mechanical surface work is always converted into viscous internal heat and damped oscillations during the ascension!
                </p>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowTheoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
              >
                {lang === 'en' ? 'Close Guide' : 'বন্ধ করুন'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white/80 border-t border-slate-200 py-2.5 px-4 text-center text-[11px] text-slate-700 font-medium">
        <p>
          Capillarity, Meniscus Curvature &amp; Jurin's Law Studio • Standalone HTML5/Canvas Physics Laboratory
        </p>
      </footer>

    </div>
  );
}
