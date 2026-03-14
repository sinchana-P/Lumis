'use client';

import { getAstrologyDataForMember } from '@/data/mockAstrologyData';
import { NorthIndianKundli } from '@/components/astrology';
import type { HouseData } from '@/components/astrology/NorthIndianKundli';

interface Member {
  id: string;
  fullName: string;
  nickname?: string;
  relationType: string;
  relationTypeCustom?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

interface MemberAstrologyTabProps {
  member: Member;
}

export function MemberAstrologyTab({ member }: MemberAstrologyTabProps) {
  const astrologyData = getAstrologyDataForMember(member.id);
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
    <div className="w-full max-w-none">
      {/* Main Layout - More Flowing Design */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Column - Birth Details & Essence */}
        <div className="col-span-3 space-y-8">
          
          {/* Birth Data - Minimal Card */}
          <div className="space-y-6">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-tertiary">
              Birth Data
            </h3>
            
            <div className="space-y-4 pl-4 border-l-2 border-accent-gold/30">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-tertiary mb-1">Date</p>
                <p className="font-serif text-base text-primary">{astrologyData.birthData.date}</p>
              </div>
              
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-tertiary mb-1">Time</p>
                <p className="font-serif text-base text-primary">{astrologyData.birthData.time}</p>
              </div>
              
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-tertiary mb-1">Place</p>
                <p className="font-serif text-base text-primary">{astrologyData.birthData.place}</p>
              </div>
            </div>
          </div>

          {/* Current Transits - Flowing List */}
          <div className="space-y-6">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-tertiary">
              Current Transits
            </h3>
            
            <div className="space-y-6">
              {astrologyData.currentTransits.map((transit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm text-accent-primary font-bold">{transit.symbol}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-base text-primary font-medium mb-2">{transit.aspect}</p>
                    <p className="font-serif text-sm text-secondary leading-relaxed">
                      {transit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column - Vedic Chart */}
        <div className="col-span-6 flex flex-col items-center justify-start space-y-8">
          
          {/* Vedic Chart - Clean Presentation */}
          <div className="text-center space-y-6">
            <div className="bg-surface/50 p-12 rounded-2xl border border-primary/20">
              <NorthIndianKundli
                size={420}
                houses={houses}
              />
            </div>
            
            {/* ASC Label */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-accent-gold/10 text-primary rounded-full font-serif text-base font-medium border border-accent-gold/20">
              <span className="text-accent-gold">✦</span>
              ASC: {chartData.ascendant.sign.split('(')[0]}
            </div>
          </div>
        </div>

        {/* Right Column - Janam Kundli */}
        <div className="col-span-3 flex flex-col justify-start">
          
          {/* Janam Kundli - Elegant Typography */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-primary italic">Janam Kundli</h2>
              <div className="w-16 h-px bg-accent-gold mx-auto"></div>
              <p className="font-serif text-sm text-secondary leading-relaxed italic max-w-xs mx-auto">
                The map of the heavens at the moment of your breath. A structural blueprint of your karmic journey.
              </p>
            </div>
            
            <button className="px-6 py-3 border border-primary/30 rounded-full font-mono text-xs uppercase tracking-widest text-primary hover:bg-surface/30 transition-all duration-300">
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Elemental Essence & Planetary Data */}
      <div className="grid grid-cols-12 gap-8 mt-16">
        
        {/* Elemental Essence - Reduced Width */}
        <div className="col-span-3 space-y-6">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-tertiary">
            Elemental Essence
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-serif text-sm text-primary">Fire</span>
                <span className="font-mono text-sm font-medium text-primary">45%</span>
              </div>
              <div className="w-full bg-tertiary rounded-full h-1.5">
                <div className="bg-accent-secondary h-1.5 rounded-full w-[45%]"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-serif text-sm text-primary">Water</span>
                <span className="font-mono text-sm font-medium text-primary">30%</span>
              </div>
              <div className="w-full bg-tertiary rounded-full h-1.5">
                <div className="bg-accent-ai h-1.5 rounded-full w-[30%]"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-serif text-sm text-primary">Air</span>
                <span className="font-mono text-sm font-medium text-primary">15%</span>
              </div>
              <div className="w-full bg-tertiary rounded-full h-1.5">
                <div className="bg-accent-ai h-1.5 rounded-full w-[15%]"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-serif text-sm text-primary">Earth</span>
                <span className="font-mono text-sm font-medium text-primary">10%</span>
              </div>
              <div className="w-full bg-tertiary rounded-full h-1.5">
                <div className="bg-accent-primary h-1.5 rounded-full w-[10%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Gap Column */}
        <div className="col-span-1"></div>

        {/* Planetary Alignment - Clean Table */}
        <div className="col-span-8 space-y-6">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-tertiary">
            Planetary Alignment
          </h3>
          
          <div className="space-y-1">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-6 pb-4 border-b border-primary/20">
              <div className="font-mono text-[9px] uppercase tracking-widest text-tertiary">Graha</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-tertiary">Rashi</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-tertiary">Nakshatra</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-tertiary">Degree</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-tertiary">Pada</div>
            </div>

            {/* Table Rows */}
            {astrologyData.planetaryPositions.map((planet, index) => (
              <div key={index} className="grid grid-cols-5 gap-6 py-3 hover:bg-surface/20 rounded-lg transition-colors duration-200">
                <div className="font-serif text-sm font-medium text-primary">{planet.planet.split('(')[0]}</div>
                <div className="font-serif text-sm text-secondary">{planet.sign.split('(')[0]}</div>
                <div className="font-serif text-sm text-secondary">{planet.nakshatra}</div>
                <div className="font-mono text-sm text-secondary">{planet.degree}° {planet.minutes}'</div>
                <div className="font-mono text-sm text-tertiary">{planet.pada}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Synthesized Insight - Elegant Bottom */}
      <div className="mt-20 space-y-8">
        <div className="text-center">
          <h3 className="font-serif text-xl text-primary mb-4">Synthesized Vedic Insight</h3>
          <div className="w-24 h-px bg-accent-gold mx-auto"></div>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6">
          {astrologyData.insights.map((insight, index) => (
            <p key={index} className="font-serif text-base text-primary leading-relaxed text-center">
              {insight}
            </p>
          ))}
          
          <div className="text-center pt-8 mt-8 border-t border-primary/20">
            <p className="font-serif text-sm text-secondary italic">
              "The stars do not compel, they incline. Your free will is the master that guides the ship through the tides of your karma."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}