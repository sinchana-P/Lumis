'use client';

import { useState, useRef, useEffect } from 'react';

interface TimePickerProps {
  value: string; // 24h "HH:MM"
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function to12h(value: string): { hour: string; minute: string; period: 'AM' | 'PM' } {
  if (!value) return { hour: '', minute: '', period: 'AM' };
  const [h, m] = value.split(':').map(Number);
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { hour: String(hour12), minute: String(m).padStart(2, '0'), period };
}

function to24h(hour: string, minute: string, period: string): string {
  let h = parseInt(hour);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${minute}`;
}

export function TimePicker({ value, onChange, placeholder = '--:-- --', label }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => to12h(value));
  const containerRef = useRef<HTMLDivElement>(null);

  const displayValue = value ? (() => {
    const { hour, minute, period } = to12h(value);
    return `${hour}:${minute} ${period}`;
  })() : '';

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync internal state when value changes externally
  useEffect(() => {
    setSelected(to12h(value));
  }, [value]);

  const handleSet = () => {
    if (selected.hour && selected.minute) {
      onChange(to24h(selected.hour, selected.minute, selected.period));
      setOpen(false);
    }
  };

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      {label && (
        <label className="block text-[10px] uppercase tracking-widest text-secondary">{label}</label>
      )}
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onClick={() => setOpen(o => !o)}
          readOnly
          placeholder={placeholder}
          tabIndex={-1}
          className="w-full px-0 py-2 bg-transparent border-0 border-b border-primary outline-none focus:outline-none focus:ring-0 text-primary cursor-pointer placeholder:text-tertiary"
        />
        <div className="absolute right-0 top-2.5 text-tertiary pointer-events-none">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
          </svg>
        </div>
      </div>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface-elevated border border-primary rounded-xl shadow-lg z-50 p-2.5">
          <div className="flex gap-2">
            {/* Hour column */}
            <div className="flex-1">
              <p className="text-[9px] uppercase tracking-widest text-tertiary mb-1 font-sans text-center">Hr</p>
              <div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {HOURS.map(hour => (
                  <button key={hour} type="button"
                    onClick={() => setSelected(s => ({ ...s, hour }))}
                    className={`py-1 text-xs rounded font-serif transition-colors text-center
                      ${selected.hour === hour ? 'bg-accent-primary text-inverse' : 'text-primary hover:bg-accent-primary hover:text-inverse'}`}
                  >{hour.padStart(2, '0')}</button>
                ))}
              </div>
            </div>

            <div className="w-px bg-primary self-stretch opacity-30" />

            {/* Minute column */}
            <div className="flex-1">
              <p className="text-[9px] uppercase tracking-widest text-tertiary mb-1 font-sans text-center">Min</p>
              <div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {MINUTES.map(minute => (
                  <button key={minute} type="button"
                    onClick={() => setSelected(s => ({ ...s, minute }))}
                    className={`py-1 text-xs rounded font-serif transition-colors text-center
                      ${selected.minute === minute ? 'bg-accent-primary text-inverse' : 'text-primary hover:bg-accent-primary hover:text-inverse'}`}
                  >{minute}</button>
                ))}
              </div>
            </div>

            <div className="w-px bg-primary self-stretch opacity-30" />

            {/* AM/PM column */}
            <div className="flex flex-col justify-center gap-1.5 px-1">
              {(['AM', 'PM'] as const).map(period => (
                <button key={period} type="button"
                  onClick={() => setSelected(s => ({ ...s, period }))}
                  className={`px-2 py-1.5 text-xs rounded font-sans tracking-widest uppercase transition-colors
                    ${selected.period === period ? 'bg-accent-primary text-inverse' : 'border border-primary text-secondary hover:border-accent-primary hover:text-primary'}`}
                >{period}</button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2 mt-2 border-t border-primary">
            <button type="button" onClick={() => setOpen(false)}
              className="text-xs text-tertiary hover:text-primary font-serif transition-colors">cancel</button>
            <button type="button" onClick={handleSet}
              disabled={!selected.hour || !selected.minute}
              className="text-xs text-accent-primary disabled:text-tertiary font-serif transition-colors">set time</button>
          </div>
        </div>
      )}
    </div>
  );
}
