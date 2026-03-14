import { useState, useEffect, useCallback } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface DragItem {
  id: string;
  [key: string]: any;
}

export interface UseDragAndDropOptions {
  items: DragItem[];
  containerRef: React.RefObject<HTMLElement>;
  onPositionChange?: (positions: Record<string, Position>) => void;
  boundaryPadding?: number;
  minDistance?: number;
}

export interface UseDragAndDropReturn {
  positions: Record<string, Position>;
  draggedItem: string | null;
  dragOffset: Position;
  isDragging: boolean;
  hasDragged: boolean;
  handleMouseDown: (e: React.MouseEvent, itemId: string) => void;
  setPositions: (positions: Record<string, Position>) => void;
  resetPositions: () => void;
  fitAllItems: (targetCenter?: Position) => void;
  getCollisionFreePosition: (index: number, total: number, existingPositions?: Record<string, Position>) => Position;
}

export const useDragAndDrop = ({
  items,
  containerRef,
  onPositionChange,
  boundaryPadding = 5,
  minDistance = 32
}: UseDragAndDropOptions): UseDragAndDropReturn => {
  const [positions, setPositionsState] = useState<Record<string, Position>>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<Position>({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  // Collision-free positioning system
  const getCollisionFreePosition = useCallback((
    index: number, 
    total: number, 
    existingPositions: Record<string, Position> = {}
  ): Position => {
    const nodeRadius = 8;
    const minDistanceCalc = Math.max(minDistance, nodeRadius * 4);
    
    const occupiedPositions = Object.values(existingPositions);
    
    const hasCollision = (pos: Position) => {
      return occupiedPositions.some(existing => {
        const distance = Math.sqrt(
          Math.pow(pos.x - existing.x, 2) + 
          Math.pow(pos.y - existing.y, 2)
        );
        return distance < minDistanceCalc;
      });
    };
    
    let position: Position;
    
    if (index === 0) {
      position = { x: 50, y: 50 };
    } else {
      // Grid-based positioning with collision detection
      const gridCols = 8;
      const gridRows = 6;
      const colSpacing = 90 / (gridCols - 1);
      const rowSpacing = 80 / (gridRows - 1);
      
      const candidatePositions: Position[] = [];
      
      // Generate grid positions
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const x = 5 + (col * colSpacing);
          const y = 10 + (row * rowSpacing);
          candidatePositions.push({ x, y });
        }
      }
      
      // Add some random positions as backup
      for (let i = 0; i < 20; i++) {
        candidatePositions.push({
          x: 10 + Math.random() * 80,
          y: 15 + Math.random() * 70
        });
      }
      
      // Sort by distance from center
      candidatePositions.sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.x - 50, 2) + Math.pow(a.y - 50, 2));
        const distB = Math.sqrt(Math.pow(b.x - 50, 2) + Math.pow(b.y - 50, 2));
        return distA - distB;
      });
      
      // Find first non-colliding position
      let foundPosition = false;
      for (const candidatePos of candidatePositions) {
        if (!hasCollision(candidatePos)) {
          position = candidatePos;
          foundPosition = true;
          break;
        }
      }
      
      // Fallback to grid position if no collision-free position found
      if (!foundPosition) {
        position = {
          x: 10 + (index % 8) * 10,
          y: 15 + Math.floor(index / 8) * 15
        };
      }
    }
    
    return position!;
  }, [minDistance]);

  // Initialize positions when items change
  useEffect(() => {
    if (items.length > 0) {
      const newPositions: Record<string, Position> = {};
      
      items.forEach((item, index) => {
        if (!positions[item.id]) {
          const position = getCollisionFreePosition(index, items.length, newPositions);
          newPositions[item.id] = position;
        } else {
          newPositions[item.id] = positions[item.id];
        }
      });
      
      setPositionsState(newPositions);
      onPositionChange?.(newPositions);
    }
  }, [items.length, getCollisionFreePosition]);

  // Handle mouse down on draggable item
  const handleMouseDown = useCallback((e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (!containerRect) return;
    
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    
    setDraggedItem(itemId);
    setDragOffset({ x: offsetX, y: offsetY });
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(false);
    setHasDragged(false); // Reset drag state
  }, [containerRef]);

  // Handle mouse move during drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedItem || !containerRef.current) return;
      
      // Check if we've moved enough to consider this a drag (threshold: 5px)
      const dragDistance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.x, 2) + 
        Math.pow(e.clientY - dragStartPos.y, 2)
      );
      
      if (dragDistance > 5 && !isDragging) {
        setIsDragging(true);
        setHasDragged(true); // Mark that we've dragged
      }
      
      // Only update position if we're actually dragging
      if (isDragging || dragDistance > 5) {
        const containerRect = containerRef.current.getBoundingClientRect();
        
        let newX = ((e.clientX - containerRect.left - dragOffset.x) / containerRect.width) * 100;
        let newY = ((e.clientY - containerRect.top - dragOffset.y) / containerRect.height) * 100;
        
        // Apply boundary constraints
        newX = Math.max(boundaryPadding, Math.min(100 - boundaryPadding, newX));
        newY = Math.max(boundaryPadding, Math.min(100 - boundaryPadding, newY));
        
        const newPositions = {
          ...positions,
          [draggedItem]: { x: newX, y: newY }
        };
        
        setPositionsState(newPositions);
        onPositionChange?.(newPositions);
      }
    };

    const handleMouseUp = () => {
      // Small delay to prevent click event from firing immediately after drag
      if (isDragging) {
        setTimeout(() => {
          setIsDragging(false);
          setHasDragged(false); // Reset after delay
        }, 100);
      } else {
        setIsDragging(false);
        setHasDragged(false);
      }
      
      setDraggedItem(null);
      setDragOffset({ x: 0, y: 0 });
      setDragStartPos({ x: 0, y: 0 });
    };

    if (draggedItem) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedItem, dragOffset, positions, containerRef, boundaryPadding, onPositionChange, isDragging, dragStartPos]);

  // Update positions externally
  const setPositions = useCallback((newPositions: Record<string, Position>) => {
    setPositionsState(newPositions);
    onPositionChange?.(newPositions);
  }, [onPositionChange]);

  // Reset positions to collision-free layout
  const resetPositions = useCallback(() => {
    const newPositions: Record<string, Position> = {};
    items.forEach((item, index) => {
      const position = getCollisionFreePosition(index, items.length, newPositions);
      newPositions[item.id] = position;
    });
    setPositions(newPositions);
  }, [items, getCollisionFreePosition, setPositions]);

  // Fit all items with optional target center
  const fitAllItems = useCallback((targetCenter: Position = { x: 30, y: 25 }) => {
    if (items.length === 0) return;

    // Get current positions
    const currentPositions = Object.values(positions);
    if (currentPositions.length === 0) return;

    // Find bounds of all items
    const minX = Math.min(...currentPositions.map(p => p.x));
    const maxX = Math.max(...currentPositions.map(p => p.x));
    const minY = Math.min(...currentPositions.map(p => p.y));
    const maxY = Math.max(...currentPositions.map(p => p.y));

    // Calculate current center
    const currentCenterX = (minX + maxX) / 2;
    const currentCenterY = (minY + maxY) / 2;

    // Move all items to new center position
    const newPositions: Record<string, Position> = {};
    items.forEach(item => {
      const currentPos = positions[item.id] || { x: 50, y: 50 };
      const offsetX = currentPos.x - currentCenterX;
      const offsetY = currentPos.y - currentCenterY;

      newPositions[item.id] = {
        x: Math.max(boundaryPadding, Math.min(100 - boundaryPadding, targetCenter.x + offsetX)),
        y: Math.max(boundaryPadding, Math.min(100 - boundaryPadding, targetCenter.y + offsetY))
      };
    });

    setPositions(newPositions);
  }, [items, positions, boundaryPadding, setPositions]);

  return {
    positions,
    draggedItem,
    dragOffset,
    isDragging,
    hasDragged,
    handleMouseDown,
    setPositions,
    resetPositions,
    fitAllItems,
    getCollisionFreePosition
  };
};