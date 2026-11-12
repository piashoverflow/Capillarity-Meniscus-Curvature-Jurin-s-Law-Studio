import React, { useRef, useEffect } from 'react';
import { PhysicsState, SUBSTRATE_MATERIALS, LIQUID_PRESETS } from '../types';
import { Language } from '../translations';
import { drawArrow, getFluidGradients } from './canvasRenderUtils';

interface Module1ContactAngleCanvasProps {
  state: PhysicsState;
  lang: Language;
}

export const Module1ContactAngleCanvas: React.FC<Module1ContactAngleCanvasProps> = ({ state, lang }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

      // Background subtle scientific blueprint gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(0.5, '#f0f9ff');
      bgGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle metric grid lines
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const substrate = SUBSTRATE_MATERIALS.find(s => s.id === state.substrateId) || SUBSTRATE_MATERIALS[0];
      const preset = LIQUID_PRESETS.find(p => p.id === state.liquidId) || LIQUID_PRESETS[0];

      const viewMode = state.viewMode || 'split';
      const zoom = Math.max(1.0, Math.min(2.5, state.zoomScale || 1.25));

      const theta = state.contactAngle;
      const thetaRad = (theta * Math.PI) / 180;
      const fluidStyle = getFluidGradients(ctx, 100, height - 50, state);

      // ==============================================================
      // RENDER LOGIC BASED ON VIEW MODE
      // ==============================================================
      const showDrop = viewMode === 'split' || viewMode === 'drop-focus';
      const showPlate = viewMode === 'split' || viewMode === 'plate-focus';

      // Width and position allocations
      const dividerX = Math.round(width * 0.48);
      let dropAreaX = 0;
      let dropAreaW = dividerX;
      let plateAreaX = dividerX;
      let plateAreaW = width - dividerX;

      if (viewMode === 'plate-focus') {
        plateAreaX = 0;
        plateAreaW = width;
      } else if (viewMode === 'drop-focus') {
        dropAreaX = 0;
        dropAreaW = width;
      }

      // ==============================================================
      // EXHIBIT A: SESSILE DROPLET ON FLAT SUBSTRATE
      // ==============================================================
      if (showDrop) {
        const badgeX = dropAreaX + 16;
        const badgeW = dropAreaW - 32;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(badgeX, 12, badgeW, 28, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px Inter, system-ui, sans-serif';
        ctx.fillText(lang === 'bn' ? 'ক. কঠিন পৃষ্ঠে তরল ফোঁটা ও স্পর্শ কোণ (Sessile Drop Goniometer)' : 'A. Sessile Droplet & Contact Angle (Goniometer)', badgeX + 10, 31);
        ctx.restore();

        const dropBaseY = height * 0.70;
        const dropCenterX = dropAreaX + dropAreaW * 0.50;

        // Substrate base plate
        const subLeft = dropAreaX + 24;
        const subRight = dropAreaX + dropAreaW - 24;
        const subHeight = 28;

        ctx.fillStyle = substrate.color;
        ctx.fillRect(subLeft, dropBaseY, subRight - subLeft, subHeight);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(subLeft, dropBaseY, subRight - subLeft, subHeight);

        // Substrate material name text
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`${lang === 'bn' ? 'কঠিন পৃষ্ঠ: ' : 'Substrate: '}${lang === 'bn' ? substrate.nameBn : substrate.nameEn}`, subLeft + 12, dropBaseY + 18);

        // Physical droplet geometry (Spherical Cap):
        // At the contact point (P_x, dropBaseY), the angle inside the liquid
        // between the solid and the tangent to the liquid-gas interface is theta!
        const baseFootprint = Math.min(130, (dropAreaW - 60) * 0.35);
        let R_s: number;
        let y_c: number;
        let actualContactX: number;

        if (theta < 4) {
          R_s = 4000;
          y_c = dropBaseY + R_s - 3;
          actualContactX = dropCenterX + baseFootprint;
        } else if (theta <= 90) {
          R_s = baseFootprint / Math.sin(thetaRad);
          y_c = dropBaseY + R_s * Math.cos(thetaRad);
          actualContactX = dropCenterX + baseFootprint;
        } else {
          // bead shape for theta > 90
          const beadRadius = Math.min(85, (dropAreaW - 60) * 0.28);
          R_s = beadRadius;
          y_c = dropBaseY + R_s * Math.cos(thetaRad);
          actualContactX = dropCenterX + R_s * Math.sin(thetaRad);
        }

        // Draw Droplet
        ctx.save();
        ctx.beginPath();
        if (theta <= 90) {
          const startAngle = Math.PI * 1.5 - thetaRad;
          const endAngle = Math.PI * 1.5 + thetaRad;
          ctx.arc(dropCenterX, y_c, R_s, startAngle, endAngle, false);
          ctx.lineTo(actualContactX, dropBaseY);
          ctx.lineTo(dropCenterX - (actualContactX - dropCenterX), dropBaseY);
        } else {
          const contactAngleFromCenter = Math.PI * 0.5 - (thetaRad - Math.PI * 0.5);
          const startAng = contactAngleFromCenter;
          const endAng = Math.PI - contactAngleFromCenter;
          ctx.arc(dropCenterX, y_c, R_s, startAng, endAng, true);
          ctx.lineTo(dropCenterX - (actualContactX - dropCenterX), dropBaseY);
          ctx.lineTo(actualContactX, dropBaseY);
        }
        ctx.closePath();
        ctx.fillStyle = fluidStyle.fill;
        ctx.fill();
        ctx.strokeStyle = fluidStyle.stroke;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Specular highlight on drop
        ctx.beginPath();
        const dropTopY = y_c - R_s;
        ctx.ellipse(dropCenterX - 20, Math.max(dropTopY + 16, dropBaseY - 50), 16, 5, -Math.PI / 8, 0, Math.PI * 2);
        ctx.fillStyle = fluidStyle.specular;
        ctx.globalAlpha = 0.55;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();

        // Goniometer & Contact Angle
        if (state.showGoniometer) {
          const P_x = actualContactX;
          const P_y = dropBaseY;

          // 1. Horizontal solid baseline (dashed blue)
          ctx.save();
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(P_x - 110, P_y);
          ctx.lineTo(P_x + 50, P_y);
          ctx.stroke();
          ctx.restore();

          // 2. Tangent line at triple point P
          // Tangent to liquid surface:
          // Direction of tangent from P pointing away along liquid:
          // In standard physics, for a drop resting on solid:
          // The solid inside the liquid is directed to the LEFT (-X, direction angle = 180° = π).
          // The contact angle θ is measured from this solid baseline INTO the liquid up to the tangent line.
          // Therefore, tangent angle in standard coordinates = π - θ.
          // In Canvas (where Y is positive downwards):
          // Vector along tangent = ( cos(π - θ), -sin(π - θ) ) = ( -cos(θ), -sin(θ) ).
          // For θ = 138° (obtuse): cos(138°) < 0, so -cos(138°) > 0 (points rightwards!).
          // -sin(138°) < 0 (points upwards).
          // This exactly matches the curved bead surface pointing up-right into the air!
          const tangLen = 115;
          const tangDx = -Math.cos(thetaRad) * tangLen;
          const tangDy = -Math.sin(thetaRad) * tangLen;

          // Draw tangent line
          ctx.save();
          ctx.strokeStyle = '#ea580c'; // Vibrant Orange Tangent
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.moveTo(P_x - tangDx * 0.25, P_y - tangDy * 0.25);
          ctx.lineTo(P_x + tangDx * 1.15, P_y + tangDy * 1.15);
          ctx.stroke();

          // Triple-phase contact point marker
          ctx.beginPath();
          ctx.arc(P_x, P_y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ea580c';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // 3. Contact Angle Arc (θ) strictly inside the liquid (Upper Hemisphere y <= P_y)
          // Solid-liquid baseline inside the liquid points to the left (-X axis: angle π in canvas).
          // Liquid surface tangent at point P points upwards with angle 2π - thetaRad (in canvas: negative Y).
          // For theta = 138° (obtuse): 2π - 138° = 222°, which is in the upper right.
          // For theta = 45° (acute): 2π - 45° = 315° (or in upper left quadrant: π + (π - 45°) etc.)
          // Let's compute tangent canvas angle directly from tangDx, tangDy:
          // Notice tangDx = -cos(theta) * tangLen, tangDy = -sin(theta) * tangLen (pointing upwards!).
          const tangAngleInCanvas = Math.atan2(tangDy, tangDx); // between -π and 0 (upper hemisphere)
          const baselineAngleInCanvas = Math.PI; // -X axis pointing into liquid

          const arcR = 48;
          ctx.strokeStyle = '#059669'; // Emerald green
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          // Arc goes from tangent angle in upper hemisphere to the baseline π.
          // In canvas coordinates, sweeping counter-clockwise (anticlockwise: false) from tangAngleInCanvas to Math.PI:
          // Since tangAngleInCanvas is negative (e.g. -0.73 rad = -42° for 138° obtuse),
          // sweeping from tangAngleInCanvas to -π (with anticlockwise: true) stays STRICTLY in the upper hemisphere (y <= P_y)!
          ctx.arc(P_x, P_y, arcR, tangAngleInCanvas, -Math.PI, true);
          ctx.stroke();

          // Contact Angle Value Badge (placed inside the green arc sector above the substrate)
          // Middle angle in upper hemisphere:
          const midCanvasAngle = (tangAngleInCanvas + (-Math.PI)) / 2;
          const lblX = P_x + Math.cos(midCanvasAngle) * (arcR + 30);
          const lblY = P_y + Math.sin(midCanvasAngle) * (arcR + 30);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(lblX - 35, lblY - 14, 70, 22, 5);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 14px Inter, sans-serif';
          ctx.fillText(`θ = ${theta}°`, lblX - 25, lblY + 2);

          // Tangent label badge
          const tangLblX = P_x + tangDx * 1.15 + 8;
          const tangLblY = P_y + tangDy * 1.15;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(tangLblX - 4, tangLblY - 12, 115, 18, 4);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillStyle = '#c2410c';
          ctx.fillText(lang === 'bn' ? 'স্পর্শক (Tangent)' : 'Tangent line', tangLblX, tangLblY + 1);

          // Hydrophilic / Hydrophobic note
          ctx.font = 'bold 12px Inter, sans-serif';
          if (theta < 90) {
            ctx.fillStyle = '#047857';
            ctx.fillText(`✓ ${lang === 'bn' ? 'পৃষ্ঠভেজা (Hydrophilic): θ < ৯০°' : 'Hydrophilic / Wetting: θ < 90°'}`, subLeft, dropBaseY + 54);
            ctx.font = '11px Inter, sans-serif';
            ctx.fillStyle = '#334155';
            ctx.fillText(lang === 'bn' ? 'তরল কঠিন পৃষ্ঠে ছড়িয়ে পড়ে এবং ভেজায়।' : 'Liquid spreads across the solid substrate.', subLeft, dropBaseY + 70);
          } else {
            ctx.fillStyle = '#b45309';
            ctx.fillText(`✗ ${lang === 'bn' ? 'অভেজা (Hydrophobic): θ > ৯০°' : 'Hydrophobic / Non-Wetting: θ > 90°'}`, subLeft, dropBaseY + 54);
            ctx.font = '11px Inter, sans-serif';
            ctx.fillStyle = '#334155';
            ctx.fillText(lang === 'bn' ? 'তরল সংকুচিত হয়ে ফোঁটা তৈরি করে, কাচ ভেজায় না।' : 'Liquid beads up, minimizing solid contact.', subLeft, dropBaseY + 70);
          }
          ctx.restore();
        }
      }

      // Divider line in split view
      if (viewMode === 'split') {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dividerX, 15);
        ctx.lineTo(dividerX, height - 15);
        ctx.stroke();
        ctx.restore();
      }

      // ==============================================================
      // EXHIBIT B: IMMERSED VERTICAL SOLID PLATE & MOLECULAR VECTORS
      // (HIGH MAGNIFICATION, TANGENT-ALIGNED NET FORCE, PERFECT VISIBILITY)
      // ==============================================================
      if (showPlate) {
        const badgeX = plateAreaX + 16;
        const badgeW = plateAreaW - 32;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(badgeX, 12, badgeW, 28, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px Inter, system-ui, sans-serif';
        ctx.fillText(
          lang === 'bn'
            ? 'খ. নিমজ্জিত প্লেটে আণবিক আকর্ষণ বল ও বক্রতলের স্পর্শক সাম্যাবস্থা'
            : 'B. Immersed Plate & Molecular Vectors (Adhesion vs Cohesion)',
          badgeX + 10,
          31
        );
        ctx.restore();

        // In Plate-focus or Split mode with Zoom:
        // Position plate centrally in plateArea
        const plateW = Math.round(22 * zoom);
        const plateCenterX = plateAreaX + plateAreaW * 0.44;
        const plateLeftFaceX = plateCenterX - plateW / 2;
        const plateRightFaceX = plateCenterX + plateW / 2;

        const bulkLeft = plateAreaX + 24;
        const bulkRight = plateAreaX + plateAreaW - 24;
        const bulkBottom = height - 38;
        const liquidLevelY = height * 0.58;

        // Physical Meniscus Height at the plate wall:
        // h_meniscus = h_0 * cos(theta) * zoom
        // If theta < 90: h_meniscus > 0 (climbs, contactY is ABOVE liquidLevelY)
        // If theta > 90: h_meniscus < 0 (depresses, contactY is BELOW liquidLevelY)
        const baseMeniscusH = 55 * zoom;
        const meniscusDeltaY = baseMeniscusH * Math.cos(thetaRad);
        const contactY = liquidLevelY - meniscusDeltaY;

        // Meniscus horizontal spread width
        const spreadW = Math.min(plateLeftFaceX - bulkLeft - 20, 85 * zoom);

        // Fill bulk liquid
        ctx.save();
        ctx.fillStyle = fluidStyle.fill;

        // 1. Fluid on left of plate
        ctx.beginPath();
        ctx.moveTo(bulkLeft, liquidLevelY);
        ctx.lineTo(plateLeftFaceX - spreadW, liquidLevelY);
        // Meniscus curve curving smoothly from horizontal level to contact point on plate
        ctx.bezierCurveTo(
          plateLeftFaceX - spreadW * 0.45,
          liquidLevelY,
          plateLeftFaceX - 4,
          contactY + (liquidLevelY - contactY) * 0.15,
          plateLeftFaceX,
          contactY
        );
        ctx.lineTo(plateLeftFaceX, bulkBottom);
        ctx.lineTo(bulkLeft, bulkBottom);
        ctx.closePath();
        ctx.fill();

        // 2. Fluid on right of plate
        ctx.beginPath();
        ctx.moveTo(plateRightFaceX, contactY);
        ctx.bezierCurveTo(
          plateRightFaceX + 4,
          contactY + (liquidLevelY - contactY) * 0.15,
          plateRightFaceX + spreadW * 0.45,
          liquidLevelY,
          plateRightFaceX + spreadW,
          liquidLevelY
        );
        ctx.lineTo(bulkRight, liquidLevelY);
        ctx.lineTo(bulkRight, bulkBottom);
        ctx.lineTo(plateRightFaceX, bulkBottom);
        ctx.closePath();
        ctx.fill();

        // Meniscus free surface boundary curves
        ctx.strokeStyle = fluidStyle.stroke;
        ctx.lineWidth = 3;

        // Left surface
        ctx.beginPath();
        ctx.moveTo(bulkLeft, liquidLevelY);
        ctx.lineTo(plateLeftFaceX - spreadW, liquidLevelY);
        ctx.bezierCurveTo(
          plateLeftFaceX - spreadW * 0.45,
          liquidLevelY,
          plateLeftFaceX - 4,
          contactY + (liquidLevelY - contactY) * 0.15,
          plateLeftFaceX,
          contactY
        );
        ctx.stroke();

        // Right surface
        ctx.beginPath();
        ctx.moveTo(plateRightFaceX, contactY);
        ctx.bezierCurveTo(
          plateRightFaceX + 4,
          contactY + (liquidLevelY - contactY) * 0.15,
          plateRightFaceX + spreadW * 0.45,
          liquidLevelY,
          plateRightFaceX + spreadW,
          liquidLevelY
        );
        ctx.lineTo(bulkRight, liquidLevelY);
        ctx.stroke();

        // Horizontal baseline reference (dashed blue)
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bulkLeft, liquidLevelY);
        ctx.lineTo(bulkRight, liquidLevelY);
        ctx.stroke();
        ctx.restore();

        // Draw Solid Vertical Glass Plate
        ctx.fillStyle = substrate.color;
        ctx.fillRect(plateLeftFaceX, 55, plateW, bulkBottom - 40);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(plateLeftFaceX, 55, plateW, bulkBottom - 40);

        // Plate vertical label
        ctx.save();
        ctx.translate(plateCenterX + 4, 110);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(lang === 'bn' ? 'কঠিন দেওয়াল' : 'SOLID PLATE', 0, 0);
        ctx.restore();

        // Lattice molecules on plate wall
        ctx.fillStyle = '#64748b';
        for (let y = 65; y < bulkBottom - 40; y += 14) {
          ctx.beginPath();
          ctx.arc(plateLeftFaceX, y, 2.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(plateRightFaceX, y, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Molecular particles in bulk
        if (state.showMolecularParticles) {
          for (let i = 0; i < 28; i++) {
            const px = plateLeftFaceX - 20 - ((i * 19 + time * 14) % (plateLeftFaceX - bulkLeft - 40));
            const py = liquidLevelY + 12 + ((i * 23 + time * 6) % (bulkBottom - liquidLevelY - 25));
            ctx.beginPath();
            ctx.arc(px, py, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = preset.id === 'mercury' ? '#94a3b8' : 'rgba(14, 165, 233, 0.75)';
            ctx.fill();
          }
        }

        // ==============================================================
        // MOLECULAR FORCE VECTORS AT TRIPLE JUNCTION P
        // (CRUCIAL FIX: POINT P ON SURFACE, ZERO CLIPPING, PROPER TANGENT)
        // ==============================================================
        if (state.showForceVectors) {
          // The exact contact point P where liquid, solid, and gas meet
          const P_x = plateLeftFaceX;
          const P_y = contactY;

          // 1. Triple-point P marker: prominent glowing red point
          ctx.beginPath();
          ctx.arc(P_x, P_y, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // P label badge with clear offset so it NEVER gets cut off or covered
          // Place P badge to the top-left of point P
          const pBadgeX = P_x - 38;
          const pBadgeY = P_y - 28;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(pBadgeX, pBadgeY, 30, 20, 5);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#b91c1c';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillText('P', pBadgeX + 10, pBadgeY + 14);

          // Vector scale based on zoom
          const vScale = zoom;

          // 2. Adhesive Force F_adh:
          // Exerted by solid molecules pulling perpendicular into the solid wall (+X direction).
          const adhLen = Math.max(40, (state.adhesionForce / 100) * 90 * vScale);
          const adhEndX = P_x + adhLen;
          const adhEndY = P_y;

          drawArrow(ctx, P_x, P_y, adhEndX, adhEndY, '#10b981', {
            lineWidth: 3.8,
            arrowHeadSize: 12,
            label: lang === 'bn' ? 'F_adh (আসক্তি)' : 'F_adh (Adhesion)',
            textColor: '#065f46',
            labelOffsetX: 12,
            labelOffsetY: -6,
            boxBackground: true
          });

          // 3. Cohesive Force F_coh:
          // Pulling molecule P into bulk liquid at 45° angle downwards-left (135° = 3π/4).
          const cohLen = Math.max(40, (state.cohesionForce / 100) * 90 * vScale);
          const cohAng = Math.PI * 0.75; // 135 deg into bulk
          const cohEndX = P_x + Math.cos(cohAng) * cohLen;
          const cohEndY = P_y + Math.sin(cohAng) * cohLen;

          drawArrow(ctx, P_x, P_y, cohEndX, cohEndY, '#2563eb', {
            lineWidth: 3.8,
            arrowHeadSize: 12,
            label: lang === 'bn' ? 'F_coh (সংশক্তি)' : 'F_coh (Cohesion)',
            textColor: '#1e40af',
            labelOffsetX: -125,
            labelOffsetY: 12,
            boxBackground: true
          });

          // 4. Resultant Force F_res = F_adh + F_coh
          const resEndX = adhEndX + (cohEndX - P_x);
          const resEndY = P_y + (cohEndY - P_y);

          // Parallelogram dashed helper lines
          ctx.save();
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(adhEndX, adhEndY);
          ctx.lineTo(resEndX, resEndY);
          ctx.moveTo(cohEndX, cohEndY);
          ctx.lineTo(resEndX, resEndY);
          ctx.stroke();
          ctx.restore();

          // Draw Resultant Vector F_res
          const resOffsetX = resEndX >= P_x ? 12 : -125;
          const resOffsetY = resEndY >= P_y ? 24 : -12;

          drawArrow(ctx, P_x, P_y, resEndX, resEndY, '#dc2626', {
            lineWidth: 4.2,
            arrowHeadSize: 14,
            label: lang === 'bn' ? 'F_res (লব্ধি বল)' : 'F_res (Net Force)',
            textColor: '#991b1b',
            labelOffsetX: resOffsetX,
            labelOffsetY: resOffsetY,
            boxBackground: true
          });

          // 5. Curved Liquid Surface Tangent (User: "net force ke curved liquid er tangent borabor daw")
          // In physical fluid statics:
          // The free liquid surface must align PERPENDICULAR to the resultant net force (or parallel to surface stress).
          // Let's compute the tangent to the actual curved liquid surface right at P:
          const resDx = resEndX - P_x;
          const resDy = resEndY - P_y;
          const resHypot = Math.hypot(resDx, resDy);

          if (resHypot > 8) {
            // Unit vector perpendicular to F_res pointing along the liquid surface:
            // Tangent along surface: ( -resDy/resHypot, resDx/resHypot )
            const tangUnitX = -resDy / resHypot;
            const tangUnitY = resDx / resHypot;
            const tangVisualLen = 65 * vScale;

            const tEndX = P_x + tangUnitX * tangVisualLen;
            const tEndY = P_y + tangUnitY * tangVisualLen;

            // Draw Tangent line along curved surface
            ctx.save();
            ctx.strokeStyle = '#d97706'; // Amber tangent line
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(P_x, P_y);
            ctx.lineTo(tEndX, tEndY);
            ctx.stroke();

            // Right-angle symbol showing liquid surface is perpendicular to F_res
            const sq = 12;
            const normX = resDx / resHypot;
            const normY = resDy / resHypot;

            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 1.6;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(P_x + tangUnitX * sq, P_y + tangUnitY * sq);
            ctx.lineTo(P_x + tangUnitX * sq + normX * sq, P_y + tangUnitY * sq + normY * sq);
            ctx.lineTo(P_x + normX * sq, P_y + normY * sq);
            ctx.stroke();

            // Distinct badge for Surface Tangent
            const calloutX = Math.max(bulkLeft + 10, tEndX - 80);
            const calloutY = tEndY + 22;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.roundRect(calloutX, calloutY - 14, 155, 22, 5);
            ctx.fill();
            ctx.stroke();

            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillStyle = '#b45309';
            ctx.fillText(lang === 'bn' ? 'বক্রতলের স্পর্শক (⊥ F_res)' : 'Meniscus Tangent (⊥ F_res)', calloutX + 8, calloutY + 2);
            ctx.restore();
          }
        }
      }

      // ==============================================================
      // BOTTOM DIAGNOSTIC STATUS (CLEAR, LEGIBLE)
      // ==============================================================
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(16, height - 32, width - 32, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '600 12px Inter, sans-serif';
      const condText = state.contactAngle < 90
        ? (lang === 'bn' 
            ? '● F_adh > F_coh / √২ : লব্ধি বল F_res কাচের ভেতরে থাকে। তরল পৃষ্ঠ F_res এর সাথে ৯০° লম্ব থাকতে উপরে উঠে অবতল (Concave) মেনিস্কাস গঠন করে।'
            : '● F_adh > F_coh / √2 : Resultant F_res directs into the solid. Liquid climbs to keep its surface perpendicular to F_res (Concave meniscus).')
        : (lang === 'bn'
            ? '● F_adh < F_coh / √২ : লব্ধি বল F_res তরলের দিকে থাকে। তরল পৃষ্ঠ F_res এর সাথে লম্ব থাকতে নিচে নেমে উত্তল (Convex) মেনিস্কাস গঠন করে।'
            : '● F_adh < F_coh / √2 : Resultant F_res directs into the liquid. Liquid depresses to remain perpendicular to F_res (Convex meniscus).');

      ctx.fillText(condText, 24, height - 16);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [state, lang]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-sky-300 shadow-xl bg-white">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
