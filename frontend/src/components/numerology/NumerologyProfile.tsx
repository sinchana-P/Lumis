'use client';

import { useState } from 'react';
import { MinimalButtonGroup, MinimalButtonGroupItem } from '@/components/ui/MinimalButtonGroup';
import { CoreNumbersTab } from './CoreNumbersTab';
import { TimingNumbersTab } from './TimingNumbersTab';
import { CompatibilityTab } from './CompatibilityTab';

export interface NumerologyData {
  name: string;
  dateOfBirth: string;
  relationshipType: string;
  coreNumbers: CoreNumber[];
  timingNumbers: TimingNumber[];
  compatibility: CompatibilityData;
}

export interface CoreNumber {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  traits: string[];
  type: 'lifePath' | 'expression' | 'soulUrge' | 'personality' | 'destiny';
}

export interface TimingNumber {
  id: string;
  number: number;
  title: string;
  period: string;
  description: string;
  influence: string;
  year?: number;
}

export interface CompatibilityData {
  overallScore: number;
  lifePath: { score: number; description: string };
  expression: { score: number; description: string };
  soulUrge: { score: number; description: string };
}

interface NumerologyProfileProps {
  data: NumerologyData;
}

type TabId = 'core' | 'timing' | 'compatibility';

const tabs = [
  { id: 'core' as TabId, label: 'Core Numbers', icon: '●' },
  { id: 'timing' as TabId, label: 'Timing Numbers', icon: '◐' },
  { id: 'compatibility' as TabId, label: 'Compatibility', icon: '◇' }
];

export function NumerologyProfile({ data }: NumerologyProfileProps) {
  const [activeTab, setActiveTab] = useState<TabId>('core');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 bg-accent-secondary/20 rounded-full flex items-center justify-center border border-accent-secondary/30">
            <span className="text-2xl font-serif text-accent-secondary">
              {data.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Name & Info */}
          <div>
            <h1 className="text-4xl font-serif italic text-primary mb-2 font-light">
              {data.name}
            </h1>
            <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-tertiary">
              <span>{data.relationshipType}</span>
              <span>•</span>
              <span>Numerological Profile</span>
            </div>
          </div>
        </div>

        {/* Overall Compatibility */}
        <div className="text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-tertiary mb-2">
            Overall Compatibility
          </div>
          <div className="text-5xl font-display font-light text-accent-secondary">
            {data.compatibility.overallScore}%
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-12">
        <MinimalButtonGroup className="w-full">
          {tabs.map((tab) => (
            <MinimalButtonGroupItem
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              active={activeTab === tab.id}
              className="flex-1 justify-center"
            >
              <span className="text-accent-secondary mr-2">{tab.icon}</span>
              {tab.label}
            </MinimalButtonGroupItem>
          ))}
        </MinimalButtonGroup>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'core' && <CoreNumbersTab data={data} />}
        {activeTab === 'timing' && <TimingNumbersTab data={data} />}
        {activeTab === 'compatibility' && <CompatibilityTab data={data} />}
      </div>
    </div>
  );
}