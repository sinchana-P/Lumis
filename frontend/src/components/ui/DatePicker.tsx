'use client';

import { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string; // ISO string YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function DatePicker({ value, onChange, placeholder = 'dd/mm/yyyy', label }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse selected date from ISO value
  const selected = value
    ? { day: String(parseInt(value.split('-')[2])), month: String(parseInt(value.split('-')[1])), year: value.split('-')[0] }
    : { day: '', month: '', year: '' };

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowMonthDropdown(false);
        setShowYearDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentMonth = calendarDate.getMonth();
  const currentYear = calendarDate.getFullYear();

  const generateDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  };

  const handleSelect = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${currentYear}-${m}-${d}`);
    setOpen(false);
  };

  const isSelected = (day: number) =>
    selected.day === String(day) &&
    selected.month === String(currentMonth + 1) &&
    selected.year === String(currentYear);

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
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
          className="w-full px-0 py-2 bg-transparent border-0 border-b border-primary outline-none focus:outline-none focus:ring-0 text-primary cursor-pointer placeholder:text-tertiary"
        />
        <div className="absolute right-0 top-2.5 text-tertiary pointer-events-none">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
          </svg>
        </div>
      </div>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface-elevated border border-primary rounded-xl shadow-lg z-50 p-3">
          {/* Month / Year selectors */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {/* Month dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowMonthDropdown(o => !o); setShowYearDropdown(false); }}
                className="px-2.5 py-1 bg-transparent border border-primary rounded-md text-primary font-serif text-sm flex items-center gap-1 hover:border-accent-primary transition-colors"
              >
                {MONTHS[currentMonth]}
                <svg className="w-3 h-3 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showMonthDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-surface-elevated border border-primary rounded-lg shadow-lg z-50 w-32 max-h-44 overflow-y-auto">
                  {MONTHS.map((month, i) => (
                    <button key={month} type="button"
                      onClick={() => { const d = new Date(calendarDate); d.setMonth(i); setCalendarDate(d); setShowMonthDropdown(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-serif hover:bg-accent-primary hover:text-inverse transition-colors ${i === currentMonth ? 'bg-accent-primary text-inverse' : 'text-primary'}`}
                    >{month}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Year dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowYearDropdown(o => !o); setShowMonthDropdown(false); }}
                className="px-2.5 py-1 bg-transparent border border-primary rounded-md text-primary font-serif text-sm flex items-center gap-1 hover:border-accent-primary transition-colors"
              >
                {currentYear}
                <svg className="w-3 h-3 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showYearDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-surface-elevated border border-primary rounded-lg shadow-lg z-50 w-24 max-h-44 overflow-y-auto">
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <button key={year} type="button"
                      onClick={() => { const d = new Date(calendarDate); d.setFullYear(year); setCalendarDate(d); setShowYearDropdown(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-serif hover:bg-accent-primary hover:text-inverse transition-colors ${year === currentYear ? 'bg-accent-primary text-inverse' : 'text-primary'}`}
                    >{year}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] text-tertiary py-0.5">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {generateDays().map((day, i) => (
              <button key={i} type="button" disabled={!day}
                onClick={() => day && handleSelect(day)}
                className={`aspect-square text-xs rounded-full transition-colors flex items-center justify-center
                  ${!day ? 'invisible' : ''}
                  ${day && isSelected(day) ? 'bg-accent-primary text-inverse' : day && isToday(day) ? 'border border-accent-primary text-accent-primary' : 'text-primary hover:bg-accent-primary hover:text-inverse'}`}
              >{day}</button>
            ))}
          </div>

          <div className="flex justify-start mt-2 pt-2 border-t border-primary">
            <button type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="text-xs text-tertiary hover:text-primary transition-colors font-serif"
            >clear</button>
          </div>
        </div>
      )}
    </div>
  );
}
