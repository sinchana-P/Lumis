'use client';

import { Button } from '@/components/ui/Button';

interface Tab {
  id: string;
  label: string;
  description: string;
}

interface MemberPageHeaderProps {
  tabs: Tab[];
  activeTab: string;
  onActionClick?: () => void;
}

export function MemberPageHeader({ tabs, activeTab, onActionClick }: MemberPageHeaderProps) {
  const getActionButton = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <Button onClick={onActionClick}>Quick Log</Button>
            <Button variant="secondary">Edit Profile</Button>
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
      case 'traits':
        return <Button onClick={onActionClick}>Add Trait</Button>;
      case 'report':
        return <Button onClick={onActionClick}>Regenerate</Button>;
      default:
        return null;
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <header className="px-8 py-2 flex-shrink-0" style={{ 
      boxShadow: '0 2px 4px -2px rgba(61, 57, 53, 0.06)'
    }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            {currentTab?.label}
          </h2>
          <p className="font-serif text-xs" style={{ color: 'var(--text-secondary)' }}>
            {currentTab?.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getActionButton()}
        </div>
      </div>
    </header>
  );
}