'use client';

interface TimingNumber {
  id: string;
  number: number;
  title: string;
  period: string;
  description: string;
  influence: string;
  year?: number;
}

interface NumerologyData {
  name: string;
  timingNumbers: TimingNumber[];
}

interface TimingNumbersTabProps {
  data: NumerologyData;
}

const getCurrentYear = () => new Date().getFullYear();

const getTimingColor = (year?: number) => {
  const currentYear = getCurrentYear();
  if (!year) return 'text-tertiary';
  
  if (year === currentYear) return 'text-accent-gold';
  if (year === currentYear + 1) return 'text-accent-primary';
  if (year > currentYear) return 'text-accent-secondary';
  return 'text-tertiary';
};

const getTimingBorder = (year?: number) => {
  const currentYear = getCurrentYear();
  if (!year) return 'border-l-tertiary';
  
  if (year === currentYear) return 'border-l-accent-gold';
  if (year === currentYear + 1) return 'border-l-accent-primary';
  if (year > currentYear) return 'border-l-accent-secondary';
  return 'border-l-tertiary';
};

const getTimingBackground = (year?: number) => {
  const currentYear = getCurrentYear();
  if (!year) return 'bg-surface-elevated';
  
  if (year === currentYear) return 'bg-accent-gold/5';
  if (year === currentYear + 1) return 'bg-accent-primary/5';
  return 'bg-surface-elevated';
};

export function TimingNumbersTab({ data }: TimingNumbersTabProps) {
  const currentYear = getCurrentYear();
  
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="max-w-3xl">
        <div className="font-mono text-xs uppercase tracking-widest text-tertiary mb-4">
          Timing Numbers
        </div>
        <h2 className="text-2xl font-serif italic text-secondary leading-relaxed">
          The cyclical influences — energies that shift and evolve through time
        </h2>
      </div>

      {/* Current Year Highlight */}
      <div className="bg-accent-gold/10 border border-accent-gold/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <div className="font-mono text-xs uppercase tracking-widest text-accent-gold font-bold">
            Current Year Energy: {currentYear}
          </div>
        </div>
        <p className="font-serif text-secondary leading-relaxed">
          This year brings the energy of manifestation and new beginnings. Focus on laying foundations for long-term goals.
        </p>
      </div>

      {/* Timing Numbers Timeline */}
      <div className="space-y-4">
        {data.timingNumbers.map((timingNumber) => (
          <div 
            key={timingNumber.id}
            className={`${getTimingBackground(timingNumber.year)} border border-primary rounded-2xl p-6 border-l-4 ${getTimingBorder(timingNumber.year)} hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-start gap-6">
              {/* Number & Year */}
              <div className="flex-shrink-0 text-center">
                <div className={`text-5xl font-display font-light ${getTimingColor(timingNumber.year)} mb-2`}>
                  {timingNumber.number}
                </div>
                {timingNumber.year && (
                  <div className="font-mono text-xs uppercase tracking-widest text-tertiary">
                    {timingNumber.year}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-serif font-medium text-primary mb-1">
                      {timingNumber.title}
                    </h3>
                    <div className="font-mono text-xs uppercase tracking-widest text-accent-secondary">
                      {timingNumber.period}
                    </div>
                  </div>
                  
                  {timingNumber.year === currentYear && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-accent-gold/20 text-accent-gold border border-accent-gold/30 rounded-full">
                      <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse"></div>
                      <span className="font-mono text-xs uppercase tracking-wider font-bold">Active</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="font-mono text-xs uppercase tracking-widest text-tertiary mb-2">
                    Primary Influence
                  </div>
                  <p className="font-serif text-lg leading-relaxed text-secondary">
                    {timingNumber.description}
                  </p>
                </div>

                <div>
                  <div className="font-mono text-xs uppercase tracking-widest text-tertiary mb-2">
                    Guidance
                  </div>
                  <p className="font-serif text-secondary leading-relaxed">
                    {timingNumber.influence}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Legend */}
      <div className="flex items-center justify-center gap-8 pt-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent-gold rounded-full"></div>
          <span className="font-mono text-xs uppercase tracking-wider text-tertiary">Current Year</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent-primary rounded-full"></div>
          <span className="font-mono text-xs uppercase tracking-wider text-tertiary">Next Year</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent-secondary rounded-full"></div>
          <span className="font-mono text-xs uppercase tracking-wider text-tertiary">Future Years</span>
        </div>
      </div>

      {/* Insight Footer */}
      <div className="bg-primary/5 border border-primary/10 p-8 rounded-2xl mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif text-lg leading-relaxed text-secondary italic">
            "Time moves in cycles, and each year brings its own unique energy and opportunities. 
            Understanding these rhythms helps you align with the natural flow of your life's journey."
          </p>
        </div>
      </div>
    </div>
  );
}