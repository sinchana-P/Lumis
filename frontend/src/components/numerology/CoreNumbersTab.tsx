'use client';

interface CoreNumber {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  traits: string[];
  type: 'lifePath' | 'expression' | 'soulUrge' | 'personality' | 'destiny';
}

interface NumerologyData {
  name: string;
  coreNumbers: CoreNumber[];
}

interface CoreNumbersTabProps {
  data: NumerologyData;
}

const getNumberColor = (type: string) => {
  const colors = {
    lifePath: 'text-accent-primary',
    expression: 'text-accent-secondary', 
    soulUrge: 'text-accent-ai',
    personality: 'text-accent-gold',
    destiny: 'text-accent-primary'
  };
  return colors[type as keyof typeof colors] || 'text-accent-primary';
};

const getCardBorder = (type: string) => {
  const borders = {
    lifePath: 'border-l-accent-primary',
    expression: 'border-l-accent-secondary',
    soulUrge: 'border-l-accent-ai', 
    personality: 'border-l-accent-gold',
    destiny: 'border-l-accent-primary'
  };
  return borders[type as keyof typeof borders] || 'border-l-accent-primary';
};

export function CoreNumbersTab({ data }: CoreNumbersTabProps) {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="max-w-3xl">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-tertiary mb-4">
          Core Numbers
        </div>
        <h2 className="text-2xl font-serif italic text-secondary leading-relaxed">
          The permanent blueprint — calculated from name and date of birth
        </h2>
      </div>

      {/* Core Numbers Grid */}
      <div className="space-y-6">
        {data.coreNumbers.map((coreNumber, index) => (
          <div 
            key={coreNumber.id}
            className={`bg-surface-elevated border border-primary rounded-2xl p-8 border-l-4 ${getCardBorder(coreNumber.type)} hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-start gap-8">
              {/* Number Display */}
              <div className="flex-shrink-0">
                <div className={`text-7xl font-display font-light ${getNumberColor(coreNumber.type)} mb-2`}>
                  {coreNumber.number}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-tertiary">
                  {coreNumber.type.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-medium text-primary mb-2">
                      {coreNumber.title}
                    </h3>
                    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-secondary">
                      <span>Independent</span>
                      <span>•</span>
                      <span>Driven</span>
                      <span>•</span>
                      <span>Original</span>
                    </div>
                  </div>
                  <div className={`text-4xl font-display font-light ${getNumberColor(coreNumber.type)}`}>
                    {index + 1}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-tertiary mb-3">
                    {coreNumber.subtitle}
                  </div>
                  <p className="font-serif text-lg leading-relaxed text-secondary">
                    {coreNumber.description}
                  </p>
                </div>

                {/* Traits */}
                {coreNumber.traits.length > 0 && (
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-tertiary mb-3">
                      Key Traits
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {coreNumber.traits.map((trait, traitIndex) => (
                        <span 
                          key={traitIndex}
                          className="px-3 py-1 bg-accent-primary/10 text-accent-primary border border-accent-primary/20 rounded-full font-mono text-[10px] uppercase tracking-wider"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insight Footer */}
      <div className="bg-primary/5 border border-primary/10 p-8 rounded-2xl mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif text-lg leading-relaxed text-secondary italic">
            "Your core numbers reveal the fundamental energies that shape your soul's journey. 
            These permanent influences form the foundation of who you are meant to become."
          </p>
        </div>
      </div>
    </div>
  );
}