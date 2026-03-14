'use client';

import { useState, useRef, useEffect } from 'react';

interface ConstellationControlsProps {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitAll: () => void;
  zoomLevel: number;
  memberCount: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  canResetZoom: boolean;
  canFitAll: boolean;
}

export function ConstellationControls({
  onReset,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitAll,
  zoomLevel,
  memberCount,
  canZoomIn,
  canZoomOut,
  canResetZoom,
  canFitAll
}: ConstellationControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const controls = [
    {
      label: 'Reset',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      onClick: onReset,
      disabled: false
    },
    {
      label: 'Zoom In',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
        </svg>
      ),
      onClick: onZoomIn,
      disabled: !canZoomIn
    },
    {
      label: 'Zoom Out',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
        </svg>
      ),
      onClick: onZoomOut,
      disabled: !canZoomOut
    },
    {
      label: 'Reset Zoom',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      onClick: onResetZoom,
      disabled: !canResetZoom
    },
    {
      label: 'Fit All',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      ),
      onClick: onFitAll,
      disabled: !canFitAll
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-surface border-2 border-primary/30 rounded-lg text-primary hover:border-accent-primary transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
        <span className="font-mono text-xs uppercase tracking-widest">Controls</span>
        <svg 
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-surface border-2 border-primary/30 rounded-lg shadow-md z-50">
          <div className="p-2">
            {controls.map((control, index) => (
              <button
                key={control.label}
                onClick={() => {
                  control.onClick();
                  setIsOpen(false);
                }}
                disabled={control.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  control.disabled
                    ? 'text-tertiary cursor-not-allowed opacity-50'
                    : 'text-primary hover:bg-surface-hover'
                }`}
              >
                {control.icon}
                <span className="font-mono text-xs uppercase tracking-widest">
                  {control.label}
                </span>
              </button>
            ))}
          </div>
          
          {/* Status Info */}
          <div className="border-t border-primary/20 p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-tertiary">
              {memberCount} member{memberCount === 1 ? '' : 's'} • Zoom: {Math.round(zoomLevel * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}