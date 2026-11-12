import React, { useRef, useEffect } from 'react';
import { PhysicsState } from '../types';
import { Language } from '../translations';
import { calculateJurinHeight } from '../physics';
import { getFluidGradients } from './canvasRenderUtils';

interface Module3ParadoxCanvasProps {
  state: PhysicsState;
  lang: Language;
}

export const Module3ParadoxCanvas: React.FC<Module3ParadoxCanvasProps> = ({ state, lang }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Theoretical full height for standard tube (r = 0.5mm)
  const theoreticalH = calculateJurinHeight(
    state.surfaceTension,
    state.contactAngle,
    0.5,
    state.density,
    state.gravity
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
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

      // Background gradient
      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(0.5, '#f0f9ff');
      bgGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const m3Zoom = Math.max(1.0, Math.min(2.5, state.zoomScale3 || 1.0));

      // Soft measurement grid
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Shared fluid styling
      const fluidGrad = getFluidGradients(ctx, 100, height - 60, state);

      // ==========================================================
      // SCENARIO A: 4-BORE MULTI-TUBE MANIFOLD (JURIN HYPERBOLIC ENVELOPE)
      // ==========================================================
      if (state.multiTubeMode) {
        const troughLeft = width * 0.08;
        const troughRight = width * 0.92;
        const freeSurfaceY = height * 0.65;
        const troughBottom = height - 40;

        // Draw Title & Header
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 15px Inter, sans-serif';
        ctx.fillText(lang === 'en' ? "Jurin's Law Manifold: Hyperbolic Envelope (h · r = Constant)" : "জুরিনের সূত্র ম্যানিফোল্ড: অধিবৃত্তীয় প্রোফাইল (h · r = ধ্রুবক)", troughLeft, 32);

        // Tilt angle in radians
        const tiltAlphaRad = (state.tubeTiltAngleDeg * Math.PI) / 180;

        // 4 Capillaries with varying radii: 0.25 mm, 0.50 mm, 1.00 mm, 2.00 mm
        const radii = [0.25, 0.50, 1.00, 2.00];
        const tubeSpacing = (troughRight - troughLeft) / (radii.length + 1);

        // Store meniscus points to draw the connecting hyperbolic curve
        const meniscusPoints: { x: number; y: number; r: number; h: number }[] = [];

        // 1. Draw Tubes and Liquid Columns
        radii.forEach((r, idx) => {
          const tubeX = troughLeft + tubeSpacing * (idx + 1);
          const hTheoryMm = calculateJurinHeight(state.surfaceTension, state.contactAngle, r, state.density, state.gravity);
          
          // Pixel scale: 3.5 px per mm
          const pxPerMm = 3.8;
          const colHeightPx = hTheoryMm * pxPerMm;
          const meniscusY = freeSurfaceY - colHeightPx;

          // Inner radius in px
          const innerRpx = Math.max(3, r * 14);
          const wallPx = 3.5;

          // Tube length along tilt
          // If tilted, rotate tube around pivot at bottom (tubeX, troughBottom - 15)
          const pivotX = tubeX;
          const pivotY = freeSurfaceY;

          ctx.save();
          // Translate to pivot and apply tilt
          ctx.translate(pivotX, pivotY);
          ctx.rotate(tiltAlphaRad);

          // Liquid Column inside tilted tube:
          // Vertical height h means slanted column length l = h / cos(tiltAlphaRad)
          const slantedColLengthPx = colHeightPx / Math.max(0.1, Math.cos(tiltAlphaRad));
          const tubeTopRelY = -slantedColLengthPx - 40;
          const tubeBottomRelY = troughBottom - freeSurfaceY - 10;

          // Fill liquid inside tube
          ctx.fillStyle = fluidGrad.fill;
          ctx.beginPath();
          ctx.moveTo(-innerRpx, tubeBottomRelY);
          ctx.lineTo(-innerRpx, -slantedColLengthPx);
          // Meniscus cap
          const sagitta = innerRpx * 0.75 * (state.contactAngle < 90 ? 1 : -1);
          ctx.quadraticCurveTo(0, -slantedColLengthPx + sagitta, innerRpx, -slantedColLengthPx);
          ctx.lineTo(innerRpx, tubeBottomRelY);
          ctx.closePath();
          ctx.fill();

          // Meniscus line
          ctx.strokeStyle = fluidGrad.stroke;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-innerRpx, -slantedColLengthPx);
          ctx.quadraticCurveTo(0, -slantedColLengthPx + sagitta, innerRpx, -slantedColLengthPx);
          ctx.stroke();

          // Draw Tube Glass Walls
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(-innerRpx - wallPx, tubeTopRelY, wallPx, tubeBottomRelY - tubeTopRelY);
          ctx.fillRect(innerRpx, tubeTopRelY, wallPx, tubeBottomRelY - tubeTopRelY);

          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-innerRpx - wallPx, tubeTopRelY, wallPx, tubeBottomRelY - tubeTopRelY);
          ctx.strokeRect(innerRpx, tubeTopRelY, wallPx, tubeBottomRelY - tubeTopRelY);

          ctx.restore();

          // Save vertical level point for hyperbolic curve
          // Note: vertical height h is invariant with tilt!
          meniscusPoints.push({
            x: tubeX - Math.sin(tiltAlphaRad) * (slantedColLengthPx),
            y: freeSurfaceY - colHeightPx,
            r,
            h: hTheoryMm
          });

          // Tube Labels below
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText(`r₁ = ${r} mm`, tubeX - 25, troughBottom + 22);
          ctx.font = '600 10px monospace';
          ctx.fillStyle = '#0369a1';
          ctx.fillText(`h = ${hTheoryMm.toFixed(1)}mm`, tubeX - 25, troughBottom + 35);
        });

        // 2. Bulk Reservoir Liquid Fill
        ctx.fillStyle = fluidGrad.fill;
        ctx.beginPath();
        ctx.moveTo(troughLeft, freeSurfaceY);
        ctx.lineTo(troughRight, freeSurfaceY);
        ctx.lineTo(troughRight, troughBottom);
        ctx.lineTo(troughLeft, troughBottom);
        ctx.closePath();
        ctx.fill();

        // Trough Glass Container outline
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.strokeRect(troughLeft, freeSurfaceY - 10, troughRight - troughLeft, troughBottom - freeSurfaceY + 10);

        // Free surface line
        ctx.strokeStyle = fluidGrad.stroke;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(troughLeft, freeSurfaceY);
        ctx.lineTo(troughRight, freeSurfaceY);
        ctx.stroke();

        // 3. Connect Menisci with Theoretical Hyperbola Curve (h ∝ 1/r)
        if (state.tubeTiltAngleDeg === 0) {
          ctx.save();
          ctx.strokeStyle = '#ea580c'; // Vibrant Orange Hyperbolic curve
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          meniscusPoints.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else {
              // Smooth bezier through hyperbolic points
              const prev = meniscusPoints[i - 1];
              const midX = (prev.x + pt.x) / 2;
              const midY = (prev.y + pt.y) / 2;
              ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
            }
          });
          ctx.stroke();
          ctx.restore();

          // Label Hyperbola
          ctx.fillStyle = '#c2410c';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillText(lang === 'en' ? 'Hyperbolic Curve Envelope: h ∝ 1/r' : 'অধিবৃত্তীয় বক্ররেখা: h ∝ ১/r', meniscusPoints[1].x - 10, meniscusPoints[0].y + 15);
        }

      } else {
        // ==========================================================
        // SCENARIO B: THE INSUFFICIENT TUBE LENGTH PARADOX (L < h)
        // ==========================================================
        const tubeX = width * 0.38;
        const freeSurfaceY = height * 0.62;
        const troughLeft = width * 0.12;
        const troughRight = width * 0.64;
        const troughBottom = height - 40;

        // Pixel scale scaled by m3Zoom
        const pxPerMm = 4.0 * m3Zoom;
        const rMm = 0.5; // fixed test bore
        const hTheorMm = Math.max(1, theoreticalH);
        const colTheorPx = hTheorMm * pxPerMm;
        const LCutMm = state.tubeLengthMm;
        const LCutPx = LCutMm * pxPerMm;

        // Physics paradox check: Is tube cut below equilibrium height?
        const isInsufficient = LCutMm < hTheorMm;

        // Effective liquid height inside tube:
        // When L >= h, liquid climbs to h.
        // When L < h, liquid climbs to top rim L, and STOPS without spilling!
        const hEffMm = isInsufficient ? LCutMm : hTheorMm;
        const hEffPx = hEffMm * pxPerMm;

        // Calculate Flattened Meniscus Contact Angle (theta') and Radius of Curvature (R')
        // cos(theta') = (h_eff / h_theor) * cos(theta)
        const thetaRad0 = (state.contactAngle * Math.PI) / 180;
        const cosTheta0 = Math.cos(thetaRad0);
        const cosThetaEffective = Math.min(1, Math.max(0.01, (hEffMm / hTheorMm) * cosTheta0));
        const thetaEffectiveDeg = (Math.acos(cosThetaEffective) * 180) / Math.PI;
        const radiusCurvatureEffMm = rMm / cosThetaEffective;

        // Draw bulk liquid
        ctx.fillStyle = fluidGrad.fill;
        ctx.beginPath();
        ctx.moveTo(troughLeft, freeSurfaceY);
        ctx.lineTo(troughRight, freeSurfaceY);
        ctx.lineTo(troughRight, troughBottom);
        ctx.lineTo(troughLeft, troughBottom);
        ctx.closePath();
        ctx.fill();

        // Trough Outline
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.strokeRect(troughLeft, freeSurfaceY - 15, troughRight - troughLeft, troughBottom - freeSurfaceY + 15);

        // Free surface
        ctx.strokeStyle = fluidGrad.stroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(troughLeft, freeSurfaceY);
        ctx.lineTo(troughRight, freeSurfaceY);
        ctx.stroke();

        // --------------------------------------------------------
        // TUBE DRAWING (TILT AND CUT LENGTH L)
        // --------------------------------------------------------
        const tiltRad = (state.tubeTiltAngleDeg * Math.PI) / 180;
        const tubeInnerRpx = 12;
        const tubeWallPx = 4;

        ctx.save();
        ctx.translate(tubeX, freeSurfaceY);
        ctx.rotate(tiltRad);

        const slantedEffLengthPx = hEffPx / Math.max(0.1, Math.cos(tiltRad));
        const slantedCutLengthPx = LCutPx / Math.max(0.1, Math.cos(tiltRad));

        const tubeTopY = -slantedCutLengthPx;
        const tubeBottomY = troughBottom - freeSurfaceY - 10;
        const liquidMeniscusY = -slantedEffLengthPx;

        // Fill liquid column
        ctx.fillStyle = fluidGrad.fill;
        ctx.beginPath();
        ctx.moveTo(-tubeInnerRpx, tubeBottomY);
        ctx.lineTo(-tubeInnerRpx, liquidMeniscusY);

        // Curvature sagitta: when isInsufficient is true, meniscus gets FLATTENED!
        // As thetaEffectiveDeg -> 90 deg, sagitta -> 0 (almost flat plane)
        const flatSagitta = tubeInnerRpx * 0.85 * (Math.cos((thetaEffectiveDeg * Math.PI) / 180));
        ctx.quadraticCurveTo(0, liquidMeniscusY + flatSagitta, tubeInnerRpx, liquidMeniscusY);
        ctx.lineTo(tubeInnerRpx, tubeBottomY);
        ctx.closePath();
        ctx.fill();

        // Meniscus contour
        ctx.strokeStyle = fluidGrad.stroke;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-tubeInnerRpx, liquidMeniscusY);
        ctx.quadraticCurveTo(0, liquidMeniscusY + flatSagitta, tubeInnerRpx, liquidMeniscusY);
        ctx.stroke();

        // Draw Tube Cut Walls
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(-tubeInnerRpx - tubeWallPx, tubeTopY, tubeWallPx, tubeBottomY - tubeTopY);
        ctx.fillRect(tubeInnerRpx, tubeTopY, tubeWallPx, tubeBottomY - tubeTopY);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-tubeInnerRpx - tubeWallPx, tubeTopY, tubeWallPx, tubeBottomY - tubeTopY);
        ctx.strokeRect(tubeInnerRpx, tubeTopY, tubeWallPx, tubeBottomY - tubeTopY);

        // Cut Rim of tube
        ctx.strokeStyle = '#dc2626'; // Red cut rim
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, tubeTopY, tubeInnerRpx + tubeWallPx, 3, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // --------------------------------------------------------
        // THEORETICAL GHOST HEIGHT (Where water would have gone if L >= h)
        // --------------------------------------------------------
        if (isInsufficient) {
          const ghostY = freeSurfaceY - colTheorPx;
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tubeX - 45, ghostY);
          ctx.lineTo(tubeX + 55, ghostY);
          ctx.stroke();

          ctx.fillStyle = '#64748b';
          ctx.font = 'italic 11px Inter, sans-serif';
          ctx.fillText(`Theoretical h_th = ${hTheorMm.toFixed(1)} mm (Uncut)`, tubeX + 62, ghostY + 4);
          ctx.restore();
        }

        // --------------------------------------------------------
        // INSUFFICIENT LOUPE PIP (Ultra-Magnification of Top Rim)
        // --------------------------------------------------------
        const loupeSize = 180;
        const loupeX = width - loupeSize - 25;
        const loupeY = 25;

        ctx.save();
        ctx.beginPath();
        ctx.arc(loupeX + loupeSize / 2, loupeY + loupeSize / 2, loupeSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.clip();

        // Loupe Background
        ctx.fillStyle = isInsufficient ? '#fffbeb' : '#f0fdf4';
        ctx.fillRect(loupeX, loupeY, loupeSize, loupeSize);

        const lCenterX = loupeX + loupeSize / 2;
        const lCenterY = loupeY + loupeSize / 2;

        // Magnified tube rim
        const mWall = 55;
        ctx.fillStyle = '#cbd5e1';
        // Rim cut line
        ctx.fillRect(lCenterX - mWall - 12, lCenterY, 12, loupeSize);
        ctx.fillRect(lCenterX + mWall, lCenterY, 12, loupeSize);
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5;
        // Top cut edge
        ctx.strokeRect(lCenterX - mWall - 12, lCenterY, 12, loupeSize);
        ctx.strokeRect(lCenterX + mWall, lCenterY, 12, loupeSize);

        // Magnified fluid at rim
        ctx.fillStyle = fluidGrad.fill;
        ctx.beginPath();
        ctx.moveTo(lCenterX - mWall, lCenterY);
        // If insufficient, meniscus flattens!
        const magFlatSagitta = 45 * Math.cos((thetaEffectiveDeg * Math.PI) / 180);
        ctx.quadraticCurveTo(lCenterX, lCenterY + magFlatSagitta, lCenterX + mWall, lCenterY);
        ctx.lineTo(lCenterX + mWall, loupeY + loupeSize);
        ctx.lineTo(lCenterX - mWall, loupeY + loupeSize);
        ctx.closePath();
        ctx.fill();

        // Magnified meniscus contour
        ctx.strokeStyle = fluidGrad.stroke;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(lCenterX - mWall, lCenterY);
        ctx.quadraticCurveTo(lCenterX, lCenterY + magFlatSagitta, lCenterX + mWall, lCenterY);
        ctx.stroke();

        ctx.restore();

        // Loupe Border Ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(loupeX + loupeSize / 2, loupeY + loupeSize / 2, loupeSize / 2, 0, Math.PI * 2);
        ctx.strokeStyle = isInsufficient ? '#f59e0b' : '#10b981';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(lang === 'en' ? 'TOP RIM MENISCUS (8×)' : 'নলের শীর্ষ মেনিস্কাস (৮×)', loupeX + 22, loupeY + 22);

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = isInsufficient ? '#b45309' : '#047857';
        ctx.fillText(`θ' = ${thetaEffectiveDeg.toFixed(1)}° (Flattened)`, loupeX + 22, loupeY + loupeSize - 26);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#475569';
        ctx.fillText(`R' = ${radiusCurvatureEffMm.toFixed(2)} mm`, loupeX + 22, loupeY + loupeSize - 12);
        ctx.restore();

        // --------------------------------------------------------
        // PARADOX EXPLANATION CARD (RIGHT SIDE)
        // --------------------------------------------------------
        const cardX = width * 0.67;
        const cardY = 225;
        const cardW = width * 0.30;
        const cardH = height - cardY - 45;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
        ctx.strokeStyle = isInsufficient ? '#fde68a' : '#bae6fd';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 16);
        ctx.fill();
        ctx.stroke();

        // Card Header
        ctx.fillStyle = isInsufficient ? '#b45309' : '#0369a1';
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillText(lang === 'en' ? "Paradox Rig Status" : 'প্যারাডক্স পরীক্ষার ফলাফল', cardX + 16, cardY + 26);

        // Status Banner
        ctx.fillStyle = isInsufficient ? '#fef3c7' : '#ecfdf5';
        ctx.beginPath();
        ctx.roundRect(cardX + 14, cardY + 38, cardW - 28, 48, 8);
        ctx.fill();

        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = isInsufficient ? '#92400e' : '#065f46';
        if (isInsufficient) {
          ctx.fillText(lang === 'en' ? "NO OVERFLOW OCCURS!" : "কোনো তরল উপচে পড়ে না!", cardX + 22, cardY + 58);
          ctx.font = '11px Inter, sans-serif';
          ctx.fillText(lang === 'en' ? "Meniscus flattens to maintain balance." : "মেনিস্কাস চ্যাপ্টা হয়ে সাম্যাবস্থা বজায় রাখে।", cardX + 22, cardY + 74);
        } else {
          ctx.fillText(lang === 'en' ? "Standard Jurin Equilibrium" : "স্বাভাবিক জুরিন সাম্যাবস্থা", cardX + 22, cardY + 58);
          ctx.font = '11px Inter, sans-serif';
          ctx.fillText(lang === 'en' ? "L >= h; tube fully accommodates column." : "L >= h; নল তরল স্তম্ভকে ধারণ করতে সক্ষম।", cardX + 22, cardY + 74);
        }

        // Live Math Breakdowns
        ctx.font = '11px monospace';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(`Theoretical h_th : ${hTheorMm.toFixed(1)} mm`, cardX + 18, cardY + 110);
        ctx.fillText(`Actual Cut L     : ${LCutMm.toFixed(1)} mm`, cardX + 18, cardY + 128);
        ctx.fillText(`Effective h_eff  : ${hEffMm.toFixed(1)} mm`, cardX + 18, cardY + 146);
        ctx.fillText(`Original θ       : ${state.contactAngle}°`, cardX + 18, cardY + 164);
        ctx.fillText(`Adjusted θ'      : ${thetaEffectiveDeg.toFixed(1)}°`, cardX + 18, cardY + 182);

        // Slanted length
        if (state.tubeTiltAngleDeg > 0) {
          const lSlantedMm = hEffMm / Math.cos(tiltRad);
          ctx.fillStyle = '#0369a1';
          ctx.fillText(`Slant Length l   : ${lSlantedMm.toFixed(1)} mm`, cardX + 18, cardY + 204);
          ctx.fillText(`Formula: l = h / cos(α)`, cardX + 18, cardY + 222);
        }

        // Key insight statement
        ctx.fillStyle = '#475569';
        ctx.font = '10px Inter, sans-serif';
        const msg1 = lang === 'en' 
          ? "Why no overflow? If liquid spilt over, it would constitute a perpetual motion machine of the first kind (violating the First Law of Thermodynamics)!"
          : "কেন উপচে পড়ে না? তরল উছলে পড়লে প্রথম শ্রেণির অবিনাশী চিরস্থায়ী যন্ত্র (Perpetual Motion) তৈরি হতো, যা তাপগতিবিদ্যার প্রথম সূত্রের সরাসরি লঙ্ঘন!";
        
        // Wrap text
        const words = msg1.split(' ');
        let line = '';
        let textY = cardY + 245;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > cardW - 36 && n > 0) {
            ctx.fillText(line, cardX + 18, textY);
            line = words[n] + ' ';
            textY += 14;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, cardX + 18, textY);

        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [state, lang, theoreticalH]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-sky-300 shadow-xl bg-white">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
