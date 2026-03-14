import { useState, useCallback, useEffect } from 'react';

export interface UseZoomOptions {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  scrollContainerRef?: React.RefObject<HTMLElement>;
}

export interface UseZoomReturn {
  zoomLevel: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (level: number) => void;
  scrollToTopLeft: () => void;
  fitAllWithZoom: (positions: Record<string, { x: number; y: number }>) => number;
}

export const useZoom = ({
  initialZoom = 1,
  minZoom = 0.2,
  maxZoom = 3,
  zoomStep = 0.2,
  scrollContainerRef
}: UseZoomOptions = {}): UseZoomReturn => {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);

  // Zoom in
  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + zoomStep, maxZoom));
  }, [zoomStep, maxZoom]);

  // Zoom out
  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - zoomStep, minZoom));
  }, [zoomStep, minZoom]);

  // Reset zoom to initial level
  const resetZoom = useCallback(() => {
    setZoomLevel(initialZoom);
  }, [initialZoom]);

  // Set specific zoom level
  const setZoom = useCallback((level: number) => {
    setZoomLevel(Math.max(minZoom, Math.min(maxZoom, level)));
  }, [minZoom, maxZoom]);

  // Scroll to top-left of container
  const scrollToTopLeft = useCallback(() => {
    const scrollContainer = scrollContainerRef?.current;
    if (scrollContainer) {
      // Multiple methods to ensure scroll works
      scrollContainer.scrollLeft = 0;
      scrollContainer.scrollTop = 0;
      scrollContainer.scrollTo(0, 0);
      
      // Additional attempt with requestAnimationFrame
      requestAnimationFrame(() => {
        scrollContainer.scrollLeft = 0;
        scrollContainer.scrollTop = 0;
      });
    }
  }, [scrollContainerRef]);

  // Calculate optimal zoom to fit all positions
  const fitAllWithZoom = useCallback((positions: Record<string, { x: number; y: number }>): number => {
    const positionValues = Object.values(positions);
    if (positionValues.length === 0) return initialZoom;

    // Find bounds of all positions
    const minX = Math.min(...positionValues.map(p => p.x));
    const maxX = Math.max(...positionValues.map(p => p.x));
    const minY = Math.min(...positionValues.map(p => p.y));
    const maxY = Math.max(...positionValues.map(p => p.y));

    // Calculate required zoom to fit all items with padding
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const padding = 15; // 15% padding around items
    
    // Calculate zoom level needed to fit the range in viewport
    const viewportPadding = 20; // Leave 20% of viewport as padding
    const zoomX = (100 - viewportPadding) / Math.max(rangeX + padding, 25); // Min range of 25%
    const zoomY = (100 - viewportPadding) / Math.max(rangeY + padding, 25);
    const optimalZoom = Math.min(zoomX, zoomY) / 100;
    
    // Allow zooming in up to maxZoom for small clusters
    const finalZoom = Math.max(minZoom, Math.min(optimalZoom, maxZoom));
    
    setZoom(finalZoom);
    return finalZoom;
  }, [initialZoom, minZoom, maxZoom, setZoom]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case '0':
            e.preventDefault();
            resetZoom();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom]);

  return {
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    scrollToTopLeft,
    fitAllWithZoom
  };
};