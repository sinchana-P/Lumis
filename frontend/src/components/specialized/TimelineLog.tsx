'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface TimelineEntry {
  id: string;
  date: Date;
  title?: string;
  content: string;
  metadata?: Record<string, any>;
}

interface TimelineLogProps {
  entries: TimelineEntry[];
  type: 'incident' | 'interaction' | 'journal' | 'pattern';
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  emotionTracking?: boolean;
  searchable?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function TimelineLog({
  entries,
  type,
  onAdd,
  onEdit,
  onDelete,
  emotionTracking = false,
  searchable = false,
  emptyMessage = 'No entries yet',
  className,
}: TimelineLogProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'incident':
        return '◆';
      case 'interaction':
        return '◈';
      case 'journal':
        return '◉';
      case 'pattern':
        return '◇';
      default:
        return '●';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-medium text-primary capitalize">
          {type} Log
        </h3>
        {onAdd && (
          <Button size="sm" onClick={onAdd}>
            Add {type}
          </Button>
        )}
      </div>

      {/* Timeline */}
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-serif text-tertiary">{emptyMessage}</p>
          {onAdd && (
            <Button variant="secondary" size="sm" onClick={onAdd} className="mt-4">
              Add your first entry
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="relative pl-8 pb-6 border-l-2 border-primary last:border-l-0 last:pb-0"
            >
              {/* Timeline dot */}
              <div className="absolute left-0 top-0 -translate-x-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-accent-primary text-white text-xs">
                {getTypeIcon()}
              </div>

              {/* Entry card */}
              <div className="bg-surface-elevated rounded-lg p-4 shadow-sm border border-primary hover:shadow-md transition-shadow duration-200">
                {/* Date */}
                <div className="flex items-center justify-between mb-2">
                  <time className="font-rounded text-xs text-tertiary uppercase tracking-wider">
                    {formatDate(entry.date)}
                  </time>
                  
                  {/* Actions */}
                  {(onEdit || onDelete) && (
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(entry.id)}
                          className="p-1 rounded hover:bg-surface transition-colors"
                          aria-label="Edit"
                        >
                          <svg
                            className="h-4 w-4 text-tertiary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="p-1 rounded hover:bg-error/10 transition-colors"
                          aria-label="Delete"
                        >
                          <svg
                            className="h-4 w-4 text-error"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Title */}
                {entry.title && (
                  <h4 className="font-serif text-base font-medium text-primary mb-2">
                    {entry.title}
                  </h4>
                )}

                {/* Content */}
                <p className="font-serif text-sm text-secondary leading-relaxed">
                  {entry.content}
                </p>

                {/* Emotion tracking metadata */}
                {emotionTracking && entry.metadata && (
                  <div className="mt-3 flex items-center gap-4 text-xs font-serif">
                    {entry.metadata.moodBefore !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="text-tertiary">Before:</span>
                        <span className={cn(
                          'font-medium',
                          entry.metadata.moodBefore >= 0 ? 'text-lumis-success' : 'text-error'
                        )}>
                          {entry.metadata.moodBefore > 0 ? '+' : ''}{entry.metadata.moodBefore}
                        </span>
                      </div>
                    )}
                    {entry.metadata.moodAfter !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="text-tertiary">After:</span>
                        <span className={cn(
                          'font-medium',
                          entry.metadata.moodAfter >= 0 ? 'text-lumis-success' : 'text-error'
                        )}>
                          {entry.metadata.moodAfter > 0 ? '+' : ''}{entry.metadata.moodAfter}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
