import { PhysicsState, LIQUID_PRESETS } from '../types';

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface ArrowOptions {
  lineWidth?: number;
  arrowHeadSize?: number;
  label?: string;
  textColor?: string;
  labelPlacement?: 'end' | 'start' | 'mid' | 'end-offset' | 'above' | 'below';
  labelOffsetX?: number;
  labelOffsetY?: number;
  boxBackground?: boolean;
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  options?: ArrowOptions | number,
  legacyArrowHeadSize?: number,
  legacyLabel?: string,
  legacyTextColor?: string
) {
  // Support both legacy positional arguments and options object
  let lineWidth = 3.5;
  let arrowHeadSize = 12;
  let label = '';
  let textColor = '#0f172a';
  let labelOffsetX = 0;
  let labelOffsetY = 0;
  let boxBackground = true;

  if (typeof options === 'object' && options !== null) {
    lineWidth = options.lineWidth ?? 3.5;
    arrowHeadSize = options.arrowHeadSize ?? 12;
    label = options.label ?? '';
    textColor = options.textColor ?? '#0f172a';
    labelOffsetX = options.labelOffsetX ?? 0;
    labelOffsetY = options.labelOffsetY ?? 0;
    boxBackground = options.boxBackground ?? true;
  } else if (typeof options === 'number') {
    lineWidth = options;
    arrowHeadSize = legacyArrowHeadSize ?? 12;
    label = legacyLabel ?? '';
    textColor = legacyTextColor ?? '#0f172a';
  }

  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  const len = Math.hypot(dx, dy);

  if (len < 3) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw arrow stem
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - arrowHeadSize * Math.cos(angle - Math.PI / 6),
    toY - arrowHeadSize * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - arrowHeadSize * Math.cos(angle + Math.PI / 6),
    toY - arrowHeadSize * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  // Draw badge label at toX + offset or specified position
  if (label) {
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    const textMetrics = ctx.measureText(label);
    const textW = textMetrics.width;
    const textH = 14;

    const badgeX = toX + labelOffsetX;
    const badgeY = toY + labelOffsetY;

    if (boxBackground) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(badgeX - 4, badgeY - textH + 1, textW + 8, textH + 4, 4);
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = textColor;
    ctx.fillText(label, badgeX, badgeY);
  }

  ctx.restore();
}

/**
 * Creates realistic fluid gradients based on liquid preset or custom params
 */
export function getFluidGradients(
  ctx: CanvasRenderingContext2D,
  topY: number,
  bottomY: number,
  state: PhysicsState
) {
  const preset = LIQUID_PRESETS.find(p => p.id === state.liquidId) || LIQUID_PRESETS[0];

  if (preset.id === 'mercury') {
    // Quicksilver metallic mirror finish
    const grad = ctx.createLinearGradient(0, topY, 0, bottomY);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.12, '#cbd5e1');
    grad.addColorStop(0.35, '#94a3b8');
    grad.addColorStop(0.65, '#475569');
    grad.addColorStop(1, '#1e293b');
    return { fill: grad, stroke: '#334155', specular: '#ffffff' };
  } else if (preset.id === 'glycerol') {
    // Amber syrupy
    const grad = ctx.createLinearGradient(0, topY, 0, bottomY);
    grad.addColorStop(0, 'rgba(254, 243, 199, 0.85)');
    grad.addColorStop(0.2, 'rgba(245, 158, 11, 0.75)');
    grad.addColorStop(0.8, 'rgba(217, 119, 6, 0.85)');
    grad.addColorStop(1, 'rgba(180, 83, 9, 0.95)');
    return { fill: grad, stroke: 'rgba(180, 83, 9, 1)', specular: 'rgba(255, 255, 255, 0.9)' };
  } else if (preset.id === 'ethanol') {
    // Highly transparent blue violet wash
    const grad = ctx.createLinearGradient(0, topY, 0, bottomY);
    grad.addColorStop(0, 'rgba(238, 242, 255, 0.6)');
    grad.addColorStop(0.3, 'rgba(199, 210, 254, 0.5)');
    grad.addColorStop(1, 'rgba(99, 102, 241, 0.65)');
    return { fill: grad, stroke: 'rgba(79, 70, 229, 0.9)', specular: 'rgba(255, 255, 255, 0.95)' };
  } else {
    // Pure Water / Custom Cyan-Blue
    const grad = ctx.createLinearGradient(0, topY, 0, bottomY);
    grad.addColorStop(0, 'rgba(224, 242, 254, 0.8)');
    grad.addColorStop(0.25, 'rgba(56, 189, 248, 0.7)');
    grad.addColorStop(0.7, 'rgba(14, 165, 233, 0.75)');
    grad.addColorStop(1, 'rgba(3, 105, 161, 0.85)');
    return { fill: grad, stroke: 'rgba(2, 132, 199, 1)', specular: 'rgba(255, 255, 255, 0.95)' };
  }
}
