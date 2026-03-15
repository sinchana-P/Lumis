'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const emotions = {
  positive: [
    { label: 'Joyful', value: 'joyful', color: 'emotion-joyful' },
    { label: 'Safe', value: 'safe', color: 'emotion-safe' },
    { label: 'Energized', value: 'energized', color: 'emotion-energized' },
    { label: 'Peaceful', value: 'peaceful', color: 'emotion-peaceful' },
    { label: 'Loved', value: 'loved', color: 'emotion-loved' },
  ],
  negative: [
    { label: 'Anxious', value: 'anxious', color: 'emotion-anxious' },
    { label: 'Drained', value: 'drained', color: 'emotion-drained' },
    { label: 'Confused', value: 'confused', color: 'emotion-confused' },
    { label: 'Hurt', value: 'hurt', color: 'emotion-hurt' },
  ],
};

interface EmotionPickerProps {
  selected: string[];
  onChange: (emotions: string[]) => void;
  multiple?: boolean;
  categories?: ('positive' | 'negative')[];
  className?: string;
}

export function EmotionPicker({
  selected,
  onChange,
  multiple = true,
  categories = ['positive', 'negative'],
  className,
}: EmotionPickerProps) {
  const [activeCategory, setActiveCategory] = useState<'positive' | 'negative'>('positive');

  const handleEmotionClick = (emotionValue: string) => {
    if (multiple) {
      if (selected.includes(emotionValue)) {
        onChange(selected.filter((e) => e !== emotionValue));
      } else {
        onChange([...selected, emotionValue]);
      }
    } else {
      onChange([emotionValue]);
    }
  };

  const displayedEmotions = categories.length === 1 
    ? emotions[categories[0]]
    : emotions[activeCategory];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Category tabs if showing both */}
      {categories.length > 1 && (
        <div className="flex gap-2 border-b border-primary">
          <button
            onClick={() => setActiveCategory('positive')}
            className={cn(
              'px-4 py-2 font-serif text-sm font-medium transition-all duration-200',
              activeCategory === 'positive'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-tertiary hover:text-secondary'
            )}
          >
            Positive
          </button>
          <button
            onClick={() => setActiveCategory('negative')}
            className={cn(
              'px-4 py-2 font-serif text-sm font-medium transition-all duration-200',
              activeCategory === 'negative'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-tertiary hover:text-secondary'
            )}
          >
            Negative
          </button>
        </div>
      )}

      {/* Emotion pills */}
      <div className="flex flex-wrap gap-2">
        {displayedEmotions.map((emotion) => {
          const isSelected = selected.includes(emotion.value);
          return (
            <button
              key={emotion.value}
              onClick={() => handleEmotionClick(emotion.value)}
              className={cn(
                'emotion-pill transition-all duration-200',
                isSelected
                  ? 'bg-accent-primary text-white border-accent-primary shadow-sm'
                  : 'bg-surface hover:bg-surface-hover border-primary'
              )}
            >
              {emotion.label}
            </button>
          );
        })}
      </div>

      {/* Selected count */}
      {multiple && selected.length > 0 && (
        <p className="text-xs font-serif text-tertiary">
          {selected.length} emotion{selected.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
