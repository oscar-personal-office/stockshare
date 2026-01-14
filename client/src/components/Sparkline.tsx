import React from 'react';

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  color,
  width = 100,
  height = 40
}) => {
  if (!data || data.length === 0) {
    return <div style={{ width, height }} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={color}
        fillOpacity="0.1"
        stroke="none"
      />
    </svg>
  );
};

export default Sparkline;
