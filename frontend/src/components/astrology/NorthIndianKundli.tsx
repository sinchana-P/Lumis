import React from "react";

type Planet = {
  id: string;
  label: string;
};

export type HouseData = {
  houseNumber: number;
  houseName?: string;
  planets?: Planet[];
};

export interface NorthIndianKundliProps {
  size?: number;
  houses: HouseData[];
  strokeColor?: string;
  textColor?: string;
}

type Point = { x: number; y: number };

function centroid(points: Point[]): Point {
  const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  return { x, y };
}

export const NorthIndianKundli: React.FC<NorthIndianKundliProps> = ({
  size = 500,
  houses,
  strokeColor = "currentColor",
  textColor = "currentColor",
}) => {
  const mid = size / 2;
  const top = { x: mid, y: 0 };
  const right = { x: size, y: mid };
  const bottom = { x: mid, y: size };
  const left = { x: 0, y: mid };
  const center = { x: mid, y: mid };
  const tl = { x: 0, y: 0 };
  const tr = { x: size, y: 0 };
  const bl = { x: 0, y: size };
  const br = { x: size, y: size };

  // 12 House polygons for North Indian Vedic chart
  const housePolygons: Record<number, Point[]> = {
    1: [top, right, bottom, left], // Center diamond
    2: [tl, top, center],
    3: [tl, left, center],
    4: [left, bl, center],
    5: [bl, bottom, center],
    6: [bottom, br, center],
    7: [right, br, center],
    8: [tr, right, center],
    9: [tr, top, center],
    10: [right, bottom, center],
    11: [top, tr, center],
    12: [tl, center, top],
  };

  const houseMap = Object.fromEntries(houses.map((h) => [h.houseNumber, h]));

  return (
    <div className="flex justify-center">
      <div className="text-lumis-text-primary">
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
          className="border border-lumis-text-tertiary/30 rounded-lg bg-lumis-bg-primary"
        >
        {/* Outer square */}
        <rect
          x="0"
          y="0"
          width={size}
          height={size}
          fill="currentColor"
          fillOpacity="0.02"
          stroke={strokeColor}
          strokeWidth="2"
        />

        {/* Diamond */}
        <polygon
          points={`${mid},0 ${size},${mid} ${mid},${size} 0,${mid}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
        />

        {/* Diagonal connectors */}
        <line x1={0} y1={0} x2={mid} y2={mid} stroke={strokeColor} strokeWidth="1" />
        <line x1={size} y1={0} x2={mid} y2={mid} stroke={strokeColor} strokeWidth="1" />
        <line x1={0} y1={size} x2={mid} y2={mid} stroke={strokeColor} strokeWidth="1" />
        <line x1={size} y1={size} x2={mid} y2={mid} stroke={strokeColor} strokeWidth="1" />

        {/* Houses */}
        {Object.entries(housePolygons).map(([houseNum, points]) => {
          const centroidPoint = centroid(points);
          const house = houseMap[Number(houseNum)];
          
          return (
            <g key={houseNum}>
              <text
                x={centroidPoint.x}
                y={centroidPoint.y - 5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                fontSize="16"
                fontWeight="600"
              >
                {house?.houseName ?? houseNum}
              </text>
              {house?.planets?.map((planet, i) => (
                <text
                  key={planet.id}
                  x={centroidPoint.x}
                  y={centroidPoint.y + 15 + i * 16}
                  textAnchor="middle"
                  fill="currentColor"
                  fillOpacity="0.8"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {planet.label}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
      </div>
    </div>
  );
};

export default NorthIndianKundli;