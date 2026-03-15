'use client';

interface CompatibilityData {
  overallScore: number;
  lifePath: { score: number; description: string };
  expression: { score: number; description: string };
  soulUrge: { score: number; description: string };
}

interface NumerologyData {
  name: string;
  compatibility: CompatibilityData;
}

interface CompatibilityTabProps {
  data: NumerologyData;
}

const getCompatibilityColor = (score: number) => {
  if (score >= 80) return 'text-accent-primary';
  if (score >= 60) return 'text-accent-gold';
  if (score >= 40) return 'text-accent-secondary';
  return 'text-tertiary';
};

const getCompatibilityBg = (score: number) => {
  if (score >= 80) return 'bg-accent-primary/10';
  if (score >= 60) return 'bg-accent-gold/10';
  if (score >= 40) return 'bg-accent-secondary/10';
  return 'bg-tertiary/10';
};

const getCompatibilityBorder = (score: number) => {
  if (score >= 80) return 'border-accent-primary/20';
  if (score >= 60) return 'border-accent-gold/20';
  if (score >= 40) return 'border-accent-secondary/20';
  return 'border-tertiary/20';
};

const getCompatibilityLabel = (score: number) => {
  if (score >= 80) return 'Harmonious';
  if (score >= 60) return 'Complementary';
  if (score >= 40) return 'Challenging';
  return 'Complex';
};

export function CompatibilityTab({ data }: CompatibilityTabProps) {
  const compatibilityAreas = [
    {
      id: 'lifePath',
      title: 'Life Path Harmony',
      subtitle: 'Core life direction alignment',
      data: data.compatibility.lifePath,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      id: 'expression',
      title: 'Expression Resonance',
      subtitle: 'How you both show up in the world',
      data: data.compatibility.expression,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      id: 'soulUrge',
      title: 'Soul Urge Connection',
      subtitle: 'Deep desires and motivations',
      data: data.compatibility.soulUrge,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="max-w-3xl">
        <div className="font-mono text-xs uppercase tracking-widest text-tertiary mb-4">
          Compatibility Analysis
        </div>
        <h2 className="text-2xl font-serif italic text-secondary leading-relaxed">
          The energetic resonance between your numerological blueprints
        </h2>
      </div>

      {/* Overall Compatibility Score */}
      <div className="bg-surface-elevated border border-primary rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-medium">
            Overall Compatibility
          </h3>
        </div>
        
        <div className={`text-8xl font-display font-light mb-4 ${getCompatibilityColor(data.compatibility.overallScore)}`}>
          {data.compatibility.overallScore}%
        </div>
        
        <div className="font-mono text-xs uppercase tracking-widest text-tertiary mb-6">
          {getCompatibilityLabel(data.compatibility.overallScore)} Connection
        </div>
        
        <p className="font-serif text-lg leading-relaxed text-secondary max-w-2xl mx-auto">
          Your numerological profiles create a {getCompatibilityLabel(data.compatibility.overallScore).toLowerCase()} energetic 
          resonance, indicating {data.compatibility.overallScore >= 70 ? 'strong potential for mutual growth and understanding' : 
          data.compatibility.overallScore >= 50 ? 'opportunities for learning and balance through differences' : 
          'significant growth potential through navigating contrasts'}.
        </p>
      </div>

      {/* Compatibility Breakdown */}
      <div className="space-y-6">
        {compatibilityAreas.map((area) => (
          <div 
            key={area.id}
            className={`${getCompatibilityBg(area.data.score)} border ${getCompatibilityBorder(area.data.score)} rounded-2xl p-8 hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-start gap-6">
              {/* Score Display */}
              <div className="flex-shrink-0 text-center">
                <div className={`text-5xl font-display font-light ${getCompatibilityColor(area.data.score)} mb-2`}>
                  {area.data.score}%
                </div>
                <div className="font-mono text-xs uppercase tracking-widest text-tertiary">
                  {getCompatibilityLabel(area.data.score)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${getCompatibilityColor(area.data.score)}`}>
                    {area.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-medium text-primary">
                      {area.title}
                    </h3>
                    <div className="font-mono text-xs uppercase tracking-widest text-tertiary">
                      {area.subtitle}
                    </div>
                  </div>
                </div>

                <p className="font-serif text-lg leading-relaxed text-secondary">
                  {area.data.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compatibility Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-accent-primary/5 border border-accent-primary/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h4 className="font-mono text-xs uppercase tracking-widest text-accent-primary font-medium">
              Strengths
            </h4>
          </div>
          <ul className="space-y-2 font-serif text-secondary">
            <li>• Complementary life path directions</li>
            <li>• Shared values around growth</li>
            <li>• Natural communication flow</li>
            <li>• Mutual respect for independence</li>
          </ul>
        </div>

        <div className="bg-accent-secondary/5 border border-accent-secondary/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h4 className="font-mono text-xs uppercase tracking-widest text-accent-secondary font-medium">
              Growth Areas
            </h4>
          </div>
          <ul className="space-y-2 font-serif text-secondary">
            <li>• Different approaches to decision-making</li>
            <li>• Varying needs for social connection</li>
            <li>• Balancing individual vs. shared goals</li>
            <li>• Communication timing preferences</li>
          </ul>
        </div>
      </div>

      {/* Insight Footer */}
      <div className="bg-primary/5 border border-primary/10 p-8 rounded-2xl mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif text-lg leading-relaxed text-secondary italic">
            "Numerological compatibility reveals the energetic dance between two souls. 
            High compatibility suggests natural harmony, while lower scores indicate opportunities for profound growth through conscious understanding."
          </p>
        </div>
      </div>
    </div>
  );
}