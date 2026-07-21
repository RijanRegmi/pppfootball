'use client';

import { motion } from 'framer-motion';

interface RadarChartProps {
  data: Record<string, number>;
  secondaryData?: Record<string, number>;
  size?: number;
  color?: 'green' | 'blue';
  secondaryColor?: 'green' | 'blue' | 'carbon';
  isDashed?: boolean;
  hideGrid?: boolean;
  hideLabels?: boolean;
}

export default function RadarChart({
  data,
  secondaryData,
  size = 240,
  color = 'green',
  secondaryColor = 'carbon',
  isDashed = false,
  hideGrid = false,
  hideLabels = false,
}: RadarChartProps) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const numAxes = keys.length;
  const center = size / 2;
  const radius = (size / 2) - 32;

  if (numAxes === 0) return null;

  const getPoint = (index: number, scale: number = 1) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    return {
      x: center + radius * scale * Math.cos(angle),
      y: center + radius * scale * Math.sin(angle),
    };
  };

  // Primary data polygon points
  const dataPolygon = values
    .map((val, i) => {
      const norm = Math.min(100, Math.max(0, val)) / 100;
      const pt = getPoint(i, norm);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  // Secondary data polygon points
  let secondaryPolygon = '';
  let secondaryPointCoords: { x: number; y: number }[] = [];
  if (secondaryData) {
    const actualSecondaryValues = keys.map(k => secondaryData[k] || 0);
    secondaryPointCoords = actualSecondaryValues.map((val, i) => {
      const norm = Math.min(100, Math.max(0, val)) / 100;
      return getPoint(i, norm);
    });

    secondaryPolygon = secondaryPointCoords
      .map(pt => `${pt.x},${pt.y}`)
      .join(' ');
  }

  const gradientId = `radar-gradient-${color}`;
  const glowId = `radar-glow-${color}`;

  const colors = {
    green: {
      stroke: '#10b981',
      fill1: 'rgba(16, 185, 129, 0.35)',
      fill2: 'rgba(16, 185, 129, 0.05)',
      dot: '#10b981',
      glow: 'rgba(16, 185, 129, 0.6)',
    },
    blue: {
      stroke: '#3b82f6',
      fill1: 'rgba(59, 130, 246, 0.35)',
      fill2: 'rgba(59, 130, 246, 0.05)',
      dot: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.6)',
    },
    carbon: {
      stroke: '#94a3b8',
      fill1: 'rgba(148, 163, 184, 0.25)',
      fill2: 'rgba(148, 163, 184, 0.05)',
      dot: '#94a3b8',
      glow: 'rgba(148, 163, 184, 0.4)',
    },
  };

  const c = colors[color];
  const cSec = colors[secondaryColor];
  const secondaryGradientId = `radar-gradient-sec-${secondaryColor}`;

  return (
    <div className="flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={c.fill1} />
            <stop offset="100%" stopColor={c.fill2} />
          </radialGradient>
          <radialGradient id={secondaryGradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={cSec.fill1} />
            <stop offset="100%" stopColor={cSec.fill2} />
          </radialGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background rings & axis lines */}
        <motion.g animate={{ opacity: hideGrid ? 0 : 1 }} transition={{ duration: 0.5 }}>
          {[0.25, 0.5, 0.75, 1].map((level, idx) => (
            <polygon
              key={idx}
              points={keys
                .map((_, i) => {
                  const pt = getPoint(i, level);
                  return `${pt.x},${pt.y}`;
                })
                .join(' ')}
              fill="none"
              className="stroke-carbon-200 dark:stroke-carbon-800"
              strokeWidth="1"
              opacity={idx === 3 ? 0.8 : 0.4}
            />
          ))}

          {keys.map((_, i) => {
            const pt = getPoint(i, 1);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={pt.x}
                y2={pt.y}
                className="stroke-carbon-200 dark:stroke-carbon-800"
                strokeWidth="1"
                opacity="0.5"
              />
            );
          })}
        </motion.g>

        {/* Secondary Data polygon (Dashed Line if provided) */}
        {secondaryData && (
          <motion.polygon
            points={secondaryPolygon}
            fill={`url(#${secondaryGradientId})`}
            stroke={cSec.stroke}
            strokeWidth="2.5"
            strokeDasharray="5 5"
            filter={`url(#radar-glow-${secondaryColor})`}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              points: secondaryPolygon,
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${center}px ${center}px` }}
          />
        )}

        {/* Primary Data polygon (Solid or Dashed Line) */}
        <motion.polygon
          points={dataPolygon}
          fill={`url(#${gradientId})`}
          stroke={c.stroke}
          strokeWidth="2.5"
          strokeDasharray={isDashed ? '5 5' : 'none'}
          filter={`url(#${glowId})`}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1, points: dataPolygon }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Secondary data dots */}
        {secondaryData && secondaryPointCoords.map((pt, i) => (
          <motion.circle
            key={`sec-dot-${i}`}
            cx={pt.x}
            cy={pt.y}
            r="3.5"
            fill={cSec.dot}
            className="stroke-white dark:stroke-carbon-900"
            strokeWidth="1.5"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.9,
              cx: pt.x,
              cy: pt.y,
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}

        {/* Primary data dots & labels */}
        {keys.map((key, i) => {
          const val = values[i];
          const norm = Math.min(100, Math.max(0, val)) / 100;
          const dataPt = getPoint(i, norm);
          const labelPt = getPoint(i, 1.22);

          return (
            <g key={i}>
              {/* Dot */}
              <motion.circle
                cx={dataPt.x}
                cy={dataPt.y}
                r="4"
                fill={c.dot}
                className="stroke-white dark:stroke-carbon-900"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1, cx: dataPt.x, cy: dataPt.y }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Label */}
              {!hideLabels && (
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[9px] font-bold fill-carbon-500 dark:fill-carbon-400 uppercase"
                >
                  {key}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
