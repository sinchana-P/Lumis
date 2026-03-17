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
  actionLabel?: string | null; // Override default button label; null = hide button
  actionDisabled?: boolean;   // Disable the action button
  actionLoading?: boolean;    // Show loading state on action button
  children?: React.ReactNode;
}

export function MemberPageHeader({ tabs, activeTab, tabCount, onActionClick, onSecondaryAction, actionLabel, actionDisabled, actionLoading, children }: MemberPageHeaderProps) {
  const getActionButton = () => {
    const label = actionLabel;
    const disabled = actionDisabled || actionLoading;

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
        if (label === null) return null; // hidden when can't generate
        return (
          <Button onClick={onActionClick} disabled={disabled}>
            {actionLoading ? 'Generating…' : (label ?? 'Generate Numerology')}
          </Button>
        );
      case 'astrology':
        if (label === null) return null;
        return (
          <Button onClick={onActionClick} disabled={disabled}>
            {actionLoading ? 'Generating…' : (label ?? 'Generate Astrology')}
          </Button>
        );
      case 'report':
        return (
          <Button onClick={onActionClick} disabled={actionDisabled || actionLoading}>
            {actionLoading ? 'Generating…' : (label ?? 'Generate Report')}
          </Button>
        );
      default:
        return null;
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <header
      className="px-8 flex-shrink-0 border-b"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)', paddingTop: 14, paddingBottom: 14 }}
      data-tour="member-header"
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
        <div className="flex items-center gap-3" data-tour="member-actions">
          {children || getActionButton()}
        </div>
      </div>
    </header>
  );
}