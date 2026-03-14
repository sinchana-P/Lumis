import React from "react";
import { getAstrologyDataForMember } from '@/data/mockAstrologyData';
import { NorthIndianKundli, type HouseData } from './NorthIndianKundli';

interface VedicChartCompleteProps {
  memberId?: string;
  size?: number;
  showControls?: boolean;
  showLegend?: boolean;
  interactive?: boolean;
  className?: string;
}

export const VedicChartComplete: React.FC<VedicChartCompleteProps> = ({
  memberId = 'default',
  size = 500,
  showLegend = true,
  className = ''
}) => {
  const astrologyData = getAstrologyDataForMember(memberId);
  const chartData = astrologyData.vedicChart;

  // Convert astrology data to Kundli format
  const houses: HouseData[] = [];
  
  for (let i = 1; i <= 12; i++) {
    const planets = chartData.houses[i]?.map(planet => ({
      id: planet.planet,
      label: planet.symbol
    })) || [];
    
    houses.push({
      houseNumber: i,
      houseName: i === 1 ? 'Asc' : i.toString(),
      planets
    });
  }

  return (
    <div className={`vedic-chart-complete ${className}`}>
      <div className="flex gap-6">
        {/* Chart */}
        <div className="relative">
          <NorthIndianKundli
            size={size}
            houses={houses}
          />
          
          {/* Ascendant Label */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              ASC: {chartData.ascendant.sign.split('(')[0]}
            </div>
          </div>
        </div>

        {/* Legend and Info Panel */}
        {showLegend && (
          <div className="flex-1 min-w-64">
            {/* Birth Data */}
            <div className="bg-amber-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-amber-800 mb-2">Birth Information</h3>
              <div className="text-sm space-y-1">
                <div>Date: {astrologyData.birthData.date}</div>
                <div>Time: {astrologyData.birthData.time}</div>
                <div>Place: {astrologyData.birthData.place}</div>
              </div>
            </div>

            {/* Planet Legend */}
            <div className="bg-lumis-surface p-4 rounded-lg">
              <h3 className="font-semibold text-lumis-text-primary mb-2">Planets</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {astrologyData.planetaryPositions.map(planet => (
                  <div key={planet.planet} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-lumis-accent-gold flex items-center justify-center text-lumis-text-inverse text-xs">
                      {planet.symbol}
                    </div>
                    <span className="text-lumis-text-secondary">{planet.planet.split('(')[0]} - House {planet.house}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VedicChartComplete;