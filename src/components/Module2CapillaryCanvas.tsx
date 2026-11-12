import React, { useRef, useEffect } from 'react';
import { PhysicsState, LIQUID_PRESETS } from '../types';
import { Language } from '../translations';
import { 
  calculateJurinHeight, 
  calculateLaplacePressure, 
  calculateRadiusOfCurvatureMm, 
  calculateEnergies 
} from '../physics';
import { drawArrow, getFluidGradients } from './canvasRenderUtils';

interface Module2CapillaryCanvasProps {
  state: PhysicsState;
  lang: Language;
  onCalculatedHeightChange?: (h: number) => void;
}

export const Module2CapillaryCanvas: React.FC<Module2CapillaryCanvasProps> = ({ 
  state, 
  lang,
  onCalculatedHeightChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Persistent smooth fluid height across slider changes (no abrupt jump!)
  const currentHeightRef = useRef<number>(20);
  const velocityRef = useRef<number>(0);

  // Theoretical Jurin's Height calculation
  const jurinHeightMm = calculateJurinHeight(
    state.surfaceTension,
    state.contactAngle,
    state.capillaryRadiusMm,
    state.density,
    state.gravity
  );

  useEffect(() => {
    if (onCalculatedHeightChange) {
      onCalculatedHeightChange(jurinHeightMm);
    }
  }, [jurinHeightMm, onCalculatedHeightChange]);

  const radiusOfCurvatureMm = calculateRadiusOfCurvatureMm(state.capillaryRadiusMm, state.contactAngle);
  const laplacePressurePa = calculateLaplacePressure(state.surfaceTension, radiusOfCurvatureMm * 1e-3);
  const energies = calculateEnergies(
    state.surfaceTension,
    state.contactAngle,
    state.capillaryRadiusMm,
    state.density,
    state.gravity,
    jurinHeightMm
  );

  // Upward force: F_up = 2 * pi * r * T * cos(theta)
  const thetaRad = (state.contactAngle * Math.PI) / 180;
  const upwardPullN = 2 * Math.PI * (state.capillaryRadiusMm * 1e-3) * state.surfaceTension * Math.cos(thetaRad);
  const weightColumnN = Math.PI * Math.pow(state.capillaryRadiusMm * 1e-3, 2) * (Math.abs(jurinHeightMm) * 1e-3) * state.density * state.gravity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.03;

      // Realistic Damped Spring / Viscous Fluid Column Motion:
      // Acceleration a = k * (targetH - currentH) - damping * velocity
      const targetH = jurinHeightMm;
      const displacement = targetH - currentHeightRef.current;
      // Spring constant k and damping constant c modeling Poiseuille viscous drag
      const k = 0.045;
      const damping = 0.82;
      velocityRef.current = velocityRef.current * damping + displacement * k;
      currentHeightRef.current += velocityRef.current;
      const currentColumnHeightMm = currentHeightRef.current;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Support Zoom for Module 2
      const m2Zoom = Math.max(1.0, Math.min(2.5, state.zoomScale2 || 1.0));

      // Background cyan wash
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#f0fdf4'); // soft mint/sky
      bgGrad.addColorStop(0.5, '#f0f9ff');
      bgGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Metric coordinate grid lines
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // ----------------------------------------------------
      // RESERVOIR & CAPILLARY TUBE GEOMETRY
      // ----------------------------------------------------
      const troughLeft = width * 0.10;
      const troughWidth = width * 0.54;
      const troughRight = troughLeft + troughWidth;
      const troughBottom = height - 50;
      const freeSurfaceY = height * 0.62;

      // Capillary Tube in center of trough
      const tubeCenterX = troughLeft + troughWidth * 0.50;
      // Pixel scale: map millimeters to pixels
      const mmToPx = 4.0 * m2Zoom;
      const tubeInnerRadiusPx = Math.max(8, state.capillaryRadiusMm * 24 * m2Zoom);
      const tubeWallPx = Math.round(5 * m2Zoom);

      const tubeTopY = Math.max(30, 50 - (m2Zoom - 1) * 20);
      const tubeBottomY = troughBottom - 18;

      // Equilibrium Meniscus Y position
      const meniscusCenterY = freeSurfaceY - currentColumnHeightMm * mmToPx;

      // 1. Draw Liquid in bulk reservoir
      const fluidGrad = getFluidGradients(ctx, freeSurfaceY, troughBottom, state);

      ctx.fillStyle = fluidGrad.fill;
      ctx.beginPath();
      ctx.moveTo(troughLeft, freeSurfaceY);
      ctx.lineTo(troughRight, freeSurfaceY);
      ctx.lineTo(troughRight, troughBottom);
      ctx.lineTo(troughLeft, troughBottom);
      ctx.closePath();
      ctx.fill();

      // Free surface line with meniscus curve at reservoir edges
      ctx.strokeStyle = fluidGrad.stroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(troughLeft, freeSurfaceY);
      ctx.lineTo(troughRight, freeSurfaceY);
      ctx.stroke();

      // 2. Draw Liquid column inside Capillary Tube
      ctx.save();
      ctx.fillStyle = fluidGrad.fill;
      ctx.beginPath();
      const tubeLeftInner = tubeCenterX - tubeInnerRadiusPx;
      const tubeRightInner = tubeCenterX + tubeInnerRadiusPx;

      ctx.moveTo(tubeLeftInner, tubeBottomY);
      ctx.lineTo(tubeLeftInner, meniscusCenterY);

      // Meniscus Curvature inside tube
      // If theta < 90: concave (center dips down)
      // If theta > 90: convex (center curves up)
      const meniscusSagittaPx = tubeInnerRadiusPx * Math.min(1.2, Math.abs(Math.cos(thetaRad)));
      const sagittaDir = state.contactAngle < 90 ? 1 : -1;
      const meniscusBottomY = meniscusCenterY + meniscusSagittaPx * sagittaDir;

      ctx.quadraticCurveTo(tubeCenterX, meniscusBottomY, tubeRightInner, meniscusCenterY);
      ctx.lineTo(tubeRightInner, tubeBottomY);
      ctx.closePath();
      ctx.fill();

      // Meniscus boundary highlight
      ctx.strokeStyle = fluidGrad.stroke;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tubeLeftInner, meniscusCenterY);
      ctx.quadraticCurveTo(tubeCenterX, meniscusBottomY, tubeRightInner, meniscusCenterY);
      ctx.stroke();

      // Liquid reflection shine
      ctx.fillStyle = fluidGrad.specular;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(tubeLeftInner + 2, Math.min(meniscusCenterY, freeSurfaceY), 3, Math.abs(meniscusCenterY - freeSurfaceY) + 30);
      ctx.globalAlpha = 1.0;
      ctx.restore();

      // 3. Draw Glass Reservoir Trough Glass Walls
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(troughLeft, freeSurfaceY - 40, troughWidth, troughBottom - (freeSurfaceY - 40));
      // Reservoir Glass tint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(troughLeft, freeSurfaceY - 40, troughWidth, troughBottom - (freeSurfaceY - 40));

      // 4. Draw Glass Capillary Tube Walls (Reflective glass cylinder)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      // Left glass wall
      ctx.fillRect(tubeLeftInner - tubeWallPx, tubeTopY, tubeWallPx, tubeBottomY - tubeTopY);
      // Right glass wall
      ctx.fillRect(tubeRightInner, tubeTopY, tubeWallPx, tubeBottomY - tubeTopY);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      // Outer border
      ctx.strokeRect(tubeLeftInner - tubeWallPx, tubeTopY, tubeWallPx, tubeBottomY - tubeTopY);
      ctx.strokeRect(tubeRightInner, tubeTopY, tubeWallPx, tubeBottomY - tubeTopY);

      // Top rim of tube
      ctx.beginPath();
      ctx.ellipse(tubeCenterX, tubeTopY, tubeInnerRadiusPx + tubeWallPx, 3, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Bottom open submerged rim
      ctx.beginPath();
      ctx.ellipse(tubeCenterX, tubeBottomY, tubeInnerRadiusPx + tubeWallPx, 3, 0, 0, Math.PI * 2);
      ctx.stroke();

      // ----------------------------------------------------
      // MEASUREMENT RULER & HEIGHT MARKERS
      // ----------------------------------------------------
      const rulerX = tubeLeftInner - tubeWallPx - 45;
      // Zero reference line at free surface
      ctx.save();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(troughLeft - 10, freeSurfaceY);
      ctx.lineTo(tubeRightInner + 70, freeSurfaceY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(lang === 'en' ? 'Reference Surface Level (h = 0)' : 'মুক্ত পৃষ্ঠতলের স্তর (h = ০)', troughLeft + 8, freeSurfaceY - 6);

      // Height dimension line
      ctx.save();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rulerX, freeSurfaceY);
      ctx.lineTo(rulerX, meniscusCenterY);
      ctx.stroke();

      // Ruler ticks
      ctx.beginPath();
      ctx.moveTo(rulerX - 6, freeSurfaceY);
      ctx.lineTo(rulerX + 6, freeSurfaceY);
      ctx.moveTo(rulerX - 6, meniscusCenterY);
      ctx.lineTo(rulerX + 6, meniscusCenterY);
      ctx.stroke();

      // Height readout text
      ctx.fillStyle = '#991b1b';
      ctx.font = 'bold 14px Inter, sans-serif';
      const hSign = currentColumnHeightMm >= 0 ? '+' : '';
      ctx.fillText(`h = ${hSign}${currentColumnHeightMm.toFixed(1)} mm`, rulerX - 85, (freeSurfaceY + meniscusCenterY) / 2 + 5);
      ctx.restore();

      // ----------------------------------------------------
      // VECTOR OVERLAYS (Module 2: Upward Pull & Column Weight)
      // ----------------------------------------------------
      if (state.showForceBalance) {
        // Upward surface tension vector along meniscus rim
        if (state.contactAngle < 90) {
          drawArrow(
            ctx,
            tubeLeftInner,
            meniscusCenterY,
            tubeLeftInner,
            meniscusCenterY - 45,
            '#059669', // Emerald
            3,
            8,
            'F_up',
            '#065f46'
          );
          drawArrow(
            ctx,
            tubeRightInner,
            meniscusCenterY,
            tubeRightInner,
            meniscusCenterY - 45,
            '#059669',
            3,
            8,
            'F_up',
            '#065f46'
          );
          // Downward gravity weight vector of liquid column
          const colMidY = (freeSurfaceY + meniscusCenterY) / 2;
          drawArrow(
            ctx,
            tubeCenterX,
            colMidY,
            tubeCenterX,
            colMidY + 45,
            '#dc2626', // Red gravity
            3.5,
            9,
            'W = mg',
            '#991b1b'
          );
        } else {
          // Depression downward push
          drawArrow(
            ctx,
            tubeCenterX,
            meniscusCenterY,
            tubeCenterX,
            meniscusCenterY + 40,
            '#dc2626',
            3,
            8,
            'F_depress',
            '#991b1b'
          );
        }
      }

      // ----------------------------------------------------
      // FLOATING PICTURE-IN-PICTURE ULTRA-ZOOM MENISCUS LOUPE (8x)
      // ----------------------------------------------------
      if (state.showPipLoupe) {
        const loupeSize = 190;
        const loupeX = width - loupeSize - 20;
        const loupeY = 24;

        // Circular Loupe Clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(loupeX + loupeSize / 2, loupeY + loupeSize / 2, loupeSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.clip();

        // Loupe Background
        const loupeBg = ctx.createRadialGradient(
          loupeX + loupeSize / 2,
          loupeY + loupeSize / 2,
          10,
          loupeX + loupeSize / 2,
          loupeY + loupeSize / 2,
          loupeSize / 2
        );
        loupeBg.addColorStop(0, '#f8fafc');
        loupeBg.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = loupeBg;
        ctx.fillRect(loupeX, loupeY, loupeSize, loupeSize);

        // Loupe grid
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1;
        for (let i = loupeX; i < loupeX + loupeSize; i += 20) {
          ctx.beginPath();
          ctx.moveTo(i, loupeY);
          ctx.lineTo(i, loupeY + loupeSize);
          ctx.stroke();
        }

        // Loupe Zoom Center coordinates
        const loupeCenterCanvasX = loupeX + loupeSize / 2;
        const loupeCenterCanvasY = loupeY + loupeSize / 2;

        // Draw magnified glass walls
        const magWallDist = 58;
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(loupeCenterCanvasX - magWallDist - 12, loupeY, 12, loupeSize);
        ctx.fillRect(loupeCenterCanvasX + magWallDist, loupeY, 12, loupeSize);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(loupeCenterCanvasX - magWallDist - 12, loupeY, 12, loupeSize);
        ctx.strokeRect(loupeCenterCanvasX + magWallDist, loupeY, 12, loupeSize);

        // Magnified Meniscus Cap
        const magSagitta = Math.min(50, 52 * Math.abs(Math.cos(thetaRad)));
        const magDir = state.contactAngle < 90 ? 1 : -1;

        ctx.fillStyle = fluidGrad.fill;
        ctx.beginPath();
        ctx.moveTo(loupeCenterCanvasX - magWallDist, loupeCenterCanvasY);
        ctx.quadraticCurveTo(
          loupeCenterCanvasX,
          loupeCenterCanvasY + magSagitta * magDir,
          loupeCenterCanvasX + magWallDist,
          loupeCenterCanvasY
        );
        ctx.lineTo(loupeCenterCanvasX + magWallDist, loupeY + loupeSize);
        ctx.lineTo(loupeCenterCanvasX - magWallDist, loupeY + loupeSize);
        ctx.closePath();
        ctx.fill();

        // Magnified meniscus line
        ctx.strokeStyle = fluidGrad.stroke;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(loupeCenterCanvasX - magWallDist, loupeCenterCanvasY);
        ctx.quadraticCurveTo(
          loupeCenterCanvasX,
          loupeCenterCanvasY + magSagitta * magDir,
          loupeCenterCanvasX + magWallDist,
          loupeCenterCanvasY
        );
        ctx.stroke();

        // Real Physics Tangent & Contact Angle indicator inside Loupe (Fixed for Image 3)
        // Contact point on left glass wall:
        const cpX = loupeCenterCanvasX - magWallDist;
        const cpY = loupeCenterCanvasY;
        const angRad = (state.contactAngle * Math.PI) / 180;
        const tangLen = 55;

        // Tangent vector to the meniscus surface:
        // By definition, at the left wall inside the tube:
        // Angle from the downward wall (inside liquid) to the surface tangent is theta!
        // At left wall, the solid wall downwards has angle = +90° = π/2.
        // If theta < 90 (concave, climbs): tangent points across into fluid and downwards from wall by theta.
        // Specifically: dx = sin(theta) * tangLen, dy = cos(theta) * tangLen (downwards into fluid)
        // or tangent vector along the meniscus interface:
        // dy/dx at cpX = -tan(90 - theta) = -cot(theta)
        const tangDx = Math.sin(angRad) * tangLen;
        const tangDy = (state.contactAngle < 90 ? 1 : -1) * Math.cos(angRad) * tangLen;

        ctx.save();
        ctx.strokeStyle = '#ea580c'; // Vibrant Orange Tangent
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cpX - tangDx * 0.2, cpY - tangDy * 0.2);
        ctx.lineTo(cpX + tangDx * 1.1, cpY + tangDy * 1.1);
        ctx.stroke();

        // Contact point dot
        ctx.beginPath();
        ctx.arc(cpX, cpY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ea580c';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Contact Angle Arc theta inside liquid (between vertical wall and tangent)
        ctx.strokeStyle = '#059669'; // Emerald green
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        // Downward vertical wall is angle = Math.PI / 2
        // Tangent is at Math.PI / 2 - angRad (if concave)
        const arcR = 30;
        if (state.contactAngle < 90) {
          ctx.arc(cpX, cpY, arcR, Math.PI * 0.5 - (Math.PI * 0.5 - angRad), Math.PI * 0.5, false);
        } else {
          ctx.arc(cpX, cpY, arcR, Math.PI * 0.5, Math.PI * 0.5 + (angRad - Math.PI * 0.5), false);
        }
        ctx.stroke();

        // Contact angle text badge inside Loupe
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`θ = ${state.contactAngle}°`, cpX + 10, cpY + (state.contactAngle < 90 ? 24 : -14));
        ctx.restore();

        // Crosshairs in loupe
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(loupeCenterCanvasX, loupeY);
        ctx.lineTo(loupeCenterCanvasX, loupeY + loupeSize);
        ctx.moveTo(loupeX, loupeCenterCanvasY);
        ctx.lineTo(loupeX + loupeSize, loupeCenterCanvasY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();

        // Loupe Metallic Rim
        ctx.save();
        ctx.beginPath();
        ctx.arc(loupeX + loupeSize / 2, loupeY + loupeSize / 2, loupeSize / 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 5;
        ctx.shadowColor = 'rgba(2, 132, 199, 0.35)';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Loupe Badge Header
        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('MENISCUS LOUPE (8×)', loupeX + 24, loupeY + 22);

        // Loupe Subtext (Curvature R and Laplace Delta P)
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`R = ${radiusOfCurvatureMm.toFixed(2)} mm`, loupeX + 24, loupeY + loupeSize - 28);
        ctx.font = '600 10px Inter, sans-serif';
        ctx.fillStyle = '#047857';
        ctx.fillText(`ΔP = ${Math.round(laplacePressurePa)} Pa`, loupeX + 24, loupeY + loupeSize - 14);

        ctx.restore();
      }

      // ----------------------------------------------------
      // RIGHT-SIDE LIVE NUMERIC EQUATION CARD (On-Canvas)
      // ----------------------------------------------------
      const cardX = width * 0.67;
      const cardY = 225;
      const cardW = width * 0.30;
      const cardH = height - cardY - 45;

      ctx.save();
      // Glass card container
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 16);
      ctx.fill();
      ctx.stroke();

      // Card Title
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText(lang === 'en' ? "Jurin's Formula Substitution" : 'জুরিন সূত্রে সরাসরি প্রতিস্থাপন', cardX + 16, cardY + 26);

      // Equation box
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(cardX + 14, cardY + 38, cardW - 28, 44, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('h = (2 · T · cos θ) / (r · ρ · g)', cardX + 22, cardY + 65);

      // Numeric Values substitution
      ctx.font = '11px monospace';
      ctx.fillStyle = '#334155';
      const rMeters = (state.capillaryRadiusMm * 1e-3).toExponential(2);
      const TMeters = state.surfaceTension.toFixed(3);
      const cosTh = Math.cos(thetaRad).toFixed(3);

      ctx.fillText(`T = ${TMeters} N/m`, cardX + 18, cardY + 104);
      ctx.fillText(`θ = ${state.contactAngle}° (cos θ = ${cosTh})`, cardX + 18, cardY + 120);
      ctx.fillText(`r = ${state.capillaryRadiusMm.toFixed(2)} mm (${rMeters} m)`, cardX + 18, cardY + 136);
      ctx.fillText(`ρ = ${Math.round(state.density)} kg/m³ | g = ${state.gravity.toFixed(2)} m/s²`, cardX + 18, cardY + 152);

      // Force balance verification
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(lang === 'en' ? 'Hydrostatic Force Balance:' : 'হাইড্রোস্ট্যাটিক বলের সাম্যাবস্থা:', cardX + 18, cardY + 180);
      ctx.font = '11px monospace';
      ctx.fillText(`F_up = 2πrT cosθ = ${(upwardPullN * 1e3).toFixed(2)} mN`, cardX + 18, cardY + 198);
      ctx.fillText(`Weight W = mg = ${(weightColumnN * 1e3).toFixed(2)} mN`, cardX + 18, cardY + 214);

      // Energy Paradox section
      ctx.fillStyle = '#991b1b';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(lang === 'en' ? 'Energy & Viscous Dissipation:' : 'শক্তি ও সান্দ্র তাপক্ষয়:', cardX + 18, cardY + 240);
      
      ctx.font = '10px monospace';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(`W_st = ${(energies.wSurfaceTension * 1e6).toFixed(1)} μJ`, cardX + 18, cardY + 258);
      ctx.fillText(`E_p  = ${(energies.potentialEnergy * 1e6).toFixed(1)} μJ (50%)`, cardX + 18, cardY + 274);
      ctx.fillText(`Q_heat = ${(energies.dissipatedHeat * 1e6).toFixed(1)} μJ (50%)`, cardX + 18, cardY + 290);

      // Energy bar visualization
      const barW = cardW - 36;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(cardX + 18, cardY + 300, barW, 10);
      ctx.fillStyle = '#10b981'; // Green for Ep
      ctx.fillRect(cardX + 18, cardY + 300, barW * 0.5, 10);
      ctx.fillStyle = '#f59e0b'; // Amber for Heat
      ctx.fillRect(cardX + 18 + barW * 0.5, cardY + 300, barW * 0.5, 10);

      ctx.restore();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [state, lang, jurinHeightMm, radiusOfCurvatureMm, laplacePressurePa, upwardPullN, weightColumnN, energies]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-sky-300 shadow-xl bg-white">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
