'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface Tab {
  id: string;
  label: string;
  description: string;
}

interface MemberPageHeaderProps {
  tabs: Tab[];
  activeTab: string;
  tabCount?: number;
  onActionClick?: () => void;
  onSecondaryAction?: () => void;
  children?: React.ReactNode; // Allow custom action buttons
}

export function MemberPageHeader({ tabs, activeTab, tabCount, onActionClick, onSecondaryAction, children }: MemberPageHeaderProps) {
  const getActionButton = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <Button onClick={onActionClick}>Quick Log</Button>
            <Button variant="secondary" onClick={onSecondaryAction}>Edit Luminary</Button>
          </>
        );
      case 'journal':
        return <Button onClick={onActionClick}>New Entry</Button>;
      case 'patterns':
        return <Button onClick={onActionClick}>Add Pattern</Button>;
      case 'interactions':
        return <Button onClick={onActionClick}>Log Interaction</Button>;
      case 'incidents':
        return <Button onClick={onActionClick}>Add Incident</Button>;
      case 'numerology':
        return <Button onClick={onActionClick}>Generate Numerology</Button>;
      case 'astrology':
        return <Button onClick={onActionClick}>Generate Astrology</Button>;
      // case 'traits':
      //   return <Button onClick={onActionClick}>Add Trait</Button>;
      case 'report':
        return <Button onClick={onActionClick}>Regenerate</Button>;
      default:
        return null;
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <header
      className="px-8 flex-shrink-0 border-b"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)', paddingTop: 14, paddingBottom: 14 }}
    >
      <div className="flex items-center justify-between">
        <div>
          {/* Crimson Pro — soft page title */}
          <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 2 }}>
            {currentTab?.label}
            {tabCount !== undefined && (
              <span style={{ fontSize: 18, color: 'var(--text-tertiary)', fontWeight: 300, marginLeft: 8, verticalAlign: 'baseline' }}>
                ({tabCount})
              </span>
            )}
          </h2>
          {/* Crimson Pro — soft description */}
          <p className="font-serif" style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
            {currentTab?.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {children || getActionButton()}
        </div>
      </div>
    </header>
  );
}