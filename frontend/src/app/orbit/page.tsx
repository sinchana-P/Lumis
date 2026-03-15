'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMembersQuery, useCreateMemberMutation } from '@/store/api/membersApi';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useZoom } from '@/hooks/useZoom';
import { MinimalButton } from '@/components/ui/MinimalButton';
import { MinimalButtonGroup, MinimalButtonGroupItem } from '@/components/ui/MinimalButtonGroup';
import { LuminaryControls } from '@/components/ui/LuminaryControls';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function MembersPage() {
  const router = useRouter();
  const { data: membersResponse, isLoading, error } = useGetMembersQuery();
  const [createMember] = useCreateMemberMutation();
  const [energyFilter, setEnergyFilter] = useState<'all' | 'nourishing' | 'draining'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'health' | 'type' | 'date'>('name');
  const [viewMode, setViewMode] = useState<'orbit' | 'list'>('orbit');
  const luminaryRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const members = membersResponse?.data || [];
  const displayMembers = members;

  // Initialize drag and drop functionality
  const {
    positions: memberPositions,
    draggedItem: draggedMember,
    dragOffset,
    isDragging,
    hasDragged,
    handleMouseDown,
    setPositions: setMemberPositions,
    resetPositions: resetMemberPositions,
    fitAllItems: fitAllMembers
  } = useDragAndDrop({
    items: displayMembers,
    containerRef: luminaryRef,
    boundaryPadding: 5,
    minDistance: 32
  });

  // Initialize zoom functionality
  const {
    zoomLevel,
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    resetZoom,
    setZoom,
    scrollToTopLeft,
    fitAllWithZoom
  } = useZoom({
    initialZoom: 1,
    minZoom: 0.2,
    maxZoom: 3,
    zoomStep: 0.2,
    scrollContainerRef
  });

  const fitAllNodes = () => {
    if (displayMembers.length === 0) return;
    
    // First, reposition all members to top-left area
    fitAllMembers({ x: 30, y: 25 });
    
    // Then calculate and apply optimal zoom
    setTimeout(() => {
      fitAllWithZoom(memberPositions);
      
      // Finally, scroll to top-left
      setTimeout(() => {
        scrollToTopLeft();
      }, 100);
    }, 100);
  };

  // Initialize member positions when members change
  useEffect(() => {
    if (displayMembers.length > 0 && Object.keys(memberPositions).length === 0) {
      resetMemberPositions();
    }
  }, [displayMembers.length, memberPositions, resetMemberPositions]);

  const getRelationshipHealth = (member: any) => {
    const healthMap: Record<string, number> = {
      'partner': Math.floor(Math.random() * 20) + 80,
      'family': Math.floor(Math.random() * 30) + 60,
      'friend': Math.floor(Math.random() * 40) + 50,
      'colleague': Math.floor(Math.random() * 30) + 40,
      'acquaintance': Math.floor(Math.random() * 20) + 30,
    };
    return healthMap[member.relationType] || 65;
  };

  const getRelationshipType = (member: any) => {
    return member.relationTypeCustom || member.relationType.toUpperCase();
  };

  const getNodeSize = (health: number) => {
    return 'w-20 h-20';
  };

  const getNodeColor = (health: number, relationType: string) => {
    return 'bg-accent-primary';
  };

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search luminaries..."]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }

      // Fit all shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === '9') {
        e.preventDefault();
        fitAllNodes();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, fitAllNodes]);

  if (isLoading) {
    return (
      <LoadingScreen />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-serif text-primary mb-4">
            Something went wrong
          </h3>
          <p className="text-secondary mb-6">
            We couldn't load your luminaries. Please try again.
          </p>
          <MinimalButton 
            onClick={() => window.location.reload()}
            variant="primary"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </MinimalButton>
        </div>
      </div>
    );
  }

  const filteredMembers = displayMembers.filter(member => {
    const health = getRelationshipHealth(member);
    
    let passesEnergyFilter = true;
    if (energyFilter === 'nourishing') passesEnergyFilter = health >= 70;
    if (energyFilter === 'draining') passesEnergyFilter = health < 50;
    
    const passesSearchFilter = searchQuery === '' || 
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.relationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.relationTypeCustom && member.relationTypeCustom.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return passesEnergyFilter && passesSearchFilter;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.fullName.localeCompare(b.fullName);
      case 'health':
        return getRelationshipHealth(b) - getRelationshipHealth(a);
      case 'type':
        return getRelationshipType(a).localeCompare(getRelationshipType(b));
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });
  return (
    <div className="min-h-screen bg-primary">
      <Header />

      {/* Main Content */}
      <main className="w-full px-6 lg:px-12 pt-16 pb-4">
        {/* Compact page header row */}
        <div className="flex items-baseline gap-4 mb-3">
          <h1 className="text-2xl font-serif font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Luminaries
          </h1>
          <span className="font-serif text-sm italic hidden md:block" style={{ color: 'var(--text-tertiary)' }}>
            {searchQuery
              ? `${sortedMembers.length} of ${displayMembers.length} luminaries found`
              : 'The people in your orbit'}
          </span>
          {viewMode === 'orbit' && displayMembers.length > 0 && (
            <span className="font-mono text-xs uppercase tracking-widest hidden lg:block" style={{ color: 'var(--text-tertiary)' }}>
              Drag to rearrange · Ctrl/Cmd + / - / 0 / 9
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="mb-3 flex items-center justify-between">
          {/* Left side: View Toggle and Controls */}
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <MinimalButtonGroup>
              <MinimalButtonGroupItem
                onClick={() => setViewMode('orbit')}
                active={viewMode === 'orbit'}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Orbit
              </MinimalButtonGroupItem>
              <MinimalButtonGroupItem
                onClick={() => setViewMode('list')}
                active={viewMode === 'list'}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </MinimalButtonGroupItem>
            </MinimalButtonGroup>

          </div>

          {/* Search and Controls */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search luminaries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 px-4 py-2 pl-10 bg-surface border-2 border-primary/30 rounded-lg text-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-accent-primary transition-colors shadow-sm"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tertiary hover:text-primary"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <MinimalButton 
              onClick={() => router.push('/orbit/add')}
              variant="primary"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Member
            </MinimalButton>
          </div>
        </div>
        {displayMembers.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center">
                <svg className="w-12 h-12 text-accent-primary opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-serif text-primary mb-4">
                Your luminaries await
              </h3>
              <p className="text-secondary mb-8 leading-relaxed">
                Begin by adding the people who shape your world. Each luminary becomes a presence in your orbit.
              </p>
              <MinimalButton
                onClick={() => router.push('/orbit/add')}
                variant="primary"
                size="md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Node
              </MinimalButton>
            </div>
          </div>
        ) : viewMode === 'orbit' ? (
          <div className="relative">
            <LuminaryControls
              onReset={resetMemberPositions}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={resetZoom}
              onFitAll={fitAllNodes}
              zoomLevel={zoomLevel}
              memberCount={sortedMembers.length}
              canZoomIn={zoomLevel < 3}
              canZoomOut={zoomLevel > 0.5}
              canResetZoom={zoomLevel !== 1}
              canFitAll={sortedMembers.length > 0}
            />
            <div
              ref={scrollContainerRef}
              className="relative overflow-auto border-2 border-primary/30 rounded-lg shadow-inner scrollbar-thin"
              style={{ height: '60vh' }}
            >
              <div 
                ref={luminaryRef}
                className="relative select-none" 
                data-luminary-container
                style={{ 
                  width: '160%',
                  height: '140%',
                  minWidth: '1200px',
                  minHeight: '700px',
                  userSelect: 'none',
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.3s ease-in-out'
                }}
              >
                {/* Member Nodes */}
                {sortedMembers.map((member, index) => {
                  const position = memberPositions[member.id] || { x: 50, y: 50 };
                  const health = getRelationshipHealth(member);
                  const nodeSize = getNodeSize(health);
                  const nodeColor = getNodeColor(health, member.relationType);
                  const isDragging = draggedMember === member.id;
                  const isHighlighted = searchQuery && (
                    member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    member.relationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (member.relationTypeCustom && member.relationTypeCustom.toLowerCase().includes(searchQuery.toLowerCase()))
                  );
                  
                  return (
                    <div
                      key={member.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab group transition-all duration-200 ${
                        isDragging ? 'cursor-grabbing scale-110 z-50' : 'hover:scale-105 z-10'
                      } ${isHighlighted ? 'animate-pulse' : ''}`}
                      style={{ 
                        left: `${position.x}%`, 
                        top: `${position.y}%`,
                        transition: isDragging ? 'none' : 'all 0.2s ease'
                      }}
                      onMouseDown={(e) => handleMouseDown(e, member.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDragging && !hasDragged) {
                          router.push(`/orbit/${member.id}`);
                        }
                      }}
                    >
                      {/* Node */}
                      <div className={`${nodeSize} ${nodeColor} rounded-full flex items-center justify-center shadow-md border-4 transition-all duration-200 ${
                        isDragging ? 'shadow-lg border-accent-gold' : 
                        isHighlighted ? 'border-accent-gold shadow-md' : 
                        'border-white group-hover:shadow-md'
                      }`}>
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.fullName}
                            className="w-full h-full rounded-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <span className="text-white font-medium text-lg select-none">
                            {member.fullName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      {/* Member Info */}
                      <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-3 text-center transition-opacity duration-200 ${
                        isDragging ? 'opacity-50' : 'opacity-100'
                      }`}>
                        <div className={`font-serif font-medium text-base mb-1 select-none ${
                          isHighlighted ? 'text-accent-gold' : 'text-primary'
                        }`}>
                          {member.fullName.split(' ')[0]}
                        </div>
                        <div className="text-xs text-tertiary uppercase tracking-wider whitespace-nowrap select-none">
                          {getRelationshipType(member)} • HEALTH {health}
                        </div>
                      </div>

                      {/* Search highlight indicator */}
                      {isHighlighted && (
                        <div className="absolute -top-1 -left-1 w-6 h-6 bg-accent-gold rounded-full flex items-center justify-center animate-bounce">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      )}

                      {/* Drag hint */}
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="w-5 h-5 bg-accent-primary rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {sortedMembers.map((member) => {
              const health = getRelationshipHealth(member);
              const isHighlighted = searchQuery && (
                member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.relationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (member.relationTypeCustom && member.relationTypeCustom.toLowerCase().includes(searchQuery.toLowerCase()))
              );
              
              return (
                <div
                  key={member.id}
                  className={`bg-surface rounded-2xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer shadow-md ${
                    isHighlighted ? 'ring-2 ring-accent-gold' : ''
                  }`}
                  onClick={() => router.push(`/orbit/${member.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-accent-primary rounded-full flex items-center justify-center border-4 border-white shadow-md">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-medium text-xl">
                            {member.fullName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      {/* Member Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-xl font-serif font-medium ${
                            isHighlighted ? 'text-accent-gold' : 'text-primary'
                          }`}>
                            {member.fullName}
                          </h3>
                          {isHighlighted && (
                            <div className="w-5 h-5 bg-accent-gold rounded-full flex items-center justify-center animate-pulse">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-secondary">
                          <span className="uppercase tracking-wider font-medium">
                            {getRelationshipType(member)}
                          </span>
                          <span>•</span>
                          <span>Added {new Date(member.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Health Score & Energy Indicator */}
                    <div className="flex items-center space-x-6">
                      {/* Health Score */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {health}
                        </div>
                        <div className="text-xs uppercase tracking-wider text-tertiary">
                          Health
                        </div>
                      </div>
                      
                      {/* Energy Indicator */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`w-4 h-4 rounded-full ${
                          health >= 70 ? 'bg-accent-primary' : 
                          health >= 50 ? 'bg-accent-secondary' : 
                          'bg-error'
                        }`}></div>
                        <div className="text-xs uppercase tracking-wider text-tertiary">
                          {health >= 70 ? 'Nourishing' : health >= 50 ? 'Neutral' : 'Draining'}
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <div className="text-tertiary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}